import { Injectable, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { normalizeCatalogUrl } from './catalog-return.util';

/**
 * TZ-UX-317 — site-wide SPA history for the global ← → gutter buttons.
 *
 * Tracks a same-app URL stack from Router events (imperative navigations
 * push; `popstate` — browser back/forward — moves within the stack; same
 * normalized URL is deduped so `replaceUrl` ticks like the builder's
 * ?categoryId filter never grow the stack). `back()`/`forward()` delegate
 * to `Location.back()/forward()` (real browser history), so the native
 * browser ← → stays consistent with the buttons.
 *
 * The global buttons are disabled (never silently jump to a section
 * fallback) when there is no previous/next same-app URL — deep links and
 * post-login landings start with a single-entry stack. `/login` is never
 * seeded as a previous URL: a global ← must not dump the user at the
 * sign-in page while authenticated.
 *
 * `CatalogReturnStore` (catalog smart-back, TZ-UX-313) is untouched —
 * this store is additive and reuses only `normalizeCatalogUrl`.
 */
@Injectable({ providedIn: 'root' })
export class AppHistoryStore {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly stack = signal<string[]>([]);
  private readonly index = signal(-1);

  /** Global ← enabled: there is a same-app URL behind the current one. */
  readonly canGoBack = computed(() => this.index() > 0);

  /** Global → enabled: the user has gone back and a forward entry exists. */
  readonly canGoForward = computed(
    () => this.index() >= 0 && this.index() < this.stack().length - 1,
  );

  private lastTrigger: 'imperative' | 'popstate' | 'hashchange' | 'other' | null = null;

  constructor() {
    const current = normalizeCatalogUrl(this.router.url || '/');
    const prev = this.seedPreviousUrl(current);
    this.stack.set(prev ? [prev, current] : [current]);
    this.index.set(prev ? 1 : 0);

    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => {
        this.lastTrigger = (e.navigationTrigger ?? 'other') as
          'imperative' | 'popstate' | 'hashchange' | 'other';
      });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.onNavigationEnd(e.urlAfterRedirects || e.url));
  }

  /** Global ← — real browser history back, no silent section fallback. */
  back(): void {
    if (!this.canGoBack()) return;
    this.location.back();
  }

  /** Global → — real browser history forward. */
  forward(): void {
    if (!this.canGoForward()) return;
    this.location.forward();
  }

  private onNavigationEnd(url: string): void {
    const normalized = normalizeCatalogUrl(url);
    const stack = this.stack();
    const index = this.index();

    if (this.lastTrigger === 'popstate') {
      // Browser back/forward (our buttons or native). Move within the stack;
      // an untracked URL (external pop) clamps one step back.
      const found = stack.lastIndexOf(normalized);
      this.index.set(found >= 0 ? found : Math.max(0, index - 1));
      return;
    }

    // Imperative navigation (link click / router.navigate / redirect).
    // Same normalized URL (replaceUrl ticks) — don't grow the stack.
    if (stack[index] === normalized) return;
    const next = [...stack.slice(0, index + 1), normalized];
    this.stack.set(next);
    this.index.set(next.length - 1);
  }

  /** Seed from the landing navigation (previous page before this one). */
  private seedPreviousUrl(current: string): string | null {
    const last = this.router.lastSuccessfulNavigation;
    const prevTree = last?.previousNavigation?.finalUrl;
    if (!prevTree) return null;
    const prev = normalizeCatalogUrl(this.router.serializeUrl(prevTree));
    if (!prev || prev === current || prev === '/login') return null;
    return prev;
  }
}
