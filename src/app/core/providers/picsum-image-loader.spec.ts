import { picsumImageLoader } from './picsum-image-loader';

describe('picsumImageLoader', () => {
  it('builds a thumbnail url at the requested width, keeping the 2 / 3 aspect ratio', () => {
    expect(picsumImageLoader({ src: '0', width: 640 })).toBe('https://picsum.photos/id/0/640/960');
  });

  it('falls back to a default width when none is requested', () => {
    expect(picsumImageLoader({ src: '0' })).toBe('https://picsum.photos/id/0/400/600');
  });

  it('blurs the placeholder', () => {
    expect(picsumImageLoader({ src: '0', width: 30, isPlaceholder: true })).toBe(
      'https://picsum.photos/id/0/30/45?blur=1'
    );
  });
});
