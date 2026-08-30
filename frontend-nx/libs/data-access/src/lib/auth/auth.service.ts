import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL } from '@kppdf/util-http';
import { JWT_ACCESS_HEADER } from './jwt-access-header';
import { silentPost } from '@kppdf/util-http';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
  /** TZ-238 */
  organizationId?: string | null;
  /** TZ-ACCESS-301: page ACL from role — delivered by /auth/me. */
  pages?: string[];
  /** TZ-AUTH-306: `true` only for the single hidden owner. */
  isOwner?: boolean;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

const ACCESS_KEY = 'kppdf.access';
const REFRESH_KEY = 'kppdf.refresh';

/** TZ-AUTH-304 — marks a browser as a device session (no refresh token). */
const DEVICE_KEY = 'kppdf.device';

/** TZ-AUTH-304 — the backend cookie-only status probe shape. */
interface DeviceStatusResponse {
  status: 'active' | 'revoked' | 'expired';
  deviceName?: string;
}

/** TZ-AUTH-304 — the revoked/expired-device message shown to the user. */
const DEVICE_DENIED_MESSAGE = 'Доступ этого компьютера отключён. Обратитесь к администратору.';

/**
 * Centralised authentication state. Signal-based — components read directly.
 *
 * - Token storage: localStorage so page reload keeps the session alive.
 * - State ownership: this service is the single source of truth; UI
 *   components never read localStorage directly.
 * - Why HttpClient (not httpResource): login / logout / refresh are
 *   mutations. httpResource is for read-only data fetching; we'll switch
 *   to it when listing pages are introduced.
 *
 * TZ-AUTH-304 adds a second session kind: the DEVICE flow. A device stores
 * only a short-lived access JWT (≤5m) and never a refresh token — the
 * long-lived credential is the `__Host-` grant cookie, which the backend
 * exchanges for a fresh access JWT via the cookie-only `/device/session`
 * endpoint. `DEVICE_KEY` in localStorage distinguishes device browsers from
 * password browsers so bootstrap knows which renewal path to take.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // --- reactive state ---

  readonly accessToken = signal<string | null>(this.read(ACCESS_KEY));
  readonly refreshToken = signal<string | null>(this.read(REFRESH_KEY));
  readonly user = signal<AuthUser | null>(null);
  /** Session alive if we have access OR a refresh token to renew it. */
  readonly isAuthenticated = computed(() => !!this.accessToken() || !!this.refreshToken());

  /** TZ-AUTH-304 — true while this browser is a device session. */
  private readonly deviceMode = signal(false);
  /** TZ-AUTH-304 — set when a device credential is revoked/expired. */
  readonly deviceDenied = signal<string | null>(null);

  /**
   * TZ-AUTH-306 — `true` only for the single hidden owner. Drives
   * owner-only UI (role editor, «Добавить мой компьютер» in TZ-AUTH-304).
   * Backend returns `isOwner` only to the owner; everyone else gets `false`.
   */
  readonly isOwner = computed(() => this.user()?.isOwner === true);

  /** TZ-AUTH-304 — device session: an access JWT but never a refresh token. */
  readonly isDeviceSession = computed(() => this.deviceMode() && !!this.accessToken());

  /**
   * Single-flight: while a refresh is in progress, every concurrent caller
   * (typically several failed requests in the same tick) gets the same
   * Promise. Prevents thundering-herd of N parallel /auth/refresh calls
   * when 5 requests all get 401 simultaneously.
   *
   * Reset in `finally` so a later failure can still trigger a new attempt.
   */
  private refreshInFlight: Promise<string> | null = null;

  /** TZ-AUTH-304 — single-flight for the cookie-only device renew. */
  private deviceSessionInFlight: Promise<string> | null = null;

  /**
   * Set when bootstrap kept tokens after a transient /auth/me failure
   * (network/5xx) without hydrating `user`. Cleared on login, clear, or
   * successful hydrate — so refresh() does not spam /auth/me on every
   * normal token rotation.
   */
  private needsUserHydration = false;

  // --- lifecycle ---

  /**
   * Called once via `provideAppInitializer`. Restores session from
   * localStorage: valid access → /auth/me; expired access + refresh →
   * refresh then /auth/me; refresh-only → refresh then /auth/me. For
   * device browsers, restores the session from the `__Host-` cookie.
   *
   * Tokens are cleared ONLY on definitive auth rejection (401/403).
   * Network blips and 5xx must NOT wipe the refresh token — otherwise
   * every backend restart / proxy hiccup forces a full re-login.
   */
  async bootstrap(): Promise<void> {
    // TZ-AUTH-304 — device browsers never persist a refresh token; their
    // long-lived credential is the grant cookie. Route them through the
    // cookie-only session path exclusively.
    if (this.isDeviceFlow() && !this.refreshToken()) {
      await this.bootstrapDevice();
      return;
    }

    if (!this.accessToken() && !this.refreshToken()) return;

    // Renew access before /auth/me when missing or JWT past exp.
    if (this.refreshToken() && (!this.accessToken() || this.isAccessExpired())) {
      try {
        await this.refresh();
      } catch {
        return; // auth failure → refresh() cleared; network → tokens kept
      }
    }

    const meResult = await firstValueFrom(
      this.http.get<AuthUser>(`${this.baseUrl}/auth/me`).pipe(
        map((user) => ({ ok: true as const, user })),
        catchError((err: unknown) => {
          const status = err instanceof HttpErrorResponse ? err.status : 0;
          return of({ ok: false as const, status });
        }),
      ),
    );

    if (meResult.ok) {
      this.user.set(meResult.user);
      this.needsUserHydration = false;
      return;
    }

    // 401 with a refresh token → try to refresh, then retry /auth/me.
    if (meResult.status === 401 && this.refreshToken()) {
      try {
        await this.refresh();
        const retry = await firstValueFrom(
          this.http
            .get<AuthUser>(`${this.baseUrl}/auth/me`)
            .pipe(catchError(() => of(null as AuthUser | null))),
        );
        if (retry) {
          this.user.set(retry);
          this.needsUserHydration = false;
          return;
        }
        // Refresh OK but /me still rejected → session unusable.
        this.clear();
      } catch {
        // refresh() clears on auth failure; network errors keep tokens.
        if (this.refreshToken() || this.accessToken()) {
          this.needsUserHydration = true;
        }
      }
      return;
    }

    // Definitive unauthenticated without refresh.
    if (meResult.status === 401 || meResult.status === 403) {
      this.clear();
      return;
    }

    // Transient (network status 0, 5xx, …): keep tokens for the next load.
    this.needsUserHydration = true;
  }

  async login(username: string, password: string): Promise<void> {
    // Use silentPost so the observable never errors and RxJS's global
    // unhandled-error log is suppressed. On failure we throw the
    // HttpErrorResponse so the caller (LoginPage.onSubmit) can show
    // a toast via its existing try/catch — this preserves the user-
    // visible error UX (bad credentials, etc.) while keeping the
    // console clean.
    const res = await firstValueFrom(
      silentPost<LoginResponse>(this.http, `${this.baseUrl}/auth/login`, {
        username,
        password,
      }),
    );
    if (!res.ok) {
      throw res.error;
    }
    this.setTokens(res.data.access, res.data.refresh);
    this.deviceMode.set(false);
    this.deviceDenied.set(null);
    localStorage.removeItem(DEVICE_KEY);
    this.user.set(res.data.user);
    this.needsUserHydration = false;
  }

  async logout(): Promise<void> {
    // silentPost never errors, so no try/catch needed — the network
    // call is fire-and-forget. The observable emits a SilentResult
    // value (which we ignore) and then completes; RxJS's global
    // unhandled-error log is suppressed.
    await firstValueFrom(silentPost(this.http, `${this.baseUrl}/auth/logout`, {}));
    this.clear();
  }

  /**
   * Exchanges the stored refresh token for a new access token.
   *
   * - Returns the new access token on success.
   * - On failure clears local auth state and re-throws so the caller
   *   (interceptor) can navigate to /login and propagate the original 401.
   * - Single-flight: concurrent calls share one in-flight Promise.
   *
   * Backend contract (`POST /api/auth/refresh`):
   *   - Authenticated by `AuthGuard('jwt-refresh')` which reads the
   *     refresh token from `X-Access-Token` (or legacy `Authorization: Bearer`).
   *   - Body can be empty; `RefreshTokenDto` is a placeholder.
   *   - Response: `{ access: string }`. Refresh token is NOT rotated.
   */
  refresh(): Promise<string> {
    if (this.refreshInFlight) return this.refreshInFlight;

    this.refreshInFlight = (async () => {
      const refresh = this.refreshToken();
      if (!refresh) {
        this.clear();
        throw new Error('No refresh token available');
      }

      // Same silent-error pattern as bootstrap(): convert Observable
      // errors to a plain `{ ok, access }` value so RxJS's global
      // unhandled-error log (and its zone.js stack trace) doesn't
      // fire on the expected 4xx. We re-throw on failure so callers
      // (interceptor's catchError, bootstrap's await) can handle it.
      const res = await firstValueFrom(
        this.http
          .post<{ access: string }>(
            `${this.baseUrl}/auth/refresh`,
            {},
            { headers: { [JWT_ACCESS_HEADER]: refresh } },
          )
          .pipe(
            map((data) => ({ ok: true as const, access: data.access })),
            catchError((err: unknown) => of({ ok: false as const, error: err })),
          ),
      );

      if (!res.ok) {
        // Wipe local session only on definitive auth rejection.
        // status 0 (network) / 5xx must keep refresh so a backend blip
        // does not force re-login.
        const status = res.error instanceof HttpErrorResponse ? res.error.status : 0;
        if (status === 401 || status === 403 || status === 400) {
          this.clear();
        }
        if (res.error instanceof HttpErrorResponse) {
          throw res.error;
        }
        throw new HttpErrorResponse({
          status: 0,
          statusText: 'Unknown',
          error: res.error,
        });
      }

      // Keep the existing refresh token; only the access token rotates.
      this.setTokens(res.access, refresh);
      // Recover profile after a transient bootstrap miss (tokens kept, user null).
      void this.hydrateUserIfNeeded();
      return res.access;
    })().finally(() => {
      this.refreshInFlight = null;
    });

    return this.refreshInFlight;
  }

  // --- TZ-AUTH-304 device flow ---

  /**
   * Persist a device access JWT. The device flow NEVER stores a refresh
   * token — the grant cookie is the long-lived credential.
   */
  applyDeviceAccess(access: string): void {
    this.accessToken.set(access);
    this.refreshToken.set(null);
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.setItem(DEVICE_KEY, '1');
    this.deviceMode.set(true);
    this.deviceDenied.set(null);
  }

  /**
   * Cookie-only device renew (single-flight). Exchanges the `__Host-`
   * grant cookie for a fresh ≤5m access JWT. Used by the interceptor when
   * a device's access JWT has expired mid-session.
   */
  renewDevice(): Promise<string> {
    if (this.deviceSessionInFlight) return this.deviceSessionInFlight;

    this.deviceSessionInFlight = (async () => {
      const res = await firstValueFrom(
        this.http.get<{ access: string }>(`${this.baseUrl}/device/session`).pipe(
          map((data) => ({ ok: true as const, access: data.access })),
          catchError((err: unknown) => of({ ok: false as const, error: err })),
        ),
      );

      if (!res.ok) {
        const status = res.error instanceof HttpErrorResponse ? res.error.status : 0;
        if (status === 401 || status === 403 || status === 410 || status === 400) {
          this.deviceDenied.set(DEVICE_DENIED_MESSAGE);
          this.clear();
        }
        if (res.error instanceof HttpErrorResponse) {
          throw res.error;
        }
        throw new HttpErrorResponse({ status: 0, statusText: 'Unknown', error: res.error });
      }

      this.applyDeviceAccess(res.access);
      return res.access;
    })().finally(() => {
      this.deviceSessionInFlight = null;
    });

    return this.deviceSessionInFlight;
  }

  /** Load /auth/me only after bootstrap marked a zombie (tokens, no user). */
  private async hydrateUserIfNeeded(): Promise<void> {
    if (!this.needsUserHydration || this.user() || !this.accessToken()) return;
    try {
      const me = await firstValueFrom(
        this.http.get<AuthUser>(`${this.baseUrl}/auth/me`).pipe(catchError(() => of(null))),
      );
      if (me) {
        this.user.set(me);
        this.needsUserHydration = false;
      }
    } catch {
      // leave user null; logout still available via isAuthenticated
    }
  }

  /** Public recovery: tokens exist but `user` is null (zombie after backend blip). */
  ensureUser(): Promise<void> {
    this.needsUserHydration = true;
    return this.hydrateUserIfNeeded();
  }

  /**
   * TZ-AUTH-304 — true when this browser was previously activated as a
   * device (persisted flag). Used by bootstrap to pick the cookie-based
   * session path instead of the password path.
   */
  private isDeviceFlow(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(DEVICE_KEY) === '1';
  }

  /** Restore a device session from the grant cookie (bootstrap path). */
  private async bootstrapDevice(): Promise<void> {
    const status = await firstValueFrom(
      this.http.get<DeviceStatusResponse>(`${this.baseUrl}/device/status`).pipe(
        map((s) => ({ ok: true as const, s })),
        catchError(() => of({ ok: false as const })),
      ),
    );

    if (status.ok && status.s.status === 'active') {
      const session = await firstValueFrom(
        this.http.get<{ access: string }>(`${this.baseUrl}/device/session`).pipe(
          map((data) => ({ ok: true as const, access: data.access })),
          catchError(() => of({ ok: false as const })),
        ),
      );
      if (session.ok) {
        this.applyDeviceAccess(session.access);
        const me = await firstValueFrom(
          this.http
            .get<AuthUser>(`${this.baseUrl}/auth/me`)
            .pipe(catchError(() => of(null as AuthUser | null))),
        );
        if (me) this.user.set(me);
        return;
      }
    }

    if (status.ok && (status.s.status === 'revoked' || status.s.status === 'expired')) {
      this.deviceDenied.set(DEVICE_DENIED_MESSAGE);
    }
  }

  // --- helpers ---

  private read(k: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(k);
  }

  private setTokens(access: string, refresh: string): void {
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  private clear(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    this.deviceMode.set(false);
    this.needsUserHydration = false;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(DEVICE_KEY);
  }

  /**
   * True when access JWT is past `exp` (30s skew).
   * Non-JWT / malformed tokens → false (let /auth/me decide; tests use opaque stubs).
   */
  private isAccessExpired(): boolean {
    const token = this.accessToken();
    if (!token) return true;
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return false;
    try {
      const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(json) as { exp?: number };
      if (typeof payload.exp !== 'number') return false;
      return payload.exp * 1000 <= Date.now() + 30_000;
    } catch {
      return false;
    }
  }
}
