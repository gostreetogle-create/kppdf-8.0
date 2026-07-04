import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'kppdf-theme';

/**
 * Theme service — dark-first default per TZ-40 / UI Kit spec.
 * Persists preference to localStorage and applies the .dark class to <html>.
 * The anti-FOUC script in index.html applies the theme before app bootstrap.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    // Apply theme on init (in case anti-FOUC script wasn't run)
    this.apply(this.theme());

    // React to signal changes
    effect(() => {
      this.apply(this.theme());
    });
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }

  private initial(): Theme {
    if (typeof localStorage === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark'; // dark-first default
  }

  private apply(theme: Theme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
