import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'pi.theme';

/**
 * ThemeService — single source of truth for light/dark mode toggle.
 *
 * - `mode` signal: the current mode.
 * - `isDark`: computed boolean.
 * - Effect on `mode` automatically syncs DOM (classList) + localStorage.
 * - `applyEarlyHint()` called once in main.ts SYNCHRONOUSLY so that
 *   pre-paint <html class="dark"> is set BEFORE bootstrapApplication
 *   (TZ-33 §3 — no FOUC).
 *
 * TZ-77 ↔ TZ-33 coordination: this service handles light/dark only.
 * Color override layer (e.g. user shifts hue of `--color-ink`) is
 * applied separately by Theme Editor override-vars via `style.setProperty`,
 * NOT here — keeping two responsibilities split.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _mode = signal<ThemeMode>(this.detectInitial());
  readonly mode = this._mode.asReadonly();
  readonly isDark = computed(() => this._mode() === 'dark');

  constructor() {
    effect(() => {
      const m = this._mode();
      if (!this.isBrowser) return;
      this.doc.documentElement.classList.toggle('dark', m === 'dark');
      try {
        localStorage.setItem(STORAGE_KEY, m);
      } catch {
        /* private mode — silent */
      }
    });
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  set(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  private detectInitial(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      /* ignore */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
