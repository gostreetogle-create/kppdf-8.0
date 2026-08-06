import { InjectionToken } from '@angular/core';

/** Same-origin installer path used when deployment does not configure a URL. */
export const DEFAULT_DESKTOP_DOWNLOAD_URL = '/downloads/kppdf-desktop-setup.exe';

declare global {
  interface Window {
    /** Runtime value injected by the deployment from DESKTOP_DOWNLOAD_URL. */
    __DESKTOP_DOWNLOAD_URL__?: string;
  }
}

export function resolveDesktopDownloadUrl(value: string | undefined): string {
  return value === undefined ? DEFAULT_DESKTOP_DOWNLOAD_URL : value;
}

/**
 * Installer URL for the pairing dialog.
 *
 * The static Angular bundle has no dotenv loader. Deployments may inject
 * `window.__DESKTOP_DOWNLOAD_URL__` from the `DESKTOP_DOWNLOAD_URL` env value
 * before the bundle runs. An explicitly empty value intentionally disables the
 * action; an absent value uses the same-origin default.
 */
export const DESKTOP_DOWNLOAD_URL = new InjectionToken<string>('DESKTOP_DOWNLOAD_URL', {
  providedIn: 'root',
  factory: () =>
    resolveDesktopDownloadUrl(
      typeof window !== 'undefined' ? window.__DESKTOP_DOWNLOAD_URL__ : undefined,
    ),
});
