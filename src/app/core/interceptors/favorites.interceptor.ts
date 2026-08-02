import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';
import { Photo } from '../../shared/types';
import { FAVORITES_URL, favoriteIdFromUrl } from '../../shared/favorites.api';

export const FAVORITES_STORAGE_KEY = 'gallery.favorites';
export const LATENCY_MS = 500;

// Stands in for the favorites backend we do not have: persists to localStorage and answers like an endpoint
export const favoritesInterceptor: HttpInterceptorFn = (req, next) => {
  const favoriteId = favoriteIdFromUrl(req.url);

  if (favoriteId !== null && req.method === 'GET') {
    const photos = readFavorites();
    const photo = photos.find((favorite) => favorite.id === favoriteId);
    return withLatency(
      photo
        ? of(new HttpResponse<Photo>({ status: 200, statusText: 'OK', body: photo }))
        : throwError(
            () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url })
          )
    );
  }

  if (favoriteId !== null && req.method === 'DELETE') {
    removePhotoFromFavorites(favoriteId);
    return withLatency(
      of(new HttpResponse<null>({ status: 204, statusText: 'No Content', body: null }))
    );
  }

  if (req.url === FAVORITES_URL && req.method === 'GET') {
    const photos = readFavorites();
    return withLatency(
      of(new HttpResponse<Photo[]>({ status: 200, statusText: 'OK', body: photos }))
    );
  }

  if (req.url === FAVORITES_URL && req.method === 'POST') {
    const photo = req.body as Photo;
    addPhotoToFavorites(photo);
    return withLatency(
      of(new HttpResponse<Photo>({ status: 201, statusText: 'Created', body: photo }))
    );
  }

  return next(req);
};

const readFavorites = (): Photo[] => {
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Photo[];
  } catch {
    return [];
  }
};

const addPhotoToFavorites = (photo: Photo): void => {
  const favorites = readFavorites();

  if (favorites.some((favorite) => favorite.id === photo.id)) {
    return;
  }

  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites, photo]));
};

const removePhotoFromFavorites = (id: string): void => {
  const favorites = readFavorites();

  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(favorites.filter((favorite) => favorite.id !== id))
  );
};

const withLatency = <T>(observableResponse: Observable<HttpResponse<T>>) =>
  timer(LATENCY_MS).pipe(switchMap(() => observableResponse));
