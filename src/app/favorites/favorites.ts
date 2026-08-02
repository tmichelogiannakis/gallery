import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Alert } from '../shared/components/alert/alert';
import {
  PHOTO_GRID_PRIORITY_COUNT,
  PhotoGridDirective
} from '../shared/directives/photo-grid.directive';
import { PhotoLinkCard } from '../shared/components/photo-link-card/photo-link-card';

@Component({
  selector: 'app-favorites',
  imports: [PhotoGridDirective, PhotoLinkCard, Alert, MatButtonModule],
  templateUrl: './favorites.html'
})
export class Favorites {
  readonly favoritesStore = inject(FavoritesStore);

  readonly priorityCount = PHOTO_GRID_PRIORITY_COUNT;

  readonly isEmpty = computed(
    () => this.favoritesStore.status() === 'loaded' && this.favoritesStore.photos().length === 0
  );

  reloadFavorites(): void {
    this.favoritesStore.refresh();
  }
}
