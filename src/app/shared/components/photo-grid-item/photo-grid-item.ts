import { Component, computed, input, output } from '@angular/core';
import { Photo } from '../../types';
import { NgOptimizedImage } from '@angular/common';
import { PicsumLoaderParams } from '../../../core/providers/picsum-image-loader';

@Component({
  selector: 'app-photo-grid-item',
  imports: [NgOptimizedImage],
  templateUrl: './photo-grid-item.html',
  styleUrl: './photo-grid-item.scss'
})
export class PhotoGridItem {
  photo = input.required<Photo>();
  priority = input(false);

  photoSelected = output<Photo>();

  readonly imageLoaderParams: PicsumLoaderParams = { aspectRatio: 2 / 3 };

  altText = computed(() => `Photo by ${this.photo().author}`);
  dimensionsText = computed(() => `${this.photo().width} × ${this.photo().height}`);
  favoriteLabel = computed(() => `Add photo by ${this.photo().author} to favorites`);

  handleItemClick = () => {
    this.photoSelected.emit(this.photo());
  };
}
