import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PhotoGridItem } from './photo-grid-item';
import { Photo } from '../../types';
import { provideFakeImageLoader } from '../../../../testing/image-loader';
import { expectNoAxeViolations } from '../../../../testing/axe';
import { PHOTO_GRID_ITEM_WIDTH_PX } from '../../directives/photo-grid.directive';

const THUMBNAIL_RATIO = 2 / 3;

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('PhotoGridItem', () => {
  let fixture: ComponentFixture<PhotoGridItem>;

  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoGridItem],
      providers: [provideFakeImageLoader(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoGridItem);
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

  it('offers the card as a labelled control for favoriting the photo', () => {
    const card = query('.photo-card');

    expect(card.tagName).toBe('BUTTON');
    expect(card.getAttribute('aria-label')).toBe('Add photo by Alejandro Escamilla to favorites');
    expect(card.getAttribute('aria-disabled')).toBeNull();
  });

  it('emits the photo when the card is clicked', () => {
    const photoSelected = vi.fn();
    fixture.componentInstance.photoSelected.subscribe(photoSelected);

    query('.photo-card').click();

    expect(photoSelected).toHaveBeenCalledExactlyOnceWith(photo);
  });

  it('leaves the photo unbadged until it is a favorite', () => {
    expect(query('.favorite-badge')).toBeNull();
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(fixture);
  });

  describe('when the photo is already a favorite', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('isFavorite', true);
      await fixture.whenStable();
    });

    it('badges the card', () => {
      expect(query('.favorite-badge')).not.toBeNull();
    });

    it('says the photo is already a favorite rather than offering to add it', () => {
      expect(query('.photo-card').getAttribute('aria-label')).toBe(
        'Photo by Alejandro Escamilla is in your favorites'
      );
    });

    it('marks the card as unavailable while keeping it in the tab order', () => {
      const card = query('.photo-card') as HTMLButtonElement;

      expect(card.getAttribute('aria-disabled')).toBe('true');
      expect(card.disabled).toBe(false);
    });

    it('has no axe violations', async () => {
      await expectNoAxeViolations(fixture);
    });

    it('ignores clicks so the photo cannot be favorited twice', () => {
      const photoSelected = vi.fn();
      fixture.componentInstance.photoSelected.subscribe(photoSelected);

      query('.photo-card').click();

      expect(photoSelected).not.toHaveBeenCalled();
    });
  });

  describe('when the card opens the photo instead of favoriting it', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('link', ['/photos', photo.id]);
      await fixture.whenStable();
    });

    // A link so the photo can be opened in a new tab, copied, and announced as a link
    it('offers the card as a link to the photo', () => {
      const card = query('.photo-card');

      expect(card.tagName).toBe('A');
      expect(card.getAttribute('href')).toBe('/photos/0');
      expect(card.textContent).toContain('Alejandro Escamilla');
    });

    it('stays actionable for a photo that is already a favorite', async () => {
      fixture.componentRef.setInput('isFavorite', true);
      await fixture.whenStable();

      const card = query('.photo-card');

      expect(card.getAttribute('href')).toBe('/photos/0');
      expect(card.getAttribute('aria-disabled')).toBeNull();
      expect(query('.favorite-badge')).not.toBeNull();
    });

    it('has no axe violations', async () => {
      await expectNoAxeViolations(fixture);
    });
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
