import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Photo } from '../shared/types';

// Only the first read holds the navigation; later ones refresh in the background behind the cached favorites
export const favoritesResolver: ResolveFn<Photo[]> = () => {
  const favoritesStore = inject(FavoritesStore);

  if (favoritesStore.status() === 'loaded') {
    favoritesStore.refresh();
    return favoritesStore.photos();
  }

  return favoritesStore.load();
};
