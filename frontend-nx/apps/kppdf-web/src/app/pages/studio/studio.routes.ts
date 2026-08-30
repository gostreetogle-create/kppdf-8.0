import type { Route } from '@angular/router';

export const STUDIO_ROUTES: Route[] = [
  { path: '', loadComponent: () => import('./studio-list.page').then((m) => m.StudioListPage) },
  { path: ':id', loadComponent: () => import('./studio-shell.page').then((m) => m.StudioShellPage) },
];
