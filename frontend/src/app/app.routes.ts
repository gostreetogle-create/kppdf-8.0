import { inject } from '@angular/core';
import { CanMatchFn, Router, Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { capabilityRouteGuard } from './core/capabilities/capability-route.guard';

/**
 * TZ-PRODUCTS-301 — admin-only route guard for the color dictionary.
 *
 * Backend RBAC allows `user` to READ colors (the RAL dropdown in the product
 * form is used by every authenticated user), but the dictionary PAGE is an
 * admin/manager management surface — mutations are @Roles('admin','manager').
 * This guard hides the page from plain `user` role accounts by redirecting to
 * /forbidden (same UX contract as capabilityRouteGuard, without inventing a
 * new permission key for a small dictionary).
 */
export const adminOnlyRouteGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.user()?.role === 'admin' || auth.user()?.role === 'manager') return true;
  return router.parseUrl('/forbidden');
};

/**
 * KPPDF site routing.
 *
 * Layouts:
 *   /login   — public, publicOnlyGuard bounces authed users to /
 *   /*       — operational site (AppLayoutComponent, authGuard).
 *   **       → redirect to /, then authGuard decides login vs home.
 *
 * TZ-83 routes (rollout per phase commits — TZ-83A→B→C→D):
 *   /work-types   — work types catalogue       (Phase B)
 *   /modules      — module catalogue list      (Phase C)
 *   /modules/:id  — module detail (4 sections) (Phase C)
 *   /products/:id — product detail + modules   (Phase D)
 */
