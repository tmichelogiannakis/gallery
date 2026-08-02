import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

export function fakeImageLoader({
  src,
  width,
  isPlaceholder,
  loaderParams
}: ImageLoaderConfig): string {
  const aspectRatio = loaderParams?.['aspectRatio'];
  const params: string[] = [];

  if (aspectRatio !== undefined) {
    params.push(`ar=${aspectRatio}`);
  }

  if (isPlaceholder) {
    params.push('placeholder=1');
  }

  const path = width === undefined ? `/img/${src}` : `/img/${src}/${width}`;

  return params.length > 0 ? `${path}?${params.join('&')}` : path;
}

export function provideFakeImageLoader(): Provider {
  return { provide: IMAGE_LOADER, useValue: fakeImageLoader };
}
