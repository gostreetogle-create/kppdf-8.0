import { Injectable, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * App-shell back/forward gutter buttons — same-app URL stack tracked from
 * Router events; `back()`/`forward()` always delegate to `Location`, i.e.
 * real browser history, so there is no parallel/custom URL history to keep
 * in sync — this service only derives the enabled/disabled state of the
 * two buttons.
 */
@Injectable({ providedIn: 'root' })
export class NavHistoryService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly stack = signal<string[]>([this.router.url]);
  private readonly index = signal(0);
  private lastTrigger: 'imperative' | 'popstate' | 'hashchange' | 'other' | null = null;

  readonly canGoBack = computed(() => this.index() > 0);
  readonly canGoForward = computed(() => this.index() < this.stack().length - 1);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => {
        this.lastTrigger = (e.navigationTrigger ?? 'other') as typeof this.lastTrigger;
      });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.onNavigationEnd(e.urlAfterRedirects || e.url));
  }

  back(): void {
    if (!this.canGoBack()) return;
    this.location.back();
  }

  forward(): void {
    if (!this.canGoForward()) return;
    this.location.forward();
  }

  private onNavigationEnd(url: string): void {
    const stack = this.stack();
    const index = this.index();

    if (this.lastTrigger === 'popstate') {
      const found = stack.lastIndexOf(url);
      this.index.set(found >= 0 ? found : Math.max(0, index - 1));
      return;
    }

    if (stack[index] === url) return;
    const next = [...stack.slice(0, index + 1), url];
    this.stack.set(next);
    this.index.set(next.length - 1);
  }
}
