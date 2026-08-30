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
} from 'lucide-angular';
import { AuthService } from '@kppdf/data-access/auth';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { ThemeToggleComponent } from './theme-toggle.component';
import { NavHistoryService } from './nav-history.service';
import { NAV_CATEGORIES, filterNavCategories, matchActiveCategoryId } from './nav-categories';
import { collectPageRoutePaths } from './route-paths';
import {
  LEFT_TOOL_RAIL_ITEMS,
  RIGHT_TOOL_RAIL_ITEMS,
  isToolRailItemDisabled,
  type ToolRailItem,
} from './tool-rail-definitions';

/**
 * TZ-NX-SHELL-rail-layout-fix — operational shell matching legacy chrome:
 * full-width header + left/right narrow tool rails + central workspace grid.
 * `/kit/*` stays on `KitLayoutComponent` (not nested here).
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, LucideAngularModule, ThemeToggleComponent],
  template: `
    <div class="h-screen bg-paper text-ink font-body flex flex-col overflow-hidden">
      <header class="shrink-0 z-30 bg-paper hairline-b pi-edge-bleed">
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
      >
        <aside
          class="shell-rail shell-rail-left"
          data-test="shell-rail-left"
          aria-label="Левая панель инструментов"
          aria-orientation="vertical"
        >
          <button
            type="button"
            class="shell-rail-button pi-focus-ring"
            data-test="shell-nav-back"
            [disabled]="!navHistory.canGoBack()"
            [attr.aria-disabled]="navHistory.canGoBack() ? null : 'true'"
            (click)="navHistory.back()"
            aria-label="Назад"
            title="Назад"
          >
            <lucide-angular [img]="backIcon" [size]="13" aria-hidden="true" />
          </button>
          @if (leftTools().length > 0) {
            <div class="shell-rail-tools-gap" aria-hidden="true"></div>
          }
          @for (tool of leftTools(); track tool.id) {
            <button
              type="button"
              class="shell-rail-button shell-rail-tool pi-focus-ring"
              [class.is-active]="activeToolId() === tool.id"
              [attr.data-test]="'shell-tool-left-' + tool.id"
              [attr.aria-label]="tool.ariaLabel"
              [attr.title]="tool.title"
              [disabled]="isToolDisabled(tool)"
              [attr.aria-disabled]="isToolDisabled(tool) ? 'true' : null"
              (click)="onToolClick(tool)"
            >
              <lucide-angular [img]="tool.icon" [size]="13" aria-hidden="true" />
            </button>
          }
        </aside>

        <main class="shell-main min-w-0 min-h-0 overflow-y-auto overflow-x-hidden bg-paper">
          <router-outlet />
        </main>

        <aside
          class="shell-rail shell-rail-right"
          data-test="shell-rail-right"
          aria-label="Правая панель инструментов"
          aria-orientation="vertical"
        >
          <button
            type="button"
            class="shell-rail-button pi-focus-ring"
            data-test="shell-nav-forward"
            [disabled]="!navHistory.canGoForward()"
            [attr.aria-disabled]="navHistory.canGoForward() ? null : 'true'"
            (click)="navHistory.forward()"
            aria-label="Вперёд"
            title="Вперёд"
          >
            <lucide-angular [img]="forwardIcon" [size]="13" aria-hidden="true" />
          </button>
          @if (rightTools().length > 0) {
            <div class="shell-rail-tools-gap" aria-hidden="true"></div>
          }
          @for (tool of rightTools(); track tool.id) {
            <button
              type="button"
              class="shell-rail-button shell-rail-tool pi-focus-ring"
              [class.is-active]="activeToolId() === tool.id"
              [attr.data-test]="'shell-tool-right-' + tool.id"
              [attr.aria-label]="tool.ariaLabel"
              [attr.title]="tool.title"
              [disabled]="isToolDisabled(tool)"
              [attr.aria-disabled]="isToolDisabled(tool) ? 'true' : null"
              (click)="onToolClick(tool)"
            >
              <lucide-angular [img]="tool.icon" [size]="13" aria-hidden="true" />
            </button>
          }
        </aside>
      </div>
    </div>
  `,
  styles: `
    .shell-workspace {
      display: grid;
      grid-template-columns: var(--shell-rail-w, 4rem) minmax(0, 1fr) var(--shell-rail-w, 4rem);
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

    .shell-rail-tools-gap {
      flex: 0 0 32px;
      width: 32px;
      height: 32px;
      pointer-events: none;
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

    .shell-main {
      contain: inline-size;
    }

    @media (max-width: 767px) {
      .shell-workspace {
        grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
      }

      .shell-rail-tool,
      .shell-rail-tools-gap {
        display: none;
      }
    }
  `,
})
export class AppShellComponent {
  protected readonly backIcon = ArrowLeft;
  protected readonly forwardIcon = ArrowRight;
  protected readonly logOutIcon = LogOut;
  protected readonly bellIcon = Bell;

  protected readonly leftTools = signal(LEFT_TOOL_RAIL_ITEMS);
  protected readonly rightTools = signal(RIGHT_TOOL_RAIL_ITEMS);
  protected readonly activeToolId = signal<string | null>(null);

  protected readonly navHistory = inject(NavHistoryService);

  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

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

  protected isToolDisabled(tool: ToolRailItem): boolean {
    return isToolRailItemDisabled(tool);
  }

  protected onToolClick(tool: ToolRailItem): void {
    if (this.isToolDisabled(tool)) return;
    this.activeToolId.set(tool.id);
  }

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
