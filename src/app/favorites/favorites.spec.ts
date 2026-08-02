import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { Favorites } from './favorites';
import { FavoritesService } from '../shared/services/favorites.service';
import { FavoritesStore } from '../shared/services/favorites.store';
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

describe('Favorites', () => {
  let fixture: ComponentFixture<Favorites>;

  const renderedItems = () =>
    Array.from(fixture.nativeElement.querySelectorAll('app-photo-grid-item')) as HTMLElement[];

  const emptyMessage = () => fixture.nativeElement.querySelector('app-alert:not(.alert-error)');

  const errorAlert = () => fixture.nativeElement.querySelector('app-alert.alert-error');

  const retryButton = () =>
    fixture.nativeElement.querySelector('app-alert.alert-error button') as HTMLButtonElement | null;

  const createComponent = async (favoritesService: Pick<FavoritesService, 'list'>) => {
    TestBed.configureTestingModule({
      imports: [Favorites],
      providers: [
        { provide: FavoritesService, useValue: favoritesService },
        providePicsumImageLoader(),
        provideRouter([])
      ]
    });

    // Stands in for the route resolver, which reads the favorites before the page is rendered
    TestBed.inject(FavoritesStore).refresh();

    fixture = TestBed.createComponent(Favorites);
    await fixture.whenStable();
  };

  it('requests the favorites once', async () => {
    const list = vi.fn().mockReturnValue(of(photos));

    await createComponent({ list });

    expect(list).toHaveBeenCalledOnce();
  });

  it('renders a grid item per favorited photo', async () => {
    await createComponent({ list: () => of(photos) });

    const authors = renderedItems().map((item) => item.querySelector('.author-name')?.textContent);

    expect(authors).toEqual(['Alejandro Escamilla', 'Paul Jarvis']);
  });

  // The wait itself is covered by the global loader, so the page only has to stay quiet
  it('shows neither photos nor messages until the favorites arrive', async () => {
    await createComponent({ list: () => NEVER });

    expect(renderedItems()).toEqual([]);
    expect(emptyMessage()).toBeNull();
    expect(errorAlert()).toBeNull();
  });

  it('explains that there is nothing to show when no photo has been favorited', async () => {
    await createComponent({ list: () => of([]) });

    expect(emptyMessage()).not.toBeNull();
    expect(renderedItems()).toEqual([]);
  });

  it('keeps the empty message away while there are favorites', async () => {
    await createComponent({ list: () => of(photos) });

    expect(emptyMessage()).toBeNull();
  });

  it('opens the details of the photo that was clicked', async () => {
    await createComponent({ list: () => of(photos) });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    renderedItems()[1]?.querySelector('button')?.click();

    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/photos', '1']);
  });

  it('offers a retry when the request errors', async () => {
    await createComponent({ list: () => throwError(() => 'boom') });

    expect(retryButton()).not.toBeNull();
    expect(emptyMessage()).toBeNull();
  });

  it('re-requests the favorites when the retry is used', async () => {
    const list = vi
      .fn()
      .mockReturnValueOnce(throwError(() => 'boom'))
      .mockReturnValue(of(photos));

    await createComponent({ list });

    retryButton()?.click();
    await fixture.whenStable();

    expect(list).toHaveBeenCalledTimes(2);
    expect(renderedItems()).toHaveLength(2);
    expect(retryButton()).toBeNull();
  });
});