export const catalogAppearanceAdminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user()?.role === 'admin' ? true : router.parseUrl('/forbidden');
};

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [publicOnlyGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
    title: 'KPPDF — Вход',
  },
  // TZ-256 §ШАГ 4 — single forbidden state. Reached from:
  //  - capabilityRouteGuard when `data.capabilities` gating fails (no leak)
  //  - auth.interceptor when backend returns 403 (capability missing)
  //  - post-logout state (auth.interceptor on refresh failure → /login,
  //    direct URL on a capability-gated route when user is null)
  //
  // Doesn't require authGuard (ForbiddenPage handles both auth profiles
  // via copy() branching). NO `canMatch: [capabilityRouteGuard]`
  // because the route ITSELF is the gateway, not a gated resource.
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/ui/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
    title: 'KPPDF — Доступ ограничен',
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'materials' },
      {
        path: 'materials',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'materials' },
        loadComponent: () =>
          import('./pages/materials/materials.page').then((m) => m.MaterialsPage),
        title: 'KPPDF — Материалы',
      },
      {
        // TZ-CATALOG-312: material detail card.
        // AFTER /materials (Angular longest-prefix: :id wins over empty path).
        path: 'materials/:id',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'materials' },
        loadComponent: () =>
          import('./pages/materials/material-detail.page').then((m) => m.MaterialDetailPage),
        title: 'KPPDF — Материал',
      },
      {
        path: 'organizations',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'organizations' },
        loadComponent: () =>
          import('./pages/organizations/organizations.page').then((m) => m.OrganizationsPage),
        title: 'KPPDF — Организации',
      },
      {
        // TZ-DICT-311: hub cards retired — default group = Измерения.
        path: 'dictionaries',
        redirectTo: 'dictionaries/measurements',
        pathMatch: 'full',
      },
      // TZ-DICT-308/310: Group Chip Workspace routes
      {
        path: 'dictionaries/measurements',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'dictionaries' },
        loadComponent: () =>
          import('./pages/dictionaries/measurements-group.page').then(
            (m) => m.MeasurementsGroupPage,
          ),
        title: 'KPPDF — Измерения',
      },
      {
        // TZ-DICT-309: legacy /dictionaries/units → Group Chip Workspace (measurements).
        // Note: redirectTo cannot combine with canMatch (Angular NG04014).
        path: 'dictionaries/units',
        redirectTo: 'dictionaries/measurements',
        pathMatch: 'full',
      },
      // TZ-DICT-310: group alias routes → first chip of each group
      {
        path: 'dictionaries/classification',
        redirectTo: 'categories',
        pathMatch: 'full',
      },
      {
        path: 'dictionaries/appearance',
        redirectTo: 'dictionaries/color-references',
        pathMatch: 'full',
      },
      {
        path: 'dictionaries/documents-ref',
        redirectTo: 'doc-template-categories',
        pathMatch: 'full',
      },
      {
        path: 'categories',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'categories' },
        loadComponent: () =>
          import('./pages/dictionaries/categories.page').then((m) => m.CategoriesPage),
        title: 'KPPDF — Категории',
      },
      {
        // TZ-DOC-308 — категории шаблонов документов (справочник).
        path: 'doc-template-categories',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'doc-template-categories' },
        loadComponent: () =>
          import('./pages/dictionaries/document-template-categories.page').then(
            (m) => m.DocumentTemplateCategoriesPage,
          ),
        title: 'KPPDF — Категории шаблонов',
      },
      {
        // TZ-DOC-334 — категории текстовых блоков (page from DOC-316; route+nav gap).
        path: 'dictionaries/text-block-categories',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'text-block-categories' },
        loadComponent: () =>
          import('./pages/dictionaries/text-block-categories.page').then(
            (m) => m.TextBlockCategoriesPage,
          ),
        title: 'KPPDF — Категории текстов',
      },
      {
        // TZ-PRODUCTS-301 — справочник цветов (RAL). Admin/manager page;
        // reads are also available to users via the API for the product
        // form RAL dropdown (TZ-PRODUCTS-302).
        path: 'dictionaries/color-references',
        canMatch: [capabilityRouteGuard, adminOnlyRouteGuard],
        data: { pageKey: 'color-references' },
        loadComponent: () =>
          import('./pages/dictionaries/color-references.page').then((m) => m.ColorReferencesPage),
        title: 'KPPDF — Цвета',
      },
      {
        path: 'catalog/appearance',
        canMatch: [capabilityRouteGuard, catalogAppearanceAdminGuard],
        data: { pageKey: 'products' },
        loadComponent: () =>
          import('./pages/catalog/catalog-appearance.page').then((m) => m.CatalogAppearancePage),
        title: 'KPPDF — Оформление каталога',
      },
      {
        path: 'products',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'products' },
        loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage),
        title: 'KPPDF — Продукция',
      },
      {
        // TZ-83 Phase D: product detail с секцией «Модули» + attach/detach.
        // Динамический :id без children — отдельный top-level route под
        // AppLayout (не вложенный в ProductsPage). Angular 20 матчит по
        // longest-prefix; /products/:id выигрывает у /products для непустых id.
        path: 'products/:id',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'products' },
        loadComponent: () =>
          import('./pages/products/product-detail.page').then((m) => m.ProductDetailPage),
        title: 'KPPDF — Товар',
      },
      {
        // TZ-83 Phase C: список модулей продукции.
        path: 'modules',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'modules' },
        loadComponent: () => import('./pages/modules/modules.page').then((m) => m.ModulesPage),
        title: 'KPPDF — Модули',
      },
      {
        // TZ-83 Phase C: детальная страница модуля (4 секции).
        // Объявлена ПОСЛЕ '/modules' (Angular 20 router матчит по
        // longest-prefix; :id без children — sibling, не child).
        path: 'modules/:id',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'modules' },
        loadComponent: () =>
          import('./pages/modules/module-detail.page').then((m) => m.ModuleDetailPage),
        title: 'KPPDF — Модуль',
      },
      {
        // TZ-83 Phase B: отдельный top-level справочник «Виды работ».
        // Полноценный CRUD (normHours, rate, workCenterId) — не помещается
        // в inline-форму dictionaries.page; вынесен в самостоятельный route.
        path: 'work-types',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'work-types' },
        loadComponent: () =>
          import('./pages/work-types/work-types.page').then((m) => m.WorkTypesPage),
        title: 'KPPDF — Виды работ',
      },
      {
        // TZ-UX-306 / WORKERS-302.FOLLOWUP — каталог «Люди» (Worker API).
        path: 'people',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'people' },
        loadComponent: () => import('./pages/people/people.page').then((m) => m.PeoplePage),
        title: 'KPPDF — Люди',
      },
      {
        path: 'orders',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'orders' },
        loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
        title: 'KPPDF — Заказы',
      },
      {
        // TZ-ORDERS-302 — карточка заказа + live composition-tree.
        path: 'orders/:id',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'orders' },
        loadComponent: () =>
          import('./pages/orders/order-detail.page').then((m) => m.OrderDetailPage),
        title: 'KPPDF — Заказ',
      },
      {
        // TZ-PRODUCTION-303 — Production Cockpit (estimate Gantt).
        path: 'production',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'production', capabilities: ['production:read'] },
        loadComponent: () =>
          import('./pages/production/production-cockpit.page').then((m) => m.ProductionCockpitPage),
        title: 'KPPDF — Производство',
      },
      {
        // TZ-SALES-301 — КП (коммерческие предложения). Thin UI поверх
        // существующего QuotationModule (single API — дубль не создавался).
        // Admin/manager surface: мутации @Roles('admin','manager').
        path: 'proposals',
        canMatch: [capabilityRouteGuard, adminOnlyRouteGuard],
        data: { pageKey: 'proposals' },
        loadComponent: () =>
          import('./pages/commercial/proposals/proposals.page').then((m) => m.ProposalsPage),
        title: 'KPPDF — КП',
      },
      {
        path: 'contracts',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'contracts' },
        loadComponent: () =>
          import('./pages/contracts/contracts.page').then((m) => m.ContractsPage),
        title: 'KPPDF — Договоры',
      },
      {
        path: 'doc-constructor/templates',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'doc-templates' },
        loadComponent: () =>
          import('./pages/doc-constructor/templates/templates.page').then((m) => m.TemplatesPage),
        title: 'KPPDF — Шаблоны документов',
      },
      {
        path: 'doc-constructor/documents',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'doc-documents' },
        loadComponent: () =>
          import('./pages/doc-constructor/documents/documents.page').then((m) => m.DocumentsPage),
        title: 'KPPDF — Сохранённые документы',
      },
      {
        // TZ-86 Phase C.1 — texts sub-page CRUD.
        path: 'doc-constructor/texts',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'doc-texts' },
        loadComponent: () =>
          import('./pages/doc-constructor/texts/texts.page').then((m) => m.TextsPage),
        title: 'KPPDF — Конструктор: Тексты',
      },
      {
        // TZ-86 Phase C.3 — table-templates sub-page CRUD.
        path: 'doc-constructor/tables',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'doc-tables' },
        loadComponent: () =>
          import('./pages/doc-constructor/tables/tables.page').then((m) => m.TablesPage),
        title: 'KPPDF — Конструктор: Таблицы',
      },
      {
        // TZ-DOC-324: bare /builder has no editor without :id — send users to
        // the template registry (create / open). Query params (source/sourceId)
        // are preserved by the router on redirect.
        path: 'doc-constructor/builder',
        redirectTo: 'doc-constructor/templates',
        pathMatch: 'full',
      },
      {
        // Builder canvas with a specific template id.
        // pageKey = doc-templates (same grant as registry; open via Шаблоны).
        path: 'doc-constructor/builder/:id',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'doc-templates' },
        loadComponent: () =>
          import('./pages/doc-constructor/builder/builder.page').then((m) => m.BuilderPage),
        title: 'KPPDF — Конструктор',
      },
      // TZ-101: Inventory Operations
      {
        path: 'inventory',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'inventory' },
        loadComponent: () =>
          import('./pages/inventory/inventory-dashboard.page').then(
            (m) => m.InventoryDashboardPage,
          ),
        title: 'KPPDF — Склад',
      },
      {
        path: 'storage-items',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'storage-items' },
        loadComponent: () =>
          import('./pages/inventory/storage-items.page').then((m) => m.StorageItemsPage),
        title: 'KPPDF — Остатки',
      },
      {
        path: 'stock-movements',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'stock-movements' },
        loadComponent: () =>
          import('./pages/inventory/stock-movements.page').then((m) => m.StockMovementsPage),
        title: 'KPPDF — Движения',
      },
      {
        path: 'warehouses',
        canMatch: [capabilityRouteGuard],
        data: { pageKey: 'inventory' },
        loadComponent: () =>
          import('./pages/inventory/warehouses.page').then((m) => m.WarehousesPage),
        title: 'KPPDF — Склады',
      },
      // TZ-257 — admin module (read-only slice). Routes are
      // capability-gated AND role-gated server-side. The frontend
      // route gate mirrors this for UX (hidden from non-admin users
      // per TZ-256 §ШАГ 3 nav filter).
      {
        path: 'admin/users',
        canMatch: [capabilityRouteGuard],
        // TZ-262 (2026-08-02): gate выровнен с backend GET /api/admin/users
        // (@Permissions('user:admin') — LIST перечисляет всех пользователей;
        // user:read зарезервирован для self-service). user:read без user:admin
        // теперь не проходит гейт → /forbidden, а не тупик 403 на странице.
        data: {
          pageKey: 'admin-users',
          capabilities: ['user:admin'],
          // Mirror backend `@Roles('admin')` on users-admin controller.
          systemRoles: ['admin'],
        },
        loadComponent: () => import('./pages/admin/users-admin.page').then((m) => m.UsersAdminPage),
        title: 'KPPDF — Пользователи',
      },
      {
        path: 'admin/roles',
        canMatch: [capabilityRouteGuard],
        data: {
          pageKey: 'admin-roles',
          capabilities: ['role:read'],
          // Mirror backend `@Roles('admin')` on roles/permissions admin.
          systemRoles: ['admin'],
        },
        loadComponent: () => import('./pages/admin/roles-admin.page').then((m) => m.RolesAdminPage),
        title: 'KPPDF — Роли',
      },
      // TZ-ADMIN-306 — `/admin` deep links go straight to the real users
      // registry (placeholder page retired; the fake "in development" copy
      // is gone). The target route carries its own capability gate, so
      // non-admin visitors still land on /forbidden.
      {
        path: 'admin',
        redirectTo: 'admin/users',
        pathMatch: 'full',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
