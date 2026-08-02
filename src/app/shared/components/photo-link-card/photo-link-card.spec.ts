import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PhotoLinkCard } from './photo-link-card';
import { Photo } from '../../types';
import { provideFakeImageLoader } from '../../../../testing/image-loader';
import { expectNoAxeViolations } from '../../../../testing/axe';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('PhotoLinkCard', () => {
  let fixture: ComponentFixture<PhotoLinkCard>;

  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoLinkCard],
      providers: [provideFakeImageLoader(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoLinkCard);
    fixture.componentRef.setInput('photo', photo);
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

  it('names the link after the photo it opens', () => {
    expect(query('.thumbnail-img').getAttribute('alt')).toBe('Photo by Alejandro Escamilla');
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(fixture);
  });
});
