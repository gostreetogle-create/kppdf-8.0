import { InjectionToken } from '@angular/core';

/**
 * Base URL of the backend API, including the global `/api` prefix mounted
 * by NestJS (`app.setGlobalPrefix('api')`).
 *
 * In **development**, defaults to the RELATIVE `/api` path so requests go
 * through the Angular dev server's proxy (`frontend/proxy.conf.json`),
 * which forwards to `http://localhost:3000`. Same-origin → no CORS
 * preflight, and browser-use can drive real auth flows.
 *
 * In **production**, this file is replaced by `api.tokens.prod.ts` via
 * `angular.json` `fileReplacements` — see that file for the absolute URL
 * override.
 *
 * KEEP IN SYNC with api.tokens.prod.ts — token name + shape must match.
 *
 * Override in `app.config.ts` for E2E tests pointing at a remote staging
 * API, or via the legacy `provide` mechanism in TestBed.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
