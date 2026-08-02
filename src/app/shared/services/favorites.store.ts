import { DestroyRef, Service, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FavoritesService } from './favorites.service';
import { Photo } from '../types';

export type FavoritesStatus = 'idle' | 'loading' | 'loaded' | 'error';

export const ADD_ERROR_MESSAGE = 'We could not add this photo to your favorites.';

@Service()
export class FavoritesStore {
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly writePhotos = signal<Photo[]>([]);
  private readonly writeStatus = signal<FavoritesStatus>('idle');
  private readonly writeError = signal<string | null>(null);

  private readonly ids = computed(() => new Set(this.writePhotos().map((photo) => photo.id)));

  readonly photos = this.writePhotos.asReadonly();
  readonly status = this.writeStatus.asReadonly();
  readonly error = this.writeError.asReadonly();

  isFavorite(id: string): boolean {
    return this.ids().has(id);
  }

  load(): void {
    this.writeStatus.set('loading');
    this.favoritesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photos) => {
          this.writePhotos.set(photos);
          this.writeStatus.set('loaded');
        },
        error: () => this.writeStatus.set('error')
      });
  }

  add(photo: Photo): void {
    if (this.isFavorite(photo.id)) {
      return;
    }

    this.writeError.set(null);
    this.writePhotos.update((photos) => [...photos, photo]);

    this.favoritesService
      .add(photo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.writePhotos.update((photos) =>
            photos.filter((favorite) => favorite.id !== photo.id)
          );
          this.writeError.set(ADD_ERROR_MESSAGE);
        }
      });
  }
}
