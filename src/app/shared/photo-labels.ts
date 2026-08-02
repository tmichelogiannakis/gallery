import { Photo } from './types';

// Single source for the user-facing strings derived from a photo, so the grid item and the
// details page cannot drift apart.

export const photoAltText = (photo: Photo): string => `Photo by ${photo.author}`;

export const photoDimensionsText = (photo: Photo): string => `${photo.width} × ${photo.height}`;

export const photoDimensionsLabel = (photo: Photo): string =>
  `${photo.width} by ${photo.height} pixels`;
