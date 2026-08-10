import { InjectionToken } from '@angular/core';

/** Same-origin installer path used when deployment does not configure a URL. */
export const DEFAULT_DESKTOP_DOWNLOAD_URL = '/downloads/kppdf-desktop-setup.zip';

/** Meta tag written by `frontend/src/index.html` / `deploy.py` (CSP-safe; no inline script). */
export const DESKTOP_DOWNLOAD_URL_META_NAME = 'kppdf-desktop-download-url';

declare global {
  interface Window {
    /**
     * Legacy runtime inject (pre AUTH-302). Prefer meta tag; kept for tests / old builds.
     * @deprecated Use meta[name=kppdf-desktop-download-url]
     */
    __DESKTOP_DOWNLOAD_URL__?: string;
  }
}

export function resolveDesktopDownloadUrl(value: string | undefined): string {
  return value === undefined ? DEFAULT_DESKTOP_DOWNLOAD_URL : value;
}

/**
 * Read deploy-time desktop URL without inline scripts (Helmet CSP script-src 'self').
 *
 * - meta absent / no `content` attribute → undefined → default path
 * - meta `content=""` → explicit empty → disable download action
 * - meta `content="https://…"` → that URL
 * - legacy `window.__DESKTOP_DOWNLOAD_URL__` only if meta did not decide
 */
export function readDesktopDownloadUrlFromDom(
  doc: Document | null | undefined = typeof document !== 'undefined' ? document : undefined,
  win: Window | null | undefined = typeof window !== 'undefined' ? window : undefined,
): string | undefined {
  const meta = doc?.querySelector(`meta[name="${DESKTOP_DOWNLOAD_URL_META_NAME}"]`);
  if (meta) {
    if (!meta.hasAttribute('content')) {
      return undefined;
    }
    return meta.getAttribute('content') ?? '';
  }
  if (win && Object.prototype.hasOwnProperty.call(win, '__DESKTOP_DOWNLOAD_URL__')) {
    return win.__DESKTOP_DOWNLOAD_URL__;
  }
  return undefined;
}

/**
 * Installer URL for the pairing dialog.
 *
 * The static Angular bundle has no dotenv loader. Deployments may set
 * `<meta name="kppdf-desktop-download-url" content="…">` from `DESKTOP_DOWNLOAD_URL`
 * before the bundle runs. An explicitly empty content disables the action; an
 * absent content attribute uses the same-origin default.
 */
export const DESKTOP_DOWNLOAD_URL = new InjectionToken<string>('DESKTOP_DOWNLOAD_URL', {
  providedIn: 'root',
  factory: () => resolveDesktopDownloadUrl(readDesktopDownloadUrlFromDom()),
});
