import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { photoResolver } from './photo.resolver';
import { FavoritesService } from '../shared/services/favorites.service';
import { Photo } from '../shared/types';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

describe('photoResolver', () => {
  const resolve = (favoritesService: Pick<FavoritesService, 'get'>, id: string) => {
    TestBed.configureTestingModule({
      providers: [{ provide: FavoritesService, useValue: favoritesService }]
    });

    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;

    return TestBed.runInInjectionContext(() =>
      photoResolver(route, {} as RouterStateSnapshot)
    ) as Observable<Photo | null>;
  };

  it('fetches the photo named by the route', async () => {
    const get = vi.fn().mockReturnValue(of(photo));

    const resolved = await firstValueFrom(resolve({ get }, '0'));

    expect(get).toHaveBeenCalledExactlyOnceWith('0');
    expect(resolved).toEqual(photo);
  });

  it('resolves to null when the request errors, so the navigation still happens', async () => {
    const resolved = await firstValueFrom(resolve({ get: () => throwError(() => 'boom') }, '0'));

    expect(resolved).toBeNull();
  });
});
