import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

/**
 * Pre-paint theme hint (TZ-33 + TZ-77 coordination).
 * Runs BEFORE bootstrapApplication so there's no flash-of-light-content on
 * reload when user prefers dark. Reads:
 *   - `pi.theme`             (TZ-33 dark-mode toggle)
 *   - `pi.theme-overrides`   (TZ-77 color override JSON, reserved)
 *
 * This inline IIFE is the pre-paint call site for the algorithm that
 * ThemeService.detectInitial() implements post-bootstrap. DI isn't
 * available until bootstrapApplication, so we inline the same logic
 * once here, then ThemeService.setMode() keeps it in sync after.
 */
(function applyThemeEarlyHint(): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  let mode: 'light' | 'dark' = 'light';
  try {
    const stored = localStorage.getItem('pi.theme');
    if (stored === 'dark' || stored === 'light') {
      mode = stored;
    } else if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      mode = 'dark';
    }
  } catch {
    /* private mode / storage disabled — fallback to light */
  }
  html.classList.toggle('dark', mode === 'dark');
  // TZ-77 future: also read `pi.theme-overrides` here and apply via
  // html.style.setProperty('--color-X-override', oklch(...)) before
  // Angular mounts so the override layer is live from first paint.
})();

bootstrapApplication(App, appConfig).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Bootstrap failed:', err);
});
