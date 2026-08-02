import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { delay, map, Observable, retry, throwError, timer } from 'rxjs';
import { Photo } from '../../shared/types';

interface ListItem {
  readonly id: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly download_url: string;
}

const PICSUM_LIST_URL = 'https://picsum.photos/v2/list';
export const DELAY_MS = 500;
const PAGE_SIZE = 20;
const RETRY_COUNT = 2;
export const RETRY_DELAY_MS = 250;

const isRetryable = (error: unknown): boolean =>
  error instanceof HttpErrorResponse &&
  (error.status >= 500 || [0, 408, 429].includes(error.status));

@Service()
export class PhotosService {
  private readonly http = inject(HttpClient);

  list(page: number): Observable<Photo[]> {
    const params = new HttpParams().set('page', page).set('limit', PAGE_SIZE);

    return this.http.get<ListItem[]>(PICSUM_LIST_URL, { params }).pipe(
      delay(DELAY_MS),
      retry({
        count: RETRY_COUNT,
        delay: (error) => (isRetryable(error) ? timer(RETRY_DELAY_MS) : throwError(() => error))
      }),
      map((items) =>
        items.map(({ id, width, height, author }) => {
          return {
            id,
            width,
            height,
            author
          };
        })
      )
    );
  }
}
