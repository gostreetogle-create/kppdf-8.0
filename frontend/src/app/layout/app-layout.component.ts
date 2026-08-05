import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  afterNextRender,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  LogOut,
  Package,
  Briefcase,
  BookOpen,
  FileText,
  ShieldCheck,
  Palette,
  Warehouse,
  Users,
} from 'lucide-angular';

/**
 * Lucide icon structural type — `lucide-angular@0.460.0` keeps `LucideIconData`
 * internal (private), so we capture the literal shape via `typeof Package`.
 * All ~2000 lucide icons share this same shape — therefore any icon
 * (`Package`, `Briefcase`, `BookOpen`, …) is assignable to this type.
 */
type LucideIcon = typeof Package;
import { AuthService } from '../core/auth.service';
import { CapabilitiesService } from '../core/capabilities/capabilities.service';
import { ThemeToggleComponent } from './theme-toggle.component';
import {
  PiNavDropdownComponent,
  type PiNavDropdownItem,
} from '../shared/ui/menu/pi-nav-dropdown.component';

/**
 * TZ-ACCESS-304: every app-shell nav item must carry `pageKey` so
 * `navCategories` can hide entries without a page grant from `/auth/me`.
 * Shared `PiNavDropdownItem.pageKey` stays optional for kit/demo menus.
 */
interface AppNavItem extends Omit<PiNavDropdownItem, 'pageKey'> {
  pageKey: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AppNavItem[];
  /**
   * Group Chip Workspace entry: render a direct link (no dropdown).
   * `items` still drive ACL filtering + active-category matching.
   */
  entryPath?: string;
}

/**
 * TZ-CategoriesNav — AppLayout top-panel nav grouped into 4 dropdowns:
 *
 *   Каталог       ← Продукция · Модули · Материалы · Виды работ
 *   Сделки        ← Организации · КП · Договоры · Заказы
 *   Склад         ← Дашборд · Остатки · Движения (TZ-UX-301 — restore if missing)
 *   Справочники   ← …
 *   Документы     ← …
 *   Админ         ← …
 * Active-category algorithm: when ANY sub-route is active (e.g. /products/:id),
 * the parent category trigger is highlighted via bg-sunrise-warm. Boundary
 * matching uses `path === url || url.startsWith(path + '/')` so that
 * /orders does NOT accidentally match /orders-archive (if it ever exists).
 *
 * Standalone + OnPush + signal-based; signal `currentUrl` from Router
 * NavigationEnd events is the source of truth.
 */
const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'catalog',
    label: 'Каталог',
    icon: Package,
    entryPath: '/products',
    items: [
      { path: '/products', pageKey: 'products', label: 'Продукция' },
      { path: '/modules', pageKey: 'modules', label: 'Модули' },
      { path: '/materials', pageKey: 'materials', label: 'Материалы' },
      { path: '/work-types', pageKey: 'work-types', label: 'Виды работ' },
      { path: '/people', pageKey: 'people', label: 'Люди', icon: Users },
    ],
  },
  {
    id: 'deals',
    label: 'Сделки',
    icon: Briefcase,
    entryPath: '/organizations',
    items: [
      { path: '/organizations', pageKey: 'organizations', label: 'Организации' },
      // TZ-SALES-301: КП (коммерческие предложения) — thin UI над
      // QuotationModule, первая волна shop-customer-lifecycle.
      { path: '/proposals', pageKey: 'proposals', label: 'КП' },
      { path: '/contracts', pageKey: 'contracts', label: 'Договоры' },
      { path: '/orders', pageKey: 'orders', label: 'Заказы' },
    ],
  },
  {
    // TZ-UX-301: warehouse routes existed without menu entry — restore.
    id: 'warehouse',
    label: 'Склад',
    icon: Warehouse,
    entryPath: '/storage-items',
    items: [
      { path: '/inventory', pageKey: 'inventory', label: 'Дашборд' },
      { path: '/storage-items', pageKey: 'storage-items', label: 'Остатки' },
      { path: '/stock-movements', pageKey: 'stock-movements', label: 'Движения' },
      { path: '/warehouses', pageKey: 'inventory', label: 'Склады' },
    ],
  },
  {
    // Group Chip Workspace: chips on leaf pages; top-nav is entry only.
    id: 'reference',
    label: 'Справочники',
    icon: BookOpen,
    entryPath: '/dictionaries/classification',
    items: [
      { path: '/dictionaries/classification', pageKey: 'categories', label: 'Классификация' },
      { path: '/dictionaries/measurements', pageKey: 'dictionaries', label: 'Измерения' },
      {
        path: '/dictionaries/appearance',
        pageKey: 'color-references',
        label: 'Оформление',
        icon: Palette,
      },
      {
        path: '/dictionaries/documents-ref',
        pageKey: 'doc-template-categories',
        label: 'Документы',
      },
      // Leaf paths also match active category when user deep-links.
      { path: '/categories', pageKey: 'categories', label: 'Категории' },
      { path: '/dictionaries/color-references', pageKey: 'color-references', label: 'Цвета' },
      {
        path: '/doc-template-categories',
        pageKey: 'doc-template-categories',
        label: 'Категории шаблонов',
      },
      {
        path: '/dictionaries/text-block-categories',
        pageKey: 'doc-template-categories',
        label: 'Категории текстов',
      },
    ],
  },
  {
    // TZ-86 Phase D.1 — 4-я категория «Документы»: текстовые блоки,
    // шаблоны таблиц и 3-pane builder canvas. FileText иконка
    // (lucide-angular@0.460). Active-category алгоритм в
    // PiNavDropdownComponent использует path === url || url.startsWith(path + '/'),
    // Active-category: /doc-constructor/builder/:id still matches templates
    // via startsWith only if we kept a builder nav item; registry is entry.
    id: 'docs',
    label: 'Документы',
    icon: FileText,
    entryPath: '/doc-constructor/templates',
    items: [
      // Registry first: create/open a template, then land on /builder/:id.
      { path: '/doc-constructor/templates', pageKey: 'doc-templates', label: 'Шаблоны' },
      { path: '/doc-constructor/texts', pageKey: 'doc-texts', label: 'Текстовые блоки' },
      { path: '/doc-constructor/tables', pageKey: 'doc-tables', label: 'Шаблоны таблиц' },
      { path: '/doc-constructor/documents', pageKey: 'doc-documents', label: 'Архив документов' },
      // Match-only: keep Docs category active inside builder (no TOC chip).
      { path: '/doc-constructor/builder', pageKey: 'doc-templates', label: 'Конструктор' },
    ],
  },
  {
    // TZ-256 §ШАГ 3 — admin category, capability-gated.
    // TZ-256.A remainder — Palette swapped to ShieldCheck to avoid icon
    // collision with Palette (paint swatch) elsewhere.
    id: 'admin',
    label: 'Администрирование',
    icon: ShieldCheck,
    entryPath: '/admin/users',
    items: [
      {
        path: '/admin/users',
        pageKey: 'admin-users',
        label: 'Пользователи',
        // TZ-262 (2026-08-02): выровнено с backend GET /api/admin/users
        // (@Permissions('user:admin')). user:read без user:admin → пункт
        // скрыт из меню (TZ-256 §0 «FRONTEND VISIBILITY = UX»).
        capabilities: ['user:admin'],
      },
      {
        path: '/admin/roles',
        pageKey: 'admin-roles',
        label: 'Роли',
        capabilities: ['role:read'],
      },
    ],
  },
];

