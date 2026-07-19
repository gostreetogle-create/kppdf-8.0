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
 * TZ-83 routes (rollout per phase commits — TZ-83A→B→C→D):
 *   /work-types   — work types catalogue       (Phase B)
 *   /modules      — module catalogue list      (Phase C)
 *   /modules/:id  — module detail (4 sections) (Phase C)
 *   /products/:id — product detail + modules   (Phase D)
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
    // TZ-92b: /kit/* is intentionally PUBLIC (no canMatch guard).
    // This is the UI-Kit showcase — design tokens, component demos, theme editor,
    // code preview. No sensitive data; no backend mutations. Safe to expose to
    // browser-use and external reviewers. DO NOT add canMatch: [authGuard] here.
    // See tasks/TZ-92b.md for the reasoning + tests.
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
        path: 'categories',
        loadComponent: () =>
          import('./pages/dictionaries/categories.page').then(
            (m) => m.CategoriesPage,
          ),
        title: 'KPPDF — Категории',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.page').then((m) => m.ProductsPage),
        title: 'KPPDF — Продукция',
      },
      {
        // TZ-83 Phase D: product detail с секцией «Модули» + attach/detach.
        // Динамический :id без children — отдельный top-level route под
        // AppLayout (не вложенный в ProductsPage). Angular 20 матчит по
        // longest-prefix; /products/:id выигрывает у /products для непустых id.
        path: 'products/:id',
        loadComponent: () =>
          import('./pages/products/product-detail.page').then(
            (m) => m.ProductDetailPage,
          ),
        title: 'KPPDF — Товар',
      },
      {
        // TZ-83 Phase C: список модулей продукции.
        path: 'modules',
        loadComponent: () =>
          import('./pages/modules/modules.page').then((m) => m.ModulesPage),
        title: 'KPPDF — Модули',
      },
      {
        // TZ-83 Phase C: детальная страница модуля (4 секции).
        // Объявлена ПОСЛЕ '/modules' (Angular 20 router матчит по
        // longest-prefix; :id без children — sibling, не child).
        path: 'modules/:id',
        loadComponent: () =>
          import('./pages/modules/module-detail.page').then(
            (m) => m.ModuleDetailPage,
          ),
        title: 'KPPDF — Модуль',
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
      {
        path: 'doc-constructor/templates',
        loadComponent: () =>
          import('./pages/doc-constructor/templates/templates.page').then(
            (m) => m.TemplatesPage,
          ),
        title: 'KPPDF — Шаблоны документов',
      },
      {
        path: 'doc-constructor/documents',
        loadComponent: () =>
          import('./pages/doc-constructor/documents/documents.page').then(
            (m) => m.DocumentsPage,
          ),
        title: 'KPPDF — Сохранённые документы',
      },
      {
        // TZ-86 Phase C.1 — texts sub-page CRUD.
        path: 'doc-constructor/texts',
        loadComponent: () =>
          import('./pages/doc-constructor/texts/texts.page').then(
            (m) => m.TextsPage,
          ),
        title: 'KPPDF — Конструктор: Тексты',
      },
      {
        // TZ-86 Phase C.3 — table-templates sub-page CRUD.
        path: 'doc-constructor/tables',
        loadComponent: () =>
          import('./pages/doc-constructor/tables/tables.page').then(
            (m) => m.TablesPage,
          ),
        title: 'KPPDF — Конструктор: Таблицы',
      },
      {
        // TZ-86 Phase D.1 — builder canvas (3-pane) picker state.
        // No :id → shows template-list picker; selecting navigates to
        // /doc-constructor/builder/:id (see BuilderPage empty state).
        path: 'doc-constructor/builder',
        loadComponent: () =>
          import('./pages/doc-constructor/builder/builder.page').then(
            (m) => m.BuilderPage,
          ),
        title: 'KPPDF — Конструктор: Сборка',
      },
      {
        // TZ-86 Phase D.1 — builder canvas with a specific template id.
        // Longest-prefix match in Angular 20 wins over the bare /builder
        // route above, so :id takes precedence for non-empty ids.
        path: 'doc-constructor/builder/:id',
        loadComponent: () =>
          import('./pages/doc-constructor/builder/builder.page').then(
            (m) => m.BuilderPage,
          ),
        title: 'KPPDF — Конструктор',
      },
      // TZ-101: Inventory Operations
      {
        path: 'inventory',
        loadComponent: () =>
          import('./pages/inventory/inventory-dashboard.page').then(
            (m) => m.InventoryDashboardPage,
          ),
        title: 'KPPDF — Склад',
      },
      {
        path: 'storage-items',
        loadComponent: () =>
          import('./pages/inventory/storage-items.page').then(
            (m) => m.StorageItemsPage,
          ),
        title: 'KPPDF — Остатки',
      },
      {
        path: 'stock-movements',
        loadComponent: () =>
          import('./pages/inventory/stock-movements.page').then(
            (m) => m.StockMovementsPage,
          ),
        title: 'KPPDF — Движения',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
