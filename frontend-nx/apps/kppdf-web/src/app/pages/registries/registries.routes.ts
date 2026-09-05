import type { Route, UrlMatchResult, UrlSegment } from '@angular/router';

/**
 * TZ-NX-REGISTRIES-PLATFORM / TZ-NX-REGISTRIES-MASTER-TABLE-UX. Deliberately
 * no `canMatch`/`capabilityRouteGuard`/`data.pageKey` here: neither
 * `'registries'` nor any per-registry key has a real backend-seeded
 * permission, and the task forbids inventing one. `/registries` is reached
 * only as an authenticated child of the shell (`app.routes.ts` nests this
 * under `canMatch: [authGuard]`).
 *
 * Both `/registries` and `/registries/:registryKey` render THE SAME
 * `RegistriesPage` component — the master table + inline detail panel is one
 * page; `:registryKey` only decides which master row (if any) is expanded.
 * See `registries-page.ts`.
 *
 * TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE: a plain two-entry `Route[]` (one
 * `path: ''`, one `path: ':registryKey'`) are two DIFFERENT route config
 * objects. Angular's default `RouteReuseStrategy` decides reuse by
 * `future.routeConfig === curr.routeConfig`; two different objects fail that
 * check, so every master-row expand/collapse (which navigates between these
 * two paths) destroyed and recreated the whole `RegistriesPage` — tearing
 * down the entire master table + `.shell-main` subtree on every click. That
 * was the actual root cause of the scroll jump, not just a missing scroll
 * restore. A single `UrlMatcher`-based route keeps ONE route config object
 * for both URL shapes, so Angular reuses the SAME component instance across
 * navigation — only `ActivatedRoute.paramMap` changes, which `RegistriesPage`
 * already consumes reactively via `toSignal`.
 */
function registriesUrlMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) {
    return { consumed: segments, posParams: {} };
  }
  if (segments.length === 1) {
    return { consumed: segments, posParams: { registryKey: segments[0] } };
  }
  return null;
}

export const REGISTRIES_ROUTES: Route[] = [
  {
    matcher: registriesUrlMatcher,
    loadComponent: () => import('./registries-page').then((m) => m.RegistriesPage),
  },
];
