import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { PhotoStream } from './photo-stream/photo-stream';
import { Favorites } from './favorites/favorites';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)]
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
});