@Component({
  selector: 'app-app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    LucideAngularModule,
    ThemeToggleComponent,
    PiNavDropdownComponent,
  ],
  template: `
    <div class="h-screen bg-paper text-ink font-body flex flex-col overflow-hidden">
      <div class="pi-page-frame w-full flex-1 flex flex-col min-h-0">
        <header
          class="sticky top-0 z-30 pi-marble supports-[backdrop-filter]:backdrop-blur-sm
                 hairline-b pi-edge-bleed shrink-0"
        >
          <div class="h-14 flex items-center justify-between gap-4">
            <a routerLink="/" class="flex items-center gap-2 min-w-0" aria-label="На главную">
              <span class="block w-[10px] h-[10px] bg-ink shrink-0" aria-hidden="true"></span>
              <span class="font-display font-bold tracking-tight truncate"> KPPDF · 8.0 </span>
            </a>

            <nav
              class="flex items-center gap-1 flex-1 justify-center"
              aria-label="Главная навигация"
            >
              @for (cat of navCategories(); track cat.id) {
                @if (cat.entryPath) {
                  <a
                    [routerLink]="cat.entryPath"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm
                           transition-colors pi-focus-ring cursor-pointer no-underline"
                    [class.bg-sunrise-warm]="activeCategoryId() === cat.id"
                    [class.text-paper]="activeCategoryId() === cat.id"
                    [class.text-ink]="activeCategoryId() !== cat.id"
                    [class.hover:bg-paper-2]="activeCategoryId() !== cat.id"
                    [attr.aria-current]="activeCategoryId() === cat.id ? 'page' : undefined"
                    [attr.aria-label]="cat.label"
                    [attr.data-test]="'nav-entry-' + cat.id"
                  >
                    <lucide-angular
                      [img]="cat.icon"
                      [size]="14"
                      class="opacity-80"
                      aria-hidden="true"
                    />
                    <span>{{ cat.label }}</span>
                  </a>
                } @else {
                  <app-pi-nav-dropdown
                    [label]="cat.label"
                    [icon]="cat.icon"
                    [items]="cat.items"
                    [active]="activeCategoryId() === cat.id"
                    [ariaLabel]="cat.label"
                  />
                }
              }
            </nav>

            <div class="flex items-center gap-3 shrink-0">
              <app-theme-toggle />
              @if (isAuthenticated()) {
                <span class="text-sm text-muted-foreground hidden sm:inline">
                  {{ user()?.displayName || user()?.username || 'Сессия' }}
                </span>
                <button
                  type="button"
                  class="pi-icon-btn gap-1 px-2 w-auto pi-focus-ring"
                  aria-label="Выйти"
                  (click)="onLogout()"
                >
                  <lucide-angular [img]="logOutIcon" [size]="12" aria-hidden="true" />
                  <span class="font-mono text-[10px] tracking-wider"> Выйти </span>
                </button>
              }
            </div>
          </div>
        </header>

        <main
          class="flex-1 min-w-0 min-h-0 flex flex-col overflow-y-auto"
          [class.pt-page-y]="!denseMain()"
          [class.pt-0]="denseMain()"
        >
          <router-outlet />
        </main>

        @if (!denseMain()) {
          <footer
            class="border-t hairline border-sunrise-warm py-2 px-page-x
                   font-mono text-[10px] uppercase tracking-[0.12em]
                   text-muted-foreground flex flex-wrap justify-between gap-2 shrink-0"
          >
            <span>© 2026 KPPDF · 8.0</span>
            <span>Внутренний сервис · 2026</span>
          </footer>
        }
      </div>
    </div>
  `,
})
export class AppLayoutComponent {
  protected readonly logOutIcon = LogOut;

  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  /** Tokens present — show logout even if /auth/me has not hydrated user yet. */
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  constructor() {
    // Backend was down at bootstrap → tokens kept, user null. Retry once UI mounts.
    afterNextRender(() => {
      if (this.isAuthenticated() && !this.user()) {
        void this.auth.ensureUser();
      }
    });
  }

