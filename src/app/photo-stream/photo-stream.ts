import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { PhotosService } from './services/photos.service';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Alert } from '../shared/components/alert/alert';
import { LoadingIndicator } from '../shared/components/loading-indicator/loading-indicator';
import { PhotoFavoriteCard } from '../shared/components/photo-favorite-card/photo-favorite-card';
import {
  PHOTO_GRID_PRIORITY_COUNT,
  PhotoGridDirective
} from '../shared/directives/photo-grid.directive';
import { OnVisibleDirective } from './directives/on-visible.directive';
import { Photo } from '../shared/types';

type StreamStatus = 'idle' | 'loading' | 'error' | 'exhausted';

@Component({
  selector: 'app-photo-stream',
  imports: [
    PhotoGridDirective,
    PhotoFavoriteCard,
    Alert,
    LoadingIndicator,
    OnVisibleDirective,
    MatButtonModule
  ],
  templateUrl: './photo-stream.html'
})
export class PhotoStream implements OnInit {
  private readonly photosService = inject(PhotosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly favoritesStore = inject(FavoritesStore);

  readonly priorityCount = PHOTO_GRID_PRIORITY_COUNT;

  private nextPage = 1;

  readonly photos = signal<Photo[]>([]);
  readonly status = signal<StreamStatus>('idle');
  readonly announcement = signal('');

  readonly canLoadMore = computed(() => this.status() === 'idle');

  ngOnInit(): void {
    this.favoritesStore.refresh();
    this.loadNextPage();
  }

  loadNextPage(): void {
    if (!this.canLoadMore()) {
      return;
    }

    this.status.set('loading');
    this.photosService
      .list(this.nextPage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photos) => {
          if (photos.length === 0) {
            this.status.set('exhausted');
            this.announcement.set('All photos loaded');
            return;
          }

          this.status.set('idle');
          this.announcement.set(`${photos.length} more photos loaded`);
          this.nextPage = this.nextPage + 1;
          this.photos.update((existing) => {
            const existingIds = new Set(existing.map((photo) => photo.id));
            return [...existing, ...photos.filter((photo) => !existingIds.has(photo.id))];
          });
        },
        error: () => this.status.set('error')
      });
  }

  addPhotoToFavorites(photo: Photo): void {
    this.favoritesStore.add(photo);
  }

  retryFailedPage(): void {
    this.status.set('idle');
    this.loadNextPage();
  }
}
