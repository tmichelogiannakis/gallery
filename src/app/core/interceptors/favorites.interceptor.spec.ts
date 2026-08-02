import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  HttpClient,
  HttpResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { Photo } from '../../shared/types';
import { favoritesInterceptor, FAVORITES_STORAGE_KEY, LATENCY_MS } from './favorites.interceptor';
import { FAVORITES_URL } from '../../shared/services/favorites.service';

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333
};

const otherPhoto: Photo = {
  id: '1',
  author: 'Paul Jarvis',
  width: 2500,
  height: 1667
};

describe('favoritesInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const storedFavorites = () =>
    JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]') as Photo[];

  const postFavorite = (favorite: Photo) => http.post<Photo>(FAVORITES_URL, favorite);

  /** Lets the faked backend latency elapse so the response reaches the subscriber. */
  const settle = () => vi.advanceTimersByTimeAsync(LATENCY_MS);

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([favoritesInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.useRealTimers();
  });

  it('stores the posted photo instead of reaching the network', async () => {
    postFavorite(photo).subscribe();
    await settle();

    expect(storedFavorites()).toEqual([photo]);
    httpMock.expectNone(FAVORITES_URL);
  });

  it('appends to the photos already stored', async () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([otherPhoto]));

    postFavorite(photo).subscribe();
    await settle();

    expect(storedFavorites()).toEqual([otherPhoto, photo]);
  });

  it('stores a photo once, however many times it is posted', async () => {
    postFavorite(photo).subscribe();
    await settle();
    postFavorite(photo).subscribe();
    await settle();

    expect(storedFavorites()).toEqual([photo]);
  });

  it('answers with the created favorite', async () => {
    let response: HttpResponse<Photo> | undefined;
    http
      .post<Photo>(FAVORITES_URL, photo, { observe: 'response' })
      .subscribe((res) => (response = res));
    await settle();

    expect(response?.status).toBe(201);
    expect(response?.body).toEqual(photo);
  });

  it('keeps the response pending until the faked latency has elapsed', async () => {
    let response: Photo | undefined;
    postFavorite(photo).subscribe((favorite) => (response = favorite));

    await vi.advanceTimersByTimeAsync(LATENCY_MS - 1);

    expect(response).toBeUndefined();
  });

  it('starts over when the stored favorites are unreadable', async () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, 'not json');

    postFavorite(photo).subscribe();
    await settle();

    expect(storedFavorites()).toEqual([photo]);
  });

  it('leaves requests to other endpoints alone', async () => {
    http.get('https://picsum.photos/v2/list').subscribe();
    await settle();

    httpMock.expectOne('https://picsum.photos/v2/list').flush([]);
    expect(storedFavorites()).toEqual([]);
  });

  it('leaves other methods on the favorites endpoint alone', async () => {
    http.get<Photo[]>(FAVORITES_URL).subscribe();
    await settle();

    httpMock.expectOne(FAVORITES_URL).flush([]);
  });
});
