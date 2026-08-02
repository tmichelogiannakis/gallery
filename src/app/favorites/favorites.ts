import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Alert } from '../shared/components/alert/alert';
import { PhotoGrid } from '../shared/components/photo-grid/photo-grid';
import { PhotoGridItem } from '../shared/components/photo-grid-item/photo-grid-item';

@Component({
  selector: 'app-favorites',
  imports: [PhotoGrid, PhotoGridItem, Alert, MatButtonModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class Favorites {
  readonly favoritesStore = inject(FavoritesStore);

  readonly isEmpty = computed(
    () => this.favoritesStore.status() === 'loaded' && this.favoritesStore.photos().length === 0
  );

  reloadFavorites(): void {
    this.favoritesStore.refresh();
  }
}
