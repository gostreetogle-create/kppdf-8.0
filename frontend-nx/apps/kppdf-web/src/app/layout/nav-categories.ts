import {
  Package,
  Users,
  Briefcase,
  PenLine,
  ShoppingCart,
  Factory,
  Warehouse,
  FileText,
  ShieldCheck,
  Table2,
} from 'lucide-angular';
import type { PermissionKey } from '@kppdf/data-access/capabilities';

/**
 * Lucide icon structural type — `lucide-angular` keeps `LucideIconData`
 * internal, so we capture the literal shape via `typeof Package`. Every
 * lucide icon shares this shape.
 */
export type LucideIcon = typeof Package;

export interface AppNavItem {
  path: string;
  pageKey: string;
  label: string;
  capabilities?: readonly PermissionKey[];
  /** Visible only if `user.role` is one of these (mirrors backend `@Roles(...)`). */
  systemRoles?: readonly string[];
  /**
   * When true, item stays visible if its route exists in NX even when
   * `user.pages[]` is a restrictive allow-list that omits `pageKey`.
   * Use only for NX-local platforms with no backend page-ACL seed
   * (e.g. `/registries` fixture+real registry platform).
   */
  skipPageAcl?: boolean;
}

export interface NavCategory {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  items: readonly AppNavItem[];
  /** Preferred link target for a compact top-header entry chip. */
  entryPath?: string;
  /** Extra URL prefixes that also count as this category active. */
  activeAliases?: readonly string[];
}

/**
 * TZ-NX-SHELL-operational-shell — ported 1:1 (labels, icons, order, route
 * paths) from legacy `frontend/src/app/layout/app-layout.component.ts`
 * `NAV_CATEGORIES`. Items are rendered ONLY when the target route actually
 * exists in the current NX `app.routes.ts` (see `route-paths.ts` +
 * `filterNavCategories` below) — most business pages are not ported to NX
 * yet, so most categories currently resolve to zero visible items.
 */
export const NAV_CATEGORIES: readonly NavCategory[] = [
  {
    id: 'catalog',
    label: 'Каталог',
    shortLabel: 'Каталог',
    icon: Package,
    entryPath: '/products',
    items: [
      { path: '/products', pageKey: 'products', label: 'Продукция' },
      { path: '/modules', pageKey: 'modules', label: 'Модули' },
      { path: '/materials', pageKey: 'materials', label: 'Материалы' },
      {
        path: '/catalog/appearance',
        pageKey: 'products',
        label: 'Оформление',
        systemRoles: ['admin'],
      },
    ],
  },
  {
    id: 'clients',
    label: 'Клиенты',
    shortLabel: 'Клиенты',
    icon: Users,
    entryPath: '/counterparties',
    items: [
      { path: '/counterparties', pageKey: 'counterparties', label: 'Заказчики' },
      { path: '/people', pageKey: 'people', label: 'Люди' },
    ],
  },
  {
    id: 'deals',
    label: 'Сделки',
    shortLabel: 'Сделки',
    icon: Briefcase,
    entryPath: '/proposals/create',
    activeAliases: ['/proposals'],
    items: [
      { path: '/proposals/create', pageKey: 'proposals', label: 'КП' },
      { path: '/contracts', pageKey: 'contracts', label: 'Договоры' },
      { path: '/orders', pageKey: 'orders', label: 'Заказы' },
    ],
  },
  {
    id: 'design',
    label: 'Проектирование',
    shortLabel: 'Проект',
    icon: PenLine,
    entryPath: '/design/combine',
    items: [
      { path: '/design/combine', pageKey: 'orders', label: 'Комбайн' },
      { path: '/design', pageKey: 'design', label: 'Очередь' },
    ],
  },
  {
    id: 'supply',
    label: 'Снабжение',
    shortLabel: 'Снабж.',
    icon: ShoppingCart,
    entryPath: '/supply',
    items: [
      { path: '/supply-requests', pageKey: 'supply-requests', label: 'Заявки', capabilities: ['procurement:read'] },
      { path: '/supply', pageKey: 'supply', label: 'По заказам', capabilities: ['procurement:read'] },
    ],
  },
  {
    id: 'production',
    label: 'Производство',
    shortLabel: 'Цех',
    icon: Factory,
    entryPath: '/production',
    items: [
      { path: '/production', pageKey: 'production', label: 'Гант' },
      { path: '/work-types', pageKey: 'work-types', label: 'Виды работ' },
    ],
  },
  {
    id: 'warehouse',
    label: 'Склад',
    shortLabel: 'Склад',
    icon: Warehouse,
    entryPath: '/storage-items',
    items: [
      { path: '/warehouses', pageKey: 'inventory', label: 'Склады', capabilities: ['warehouse:read'] },
      { path: '/storage-items', pageKey: 'storage-items', label: 'Остатки', capabilities: ['warehouse:read'] },
      { path: '/stock-movements', pageKey: 'stock-movements', label: 'Движения', capabilities: ['warehouse:read'] },
      { path: '/shipping', pageKey: 'shipping', label: 'Отгрузка', capabilities: ['warehouse:read'] },
    ],
  },
  {
    id: 'docs',
    label: 'Документы',
    shortLabel: 'Докум.',
    icon: FileText,
    entryPath: '/studio',
    // TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS — only live NX routes remain:
    // /studio (Документы) and /studio/templates (Шаблоны). Dead legacy
    // /doc-constructor/* and /import-todos items are removed from NX nav
    // (pageKey seeds `doc-templates` / `doc-studio` already exist in the
    // backend permissions seed and are reused, no new RBAC keys).
    items: [
      { path: '/studio', pageKey: 'doc-studio', label: 'Документы' },
      { path: '/studio/templates', pageKey: 'doc-templates', label: 'Шаблоны' },
    ],
  },
  {
    // TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW — fixture-only demo platform,
    // no real domain/backend permission behind it (see docs/pages/registries.page.md).
    id: 'registries',
    label: 'Реестры',
    shortLabel: 'Реестры',
    icon: Table2,
    entryPath: '/registries',
    items: [
      {
        path: '/registries',
        pageKey: 'registries',
        label: 'Реестры',
        // No backend page-ACL seed for `registries` — route existence is the gate.
        skipPageAcl: true,
      },
    ],
  },
  {
    id: 'admin',
    label: 'Администрирование',
    shortLabel: 'Админ',
    icon: ShieldCheck,
    entryPath: '/admin/devices',
    items: [
      {
        path: '/admin/devices',
        pageKey: 'admin-users',
        label: 'Устройства',
        capabilities: ['user:admin'],
        systemRoles: ['admin'],
      },
      {
        path: '/admin/roles',
        pageKey: 'admin-roles',
        label: 'Роли',
        capabilities: ['role:read'],
        systemRoles: ['admin'],
      },
      { path: '/organizations', pageKey: 'organizations', label: 'Наши организации' },
    ],
  },
] as const;

