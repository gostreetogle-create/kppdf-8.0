import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { LucideAngularModule, LogOut } from 'lucide-angular';
import { AuthService } from '../core/auth.service';

interface NavLink {
  path: string;
  label: string;
  /** disabled = route not yet built; rendered muted + non-clickable. */
  disabled?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { path: '/materials', label: 'Материалы' },
  { path: '/organizations', label: 'Организации' },
  { path: '/dictionaries', label: 'Справочники' },
  { path: '/products', label: 'Продукция', disabled: true },
  { path: '/orders', label: 'Заказы', disabled: true },
];

/**
 * TZ-NEW AppLayoutComponent — the operational site shell.
 *
 * Replaces KitLayoutComponent as the default landing layout. Hosts
 * the operational site (auth-guarded, /, /materials, future
 * /counterparties, /products, …). The UI-Kit itself is preserved
 * at /kit/* for site-building work but is NOT shown in this nav.
 *
 * Layout:
 *  - Centred max-width container (max-w-[1600px] mx-auto) with
 *    generous responsive horizontal padding (px-6 sm:px-10 lg:px-16
 *    ≈ 64px on desktop, ~24px on mobile) — keeps content from
 *    touching the screen edge on any viewport width.
 *  - Sticky header: brand block ("KPPDF · 8.0") + horizontal nav
 *    + user/logout on the right. The header bleeds to the screen
 *    edge via negative margin (sticky background looks correct)
 *    and re-applies the same padding internally.
 *  - Main: <router-outlet /> for the page content.
 *  - Footer: copyright + tech credits.
 *
 * Standalone + OnPush + signal-based, matching the rest of the
 * Paper & Ink codebase.
 */
@Component({
  selector: 'app-app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-screen flex flex-col bg-paper text-ink font-body">
      <div
        class="w-full max-w-[1400px] mx-auto flex flex-col flex-1
               px-6 sm:px-10 lg:px-16"
      >
        <header
          class="sticky top-0 z-30 border-b hairline border-sunrise-warm
                 bg-paper/95 supports-[backdrop-filter]:backdrop-blur-[2px]
                 -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16"
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
              @for (link of navLinks; track link.path) {
                @if (link.disabled) {
                  <span
                    class="px-3 py-1.5 text-sm text-muted rounded-sm cursor-not-allowed"
                    [attr.aria-disabled]="true"
                    [title]="link.label + ' — скоро'"
                  >
                    {{ link.label }}
                  </span>
                } @else {
                  <a
                    [routerLink]="link.path"
                    routerLinkActive="bg-ink text-paper"
                    class="px-3 py-1.5 text-sm hover:bg-paper-2 transition-colors rounded-sm"
                  >
                    {{ link.label }}
                  </a>
                }
              }
            </nav>

            <div class="flex items-center gap-3 shrink-0">
              @if (user(); as u) {
                <span class="text-sm text-muted hidden sm:inline">
                  {{ u.displayName || u.username }}
                </span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-2 h-8
                         border hairline border-rule rounded-sm
                         hover:bg-paper-2 transition-colors"
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

        <main class="min-w-0">
          <router-outlet />
        </main>

        <footer
          class="border-t hairline border-sunrise-warm mt-auto py-section
                 font-mono text-[11px] uppercase tracking-[0.18em]
                 text-muted flex flex-wrap justify-between gap-3"
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
  protected readonly navLinks = NAV_LINKS;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
