import { Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Alert } from '../shared/components/alert/alert';
import { PicsumLoaderParams } from '../core/providers/picsum-image-loader';
import { Photo } from '../shared/types';

@Component({
  selector: 'app-photo-details',
  imports: [NgOptimizedImage, RouterLink, Alert, MatButtonModule, MatIconModule],
  templateUrl: './photo-details.html',
  styleUrl: './photo-details.scss'
})
export class PhotoDetails {
  readonly photo = input.required<Photo | null>();

  readonly imageLoaderParams = computed<Partial<PicsumLoaderParams>>(() => {
    const photo = this.photo();
    return photo ? { aspectRatio: photo.width / photo.height } : {};
  });

  readonly dimensionsText = computed(() => {
    const photo = this.photo();
    return photo ? `${photo.width} × ${photo.height}` : '';
  });
}
