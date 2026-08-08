import { Injectable, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * TZ-UX-313 — catalog detail smart back.
 *
 * Heuristic (fixed in tests): remember same-app `previousUrl` via Router
 * NavigationEnd pairs (+ seed from `lastSuccessfulNavigation.previousNavigation`
 * when the store is first constructed after the landing navigation).
 * Never Location.back() when previousUrl is empty (bookmark / deep link).
 */

/** Normalize router URLs for comparison (strip query/hash noise lightly). */
export function normalizeCatalogUrl(url: string): string {
  const bare = url.split('?')[0]?.split('#')[0] ?? url;
  if (!bare || bare === '/') return '/';
  return bare.endsWith('/') && bare.length > 1 ? bare.slice(0, -1) : bare;
}

/**
 * True when history back is safe: we know a same-app previous URL that
 * differs from the current one.
 */
export function canCatalogHistoryBack(
  previousUrl: string | null | undefined,
  currentUrl: string,
): boolean {
  if (!previousUrl) return false;
  const prev = normalizeCatalogUrl(previousUrl);
  const curr = normalizeCatalogUrl(currentUrl);
  return prev.length > 0 && prev !== curr;
}

/**
 * Ghost back label: short «← Назад» when referrer known, else section list text.
 */
export function catalogBackLabel(
  previousUrl: string | null | undefined,
  currentUrl: string,
  listLabel: string,
): string {
  return canCatalogHistoryBack(previousUrl, currentUrl) ? '← Назад' : listLabel;
}

@Injectable({ providedIn: 'root' })
export class CatalogReturnStore {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly previousUrlSig = signal<string | null>(null);
  private readonly currentUrlSig = signal(normalizeCatalogUrl('/'));

  /** Reactive URLs for labels (signals). */
  readonly previousUrlSignal = this.previousUrlSig.asReadonly();
  readonly currentUrlSignal = this.currentUrlSig.asReadonly();

  constructor() {
    this.currentUrlSig.set(normalizeCatalogUrl(this.router.url || '/'));
    this.seedFromLastNavigation();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const next = normalizeCatalogUrl(e.urlAfterRedirects || e.url);
        const curr = this.currentUrlSig();
        if (curr && curr !== next) {
          this.previousUrlSig.set(curr);
        }
        this.currentUrlSig.set(next);
      });
  }

  /** Visible for tests / labels. */
  get previousUrl(): string | null {
    return this.previousUrlSig();
  }

  get currentUrl(): string {
    return this.currentUrlSig();
  }

  /**
   * If previous same-app URL exists and differs from current → Location.back();
   * else Router.navigateByUrl(fallback).
   */
  navigateBackOr(fallback: string): void {
    if (canCatalogHistoryBack(this.previousUrlSig(), this.currentUrlSig())) {
      this.location.back();
      return;
    }
    void this.router.navigateByUrl(fallback);
  }

  /** @internal Test helper — set previous without full router graph. */
  setPreviousUrlForTests(url: string | null): void {
    this.previousUrlSig.set(url ? normalizeCatalogUrl(url) : null);
  }

  private seedFromLastNavigation(): void {
    const last = this.router.lastSuccessfulNavigation;
    const prevTree = last?.previousNavigation?.finalUrl;
    if (!prevTree) return;
    const prev = normalizeCatalogUrl(this.router.serializeUrl(prevTree));
    if (canCatalogHistoryBack(prev, this.currentUrlSig())) {
      this.previousUrlSig.set(prev);
    }
  }
}
