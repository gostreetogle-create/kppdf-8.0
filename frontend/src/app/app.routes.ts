import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth.guard';

/**
 * TZ-NEW (split-shell routing) — Paper & Ink + KPPDF site.
 *
 * Two top-level layouts, three top-level entry points:
 *
 *   /login        — public, publicOnlyGuard bounces authed users to /
 *   /kit/*        — UI-Kit (KitLayoutComponent). Hidden from main nav;
 *                   preserved for site-building work and design review.
 *   /*            — the operational site (AppLayoutComponent).
 *                   authGuard: unauthed users → /login.
 *                   `''` redirects to /materials (the first listed
 *                   resource — the user's stated landing).
 *
 * The `**` wildcard redirects unknown URLs to /, which authGuard
 * then decides between /login and the home.
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
          import('./pages/overview/overview.page').then(
            (m) => m.OverviewPage,
          ),
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
          import('./pages/overlays/overlays.page').then(
            (m) => m.OverlaysPage,
          ),
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
          import('./pages/materials/materials.page').then(
            (m) => m.MaterialsPage,
          ),
        title: 'KPPDF — Материалы',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
