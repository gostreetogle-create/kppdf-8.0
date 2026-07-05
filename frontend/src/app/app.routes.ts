import { Routes } from '@angular/router';

/**
 * Paper & Ink editorial SPA — 6 lazy routes under KitLayoutComponent.
 * TZ-30: foundation routing. TZ-69..74 will populate each page with real
 * content (color/typography tokens, primitives showcase, forms, overlays,
 * navigation/menus). TZ-67 kit-layout hosts the sticky sidebar + header.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/kit-layout.component').then((m) => m.KitLayoutComponent),
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
  { path: '**', redirectTo: '' },
];
