import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { AuthService } from './core/auth.service';
import { authInterceptor } from './core/auth.interceptor';

/**
 * TZ-NEW (site-mode) — Paper & Ink + KPPDF site app config.
 *
 * `provideAppInitializer` is the Angular 19+ replacement for
 * `APP_INITIALIZER`. We use it to call `AuthService.bootstrap()` once
 * before the app renders — this re-validates any persisted JWT
 * against /auth/me and clears stale state on 401.
 *
 * The auth interceptor attaches `Authorization: Bearer <token>` to
 * every backend call EXCEPT /auth/login, /auth/register, /auth/refresh
 * (those are public per the backend's Public() decorators).
 *
 * provideAnimationsAsync is required by TZ-48 CDK Overlay-based
 * Dialog and TZ-33 ThemeService toggle transition.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideAppInitializer(() => inject(AuthService).bootstrap()),
  ],
};
