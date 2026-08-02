import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGridItem } from './photo-grid-item';
import { Photo } from '../../../shared/types';
import { providePicsumImageLoader } from '../../../shared/picsum-image-loader';

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
