import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { Observable, firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { photoResolver } from './photo.resolver';
import { FavoritesService } from '../shared/services/favorites.service';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Photo } from '../shared/types';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('photoResolver', () => {
  const resolve = (
    favoritesService: Partial<FavoritesService>,
    id: string,
    favorites: Photo[] = []
  ) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FavoritesService,
          useValue: { list: () => of(favorites), ...favoritesService }
        }
      ]
    });

    TestBed.inject(FavoritesStore).refresh();

    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;

    const resolved = TestBed.runInInjectionContext(() =>
      photoResolver(route, {} as RouterStateSnapshot)
    );

    return isObservable(resolved)
      ? firstValueFrom(resolved as Observable<Photo | null>)
      : Promise.resolve(resolved as Photo | null);
  };

  it('hands back the photo the store already holds, without a request', async () => {
    const get = vi.fn();

    const resolved = await resolve({ get }, '0', [photo]);

    expect(get).not.toHaveBeenCalled();
    expect(resolved).toEqual(photo);
  });

  it('fetches the photo named by the route when the store does not hold it', async () => {
    const get = vi.fn().mockReturnValue(of(photo));

    const resolved = await resolve({ get }, '0');

    expect(get).toHaveBeenCalledExactlyOnceWith('0');
    expect(resolved).toEqual(photo);
  });

  it('resolves to null when the request errors, so the navigation still happens', async () => {
    const resolved = await resolve({ get: () => throwError(() => 'boom') }, '0');

    expect(resolved).toBeNull();
  });
});
