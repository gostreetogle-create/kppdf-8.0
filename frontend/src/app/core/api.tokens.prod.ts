import { InjectionToken } from '@angular/core';

/**
 * Prod override of `API_BASE_URL` — swapped in for `api.tokens.ts` by
 * `angular.json` `fileReplacements` when building the `production`
 * configuration.
 *
 * Uses a relative `/api` path so the browser sends requests to the same
 * origin that serves the frontend. In production deployments (e.g.
 * sport-set.ru) the backend and frontend are co-located or routed through
 * a reverse proxy, making same-origin the correct choice.
 *
 * KEEP IN SYNC with api.tokens.ts — token name + shape must match.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
