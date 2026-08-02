import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGridItem } from './photo-grid-item';
import { Photo } from '../../../shared/types';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333,
  thumbnailUrl: 'https://picsum.photos/id/0/400/600',
  originalUrl: 'https://picsum.photos/id/0/5000/3333'
};

describe('PhotoGridItem', () => {
  let fixture: ComponentFixture<PhotoGridItem>;

  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoGridItem]
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

  it('renders the author and the original dimensions', () => {
    expect(query('.author-name').textContent).toBe('Alejandro Escamilla');
    expect(query('.dimensions-meta').textContent).toBe('5000 × 3333');
  });

  it('updates the rendered details when the photo changes', async () => {
    const nextPhoto: Photo = {
      ...photo,
      id: '1',
      width: 100,
      height: 200,
      thumbnailUrl: 'https://picsum.photos/id/1/400/600'
    };

    fixture.componentRef.setInput('photo', nextPhoto);
    await fixture.whenStable();

    expect(query('.thumbnail-img').getAttribute('src')).toBe('https://picsum.photos/id/1/400/600');
    expect(query('.dimensions-meta').textContent).toBe('100 × 200');
  });
});
