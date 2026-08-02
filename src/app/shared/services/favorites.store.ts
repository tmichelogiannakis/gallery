import { DestroyRef, Service, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, of, tap } from 'rxjs';
import { FavoritesService } from './favorites.service';
import { Photo } from '../types';

export type FavoritesStatus = 'idle' | 'loading' | 'loaded' | 'error';

export const ADD_ERROR_MESSAGE = 'We could not add this photo to your favorites.';
export const REMOVE_ERROR_MESSAGE = 'We could not remove this photo from your favorites.';

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

  // Cold, and emits nothing the signals do not already hold — subscribe only to know when the read is done
  load(): Observable<Photo[]> {
    return defer(() => {
      this.writeStatus.set('loading');
      return this.favoritesService.list();
    }).pipe(
      tap((photos) => {
        this.writePhotos.set(photos);
        this.writeStatus.set('loaded');
      }),
      catchError(() => {
        this.writeStatus.set('error');
        return of<Photo[]>([]);
      })
    );
  }

  // For callers that do not wait on the read, so they never have to subscribe themselves
  refresh(): void {
    this.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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

  remove(id: string): void {
    const index = this.writePhotos().findIndex((photo) => photo.id === id);
    if (index === -1) {
      return;
    }

    const removed = this.writePhotos()[index];
    if (!removed) {
      return;
    }

    this.writeError.set(null);
    this.writePhotos.update((photos) => photos.filter((photo) => photo.id !== id));

    this.favoritesService
      .remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          // Back where it was, so a failed removal does not reshuffle the grid
          this.writePhotos.update((photos) => [
            ...photos.slice(0, index),
            removed,
            ...photos.slice(index)
          ]);
          this.writeError.set(REMOVE_ERROR_MESSAGE);
        }
      });
  }

  byId(id: string): Photo | undefined {
    return this.writePhotos().find((photo) => photo.id === id);
  }
}
