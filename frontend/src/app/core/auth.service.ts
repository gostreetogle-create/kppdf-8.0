import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL } from './api.tokens';
import { JWT_ACCESS_HEADER } from './jwt-access-header';
import { silentPost } from './silent-http';

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
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

const ACCESS_KEY = 'kppdf.access';
const REFRESH_KEY = 'kppdf.refresh';

/**
 * Centralised authentication state. Signal-based — components read directly.
 *
 * - Token storage: localStorage so page reload keeps the session alive.
 * - State ownership: this service is the single source of truth; UI
 *   components never read localStorage directly.
 * - Why HttpClient (not httpResource): login / logout / refresh are
 *   mutations. httpResource is for read-only data fetching; we'll switch
 *   to it when listing pages are introduced.
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

  /**
   * Single-flight: while a refresh is in progress, every concurrent caller
   * (typically several failed requests in the same tick) gets the same
   * Promise. Prevents thundering-herd of N parallel /auth/refresh calls
   * when 5 requests all get 401 simultaneously.
   *
   * Reset in `finally` so a later failure can still trigger a new attempt.
   */
  private refreshInFlight: Promise<string> | null = null;

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
   * refresh then /auth/me; refresh-only → refresh then /auth/me.
   *
   * Tokens are cleared ONLY on definitive auth rejection (401/403).
   * Network blips and 5xx must NOT wipe the refresh token — otherwise
   * every backend restart / proxy hiccup forces a full re-login.
   */
  async bootstrap(): Promise<void> {
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
    // a toast via its existing try/catch â€” this preserves the user-
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
    this.user.set(res.data.user);
    this.needsUserHydration = false;
  }

  async logout(): Promise<void> {
    // silentPost never errors, so no try/catch needed â€” the network
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
        // Runtime + type guard: refresh() in practice always rejects
        // with an HttpErrorResponse (the only source is the http.post
        // observable whose catchError sees HttpErrorResponse errors).
        // The fallback wraps any unexpected error in an HttpErrorResponse-
        // shaped error so the async function's throw type stays uniform
        // (`HttpErrorResponse`, not a 2-way union) â€” this keeps the
        // interceptor's `catchError((error: HttpErrorResponse) => â€¦)`
        // parameter narrow without a type assertion. `status: 0` is the
        // conventional sentinel for "unknown / non-HTTP error" and the
        // interceptor's `if (error.status !== 401)` check correctly
        // propagates it as-is.
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
    this.needsUserHydration = false;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
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
