import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LucideAngularModule } from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { API_BASE_URL, DEFAULT_API_BASE } from './core/tokens';
import { APP_LUCIDE_ICONS } from './core/app-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
    provideAnimationsAsync(),
    /**
     * Register every Lucide icon used anywhere in the app with the
     * `<lucide-icon>` directive. Centralised in `core/app-icons.ts` so the
     * bundle is tree-shaken to only the icons actually referenced.
     */
    importProvidersFrom(LucideAngularModule.pick(APP_LUCIDE_ICONS)),
    { provide: API_BASE_URL, useValue: DEFAULT_API_BASE },
  ],
};
