import type { Route } from '@angular/router';

/**
 * TZ-NX-CONSTRUCTOR-SHELL — no capabilityRouteGuard: Constructor is an
 * NX-local workspace with no backend-seeded permission (same pattern as
 * `/registries`). Reached only as an authenticated child of AppShell.
 */
export const CONSTRUCTOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./constructor.page').then((m) => m.ConstructorPage),
  },
  {
    path: 'create/:kind',
    loadComponent: () =>
      import('./constructor-create-placeholder.page').then((m) => m.ConstructorCreatePlaceholderPage),
  },
];
