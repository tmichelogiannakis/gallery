import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router, provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';
import type { MockInstance } from 'vitest';
import { PhotoDetails } from './photo-details';
import { ConfirmDialog } from './components/confirm-dialog/confirm-dialog';
import { FavoritesService } from '../shared/services/favorites.service';
import { FavoritesStore, REMOVE_ERROR_MESSAGE } from '../shared/services/favorites.store';
import { Photo } from '../shared/types';
import { provideFakeImageLoader } from '../../testing/image-loader';
import { expectNoAxeViolations } from '../../testing/axe';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('PhotoDetails', () => {
  let fixture: ComponentFixture<PhotoDetails>;
  let favoritesService: { list: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
  let favoritesStore: FavoritesStore;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let confirmation: Subject<boolean>;
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

  const answerConfirmation = (confirmed: boolean) => {
    confirmation.next(confirmed);
    fixture.detectChanges();
  };

  const createComponent = (resolvedPhoto: Photo | null) => {
    favoritesService = { list: vi.fn().mockReturnValue(of([photo])), remove: vi.fn() };
    confirmation = new Subject<boolean>();
    dialog = { open: vi.fn(() => ({ afterClosed: () => confirmation })) };

    TestBed.configureTestingModule({
      imports: [PhotoDetails],
      providers: [
        provideFakeImageLoader(),
        provideRouter([]),
        { provide: FavoritesService, useValue: favoritesService },
        { provide: MatDialog, useValue: dialog }
      ]
    });

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    favoritesStore = TestBed.inject(FavoritesStore);
    favoritesStore.refresh();

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
    expect(image()?.getAttribute('srcset')).toContain(
      `/img/0/600?ar=${photo.width / photo.height} 600w`
    );
  });

  it('spells out the dimensions for screen readers', () => {
    createComponent(photo);

    const dimensions = fixture.nativeElement.querySelector('.meta-entry dd') as HTMLElement;

    expect(dimensions.getAttribute('aria-label')).toBe('5000 by 3333 pixels');
  });

  it('names the photo in the document title', () => {
    createComponent(photo);

    expect(TestBed.inject(Title).getTitle()).toBe('Photo by Alejandro Escamilla · Gallery');
  });

  it('shows an error when the photo could not be resolved', () => {
    createComponent(null);

    expect(errorAlert()).not.toBeNull();
    expect(image()).toBeNull();
  });

  it('has no axe violations', async () => {
    createComponent(photo);

    await expectNoAxeViolations(fixture);
  });

  it('has no axe violations when the photo could not be resolved', async () => {
    createComponent(null);

    await expectNoAxeViolations(fixture);
  });

  it('asks for confirmation before removing the photo', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialog, expect.anything());
    expect(favoritesService.remove).not.toHaveBeenCalled();
  });

  it('removes the photo from the favorites once the removal is confirmed', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();
    answerConfirmation(true);

    expect(favoritesService.remove).toHaveBeenCalledWith('0');
  });

  it('keeps the photo when the confirmation is declined', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();
    answerConfirmation(false);

    expect(favoritesService.remove).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes back to the favorites without waiting for the removal', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();
    answerConfirmation(true);

    expect(navigate).toHaveBeenCalledWith(['/favorites']);
  });

  it('takes the photo out of the favorites everyone else reads right away', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(new Subject<void>());

    clickRemove();
    answerConfirmation(true);

    expect(favoritesStore.photos()).toEqual([]);
  });

  it('leaves the failed removal to the store to undo', () => {
    createComponent(photo);
    favoritesService.remove.mockReturnValue(throwError(() => new Error('failed')));

    clickRemove();
    answerConfirmation(true);

    expect(navigate).toHaveBeenCalledWith(['/favorites']);
    expect(favoritesStore.photos()).toEqual([photo]);
    expect(favoritesStore.error()).toBe(REMOVE_ERROR_MESSAGE);
  });

  it('offers no removal when the photo could not be resolved', () => {
    createComponent(null);

    expect(removeButton()).toBeNull();
  });
});
