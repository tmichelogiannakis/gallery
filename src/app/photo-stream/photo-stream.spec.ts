import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { PhotoStream } from './photo-stream';
import { PhotosService } from './services/photos.service';
import { FavoritesService } from '../shared/services/favorites.service';
import { Photo } from '../shared/types';
import { providePicsumImageLoader } from '../core/providers/picsum-image-loader';

const photos: Photo[] = [
  {
    id: '0',
    author: 'Alejandro Escamilla',
    width: 5000,
    height: 3333
  },
  {
    id: '1',
    author: 'Paul Jarvis',
    width: 2500,
    height: 1667
  }
];

const morePhotos: Photo[] = [
  {
    id: '2',
    author: 'Fabian Fauth',
    width: 4000,
    height: 3000
  },
  {
    id: '3',
    author: 'Ryan McGuire',
    width: 2400,
    height: 1600
  }
];

describe('PhotoStream', () => {
  let fixture: ComponentFixture<PhotoStream>;

  const renderedItems = () =>
    Array.from(fixture.nativeElement.querySelectorAll('app-photo-grid-item')) as HTMLElement[];

  const sentinel = () => fixture.nativeElement.querySelector('.photo-stream-page-bottom');

  const retryButton = () =>
    fixture.nativeElement.querySelector('app-alert.alert-error button') as HTMLButtonElement | null;

  /** Stands in for the sentinel scrolling into view, which jsdom cannot produce on its own. */
  const scrollToSentinel = async () => {
    fixture.componentInstance.loadNextPage();
    await fixture.whenStable();
  };

  const favoriteButton = (index: number) =>
    renderedItems()[index]?.querySelector('.photo-card') as HTMLButtonElement;

  const createComponent = async (
    photosService: Pick<PhotosService, 'list'>,
    favoritesService: Pick<FavoritesService, 'add'> = { add: (photo) => of(photo) }
  ) => {
    TestBed.configureTestingModule({
      imports: [PhotoStream],
      providers: [
        { provide: PhotosService, useValue: photosService },
        { provide: FavoritesService, useValue: favoritesService },
        providePicsumImageLoader()
      ]
    });

    fixture = TestBed.createComponent(PhotoStream);
    await fixture.whenStable();
  };

  it('requests the first page of photos', async () => {
    const list = vi.fn().mockReturnValue(of(photos));

    await createComponent({ list });

    expect(list).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('renders a grid item per photo', async () => {
    await createComponent({ list: () => of(photos) });

    const authors = renderedItems().map((item) => item.querySelector('.author-name')?.textContent);

    expect(authors).toEqual(['Alejandro Escamilla', 'Paul Jarvis']);
  });

  it('renders no grid items until the photos arrive', async () => {
    await createComponent({ list: () => NEVER });

    expect(renderedItems()).toEqual([]);
  });

  it('appends the next page when the sentinel is reached', async () => {
    const list = vi.fn().mockReturnValueOnce(of(photos)).mockReturnValue(of(morePhotos));

    await createComponent({ list });
    await scrollToSentinel();

    expect(list).toHaveBeenLastCalledWith(2);
    expect(renderedItems()).toHaveLength(4);
  });

  it('dedupes photos that reappear when a page overlaps with previously loaded photos', async () => {
    const list = vi.fn().mockReturnValue(of(photos));

    await createComponent({ list });
    await scrollToSentinel();

    expect(renderedItems()).toHaveLength(2);
  });

  it('keeps the sentinel mounted while there are more photos to load', async () => {
    await createComponent({ list: () => of(photos) });

    expect(sentinel()).not.toBeNull();
  });

  it('unmounts the sentinel while a page is in flight', async () => {
    const pending = new Subject<Photo[]>();
    const list = vi.fn().mockReturnValueOnce(of(photos)).mockReturnValue(pending);

    await createComponent({ list });
    await scrollToSentinel();

    expect(sentinel()).toBeNull();

    pending.next(photos);
    await fixture.whenStable();

    expect(sentinel()).not.toBeNull();
  });

  it('does not request another page while one is in flight', async () => {
    const list = vi.fn().mockReturnValueOnce(of(photos)).mockReturnValue(NEVER);

    await createComponent({ list });
    await scrollToSentinel();
    await scrollToSentinel();

    expect(list).toHaveBeenCalledTimes(2);
  });

  it('stops loading once a page comes back empty', async () => {
    const list = vi.fn().mockReturnValueOnce(of(photos)).mockReturnValue(of([]));

    await createComponent({ list });
    await scrollToSentinel();

    expect(sentinel()).toBeNull();

    await scrollToSentinel();

    expect(list).toHaveBeenCalledTimes(2);
  });

  it('stops loading, rather than retrying, if a request errors', async () => {
    const list = vi
      .fn()
      .mockReturnValueOnce(of(photos))
      .mockReturnValue(throwError(() => 'boom'));

    await createComponent({ list });
    await scrollToSentinel();

    expect(sentinel()).toBeNull();
    expect(renderedItems()).toHaveLength(2);

    await scrollToSentinel();

    expect(list).toHaveBeenCalledTimes(2);
  });

  it('offers a retry, rather than ending the stream, when a request errors', async () => {
    const list = vi
      .fn()
      .mockReturnValueOnce(of(photos))
      .mockReturnValue(throwError(() => 'boom'));

    await createComponent({ list });
    await scrollToSentinel();

    expect(retryButton()).not.toBeNull();
    expect(fixture.componentInstance.status()).toBe('error');
  });

  it('re-requests the page that failed when the retry is used', async () => {
    const list = vi
      .fn()
      .mockReturnValueOnce(of(photos))
      .mockReturnValueOnce(throwError(() => 'boom'))
      .mockReturnValue(of(morePhotos));

    await createComponent({ list });
    await scrollToSentinel();

    retryButton()?.click();
    await fixture.whenStable();

    expect(list).toHaveBeenLastCalledWith(2);
    expect(list).toHaveBeenCalledTimes(3);
    expect(renderedItems()).toHaveLength(4);
    expect(retryButton()).toBeNull();
    expect(sentinel()).not.toBeNull();
  });

  it('favorites the clicked photo', async () => {
    const add = vi.fn().mockReturnValue(of(photos[1]));

    await createComponent({ list: () => of(photos) }, { add });
    favoriteButton(1).click();
    await fixture.whenStable();

    expect(add).toHaveBeenCalledExactlyOnceWith(photos[1]);
  });

  it('keeps rendering the stream when favoriting fails', async () => {
    const add = vi.fn().mockReturnValue(throwError(() => 'boom'));

    await createComponent({ list: () => of(photos) }, { add });
    favoriteButton(0).click();
    await fixture.whenStable();

    expect(renderedItems()).toHaveLength(2);
  });

  it('does not load again when the very first page comes back empty', async () => {
    const list = vi.fn().mockReturnValueOnce(of([])).mockReturnValue(of(photos));

    await createComponent({ list });
    await scrollToSentinel();

    expect(list).toHaveBeenCalledExactlyOnceWith(1);
    expect(renderedItems()).toEqual([]);
  });
});