export const NAV_CATEGORY_ORDER: readonly string[] = NAV_CATEGORIES.map((c) => c.id);

/**
 * Drops items whose route does not exist in NX yet (`existingPaths`), items
 * the user's page-ACL / capabilities / system role hide, then drops any
 * category left with zero items — same shape as the legacy filter, so a
 * user never sees an empty dropdown or a dead link.
 */
export function filterNavCategories(
  categories: readonly NavCategory[],
  existingPaths: ReadonlySet<string>,
  pages: readonly string[] | undefined,
  hasAnyCapability: (required: readonly PermissionKey[] | undefined) => boolean,
  role: string | undefined,
): readonly NavCategory[] {
  return categories
    .map((cat) => {
      const items = cat.items.filter((item) => {
        if (!existingPaths.has(item.path)) return false;
        if (pages && !item.skipPageAcl && !pages.includes(item.pageKey)) return false;
        if (!hasAnyCapability(item.capabilities)) return false;
        if (item.systemRoles && item.systemRoles.length > 0) {
          if (!role || !item.systemRoles.includes(role)) return false;
        }
        return true;
      });
      const entryPath = cat.entryPath
        ? items.some((i) => i.path === cat.entryPath)
          ? cat.entryPath
          : items[0]?.path
        : items[0]?.path;
      return { ...cat, items, entryPath };
    })
    .filter((cat) => cat.items.length > 0);
}

/**
 * Pure active-category matcher (items + activeAliases, `/` boundary).
 * Exported for unit tests.
 */
export function matchActiveCategoryId(
  url: string,
  categories: ReadonlyArray<{
    id: string;
    items: ReadonlyArray<{ path: string }>;
    activeAliases?: readonly string[];
  }>,
): string | null {
  if (!url) return null;
  const pathOnly = url.split('?')[0] ?? url;
  for (const cat of categories) {
    const paths = [...cat.items.map((i) => i.path), ...(cat.activeAliases ?? [])];
    for (const path of paths) {
      if (pathOnly === path || pathOnly.startsWith(`${path}/`)) {
        return cat.id;
      }
    }
  }
  return null;
}
