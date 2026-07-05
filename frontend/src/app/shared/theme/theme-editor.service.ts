import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type OklchOverride = {
  lightness: number;
  chroma: number;
  hue: number;
};

const STORAGE_KEY = 'pi.theme-overrides';

const DEFAULT_INK: OklchOverride = { lightness: 14.5, chroma: 0, hue: 0 };
const DEFAULT_PAPER: OklchOverride = { lightness: 97.2, chroma: 0.8, hue: 85 };

/**
 * ThemeEditorService — TZ-77.
 *
 * NON-DESTRUCTIVE override layer: TZ-32 base @theme inline values
 * stay intact. Overrides applied via style.setProperty('--color-X-override', ...)
 * and consumed by token consumers via `var(--color-X-override, oklch(...))`
 * fallback syntax.
 *
 * Persists to localStorage `pi.theme-overrides` (JSON).
 * SSR-safe: guards on `isPlatformBrowser(inject(PLATFORM_ID))`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeEditorService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _ink = signal<OklchOverride>({ ...DEFAULT_INK });
  private readonly _paper = signal<OklchOverride>({ ...DEFAULT_PAPER });
  private readonly _rule = signal<OklchOverride>({ lightness: 85, chroma: 0.6, hue: 80 });

  readonly ink = this._ink.asReadonly();
  readonly paper = this._paper.asReadonly();
  readonly rule = this._rule.asReadonly();

  constructor() {
    this.loadFromStorage();
    this.apply();
  }

  setInk(overrides: Partial<OklchOverride>): void {
    this._ink.update((v) => ({ ...v, ...overrides }));
  }

  setPaper(overrides: Partial<OklchOverride>): void {
    this._paper.update((v) => ({ ...v, ...overrides }));
  }

  setRule(overrides: Partial<OklchOverride>): void {
    this._rule.update((v) => ({ ...v, ...overrides }));
  }

  reset(): void {
    this._ink.set({ ...DEFAULT_INK });
    this._paper.set({ ...DEFAULT_PAPER });
    this._rule.set({ lightness: 85, chroma: 0.6, hue: 80 });
    this.commit();
  }

  apply(): void {
    if (!this.isBrowser) return;
    const root = this.doc.documentElement;
    root.style.setProperty(
      '--color-ink-override',
      this.toOklch(this._ink()),
    );
    root.style.setProperty(
      '--color-paper-override',
      this.toOklch(this._paper()),
    );
    root.style.setProperty(
      '--color-rule-override',
      this.toOklch(this._rule()),
    );
  }

  persist(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ink: this._ink(),
          paper: this._paper(),
          rule: this._rule(),
        }),
      );
    } catch {
      /* silent */
    }
  }

  /** Apply + persist after every signal update. */
  commit(): void {
    this.apply();
    this.persist();
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        ink?: OklchOverride;
        paper?: OklchOverride;
        rule?: OklchOverride;
      };
      if (data.ink) this._ink.set(data.ink);
      if (data.paper) this._paper.set(data.paper);
      if (data.rule) this._rule.set(data.rule);
    } catch {
      /* corrupt JSON, silent fallback */
    }
  }

  private toOklch(o: OklchOverride): string {
    return `oklch(${o.lightness}% ${o.chroma} ${o.hue})`;
  }
}
