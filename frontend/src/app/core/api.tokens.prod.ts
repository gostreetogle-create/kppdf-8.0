import { InjectionToken } from '@angular/core';

/**
 * Prod override of `API_BASE_URL` — swapped in for `api.tokens.ts` by
 * `angular.json` `fileReplacements` when building the `production`
 * configuration.
 *
 * In prod, the static frontend (served by `start.mjs --prod` on :4200)
 * does not have a dev proxy, so requests must go directly to the backend
 * on :3000. The backend is expected to allow CORS for the prod origin
 * (configured in `backend/src/main.ts`).
 *
 * KEEP IN SYNC with api.tokens.ts — token name + shape must match.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000/api',
});
