import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingStore } from '../services/loading.store';

const URL = 'https://picsum.photos/v2/list';
const OTHER_URL = 'https://picsum.photos/id/0/info';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingStore: LoadingStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingStore = TestBed.inject(LoadingStore);
  });

  afterEach(() => {
    httpMock.verify({ ignoreCancelled: true });
  });

  it('reports loading while a request is in flight', () => {
    http.get(URL).subscribe();

    expect(loadingStore.isLoading()).toBe(true);

    httpMock.expectOne(URL).flush([]);
  });

  it('stops reporting loading once the request has responded', () => {
    http.get(URL).subscribe();
    httpMock.expectOne(URL).flush([]);

    expect(loadingStore.isLoading()).toBe(false);
  });

  it('stops reporting loading when the request fails', () => {
    http.get(URL).subscribe({ error: () => undefined });
    httpMock
      .expectOne(URL)
      .flush('went wrong', { status: 500, statusText: 'Internal Server Error' });

    expect(loadingStore.isLoading()).toBe(false);
  });

  it('stops reporting loading when the request is cancelled', () => {
    const subscription = http.get(URL).subscribe();
    httpMock.expectOne(URL);

    subscription.unsubscribe();

    expect(loadingStore.isLoading()).toBe(false);
  });

  it('keeps reporting loading until every concurrent request has finished', () => {
    http.get(URL).subscribe();
    http.get(OTHER_URL).subscribe();

    httpMock.expectOne(URL).flush([]);

    expect(loadingStore.isLoading()).toBe(true);

    httpMock.expectOne(OTHER_URL).flush({});

    expect(loadingStore.isLoading()).toBe(false);
  });
});
