import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FavoritesService } from '../shared/services/favorites.service';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Photo } from '../shared/types';

// Resolves to null rather than failing the navigation, so the details page can show the error
export const photoResolver: ResolveFn<Photo | null> = (route) => {
  const id = route.paramMap.get('id') ?? '';

  // Coming from the favorites grid the store already holds the photo, so only a deep link pays for a request
  return (
    inject(FavoritesStore).byId(id) ??
    inject(FavoritesService)
      .get(id)
      .pipe(catchError(() => of(null)))
  );
};
