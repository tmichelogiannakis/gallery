import { picsumImageLoader } from './picsum-image-loader';

describe('picsumImageLoader', () => {
  it('builds a square url at the requested width when no aspect ratio is supplied', () => {
    expect(picsumImageLoader({ src: '0', width: 640 })).toBe('https://picsum.photos/id/0/640/640');
  });

  it('falls back to a default width when none is requested', () => {
    expect(picsumImageLoader({ src: '0' })).toBe('https://picsum.photos/id/0/400/400');
  });

  it('derives the height from the aspect ratio the caller asks for', () => {
    expect(picsumImageLoader({ src: '0', width: 600, loaderParams: { aspectRatio: 3 / 2 } })).toBe(
      'https://picsum.photos/id/0/600/400'
    );

    expect(picsumImageLoader({ src: '0', width: 200, loaderParams: { aspectRatio: 2 / 3 } })).toBe(
      'https://picsum.photos/id/0/200/300'
    );
  });

  it('ignores an aspect ratio that is not a positive number', () => {
    for (const aspectRatio of [0, -2, Number.NaN, Number.POSITIVE_INFINITY, '2', null]) {
      expect(picsumImageLoader({ src: '0', width: 300, loaderParams: { aspectRatio } })).toBe(
        'https://picsum.photos/id/0/300/300'
      );
    }
  });

  it('blurs the placeholder', () => {
    expect(picsumImageLoader({ src: '0', width: 30, isPlaceholder: true })).toBe(
      'https://picsum.photos/id/0/30/30?blur=1'
    );
  });
});
