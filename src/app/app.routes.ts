import { Routes } from '@angular/router';
import { favoritesResolver } from './favorites/favorites.resolver';
import { photoResolver } from './photo-details/photo.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./photo-stream/photo-stream').then((m) => m.PhotoStream)
  },
  {
    path: 'favorites',
    resolve: { favorites: favoritesResolver },
    loadComponent: () => import('./favorites/favorites').then((m) => m.Favorites)
  },
  {
    path: 'photos/:id',
    resolve: { photo: photoResolver },
    loadComponent: () => import('./photo-details/photo-details').then((m) => m.PhotoDetails)
  }
];
