import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGridItem } from './photo-grid-item';
import { Photo } from '../../types';
import { providePicsumImageLoader } from '../../../core/providers/picsum-image-loader';

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
      providers: [providePicsumImageLoader()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoGridItem);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
  });

  it('renders the thumbnail with a descriptive alt text', () => {
    const img = query('.thumbnail-img');

    expect(img.getAttribute('src')).toBe('https://picsum.photos/id/0/400/600');
    expect(img.getAttribute('alt')).toBe('Photo by Alejandro Escamilla');
  });

  it('offers a thumbnail candidate per configured width', () => {
    expect(query('.thumbnail-img').getAttribute('srcset')).toBe(
      'https://picsum.photos/id/0/200/300 200w, ' +
        'https://picsum.photos/id/0/400/600 400w, ' +
        'https://picsum.photos/id/0/600/900 600w'
    );
  });

  it('shows a blurred placeholder until the thumbnail loads', () => {
    expect(query('.thumbnail-img').style.backgroundImage).toContain(
      'https://picsum.photos/id/0/30/45?blur=1'
    );
  });

  it('renders the author and the original dimensions', () => {
    expect(query('.author-name').textContent).toBe('Alejandro Escamilla');
    expect(query('.dimensions-meta').textContent).toBe('5000 × 3333');
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

    it('ignores clicks so the photo cannot be favorited twice', () => {
      const photoSelected = vi.fn();
      fixture.componentInstance.photoSelected.subscribe(photoSelected);

      query('.photo-card').click();

      expect(photoSelected).not.toHaveBeenCalled();
    });
  });

  describe('when the card opens the photo instead of favoriting it', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('action', 'open');
      await fixture.whenStable();
    });

    it('labels the card as opening the photo', () => {
      expect(query('.photo-card').getAttribute('aria-label')).toBe(
        'View photo by Alejandro Escamilla'
      );
    });

    it('stays actionable for a photo that is already a favorite', async () => {
      const photoSelected = vi.fn();
      fixture.componentInstance.photoSelected.subscribe(photoSelected);
      fixture.componentRef.setInput('isFavorite', true);
      await fixture.whenStable();

      const card = query('.photo-card');
      card.click();

      expect(card.getAttribute('aria-label')).toBe('View photo by Alejandro Escamilla');
      expect(card.getAttribute('aria-disabled')).toBeNull();
      expect(photoSelected).toHaveBeenCalledExactlyOnceWith(photo);
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

    expect(img.getAttribute('src')).toBe('https://picsum.photos/id/1/400/600');
    expect(img.getAttribute('srcset')).toContain('https://picsum.photos/id/1/200/300 200w');
    expect(query('.dimensions-meta').textContent).toBe('100 × 200');
  });
});
