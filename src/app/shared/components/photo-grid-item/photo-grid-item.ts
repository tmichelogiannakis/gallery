import { Component, computed, input, output } from '@angular/core';
import { Photo } from '../../types';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PicsumLoaderParams } from '../../../core/providers/picsum-image-loader';

export type PhotoGridItemAction = 'favorite' | 'open';

@Component({
  selector: 'app-photo-grid-item',
  imports: [NgOptimizedImage, MatIconModule],
  templateUrl: './photo-grid-item.html',
  styleUrl: './photo-grid-item.scss'
})
export class PhotoGridItem {
  photo = input.required<Photo>();
  priority = input(false);
  isFavorite = input(false);
  action = input<PhotoGridItemAction>('favorite');

  photoSelected = output<Photo>();

  readonly imageLoaderParams: PicsumLoaderParams = { aspectRatio: 2 / 3 };

  altText = computed(() => `Photo by ${this.photo().author}`);
  dimensionsText = computed(() => `${this.photo().width} × ${this.photo().height}`);
  isUnavailable = computed(() => this.action() === 'favorite' && this.isFavorite());
  actionLabel = computed(() => {
    if (this.action() === 'open') {
      return `View photo by ${this.photo().author}`;
    }

    return this.isFavorite()
      ? `Photo by ${this.photo().author} is in your favorites`
      : `Add photo by ${this.photo().author} to favorites`;
  });

  handleItemClick = () => {
    if (this.isUnavailable()) {
      return;
    }
    this.photoSelected.emit(this.photo());
  };
}
