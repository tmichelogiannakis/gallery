import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Photo } from '../shared/types';

export const favoritesResolver: ResolveFn<Photo[]> = () => inject(FavoritesStore).load();
