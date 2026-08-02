export const FAVORITES_URL = '/api/favorites';

export const favoriteUrl = (id: string): string => `${FAVORITES_URL}/${id}`;

// Inverse of `favoriteUrl`: returns null for anything that is not a single-favorite URL
export const favoriteIdFromUrl = (url: string): string | null => {
  if (!url.startsWith(`${FAVORITES_URL}/`)) {
    return null;
  }

  const id = url.slice(`${FAVORITES_URL}/`.length);

  return id.length > 0 && !id.includes('/') ? id : null;
};
