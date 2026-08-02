import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { defer, delay, of } from 'rxjs';
import { Photo } from '../../shared/types';
import { FAVORITES_URL } from '../../shared/services/favorites.service';

export const FAVORITES_STORAGE_KEY = 'gallery.favorites';
export const LATENCY_MS = 500;

// Stands in for the favorites backend we do not have: persists to localStorage and answers like an endpoint
export const favoritesInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url !== FAVORITES_URL) {
    return next(req);
  }

  if (req.method === 'GET') {
    const photos = readFavorites();
    return defer(() =>
      of(new HttpResponse<Photo[]>({ status: 200, statusText: 'OK', body: photos }))
    ).pipe(delay(LATENCY_MS));
  }

  if (req.method === 'POST') {
    const photo = req.body as Photo;

    return defer(() => {
      addPhotoToFavorites(photo);
      return of(new HttpResponse<Photo>({ status: 201, statusText: 'Created', body: photo }));
    }).pipe(delay(LATENCY_MS));
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
