import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Photo } from '../../shared/types';
import { FavoritesService, FAVORITES_URL } from './favorites.service';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('FavoritesService', () => {
  let service: FavoritesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(FavoritesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('reads the favorites from the favorites endpoint', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(FAVORITES_URL);

    expect(req.request.method).toBe('GET');

    req.flush([photo]);
  });

  it('emits the stored favorites', () => {
    let result: Photo[] | undefined;
    service.list().subscribe((favorites) => (result = favorites));

    httpMock.expectOne(FAVORITES_URL).flush([photo]);

    expect(result).toEqual([photo]);
  });

  it('reads a single favorite from its own url', () => {
    service.get(photo.id).subscribe();

    const req = httpMock.expectOne(`${FAVORITES_URL}/${photo.id}`);

    expect(req.request.method).toBe('GET');

    req.flush(photo);
  });

  it('emits the requested favorite', () => {
    let result: Photo | undefined;
    service.get(photo.id).subscribe((favorite) => (result = favorite));

    httpMock.expectOne(`${FAVORITES_URL}/${photo.id}`).flush(photo);

    expect(result).toEqual(photo);
  });

  it('posts the photo to the favorites endpoint', () => {
    service.add(photo).subscribe();

    const req = httpMock.expectOne(FAVORITES_URL);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(photo);

    req.flush(photo);
  });

  it('emits the created favorite', () => {
    let result: Photo | undefined;
    service.add(photo).subscribe((favorite) => (result = favorite));

    httpMock.expectOne(FAVORITES_URL).flush(photo);

    expect(result).toEqual(photo);
  });

  it('deletes the favorite through its own url', () => {
    service.remove(photo.id).subscribe();

    const req = httpMock.expectOne(`${FAVORITES_URL}/${photo.id}`);

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('completes once the favorite has been deleted', () => {
    let completed = false;
    service.remove(photo.id).subscribe({ complete: () => (completed = true) });

    httpMock.expectOne(`${FAVORITES_URL}/${photo.id}`).flush(null);

    expect(completed).toBe(true);
  });
});