  /**
   * TZ-256 §ШАГ 3 — capability-filtered nav as a `computed` signal.
   *
   * For each category, drop items where the user does NOT hold ANY of
   * the required keys (`item.capabilities []` ⇒ always visible).
   * Drop entire categories that have no surviving items, so a non-admin
   * user does not see an empty «Администрирование» dropdown.
   *
   * Pure derived state. Re-evaluates whenever `user()` changes (login,
   * logout, permission bump), keeping OnPush change-detection naturally
   * aligned.
   */
  /** TZ-ACCESS-302: filter nav by user pages (from /auth/me) AND capabilities. */
  protected readonly navCategories = computed<readonly NavCategory[]>(() => {
    const pages = this.user()?.pages;
    return NAV_CATEGORIES.map((cat) => {
      const items = cat.items.filter((item) => {
        if (pages && item.pageKey && !pages.includes(item.pageKey)) return false;
        if (!this.caps.hasAny(item.capabilities)) return false;
        return true;
      });
      // Entry link: prefer declared entryPath if still visible, else first item
      // (admin caps may hide /admin/users while /admin/roles remains).
      const entryPath = cat.entryPath
        ? items.some((i) => i.path === cat.entryPath)
          ? cat.entryPath
          : items[0]?.path
        : undefined;
      return { ...cat, items, entryPath };
    }).filter((cat) => cat.items.length > 0);
  });

  /** Source of truth: signal-mapped URL from Router NavigationEnd events. */
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /**
   * Full-bleed workspace routes (builder and Group Chip dictionaries): no
   * main top padding / site footer. Group Chip chrome must begin directly
   * below the app header instead of inheriting the catalog page gutter.
   */
  protected readonly denseMain = computed(() => isDenseWorkspaceUrl(this.currentUrl()));

  /**
   * Returns the id of the active category when ANY of its sub-paths is
   * the current URL (with `/` boundary check). Null when on a route not
   * covered by any nav category (e.g. `/login`).
   *
   * Iterates the (post-filter) `navCategories()` signal so URL
   * matching is consistent with what the user can actually see.
   */
  protected readonly activeCategoryId = computed<string | null>(() => {
    const url = this.currentUrl();
    if (!url) return null;
    for (const cat of this.navCategories()) {
      for (const item of cat.items) {
        if (url === item.path || url.startsWith(item.path + '/')) {
          return cat.id;
        }
      }
    }
    return null;
  });

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}

/** Builder + Group Chip workspaces sit flush under the app header. */
function isDenseWorkspaceUrl(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  if (/(^|\/)doc-constructor\/builder(\/|$)/.test(path)) return true;
  const denseExactOrPrefix = [
    '/dictionaries/measurements',
    '/dictionaries/classification',
    '/dictionaries/appearance',
    '/dictionaries/documents-ref',
    '/categories',
    '/dictionaries/color-references',
    '/doc-template-categories',
    '/dictionaries/text-block-categories',
    '/products',
    '/modules',
    '/materials',
    '/work-types',
    '/people',
    '/organizations',
    '/proposals',
    '/contracts',
    '/orders',
    '/inventory',
    '/storage-items',
    '/stock-movements',
    '/warehouses',
    '/doc-constructor/templates',
    '/doc-constructor/texts',
    '/doc-constructor/tables',
    '/doc-constructor/documents',
    '/admin/users',
    '/admin/roles',
  ];
  const listOnlyNoDetail = new Set(['/products', '/modules', '/materials']);
  return denseExactOrPrefix.some((route) => {
    if (path === route) return true;
    // List pages only — keep detail routes (/products/:id) on normal chrome.
    if (listOnlyNoDetail.has(route)) return false;
    return path.startsWith(route + '/');
  });
}
