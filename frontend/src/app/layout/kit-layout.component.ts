import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Menu, ArrowUpRight, Search } from 'lucide-angular';
import { ThemeToggleComponent } from './theme-toggle.component';

interface NavLink {
  path: string;
  label: string;
}
interface NavGroup {
  label: string;
  links: NavLink[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Начало',
    links: [
      { path: '/overview', label: 'Обзор' },
      { path: '/foundations', label: 'Tokens' },
    ],
  },
  {
    label: 'Компоненты',
    links: [
      { path: '/basics', label: 'Базовые' },
      { path: '/forms', label: 'Формы' },
      { path: '/overlays', label: 'Оверлеи' },
      { path: '/navigation', label: 'Навигация' },
    ],
  },
];

/**
 * TZ-67 KitLayoutComponent — sticky editorial shell.
 *
 * Top-down structure:
 *  - Sticky header (top-0, z-30, hairline border-b) with:
 *    · Mobile hamburger (md:hidden) toggles `isSidebarOpen`
 *    · Brand block (10×10 ink square + wordmark "Paper & Ink · UI Kit v0.1")
 *    · Right side: Docs link (lucide arrow-up-right) + ThemeToggle + ⌘K badge
 *  - Sidebar (md:visible, hidden on mobile) with grouped nav:
 *    · "Начало" → /overview, /foundations
 *    · "Компоненты" → /basics, /forms, /overlays, /navigation
 *    · Active link inverted: `bg-ink text-paper`
 *  - Main: `<router-outlet />`
 *  - Footer: `© 2026 Paper & Ink · Syne · Plus Jakarta Sans` (mono, uppercase)
 *
 * ResizeObserver for `isMobile` (< 768px), via DestroyRef cleanup.
 * ⌘K binding: window-level keydown listener, opens command palette
 * (placeholder for TZ-75; if not yet present, ⌘K is a no-op).
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-kit-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    ThemeToggleComponent,
  ],
  template: `
    <div class="min-h-screen bg-paper text-ink font-body flex flex-col">
      <header
        class="sticky top-0 z-30 border-b hairline border-rule
               bg-paper/95 supports-[backdrop-filter]:backdrop-blur-[2px]"
      >
        <div class="px-5 h-14 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <button
              type="button"
              class="md:hidden inline-flex items-center justify-center
                     w-8 h-8 border hairline border-rule rounded-sm
                     hover:bg-paper-2 transition-colors"
              [attr.aria-label]="isSidebarOpen() ? 'Закрыть меню' : 'Открыть меню'"
              [attr.aria-expanded]="isSidebarOpen()"
              (click)="isSidebarOpen.set(!isSidebarOpen())"
            >
              <lucide-angular [img]="menuIcon" [size]="14" aria-hidden="true" />
            </button>
            <a routerLink="/overview" class="flex items-center gap-2 min-w-0">
              <span class="block w-[10px] h-[10px] bg-ink shrink-0" aria-hidden="true"></span>
              <span class="font-display font-bold tracking-tight truncate">
                Paper &amp; Ink · UI Kit v0.1
              </span>
            </a>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <a
              href="https://example.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              class="eyebrow hidden sm:flex items-center gap-1 hover:text-ink transition-colors"
            >
              Документация
              <lucide-angular [img]="arrowUpRightIcon" [size]="11" aria-hidden="true" />
            </a>
            <app-theme-toggle />
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2 h-8
                     border hairline border-rule rounded-sm
                     hover:bg-paper-2 transition-colors"
              aria-label="Открыть командную палитру (⌘K)"
              title="Открыть командную палитру (⌘K)"
              data-cmd-k
              (click)="openCommandPalette()"
            >
              <lucide-angular [img]="searchIcon" [size]="12" aria-hidden="true" />
              <span class="font-mono text-[10px] tracking-wider">⌘K</span>
            </button>
          </div>
        </div>
      </header>

      <div class="flex flex-1 min-h-0">
        <aside
          [class.hidden]="!isSidebarOpen() && isMobile()"
          [class.md:block]="true"
          class="w-[220px] shrink-0 sticky top-14 self-start
                 h-[calc(100vh-3.5rem)] border-r hairline border-rule
                 overflow-y-auto"
          aria-label="Навигация"
        >
          <nav class="px-3 py-5 flex flex-col gap-5">
            @for (group of navGroups; track group.label) {
              <div>
                <h3 class="eyebrow mb-2 px-2">{{ group.label }}</h3>
                <ul class="flex flex-col">
                  @for (link of group.links; track link.path) {
                    <li>
                      <a
                        [routerLink]="link.path"
                        routerLinkActive="bg-ink text-paper"
                        [routerLinkActiveOptions]="{ exact: link.path === '/overview' }"
                        class="block px-2 py-1.5 text-sm
                               hover:bg-paper-2 transition-colors rounded-sm"
                      >
                        {{ link.label }}
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </nav>
        </aside>

        <main class="flex-1 min-w-0">
          <router-outlet />
        </main>
      </div>

      <footer
        class="border-t hairline border-rule mt-12 px-5 py-6
               font-mono text-[11px] uppercase tracking-[0.18em]
               text-muted flex flex-wrap justify-between gap-3"
      >
        <span>© 2026 Paper &amp; Ink</span>
        <span>Syne · Plus Jakarta Sans · ngx-charts · ngx-sonner · @angular/cdk</span>
      </footer>
    </div>
  `,
})
export class KitLayoutComponent {
  protected readonly menuIcon = Menu;
  protected readonly arrowUpRightIcon = ArrowUpRight;
  protected readonly searchIcon = Search;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly navGroups = NAV_GROUPS;

  /** Mobile (<768px) sidebar collapsed by default. */
  protected readonly isSidebarOpen = signal<boolean>(true);
  protected readonly isMobile = signal<boolean>(false);

  /** Active route URL (signal-mapped from router events for template use). */
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Has the user reached the page header for a11y focus (placeholder for future). */
  protected readonly currentRoute = computed(() => this.route.snapshot);

  constructor() {
    if (this.isBrowser) {
      const check = (): void => this.isMobile.set(window.innerWidth < 768);
      check();
      window.addEventListener('resize', check, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', check));
    }

    // ⌘K (or Ctrl+K on Win/Linux) opens the command palette (TZ-75 placeholder).
    if (this.isBrowser) {
      const onKeydown = (event: KeyboardEvent): void => {
        const isK = event.key === 'k' || event.key === 'K' || event.key === 'к' || event.key === 'К';
        const meta = event.metaKey || event.ctrlKey;
        if (meta && isK) {
          event.preventDefault();
          this.openCommandPalette();
        }
      };
      document.addEventListener('keydown', onKeydown);
      this.destroyRef.onDestroy(() => document.removeEventListener('keydown', onKeydown));
    }
  }

  /**
   * TZ-75 placeholder: ⌘K should open the command palette. If the
   * PiCommandPaletteService is not yet wired (TZ-75 not done), this
   * is a no-op. Header ⌘K badge still works (no error).
   */
  protected openCommandPalette(): void {
    // Intentionally empty until TZ-75 lands. Future: this.commandPalette.open().
  }
}
