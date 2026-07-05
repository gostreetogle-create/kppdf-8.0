import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

/**
 * Paper & Ink foundation app config — TZ-30.
 * Auth interceptor (previously tied to login flow) is intentionally NOT
 * wired here: P&I is a UI-kit showcase, not the operational ERP. The
 * auth.service/auth.interceptor files remain in core/ as orphans for
 * reference if/when production ERP shell is reused.
 *
 * provideAnimationsAsync is required by TZ-48 CDK Overlay-based Dialog
 * and TZ-33 ThemeService toggle transition.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimationsAsync(),
  ],
};
