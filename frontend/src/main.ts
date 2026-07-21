import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// TZ-157: Initialize Sentry before Angular bootstrap.
// SENTRY_DSN is injected at runtime via window.__SENTRY_DSN__
// (e.g. from a server-rendered <script> tag in index.html).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sentryDsn = (window as any).__SENTRY_DSN__ as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    tracesSampleRate: 0.2,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

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
  console.error('Bootstrap failed:', err);
});
