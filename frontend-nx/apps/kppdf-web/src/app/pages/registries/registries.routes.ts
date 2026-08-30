import type { Route } from '@angular/router';

/**
 * TZ-NX-REGISTRIES-PLATFORM / TZ-NX-REGISTRIES-MASTER-TABLE-UX. Deliberately
 * no `canMatch`/`capabilityRouteGuard`/`data.pageKey` here: neither
 * `'registries'` nor any per-registry key has a real backend-seeded
 * permission, and the task forbids inventing one. `/registries` is reached
 * only as an authenticated child of the shell (`app.routes.ts` nests this
 * under `canMatch: [authGuard]`).
 *
 * Both routes below resolve to the SAME `RegistriesPage` component — the
 * master table + inline detail panel is one page; `:registryKey` only
 * decides which master row (if any) is expanded. See `registries-page.ts`.
 */
export const REGISTRIES_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./registries-page').then((m) => m.RegistriesPage),
  },
  {
    path: ':registryKey',
    loadComponent: () => import('./registries-page').then((m) => m.RegistriesPage),
  },
];
