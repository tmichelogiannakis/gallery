import { FAVORITES_URL, favoriteIdFromUrl, favoriteUrl } from './favorites.api';

describe('favorites api', () => {
  it('should build a single-favorite url from an id', () => {
    expect(favoriteUrl('0')).toBe(`${FAVORITES_URL}/0`);
  });

  it('should read back an id it built', () => {
    expect(favoriteIdFromUrl(favoriteUrl('0'))).toBe('0');
  });

  it('should return null for the collection url', () => {
    expect(favoriteIdFromUrl(FAVORITES_URL)).toBeNull();
    expect(favoriteIdFromUrl(`${FAVORITES_URL}/`)).toBeNull();
  });

  it('should return null for a nested path', () => {
    expect(favoriteIdFromUrl(`${FAVORITES_URL}/0/tags`)).toBeNull();
  });

  it('should return null for an unrelated url', () => {
    expect(favoriteIdFromUrl('https://picsum.photos/v2/list')).toBeNull();
  });
});
