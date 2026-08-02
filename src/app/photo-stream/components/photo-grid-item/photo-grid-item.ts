import { Component, computed, input } from '@angular/core';
import { Photo } from '../../../shared/types';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-photo-grid-item',
  imports: [NgOptimizedImage],
  templateUrl: './photo-grid-item.html',
  styleUrl: './photo-grid-item.scss'
})
export class PhotoGridItem {
  photo = input.required<Photo>();
  priority = input(false);

  altText = computed(() => `Photo by ${this.photo().author}`);

  dimensionsText = computed(() => `${this.photo().width} × ${this.photo().height}`);
}
