import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePicsumImageLoader } from './core/providers/picsum-image-loader';
import { favoritesInterceptor } from './core/interceptors/favorites.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([favoritesInterceptor])),
    providePicsumImageLoader()
  ]
};
