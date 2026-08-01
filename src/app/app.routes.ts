import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./photo-stream/photo-stream').then((m) => m.PhotoStream)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites').then((m) => m.Favorites)
  }
];
