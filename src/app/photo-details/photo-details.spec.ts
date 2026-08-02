import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PhotoDetails } from './photo-details';
import { Photo } from '../shared/types';
import { providePicsumImageLoader } from '../core/providers/picsum-image-loader';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('PhotoDetails', () => {
  let fixture: ComponentFixture<PhotoDetails>;

  const image = () => fixture.nativeElement.querySelector('img') as HTMLImageElement | null;

  const author = () => fixture.nativeElement.querySelector('.photo-author')?.textContent;

  const meta = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.meta-entry dd')).map(
      (entry) => (entry as HTMLElement).textContent
    );

  const errorAlert = () => fixture.nativeElement.querySelector('app-alert.alert-error');

  const createComponent = (resolvedPhoto: Photo | null) => {
    TestBed.configureTestingModule({
      imports: [PhotoDetails],
      providers: [providePicsumImageLoader(), provideRouter([])]
    });

    fixture = TestBed.createComponent(PhotoDetails);
    fixture.componentRef.setInput('photo', resolvedPhoto);
    fixture.detectChanges();
  };

  it('renders the photo details', () => {
    createComponent(photo);

    expect(author()).toBe('Alejandro Escamilla');
    expect(meta()).toEqual(['5000 × 3333', '0']);
  });

  it('renders the image at the proportions of the photo', () => {
    createComponent(photo);

    expect(image()?.getAttribute('alt')).toBe('Photo by Alejandro Escamilla');
    expect(image()?.getAttribute('srcset')).toContain('https://picsum.photos/id/0/600/400 600w');
  });

  it('shows an error when the photo could not be resolved', () => {
    createComponent(null);

    expect(errorAlert()).not.toBeNull();
    expect(image()).toBeNull();
  });
});
