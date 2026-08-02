import { Routes } from '@angular/router';
import { favoritesResolver } from './favorites/favorites.resolver';
import { photoResolver } from './photo-details/photo.resolver';

export const routes: Routes = [
  {
    path: '',
    title: 'Photo stream · Gallery',
    loadComponent: () => import('./photo-stream/photo-stream').then((m) => m.PhotoStream)
  },
  {
    path: 'favorites',
    title: 'Favorites · Gallery',
    resolve: { favorites: favoritesResolver },
    loadComponent: () => import('./favorites/favorites').then((m) => m.Favorites)
  },
  {
    path: 'photos/:id',
    // The title needs the resolved photo, so the component sets it rather than a resolver racing this one
    resolve: { photo: photoResolver },
    loadComponent: () => import('./photo-details/photo-details').then((m) => m.PhotoDetails)
  },
  {
    path: '**',
    title: 'Page not found · Gallery',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound)
  }
];
