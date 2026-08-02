import { Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Photo, PicsumLoaderParams } from '../../types';
import { photoAltText, photoDimensionsLabel, photoDimensionsText } from '../../photo-labels';
import { PHOTO_GRID_ITEM_WIDTH_PX } from '../../directives/photo-grid.directive';

const THUMBNAIL_RATIO_WIDTH = 2;
const THUMBNAIL_RATIO_HEIGHT = 3;

// The non-interactive inside of a photo card. The interactive element around it, and with it the
// card's behaviour, is the caller's: `PhotoFavoriteCard` or `PhotoLinkCard`. Content projected
// into it overlays the thumbnail.
@Component({
  selector: 'app-photo-card-body',
  imports: [NgOptimizedImage],
  templateUrl: './photo-card-body.html',
  styleUrl: './photo-card-body.scss'
})
export class PhotoCardBody {
  photo = input.required<Photo>();
  priority = input(false);

  readonly imageLoaderParams: PicsumLoaderParams = {
    aspectRatio: THUMBNAIL_RATIO_WIDTH / THUMBNAIL_RATIO_HEIGHT
  };
  readonly thumbnailAspectRatio = `${THUMBNAIL_RATIO_WIDTH} / ${THUMBNAIL_RATIO_HEIGHT}`;
  readonly imageSizes = `${PHOTO_GRID_ITEM_WIDTH_PX}px`;

  altText = computed(() => photoAltText(this.photo()));
  dimensionsText = computed(() => photoDimensionsText(this.photo()));
  dimensionsLabel = computed(() => photoDimensionsLabel(this.photo()));
}
