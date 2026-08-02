import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { favoritesResolver } from './favorites.resolver';
import { FavoritesService } from '../shared/services/favorites.service';
import { FavoritesStore } from '../shared/services/favorites.store';
import { Photo } from '../shared/types';

const photos: Photo[] = [
  {
    id: '0',
    author: 'Alejandro Escamilla',
    width: 5000,
    height: 3333
  }
];

describe('favoritesResolver', () => {
  const setUp = (favoritesService: Pick<FavoritesService, 'list'>) => {
    TestBed.configureTestingModule({
      providers: [{ provide: FavoritesService, useValue: favoritesService }]
    });
  };

  const resolve = () =>
    TestBed.runInInjectionContext(() =>
      favoritesResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    ) as Observable<Photo[]>;

  it('holds the navigation until the favorites arrive', async () => {
    setUp({ list: () => of(photos) });

    await expect(firstValueFrom(resolve())).resolves.toEqual(photos);
    expect(TestBed.inject(FavoritesStore).photos()).toEqual(photos);
  });

  it('reads again on a later visit', async () => {
    const list = vi.fn().mockReturnValue(of(photos));
    setUp({ list });

    await firstValueFrom(resolve());
    await firstValueFrom(resolve());

    expect(list).toHaveBeenCalledTimes(2);
  });

  it('lets the navigation through when the request fails, so the page can offer a retry', async () => {
    setUp({ list: () => throwError(() => 'boom') });

    await expect(firstValueFrom(resolve())).resolves.toEqual([]);
    expect(TestBed.inject(FavoritesStore).status()).toBe('error');
  });
});
