import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL } from './api.tokens';
import { silentPost } from './silent-http';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
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
  readonly isAuthenticated = computed(() => !!this.accessToken());

  /**
   * Single-flight: while a refresh is in progress, every concurrent caller
   * (typically several failed requests in the same tick) gets the same
   * Promise. Prevents thundering-herd of N parallel /auth/refresh calls
   * when 5 requests all get 401 simultaneously.
   *
   * Reset in `finally` so a later failure can still trigger a new attempt.
   */
  private refreshInFlight: Promise<string> | null = null;

  // --- lifecycle ---

  /**
   * Called once via `provideAppInitializer`. If a token is present in
   * localStorage, validate it against /auth/me. If the access token has
   * expired (401) but a refresh token is still valid, transparently
   * refresh and retry /auth/me — long-lived sessions survive access-
   * token expiry without forcing re-login. On any unrecoverable error
   * clear state and let the AuthGuard redirect to /login.
   *
   * Note: the `authInterceptor` deliberately skips its own refresh
   * handling for /auth/me (see its docstring) to avoid an infinite
   * loop, so the refresh logic lives here.
   *
   * Error-handling note: 401/400 from /auth/me and /auth/refresh are
   * EXPECTED at bootstrap with no valid session — this is normal first-
   * load behaviour, not an error condition. We still log them via
   * Chrome's network panel (browser-level, unavoidable) but suppress
   * RxJS's default "unhandled error in observable" log + the zone.js
   * stack trace that follows it, by catching at the Observable level
   * with `catchError` and converting errors to plain values. The
   * bootstrap flow then inspects the status code and acts accordingly.
   */
  async bootstrap(): Promise<void> {
    if (!this.accessToken()) return;

    // Suppress RxJS global error log: catch at the Observable level
    // and convert to a plain `{ ok, status }` value. The HTTP call may
    // still log its 4xx via the browser's network panel (unavoidable),
    // but the rxjs+zone.js stack trace that previously followed it is
    // gone.
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
      return;
    }

    // 401 with a refresh token → try to refresh, then retry /auth/me.
    // Any other status (400, 403, 5xx, network) → give up and clear.
    if (meResult.status === 401 && this.refreshToken()) {
      try {
        await this.refresh();
        // refresh() updated the access token signal; retry /auth/me
        // with the same silent-error pattern.
        const retry = await firstValueFrom(
          this.http.get<AuthUser>(`${this.baseUrl}/auth/me`).pipe(
            catchError(() => of(null as AuthUser | null)),
          ),
        );
        if (retry) {
          this.user.set(retry);
          return;
        }
      } catch {
        // refresh() clears on its own failure; nothing else to do.
      }
    }

    this.clear();
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
    this.user.set(res.data.user);
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
   *     refresh token from the `Authorization: Bearer` header (NOT body).
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
            { headers: { Authorization: `Bearer ${refresh}` } },
          )
          .pipe(
            map((data) => ({ ok: true as const, access: data.access })),
            catchError((err: unknown) => of({ ok: false as const, error: err })),
          ),
      );

      if (!res.ok) {
        this.clear();
        // Runtime + type guard: refresh() in practice always rejects
        // with an HttpErrorResponse (the only source is the http.post
        // observable whose catchError sees HttpErrorResponse errors).
        // The fallback wraps any unexpected error in an HttpErrorResponse-
        // shaped error so the async function's throw type stays uniform
        // (`HttpErrorResponse`, not a 2-way union) — this keeps the
        // interceptor's `catchError((error: HttpErrorResponse) => …)`
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
      return res.access;
    })().finally(() => {
      this.refreshInFlight = null;
    });

    return this.refreshInFlight;
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
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
