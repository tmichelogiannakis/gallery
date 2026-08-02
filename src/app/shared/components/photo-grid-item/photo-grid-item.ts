import { Component, computed, input, output } from '@angular/core';
import { Photo, PicsumLoaderParams } from '../../types';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { photoAltText, photoDimensionsLabel, photoDimensionsText } from '../../photo-labels';
import { PHOTO_GRID_ITEM_WIDTH_PX } from '../../directives/photo-grid.directive';

const THUMBNAIL_RATIO_WIDTH = 2;
const THUMBNAIL_RATIO_HEIGHT = 3;

@Component({
  selector: 'app-photo-grid-item',
  imports: [NgOptimizedImage, NgTemplateOutlet, MatIconModule, RouterLink],
  templateUrl: './photo-grid-item.html',
  styleUrl: './photo-grid-item.scss'
})
export class PhotoGridItem {
  photo = input.required<Photo>();
  priority = input(false);
  isFavorite = input(false);
  link = input<unknown[] | null>(null);

  photoSelected = output<Photo>();

  readonly imageLoaderParams: PicsumLoaderParams = {
    aspectRatio: THUMBNAIL_RATIO_WIDTH / THUMBNAIL_RATIO_HEIGHT
  };
  readonly thumbnailAspectRatio = `${THUMBNAIL_RATIO_WIDTH} / ${THUMBNAIL_RATIO_HEIGHT}`;
  readonly imageSizes = `${PHOTO_GRID_ITEM_WIDTH_PX}px`;

  altText = computed(() => photoAltText(this.photo()));
  dimensionsText = computed(() => photoDimensionsText(this.photo()));
  dimensionsLabel = computed(() => photoDimensionsLabel(this.photo()));
  isUnavailable = computed(() => !this.link() && this.isFavorite());
  ariaLabel = computed(() => {
    return this.isFavorite()
      ? `${this.altText()} is in your favorites`
      : `Add photo by ${this.photo().author} to favorites`;
  });

  handleItemClick(): void {
    if (this.isUnavailable()) {
      return;
    }
    this.photoSelected.emit(this.photo());
  }
}
