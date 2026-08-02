import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import type { MockInstance } from 'vitest';
import { PhotoDetails } from './photo-details';
import { FavoritesService } from '../shared/services/favorites.service';
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
  let favoritesService: { remove: ReturnType<typeof vi.fn> };
  let navigate: MockInstance<Router['navigate']>;

  const image = () => fixture.nativeElement.querySelector('img') as HTMLImageElement | null;

  const author = () => fixture.nativeElement.querySelector('.photo-author')?.textContent;

  const meta = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.meta-entry dd')).map(
      (entry) => (entry as HTMLElement).textContent
    );

  const errorAlert = () => fixture.nativeElement.querySelector('app-alert.alert-error');

  const removeButton = () =>
    fixture.nativeElement.querySelector('.remove-button') as HTMLButtonElement | null;

  const clickRemove = () => {
    removeButton()?.click();
    fixture.detectChanges();
  };

  const createComponent = (resolvedPhoto: Photo | null) => {
    favoritesService = { remove: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PhotoDetails],
      providers: [
        providePicsumImageLoader(),
        provideRouter([]),
        { provide: FavoritesService, useValue: favoritesService }
      ]
    });

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(PhotoDetails);
    fixture.componentRef.setInput('photo', resolvedPhoto);
    fixture.detectChanges();
  };

  it('renders the photo details', () => {
    createComponent(photo);

    expect(author()).toBe('Alejandro Escamilla');
    expect(meta()).toEqual(['5000 × 3333']);
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

  it('removes the photo from the favorites', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();

    expect(favoritesService.remove).toHaveBeenCalledWith('0');
  });

  it('goes back to the favorites once the photo has been removed', () => {
    createComponent(photo);
    const removal = new Subject<void>();
    favoritesService.remove.mockReturnValue(removal);

    clickRemove();
    removal.next();

    expect(navigate).toHaveBeenCalledWith(['/favorites']);
  });

  it('stays on the page until the removal has come back', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not remove the photo twice while a removal is in flight', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();
    fixture.componentInstance.removeFromFavorites();

    expect(favoritesService.remove).toHaveBeenCalledTimes(1);
    expect(removeButton()?.disabled).toBe(true);
  });

  it('shows an error and stays on the page when the removal fails', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(throwError(() => new Error('failed')));

    clickRemove();

    expect(errorAlert()).not.toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    expect(removeButton()?.disabled).toBe(false);
  });

  it('offers no removal when the photo could not be resolved', () => {
    createComponent(null);

    expect(removeButton()).toBeNull();
  });
});
