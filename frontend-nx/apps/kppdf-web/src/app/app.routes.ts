import { inject } from '@angular/core';
import { CanMatchFn, Router, Route } from '@angular/router';
import { AuthService, authGuard, publicOnlyGuard } from '@kppdf/data-access/auth';
import { capabilityRouteGuard } from '@kppdf/data-access/capabilities';
import { REGISTRIES_ROUTES } from './pages/registries/registries.routes';
import { STUDIO_ROUTES } from './pages/studio/studio.routes';

export const ownerOnlyRouteGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isOwner() ? true : router.parseUrl('/forbidden');
};

export const appRoutes: Route[] = [
  {
    path: 'login',
    canMatch: [publicOnlyGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  { path: 'enroll/:token', loadComponent: () => import('./pages/enroll/enroll.page').then((m) => m.EnrollPage) },
  { path: 'forbidden', loadComponent: () => import('./pages/forbidden/forbidden.page').then((m) => m.ForbiddenPage) },
  {
    // Operational app shell (header + sidebar + outlet) — TZ-NX-SHELL-operational-shell.
    // `/kit/*` is deliberately NOT nested here — it keeps its own KitLayoutComponent.
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'admin/devices' },
      {
        path: 'admin',
        children: [
          { path: '', redirectTo: 'devices', pathMatch: 'full' },
          { path: 'devices', canMatch: [capabilityRouteGuard], data: { pageKey: 'admin-users', capabilities: ['user:admin'], systemRoles: ['admin'] }, loadComponent: () => import('./pages/admin-devices.page').then((m) => m.DevicesAdminPage) },
          { path: 'roles', canMatch: [capabilityRouteGuard, ownerOnlyRouteGuard], data: { pageKey: 'admin-roles', capabilities: ['role:read'], systemRoles: ['admin'] }, loadComponent: () => import('./pages/admin-roles.page').then((m) => m.RolesAdminPage) },
        ],
      },
      {
        // TZ-NX-REGISTRIES-PLATFORM — fixture-only demo platform, no backend/permissions yet.
        // Static `children` (not `loadChildren`) so `collectPageRoutePaths` (nav dead-link
        // filter) can see `/registries` — it only walks `route.children`, not lazy
        // `route.loadChildren` trees. Page components underneath still lazy-load individually
        // via their own `loadComponent`, same as `/admin/*` and `/kit/*` below.
        path: 'registries',
        children: REGISTRIES_ROUTES,
      },
      {
        path: 'studio',
        children: STUDIO_ROUTES,
      },
      {
        path: 'proposals',
        children: [
          { path: '', pathMatch: 'full', loadComponent: () => import('./pages/proposals/proposals-list.page').then((m) => m.ProposalsListPage) },
          { path: 'list', loadComponent: () => import('./pages/proposals/proposals-list.page').then((m) => m.ProposalsListPage) },
          { path: 'create', redirectTo: '/studio' },
        ],
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders-list.page').then((m) => m.OrdersListPage),
      },
    ],
  },
  { path: 'kit',
    loadComponent: () =>
      import('./layout/kit-layout.component').then((m) => m.KitLayoutComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/kit/kit-overview.page').then((m) => m.KitOverviewPage),
      },
      {
        path: 'foundations',
        loadComponent: () =>
          import('./pages/foundations/foundations.page').then((m) => m.FoundationsPage),
      },
      {
        path: 'forms',
        loadComponent: () => import('./pages/forms/forms.page').then((m) => m.FormsPage),
      },
      {
        path: 'overlays',
        loadComponent: () =>
          import('./pages/overlays/overlays.page').then((m) => m.OverlaysPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
