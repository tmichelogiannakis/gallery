import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoFavoriteCard } from './photo-favorite-card';
import { Photo } from '../../types';
import { provideFakeImageLoader } from '../../../../testing/image-loader';
import { expectNoAxeViolations } from '../../../../testing/axe';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('PhotoFavoriteCard', () => {
  let fixture: ComponentFixture<PhotoFavoriteCard>;

  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoFavoriteCard],
      providers: [provideFakeImageLoader()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoFavoriteCard);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
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
});
