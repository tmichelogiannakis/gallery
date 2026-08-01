import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Photo } from '../../shared/types';
import { Photos, PICSUM_LIST_URL } from './photos';

const DELAY_MS = 500;
const RETRY_DELAY_MS = 250;

const rawPhoto = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333,
  url: 'https://unsplash.com/photos/yC-Yzbqy7PY',
  download_url: 'https://picsum.photos/id/0/5000/3333'
};

const photo: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5000,
  height: 3333,
  thumbUrl: 'https://picsum.photos/id/0/400/600',
  originalUrl: 'https://picsum.photos/id/0/5000/3333'
};

describe('Photos', () => {
  let service: Photos;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(Photos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('requests the given page with the fixed page size', () => {
    service.list(2).subscribe();

    const req = httpMock.expectOne((request) => request.url === PICSUM_LIST_URL);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('30');

    req.flush([rawPhoto]);
  });

  it('maps the response to photos on success', async () => {
    let result: Photo[] | undefined;
    service.list(1).subscribe((photos) => (result = photos));

    httpMock.expectOne((request) => request.url === PICSUM_LIST_URL).flush([rawPhoto]);
    await vi.advanceTimersByTimeAsync(DELAY_MS);

    expect(result).toEqual([photo]);
  });

  it('retries twice before succeeding', async () => {
    let result: Photo[] | undefined;
    service.list(1).subscribe((photos) => (result = photos));

    for (let attempt = 0; attempt < 2; attempt++) {
      httpMock
        .expectOne((request) => request.url === PICSUM_LIST_URL)
        .flush(null, { status: 500, statusText: 'Server Error' });
      await vi.advanceTimersByTimeAsync(DELAY_MS + RETRY_DELAY_MS);
    }
    httpMock.expectOne((request) => request.url === PICSUM_LIST_URL).flush([rawPhoto]);
    await vi.advanceTimersByTimeAsync(DELAY_MS);

    expect(result).toEqual([photo]);
  });

  it('falls back to an empty list after exhausting all retries', async () => {
    let result: Photo[] | undefined;
    service.list(1).subscribe((photos) => (result = photos));

    for (let attempt = 0; attempt < 3; attempt++) {
      httpMock
        .expectOne((request) => request.url === PICSUM_LIST_URL)
        .flush(null, { status: 500, statusText: 'Server Error' });
      await vi.advanceTimersByTimeAsync(DELAY_MS + RETRY_DELAY_MS);
    }

    expect(result).toEqual([]);
  });
});
