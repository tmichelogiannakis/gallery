import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FavoritesService } from '../shared/services/favorites.service';
import { PhotoGrid } from '../shared/components/photo-grid/photo-grid';
import { PhotoGridItem } from '../shared/components/photo-grid-item/photo-grid-item';
import { Photo } from '../shared/types';

type FavoritesStatus = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-favorites',
  imports: [PhotoGrid, PhotoGridItem, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class Favorites implements OnInit {
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly photos = signal<Photo[]>([]);
  readonly status = signal<FavoritesStatus>('loading');

  readonly isEmpty = computed(() => this.status() === 'loaded' && this.photos().length === 0);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.status.set('loading');
    this.favoritesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photos) => {
          this.photos.set(photos);
          this.status.set('loaded');
        },
        error: () => this.status.set('error')
      });
  }

  navigateToPhotoDetails(photo: Photo): void {
    console.log(`Navigating to photo details`, photo);
  }
}
