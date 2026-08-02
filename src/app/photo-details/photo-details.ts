import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Alert } from '../shared/components/alert/alert';
import { FavoritesService } from '../shared/services/favorites.service';
import { PicsumLoaderParams } from '../core/providers/picsum-image-loader';
import { Photo } from '../shared/types';

type RemovalStatus = 'idle' | 'removing' | 'error';

@Component({
  selector: 'app-photo-details',
  imports: [NgOptimizedImage, RouterLink, Alert, MatButtonModule, MatIconModule],
  templateUrl: './photo-details.html',
  styleUrl: './photo-details.scss'
})
export class PhotoDetails {
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly photo = input.required<Photo | null>();

  readonly removalStatus = signal<RemovalStatus>('idle');

  readonly isRemoving = computed(() => this.removalStatus() === 'removing');

  readonly imageLoaderParams = computed<Partial<PicsumLoaderParams>>(() => {
    const photo = this.photo();
    return photo ? { aspectRatio: photo.width / photo.height } : {};
  });

  readonly dimensionsText = computed(() => {
    const photo = this.photo();
    return photo ? `${photo.width} × ${photo.height}` : '';
  });

  removeFromFavorites(): void {
    const photo = this.photo();

    if (!photo || this.isRemoving()) {
      return;
    }

    this.removalStatus.set('removing');
    this.favoritesService
      .remove(photo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/favorites']),
        error: () => this.removalStatus.set('error')
      });
  }
}
