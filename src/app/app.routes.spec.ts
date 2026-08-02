import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { PhotoStream } from './photo-stream/photo-stream';
import { Favorites } from './favorites/favorites';
import { PhotoDetails } from './photo-details/photo-details';
import { FavoritesService } from './shared/services/favorites.service';
import { Photo } from './shared/types';
import { providePicsumImageLoader } from './core/providers/picsum-image-loader';

const photo: Photo = {
  id: '42',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('app routes', () => {
  // The details route resolves its photo before activating, so the service answers synchronously
  let get: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    get = vi.fn().mockReturnValue(of(photo));

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FavoritesService, useValue: { get, list: () => of([]) } },
        providePicsumImageLoader()
      ]
    });
  });

  it('should lazy load PhotoStream at the root path', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/', PhotoStream);

    expect(component).toBeInstanceOf(PhotoStream);
  });

  it('should lazy load Favorites at "/favorites"', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/favorites', Favorites);

    expect(component).toBeInstanceOf(Favorites);
  });

  it('lazy loads PhotoDetails at "/photos/:id", bound to the prefetched photo', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/photos/42', PhotoDetails);

    expect(component).toBeInstanceOf(PhotoDetails);
    expect(get).toHaveBeenCalledExactlyOnceWith('42');
    expect(component.photo()).toEqual(photo);
  });
});
