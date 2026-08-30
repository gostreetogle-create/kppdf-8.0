import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '@kppdf/util-http';
import {
  AuthService,
  authInterceptor,
  idempotencyInterceptor,
} from '@kppdf/data-access';
import { appRoutes } from './app.routes';
import { provideAppInitializer, inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([idempotencyInterceptor, authInterceptor])),
    provideAppInitializer(() => inject(AuthService).bootstrap()),
    { provide: API_BASE_URL, useValue: '/api' },
  ],
};
