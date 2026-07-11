import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth.guard';

/**
 * KPPDF site routing.
 *
 * Layouts:
 *   /login   — public, publicOnlyGuard bounces authed users to /
 *   /kit/*   — UI-Kit (KitLayoutComponent). Hidden from main nav;
 *              preserved for site-building work and design review.
 *   /*       — operational site (AppLayoutComponent, authGuard).
 *              `''` → /materials (user's stated landing).
 *   **       → redirect to /, then authGuard decides login vs home.
 *
 * TZ-83 Phase B (commit TZ-83B):
 *   /work-types — work types catalogue (CRUD: нормы, ставки, центр)
 * Other TZ-83 routes (/modules, /modules/:id, /products/:id)
 * committed through separate atomic commits in Phases C and D.
 */
export const routes: Routes = [
  {
    path: 'login',
    canMatch: [publicOnlyGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    title: 'KPPDF — Вход',
  },
  {
    path: 'kit',
    loadComponent: () =>
      import('./layout/kit-layout.component').then(
        (m) => m.KitLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/overview/overview.page').then((m) => m.OverviewPage),
        title: 'Paper & Ink — Обзор',
      },
      {
        path: 'foundations',
        loadComponent: () =>
          import('./pages/foundations/foundations.page').then(
            (m) => m.FoundationsPage,
          ),
        title: 'Paper & Ink — Tokens',
      },
      {
        path: 'basics',
        loadComponent: () =>
          import('./pages/basics/basics.page').then((m) => m.BasicsPage),
        title: 'Paper & Ink — Базовые',
      },
      {
        path: 'forms',
        loadComponent: () =>
          import('./pages/forms/forms.page').then((m) => m.FormsPage),
        title: 'Paper & Ink — Формы',
      },
      {
        path: 'overlays',
        loadComponent: () =>
          import('./pages/overlays/overlays.page').then((m) => m.OverlaysPage),
        title: 'Paper & Ink — Оверлеи',
      },
      {
        path: 'navigation',
        loadComponent: () =>
          import('./pages/navigation/navigation.page').then(
            (m) => m.NavigationPage,
          ),
        title: 'Paper & Ink — Навигация',
      },
      {
        path: 'playground/theme',
        loadComponent: () =>
          import('./pages/playground/theme-editor.page').then(
            (m) => m.ThemeEditorPage,
          ),
        title: 'Paper & Ink — Theme Editor',
      },
      {
        path: 'playground/code',
        loadComponent: () =>
          import('./pages/playground/code-preview.page').then(
            (m) => m.CodePreviewPage,
          ),
        title: 'Paper & Ink — Code Preview',
      },
    ],
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'materials' },
      {
        path: 'materials',
        loadComponent: () =>
          import('./pages/materials/materials.page').then((m) => m.MaterialsPage),
        title: 'KPPDF — Материалы',
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('./pages/organizations/organizations.page').then(
            (m) => m.OrganizationsPage,
          ),
        title: 'KPPDF — Организации',
      },
      {
        path: 'dictionaries',
        loadComponent: () =>
          import('./pages/dictionaries/dictionaries.page').then(
            (m) => m.DictionariesPage,
          ),
        title: 'KPPDF — Справочники',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.page').then((m) => m.ProductsPage),
        title: 'KPPDF — Продукция',
      },
      {
        // TZ-83 Phase B: отдельный top-level справочник «Виды работ».
        // Полноценный CRUD (normHours, rate, workCenterId) — не помещается
        // в inline-форму dictionaries.page; вынесен в самостоятельный route.
        path: 'work-types',
        loadComponent: () =>
          import('./pages/work-types/work-types.page').then(
            (m) => m.WorkTypesPage,
          ),
        title: 'KPPDF — Виды работ',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/orders.page').then((m) => m.OrdersPage),
        title: 'KPPDF — Заказы',
      },
      {
        path: 'contracts',
        loadComponent: () =>
          import('./pages/contracts/contracts.page').then((m) => m.ContractsPage),
        title: 'KPPDF — Договоры',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
