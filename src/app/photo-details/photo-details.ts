import { Component, DestroyRef, computed, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Alert } from '../shared/components/alert/alert';
import { ConfirmDialog, ConfirmDialogData } from './components/confirm-dialog/confirm-dialog';
import { FavoritesStore } from '../shared/services/favorites.store';
import { PicsumLoaderParams } from '../core/providers/picsum-image-loader';
import { Photo } from '../shared/types';

@Component({
  selector: 'app-photo-details',
  imports: [NgOptimizedImage, RouterLink, Alert, MatButtonModule, MatIconModule],
  templateUrl: './photo-details.html',
  styleUrl: './photo-details.scss'
})
export class PhotoDetails {
  private readonly favoritesStore = inject(FavoritesStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly photo = input.required<Photo | null>();

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

    if (!photo) {
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Remove from favorites?',
      message: 'The photo will no longer appear in your favorites.',
      confirmLabel: 'Remove',
      cancelLabel: 'Keep'
    };

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, { data })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          // The store removes optimistically and rolls back on its own, so we can leave right away
          this.favoritesStore.remove(photo.id);
          this.router.navigate(['/favorites']);
        }
      });
  }
}
