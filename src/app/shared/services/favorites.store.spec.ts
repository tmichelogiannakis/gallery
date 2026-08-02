import { TestBed } from '@angular/core/testing';
import { NEVER, Subject, firstValueFrom, of, throwError } from 'rxjs';
import { FavoritesService } from './favorites.service';
import { ADD_ERROR_MESSAGE, FavoritesStore } from './favorites.store';
import { Photo } from '../types';

const firstPhoto: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

const secondPhoto: Photo = {
  id: '1',
  author: 'Paul Jarvis',
  width: 2500,
  height: 1667
};

const photos: Photo[] = [firstPhoto, secondPhoto];

const newPhoto: Photo = {
  id: '2',
  author: 'Fabian Fauth',
  width: 4000,
  height: 3000
};

describe('FavoritesStore', () => {
  const createStore = (favoritesService: Partial<FavoritesService>) => {
    TestBed.configureTestingModule({
      providers: [{ provide: FavoritesService, useValue: favoritesService }]
    });

    return TestBed.inject(FavoritesStore);
  };

  describe('reading', () => {
    it('holds what came back', () => {
      const list = vi.fn().mockReturnValue(of(photos));
      const store = createStore({ list });

      store.refresh();

      expect(list).toHaveBeenCalledOnce();
      expect(store.photos()).toEqual(photos);
      expect(store.status()).toBe('loaded');
    });

    it('reads again every time it is asked to', () => {
      const list = vi.fn().mockReturnValue(of(photos));
      const store = createStore({ list });

      store.refresh();
      store.refresh();

      expect(list).toHaveBeenCalledTimes(2);
    });

    it('says it is loading while the request is out', () => {
      const store = createStore({ list: () => NEVER });

      store.refresh();

      expect(store.status()).toBe('loading');
      expect(store.photos()).toEqual([]);
    });

    it('reports a failed read without any favorites', () => {
      const store = createStore({ list: () => throwError(() => 'boom') });

      store.refresh();

      expect(store.status()).toBe('error');
      expect(store.photos()).toEqual([]);
    });

    it('leaves the read alone until something waits on it', () => {
      const list = vi.fn().mockReturnValue(of(photos));
      const store = createStore({ list });

      store.load();

      expect(list).not.toHaveBeenCalled();
      expect(store.status()).toBe('idle');
    });

    it('hands the favorites to whoever waits on the read', async () => {
      const store = createStore({ list: () => of(photos) });

      await expect(firstValueFrom(store.load())).resolves.toEqual(photos);
    });

    it('ends a failed read empty rather than in error, so it cannot block a navigation', async () => {
      const store = createStore({ list: () => throwError(() => 'boom') });

      await expect(firstValueFrom(store.load())).resolves.toEqual([]);
    });
  });

  describe('lookups', () => {
    it('recognises the photos it holds', () => {
      const store = createStore({ list: () => of(photos) });

      store.refresh();

      expect(store.isFavorite('0')).toBe(true);
      expect(store.isFavorite('2')).toBe(false);
    });

    it('hands back the photo behind an id', () => {
      const store = createStore({ list: () => of(photos) });

      store.refresh();

      expect(store.byId('1')).toEqual(secondPhoto);
      expect(store.byId('2')).toBeUndefined();
    });
  });

  describe('adding', () => {
    it('holds the photo before the request comes back', () => {
      const store = createStore({ list: () => of(photos), add: () => NEVER });

      store.refresh();
      store.add(newPhoto);

      expect(store.isFavorite(newPhoto.id)).toBe(true);
      expect(store.photos()).toEqual([...photos, newPhoto]);
    });

    it('keeps the photo once the request succeeds', () => {
      const store = createStore({ list: () => of(photos), add: (photo) => of(photo) });

      store.refresh();
      store.add(newPhoto);

      expect(store.photos()).toEqual([...photos, newPhoto]);
      expect(store.error()).toBeNull();
    });

    it('takes the photo back out when the request fails', () => {
      const pending = new Subject<Photo>();
      const store = createStore({ list: () => of(photos), add: () => pending });

      store.refresh();
      store.add(newPhoto);
      pending.error('boom');

      expect(store.photos()).toEqual(photos);
      expect(store.error()).toBe(ADD_ERROR_MESSAGE);
    });

    it('clears an earlier failure when a new write starts', () => {
      const add = vi
        .fn()
        .mockReturnValueOnce(throwError(() => 'boom'))
        .mockReturnValue(NEVER);
      const store = createStore({ list: () => of(photos), add });

      store.refresh();
      store.add(newPhoto);
      store.add(newPhoto);

      expect(store.error()).toBeNull();
    });

    it('ignores a photo it already holds', () => {
      const add = vi.fn().mockReturnValue(of(firstPhoto));
      const store = createStore({ list: () => of(photos), add });

      store.refresh();
      store.add(firstPhoto);

      expect(add).not.toHaveBeenCalled();
      expect(store.photos()).toEqual(photos);
    });
  });
});
