import { Component, computed, input, output } from '@angular/core';
import { Photo } from '../../types';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PicsumLoaderParams } from '../../../core/providers/picsum-image-loader';

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

  readonly imageLoaderParams: PicsumLoaderParams = { aspectRatio: 2 / 3 };

  altText = computed(() => `Photo by ${this.photo().author}`);
  dimensionsText = computed(() => `${this.photo().width} × ${this.photo().height}`);
  dimensionsLabel = computed(() => `${this.photo().width} by ${this.photo().height} pixels`);
  isUnavailable = computed(() => !this.link() && this.isFavorite());
  ariaLabel = computed(() => {
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
