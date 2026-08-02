import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FavoritesService } from '../shared/services/favorites.service';
import { Photo } from '../shared/types';

// Resolves to null rather than failing the navigation, so the details page can show the error
export const photoResolver: ResolveFn<Photo | null> = (route) =>
  inject(FavoritesService)
    .get(route.paramMap.get('id') ?? '')
    .pipe(catchError(() => of(null)));
