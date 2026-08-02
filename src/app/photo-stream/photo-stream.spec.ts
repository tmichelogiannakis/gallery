import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';

import { PhotoStream } from './photo-stream';
import { PhotosService } from './services/photos.service';
import { Photo } from '../shared/types';
import { providePicsumImageLoader } from '../shared/picsum-image-loader';

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

describe('PhotoStream', () => {
  let fixture: ComponentFixture<PhotoStream>;

  const renderedItems = () =>
    Array.from(fixture.nativeElement.querySelectorAll('app-photo-grid-item')) as HTMLElement[];

  const createComponent = async (photosService: Pick<PhotosService, 'list'>) => {
    TestBed.configureTestingModule({
      imports: [PhotoStream],
      providers: [{ provide: PhotosService, useValue: photosService }, providePicsumImageLoader()]
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
});
