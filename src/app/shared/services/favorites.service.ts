import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../types';
import { FAVORITES_URL, favoriteUrl } from '../favorites.api';

@Service()
export class FavoritesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Photo[]> {
    return this.http.get<Photo[]>(FAVORITES_URL);
  }

  get(id: string): Observable<Photo> {
    return this.http.get<Photo>(favoriteUrl(id));
  }

  add(photo: Photo): Observable<Photo> {
    return this.http.post<Photo>(FAVORITES_URL, photo);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(favoriteUrl(id));
  }
}
