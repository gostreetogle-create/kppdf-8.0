import { InjectionToken } from '@angular/core';

/**
 * Base URL of the backend API, including the global `/api` prefix mounted
 * by NestJS (`app.setGlobalPrefix('api')`).
 *
 * Override in dev with environment files (TODO) or by providing a different
 * value in `app.config.ts` before bootstrap.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000/api',
});
