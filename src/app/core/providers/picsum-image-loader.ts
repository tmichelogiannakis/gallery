import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

const PICSUM_BASE_URL = 'https://picsum.photos/id';
const THUMBNAIL_ASPECT_RATIO = 3 / 2;
const FALLBACK_WIDTH = 400;

// Builds picsum URLs from a photo id, so `NgOptimizedImage` can request a thumbnail at the srcset sizes
export function picsumImageLoader({ src, width, isPlaceholder }: ImageLoaderConfig): string {
  const requestedWidth = width ?? FALLBACK_WIDTH;
  const height = Math.round(requestedWidth * THUMBNAIL_ASPECT_RATIO);
  const url = `${PICSUM_BASE_URL}/${src}/${requestedWidth}/${height}`;

  return isPlaceholder ? `${url}?blur=1` : url;
}

export function providePicsumImageLoader(): Provider {
  return { provide: IMAGE_LOADER, useValue: picsumImageLoader };
}
