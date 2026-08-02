import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingStore } from '../services/loading.store';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingStore = inject(LoadingStore);

  loadingStore.start();

  return next(req).pipe(finalize(() => loadingStore.stop()));
};
