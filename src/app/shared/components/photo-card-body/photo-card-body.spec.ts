import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCardBody } from './photo-card-body';
import { Photo } from '../../types';
import { provideFakeImageLoader } from '../../../../testing/image-loader';
import { PHOTO_GRID_ITEM_WIDTH_PX } from '../../directives/photo-grid.directive';

const THUMBNAIL_RATIO = 2 / 3;

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('PhotoCardBody', () => {
  let fixture: ComponentFixture<PhotoCardBody>;

  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoCardBody],
      providers: [provideFakeImageLoader()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoCardBody);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
  });

  it('renders the thumbnail with a descriptive alt text', () => {
    const img = query('.thumbnail-img');

    expect(img.getAttribute('src')).toBe(`/img/0?ar=${THUMBNAIL_RATIO}`);
    expect(img.getAttribute('alt')).toBe('Photo by Alejandro Escamilla');
  });

  it('offers a thumbnail candidate per configured width', () => {
    expect(query('.thumbnail-img').getAttribute('srcset')).toBe(
      `/img/0/200?ar=${THUMBNAIL_RATIO} 200w, ` +
        `/img/0/400?ar=${THUMBNAIL_RATIO} 400w, ` +
        `/img/0/600?ar=${THUMBNAIL_RATIO} 600w`
    );
  });

  it('shows a placeholder until the thumbnail loads', () => {
    expect(query('.thumbnail-img').style.backgroundImage).toContain(
      `/img/0/30?ar=${THUMBNAIL_RATIO}&placeholder=1`
    );
  });

  it('paints the thumbnail box at the ratio it crops the image to', () => {
    const requestedRatio = new URL(
      query('.thumbnail-img').getAttribute('src') ?? '',
      'http://localhost'
    ).searchParams.get('ar');

    const [ratioWidth, ratioHeight] = query('.thumbnail-wrapper').style.aspectRatio.split('/');

    expect(Number(ratioWidth) / Number(ratioHeight)).toBeCloseTo(Number(requestedRatio));
  });

  it('tells the browser the thumbnail is displayed at the grid column width', () => {
    // `NgOptimizedImage` prefixes lazy images with `auto`, hence the substring match
    expect(query('.thumbnail-img').getAttribute('sizes')).toContain(
      `${PHOTO_GRID_ITEM_WIDTH_PX}px`
    );
  });

  it('renders the author and the original dimensions', () => {
    expect(query('.author-name').textContent).toBe('Alejandro Escamilla');
    expect(query('.dimensions-meta').textContent).toBe('5000 × 3333');
  });

  it('spells out the dimensions for screen readers', () => {
    expect(query('.dimensions-meta').getAttribute('aria-label')).toBe('5000 by 3333 pixels');
  });

  it('updates the rendered details when the photo changes', async () => {
    const nextPhoto: Photo = {
      ...photo,
      id: '1',
      width: 100,
      height: 200
    };

    fixture.componentRef.setInput('photo', nextPhoto);
    await fixture.whenStable();

    const img = query('.thumbnail-img');

    expect(img.getAttribute('src')).toBe(`/img/1?ar=${THUMBNAIL_RATIO}`);
    expect(img.getAttribute('srcset')).toContain(`/img/1/200?ar=${THUMBNAIL_RATIO} 200w`);
    expect(query('.dimensions-meta').textContent).toBe('100 × 200');
  });
});
