import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  computed,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  ArrowLeft,
  ArrowRight,
  Bell,
  LogOut,
  Monitor,
} from 'lucide-angular';
import { AuthService } from '@kppdf/data-access/auth';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { ThemeToggleComponent } from './theme-toggle.component';
import {
  PairingDialogComponent,
  type PairingDialogData,
} from '../pages/desktop/pairing-dialog.component';
import { NavHistoryService } from './nav-history.service';
import { NAV_CATEGORIES, filterNavCategories, matchActiveCategoryId } from './nav-categories';
import { collectPageRoutePaths } from './route-paths';
import { ShellToolRailService, type ShellToolRailItem, type ShellToolRailMenuItem } from './shell-tool-rail.service';

/**
 * TZ-NX-SHELL-rail-layout-fix — operational shell matching legacy chrome:
 * full-width header + central workspace, with narrow left/right tool rails
 * that appear only for pages that actually register tools via
 * `ShellToolRailService.setTools()` (TZ-NX-SHELL-01-IDLE-RAILS — no disabled
 * demo placeholders). Back/forward history lives once in the header (single
 * SoT), not duplicated inside idle rails.
 * `/kit/*` stays on `KitLayoutComponent` (not nested here).
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, LucideAngularModule, ThemeToggleComponent],
  template: `
    <div class="h-screen bg-paper text-ink font-body flex flex-col overflow-hidden">
      <header class="shrink-0 z-30 bg-paper hairline-b">
        <div class="h-header-h px-page-x flex items-center justify-between gap-2 min-w-0">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 min-w-0 shrink-0 h-9 px-2
                   rounded-sm hairline bg-sunrise-soft text-ink
                   hover:bg-sunrise-warm/20 transition-colors pi-focus-ring
                   no-underline"
            aria-label="KPPDF — на главную"
            title="KPPDF — на главную"
            data-test="shell-brand"
          >
            <span class="block w-[10px] h-[10px] bg-sunrise-warm shrink-0" aria-hidden="true"></span>
            <span class="font-display font-bold tracking-tight truncate">KPPDF · 8.0</span>
          </a>

          <nav
            class="flex-1 min-w-0 flex justify-center overflow-x-auto
                   [scrollbar-width:none] [-ms-overflow-style:none]
                   [&::-webkit-scrollbar]:hidden"
            aria-label="Основные разделы"
          >
            <div class="grid grid-flow-col auto-cols-fr gap-1 w-max max-w-full items-stretch">
              @for (cat of navCategories(); track cat.id) {
                <a
                  [routerLink]="cat.entryPath"
                  class="inline-flex flex-col items-center justify-center gap-px w-full
                         h-10 px-1.5 py-1 rounded-sm hairline transition-colors pi-focus-ring
                         no-underline"
                  [class.bg-sunrise-warm]="activeCategoryId() === cat.id"
                  [class.text-on-gold]="activeCategoryId() === cat.id"
                  [class.border-sunrise-warm]="activeCategoryId() === cat.id"
                  [class.text-ink]="activeCategoryId() !== cat.id"
                  [class.hover:bg-paper-2]="activeCategoryId() !== cat.id"
                  [attr.aria-current]="activeCategoryId() === cat.id ? 'page' : null"
                  [attr.aria-label]="cat.label"
                  [attr.title]="cat.label"
                  [attr.data-test]="'shell-quicknav-' + cat.id"
                >
                  <lucide-angular [img]="cat.icon" [size]="12" class="opacity-90 shrink-0" aria-hidden="true" />
                  <span class="block w-full text-center text-[11px] leading-none font-medium whitespace-nowrap" aria-hidden="true">
                    {{ cat.shortLabel }}
                  </span>
                </a>
              }
            </div>
          </nav>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="pi-icon-btn pi-focus-ring"
              data-test="shell-nav-back"
              [disabled]="!navHistory.canGoBack()"
              [attr.aria-disabled]="navHistory.canGoBack() ? null : 'true'"
              (click)="navHistory.back()"
              aria-label="Назад"
              title="Назад"
            >
              <lucide-angular [img]="backIcon" [size]="14" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="pi-icon-btn pi-focus-ring"
              data-test="shell-nav-forward"
              [disabled]="!navHistory.canGoForward()"
              [attr.aria-disabled]="navHistory.canGoForward() ? null : 'true'"
              (click)="navHistory.forward()"
              aria-label="Вперёд"
              title="Вперёд"
            >
              <lucide-angular [img]="forwardIcon" [size]="14" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="pi-icon-btn pi-focus-ring"
              aria-label="Уведомления (скоро)"
              title="Уведомления (скоро)"
              disabled
              aria-disabled="true"
              data-test="shell-notifications"
            >
              <lucide-angular [img]="bellIcon" [size]="14" aria-hidden="true" />
            </button>
            <app-theme-toggle />
            @if (isAuthenticated()) {
              @if (canPairDesktop()) {
                <button
                  type="button"
                  class="pi-icon-btn pi-focus-ring"
                  aria-label="Подключить десктоп"
                  title="Подключить десктоп"
                  (click)="onDesktopPairing()"
                  data-test="desktop-pairing-button"
                >
                  <lucide-angular [img]="monitorIcon" [size]="14" aria-hidden="true" />
                </button>
              }
              <span
                class="text-sm text-muted-foreground hidden md:inline truncate max-w-[8rem]"
                [attr.title]="user()?.displayName || user()?.username || 'Сессия'"
              >
                {{ user()?.displayName || user()?.username || 'Сессия' }}
              </span>
              <button
                type="button"
                class="pi-icon-btn pi-focus-ring"
                aria-label="Выйти"
                title="Выйти"
                (click)="onLogout()"
                data-test="shell-logout"
              >
                <lucide-angular [img]="logOutIcon" [size]="14" aria-hidden="true" />
              </button>
            }
          </div>
        </div>
      </header>

      <div
        class="shell-workspace flex-1 min-h-0 min-w-0"
        data-test="shell-workspace-grid"
        [style.grid-template-columns]="gridTemplateColumns()"
      >
        @if (leftTools().length > 0) {
          <aside
            class="shell-rail shell-rail-left"
            data-test="shell-rail-left"
            aria-label="Левая панель инструментов"
            aria-orientation="vertical"
          >
            @for (tool of leftTools(); track tool.id) {
              <button
                type="button"
                class="shell-rail-button shell-rail-tool pi-focus-ring"
                [class.is-active]="activeToolId() === tool.id"
                [attr.data-test]="'shell-tool-left-' + tool.id"
                [attr.aria-label]="tool.ariaLabel"
                [attr.title]="tool.title"
                [disabled]="tool.disabled === true"
                [attr.aria-disabled]="tool.disabled === true ? 'true' : null"
                (click)="onShellToolClick(tool)"
              >
                <lucide-angular [img]="tool.icon" [size]="13" aria-hidden="true" />
                @if (tool.badge && tool.badge > 0) {
                  <span class="shell-tool-badge" data-test="shell-tool-badge" aria-hidden="true">{{ tool.badge }}</span>
                }
              </button>
            }
          </aside>
        }

        <main class="shell-main min-w-0 min-h-0 overflow-y-auto overflow-x-hidden bg-paper">
          <router-outlet />
        </main>

        @if (rightTools().length > 0) {
          <aside
            class="shell-rail shell-rail-right"
            data-test="shell-rail-right"
            aria-label="Правая панель инструментов"
            aria-orientation="vertical"
          >
            @for (tool of rightTools(); track tool.id) {
              <div class="shell-rail-item">
                <button
                  type="button"
                  class="shell-rail-button shell-rail-tool pi-focus-ring"
                  [class.is-active]="activeToolId() === tool.id || openMenuFor() === tool.id"
                  [attr.data-test]="'shell-tool-right-' + tool.id"
                  [attr.aria-label]="tool.ariaLabel"
                  [attr.title]="tool.title"
                  [attr.aria-haspopup]="tool.items?.length ? 'menu' : null"
                  [attr.aria-expanded]="tool.items?.length ? (openMenuFor() === tool.id ? 'true' : 'false') : null"
                  [disabled]="tool.disabled === true"
                  [attr.aria-disabled]="tool.disabled === true ? 'true' : null"
                  (click)="onShellToolClick(tool)"
                >
                  <lucide-angular [img]="tool.icon" [size]="13" aria-hidden="true" />
                  @if (tool.badge && tool.badge > 0) {
                    <span class="shell-tool-badge" data-test="shell-tool-badge" aria-hidden="true">{{ tool.badge }}</span>
                  }
                </button>
                @if (tool.items?.length && openMenuFor() === tool.id) {
                  <div
                    class="shell-rail-menu shell-rail-menu--right"
                    role="menu"
                    [attr.aria-label]="tool.title"
                    [attr.data-test]="'shell-tool-menu-' + tool.id"
                  >
                    @for (item of tool.items; track item.id) {
                      <button
                        type="button"
                        role="menuitem"
                        class="shell-rail-menu-item pi-focus-ring"
                        [class.is-active]="item.active === true"
                        [disabled]="item.disabled === true"
                        [attr.data-test]="'shell-tool-menu-item-' + item.id"
                        (click)="onMenuItemClick(item)"
                      >
                        @if (item.icon) {
                          <lucide-angular [img]="item.icon" [size]="13" aria-hidden="true" />
                        }
                        <span>{{ item.label }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </aside>
        }
      </div>
    </div>
  `,
  styles: `
    .shell-workspace {
      display: grid;
      min-height: 0;
    }

    .shell-rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      padding-top: var(--space-4, 1rem);
      background: var(--color-paper-2);
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .shell-rail-left {
      border-right: 1px solid var(--color-rule);
    }

    .shell-rail-right {
      border-left: 1px solid var(--color-rule);
    }

    .shell-rail-button {
      position: relative;
      display: inline-flex;
      flex: 0 0 32px;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      background: var(--color-paper-raised);
      color: var(--color-ink);
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 120ms ease, border-color 120ms ease;
    }

    .shell-rail-button:hover:not(:disabled),
    .shell-rail-button.is-active {
      background: var(--color-paper-2);
    }

    .shell-rail-button:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .shell-rail-tool {
      background: var(--color-paper-2);
      border-color: var(--color-rule);
    }

    .shell-rail-tool.is-active:not(:disabled) {
      color: var(--color-on-gold);
      background: var(--color-gold);
      border-color: var(--color-gold-deep);
    }

    /* TZ-NX-PO-SWEEP-07 — a rail category's popover menu (button + items) */
    .shell-rail-item {
      position: relative;
    }

    .shell-rail-menu {
      position: absolute;
      top: 0;
      z-index: 40;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 168px;
      padding: 4px;
      background: var(--color-paper-raised);
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      box-shadow: 0 6px 18px color-mix(in oklch, var(--color-ink) 15%, transparent);
    }

    .shell-rail-menu--right {
      right: calc(100% + 6px);
    }

    .shell-rail-menu--left {
      left: calc(100% + 6px);
    }

    .shell-rail-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      font-size: 12px;
      text-align: left;
      white-space: nowrap;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--color-ink);
      cursor: pointer;
    }

    .shell-rail-menu-item:hover:not(:disabled) {
      background: var(--color-paper-2);
    }

    .shell-rail-menu-item.is-active {
      color: var(--color-on-gold);
      background: var(--color-gold);
      border-color: var(--color-gold-deep);
    }

    .shell-rail-menu-item:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .shell-tool-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 15px;
      height: 15px;
      padding: 0 3px;
      border: 1px solid var(--color-paper-raised);
      border-radius: 999px;
      background: var(--color-gold-deep);
      color: var(--color-ink);
      font-size: 9px;
      font-weight: 700;
      line-height: 13px;
      text-align: center;
      pointer-events: none;
    }

    .shell-main {
      contain: inline-size;
    }

    @media (max-width: 767px) {
      .shell-workspace {
        --shell-rail-w: 2.75rem;
      }
    }
  `,
})
export class AppShellComponent {
  protected readonly backIcon = ArrowLeft;
  protected readonly forwardIcon = ArrowRight;
  protected readonly logOutIcon = LogOut;
  protected readonly bellIcon = Bell;
  protected readonly monitorIcon = Monitor;

  private readonly shellTools = inject(ShellToolRailService);
  protected readonly leftTools = this.shellTools.leftTools;
  protected readonly rightTools = this.shellTools.rightTools;
  protected readonly activeToolId = this.shellTools.activeToolId;

  /** TZ-NX-PO-SWEEP-07 — id of the rail category whose popover menu is open (null = none). */
  protected readonly openMenuFor = signal<string | null>(null);

  /**
   * TZ-NX-SHELL-01-IDLE-RAILS — a side only takes a grid column when it has
   * real tools; an idle page (no `setTools` call) gets the full-width main
   * column, matching `--shell-rail-w` (redefined narrower under 768px).
   */
  protected readonly gridTemplateColumns = computed(() => {
    const railW = 'var(--shell-rail-w, 4rem)';
    const hasLeft = this.leftTools().length > 0;
    const hasRight = this.rightTools().length > 0;
    if (hasLeft && hasRight) return `${railW} minmax(0,1fr) ${railW}`;
    if (hasLeft) return `${railW} minmax(0,1fr)`;
    if (hasRight) return `minmax(0,1fr) ${railW}`;
    return 'minmax(0,1fr)';
  });

  protected readonly navHistory = inject(NavHistoryService);

  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly apiBaseUrlToken = inject(API_BASE_URL);

  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  /** TZD-72 — RBAC: only desktop:admin (or admin wildcard) sees the pairing button. */
  protected readonly canPairDesktop = computed(() => this.caps.hasAny(['desktop:admin']));

  private readonly existingPaths = collectPageRoutePaths(this.router.config);

  protected readonly navCategories = computed(() =>
    filterNavCategories(
      NAV_CATEGORIES,
      this.existingPaths,
      this.user()?.pages,
      (required) => this.caps.hasAny(required),
      this.user()?.role,
    ),
  );

  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly activeCategoryId = computed(() =>
    matchActiveCategoryId(this.currentUrl(), this.navCategories()),
  );

  constructor() {
    if (this.isBrowser) {
      const onResize = (): void => {
        /* grid columns handled via CSS; hook reserved for future rail density */
      };
      window.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
    }
  }

  protected onShellToolClick(tool: ShellToolRailItem): void {
    if (tool.disabled) return;
    if (tool.items && tool.items.length > 0) {
      this.openMenuFor.update((current) => (current === tool.id ? null : tool.id));
      return;
    }
    this.shellTools.invoke(tool);
  }

  protected onMenuItemClick(item: ShellToolRailMenuItem): void {
    if (item.disabled) return;
    item.onClick();
    this.openMenuFor.set(null);
  }

  /** TZ-NX-PO-SWEEP-07 — dismiss the open rail category menu on any outside click. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClickOutside(event: MouseEvent): void {
    if (!this.openMenuFor()) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.shell-rail-item')) return;
    this.openMenuFor.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    this.openMenuFor.set(null);
  }

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  /**
   * TZD-72 — NX port of legacy `onDesktopPairing()`. Gated by `canPairDesktop()`
   * in the template; issue/list/revoke are also gated server-side by
   * `@Permissions('desktop:admin')` — the button hide is UX only.
   */
  protected onDesktopPairing(): void {
    const user = this.user();
    if (!user?.username) {
      this.toast.error('Профиль пользователя ещё не загружен — подождите и попробуйте снова.');
      return;
    }

    this.dialog.open<void, PairingDialogData>(PairingDialogComponent, {
      data: {
        apiBaseUrl: this.resolveApiBaseUrl(),
        username: user.username,
      },
      width: 'lg',
      ariaLabel: 'Паринг десктопа',
      parentDestroyRef: this.destroyRef,
    });
  }

  /**
   * Resolve the backend origin for pairing.
   * - Prod: window.location.origin (same-origin serving).
   * - Dev:  http://127.0.0.1:3000 (Nest default; matches proxy.conf.json target).
   * - If API_BASE_URL is an absolute URL, use its origin instead.
   */
  private resolveApiBaseUrl(): string {
    const token = this.apiBaseUrlToken;
    if (/^https?:\/\//.test(token)) {
      try {
        return new URL(token).origin;
      } catch {
        // fall through
      }
    }
    if (isDevMode()) {
      return 'http://127.0.0.1:3000';
    }
    return window.location.origin;
  }
}
