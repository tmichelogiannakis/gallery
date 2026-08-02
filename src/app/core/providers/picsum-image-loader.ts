import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

const PICSUM_BASE_URL = 'https://picsum.photos/id';
const FALLBACK_WIDTH = 400;
const DEFAULT_ASPECT_RATIO = 1;

export interface PicsumLoaderParams {
  aspectRatio: number;
}

// Builds picsum URLs from a photo id, so `NgOptimizedImage` can request a crop at the srcset widths
export function picsumImageLoader({
  src,
  width,
  isPlaceholder,
  loaderParams
}: ImageLoaderConfig): string {
  const requestedWidth = width ?? FALLBACK_WIDTH;
  const height = Math.round(requestedWidth / readAspectRatio(loaderParams));
  const url = `${PICSUM_BASE_URL}/${src}/${requestedWidth}/${height}`;

  return isPlaceholder ? `${url}?blur=1` : url;
}

const readAspectRatio = (loaderParams: ImageLoaderConfig['loaderParams']): number => {
  const aspectRatio = loaderParams?.['aspectRatio'];

  return typeof aspectRatio === 'number' && aspectRatio > 0 && Number.isFinite(aspectRatio)
    ? aspectRatio
    : DEFAULT_ASPECT_RATIO;
};

export function providePicsumImageLoader(): Provider {
  return { provide: IMAGE_LOADER, useValue: picsumImageLoader };
}
