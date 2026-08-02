import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PhotosService } from './services/photos.service';
import { PhotoGrid } from './components/photo-grid/photo-grid';
import { PhotoGridItem } from './components/photo-grid-item/photo-grid-item';
import { OnVisibleDirective } from './directives/on-visible.directive';
import { Photo } from '../shared/types';

type StreamStatus = 'idle' | 'loading' | 'error' | 'exhausted';

@Component({
  selector: 'app-photo-stream',
  imports: [
    PhotoGrid,
    PhotoGridItem,
    OnVisibleDirective,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './photo-stream.html',
  styleUrl: './photo-stream.scss'
})
export class PhotoStream implements OnInit {
  private readonly photosService = inject(PhotosService);
  private readonly destroyRef = inject(DestroyRef);

  private nextPage = 1;

  readonly photos = signal<Photo[]>([]);
  readonly status = signal<StreamStatus>('idle');

  readonly canLoadMore = computed(() => this.status() === 'idle');

  ngOnInit(): void {
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
            return;
          }

          this.status.set('idle');
          this.nextPage = this.nextPage + 1;
          this.photos.update((existing) => {
            const existingIds = new Set(existing.map((photo) => photo.id));
            return [...existing, ...photos.filter((photo) => !existingIds.has(photo.id))];
          });
        },
        error: () => this.status.set('error')
      });
  }

  retryFailedPage(): void {
    this.status.set('idle');
    this.loadNextPage();
  }
}
