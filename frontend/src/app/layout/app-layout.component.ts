import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  LogOut,
  Package,
  Briefcase,
  BookOpen,
} from 'lucide-angular';
import { AuthService } from '../core/auth.service';
import { ThemeToggleComponent } from './theme-toggle.component';
import {
  PiNavDropdownComponent,
  type PiNavDropdownItem,
} from '../shared/ui/menu/pi-nav-dropdown.component';

interface NavCategory {
  id: string;
  label: string;
  icon: unknown;
  items: PiNavDropdownItem[];
}

/**
 * TZ-CategoriesNav — AppLayout top-panel nav grouped into 3 dropdowns:
 *
 *   Каталог       ← Продукция · Модули · Материалы · Виды работ
 *     (Package)   — TZ-83 product → module → material hierarchy
 *
 *   Сделки        ← Организации · Договоры · Заказы
 *     (Briefcase) — counterparty + commercial obligations
 *
 *   Справочники   ← Справочники
 *     (BookOpen)  — meta-catalog umbrella route
 *
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
    items: [
      { path: '/products', label: 'Продукция' },
      { path: '/modules', label: 'Модули' },
      { path: '/materials', label: 'Материалы' },
      { path: '/work-types', label: 'Виды работ' },
    ],
  },
  {
    id: 'deals',
    label: 'Сделки',
    icon: Briefcase,
    items: [
      { path: '/organizations', label: 'Организации' },
      { path: '/contracts', label: 'Договоры' },
      { path: '/orders', label: 'Заказы' },
    ],
  },
  {
    id: 'reference',
    label: 'Справочники',
    icon: BookOpen,
    items: [
      { path: '/dictionaries', label: 'Все справочники' },
    ],
  },
];

@Component({
  selector: 'app-app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    ThemeToggleComponent,
    PiNavDropdownComponent,
  ],
  template: `
    <div class="min-h-screen bg-paper text-ink font-body">
      <div class="pi-page-frame">
        <header
          class="sticky top-0 z-30 bg-paper/95 supports-[backdrop-filter]:backdrop-blur-sm
                 hairline-b pi-edge-bleed"
        >
          <div class="h-14 flex items-center justify-between gap-4">
            <a
              routerLink="/"
              class="flex items-center gap-2 min-w-0"
              aria-label="На главную"
            >
              <span
                class="block w-[10px] h-[10px] bg-ink shrink-0"
                aria-hidden="true"
              ></span>
              <span class="font-display font-bold tracking-tight truncate">
                KPPDF · 8.0
              </span>
            </a>

            <nav
              class="flex items-center gap-1 flex-1 justify-center"
              aria-label="Главная навигация"
            >
              @for (cat of navCategories; track cat.id) {
                <app-pi-nav-dropdown
                  [label]="cat.label"
                  [icon]="cat.icon"
                  [items]="cat.items"
                  [active]="activeCategoryId() === cat.id"
                  [ariaLabel]="cat.label"
                />
              }
            </nav>

            <div class="flex items-center gap-3 shrink-0">
              <app-theme-toggle />
              @if (user(); as u) {
                <span class="text-sm text-muted-foreground hidden sm:inline">
                  {{ u.displayName || u.username }}
                </span>
                <button
                  type="button"
                  class="pi-icon-btn gap-1 px-2 w-auto pi-focus-ring"
                  aria-label="Выйти"
                  (click)="onLogout()"
                >
                  <lucide-angular
                    [img]="logOutIcon"
                    [size]="12"
                    aria-hidden="true"
                  />
                  <span class="font-mono text-[10px] tracking-wider">
                    Выйти
                  </span>
                </button>
              }
            </div>
          </div>
        </header>

        <main class="min-w-0 pt-page-y">
          <router-outlet />
        </main>

        <footer
          class="border-t hairline border-sunrise-warm mt-footer-y py-footer-y
                 font-mono text-[11px] uppercase tracking-[0.18em]
                 text-muted-foreground flex flex-wrap justify-between gap-3"
        >
          <span>© 2026 KPPDF · 8.0</span>
          <span>Внутренний сервис · 2026</span>
        </footer>
      </div>
    </div>
  `,
})
export class AppLayoutComponent {
  protected readonly logOutIcon = LogOut;
  protected readonly navCategories = NAV_CATEGORIES;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

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
   * Returns the id of the active category when ANY of its sub-paths is
   * the current URL (with `/` boundary check). Null when on a route not
   * covered by any nav category (e.g. `/login`).
   */
  protected readonly activeCategoryId = computed<string | null>(() => {
    const url = this.currentUrl();
    if (!url) return null;
    for (const cat of NAV_CATEGORIES) {
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
