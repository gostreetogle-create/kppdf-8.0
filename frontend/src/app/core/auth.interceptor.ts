import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Marker attached to a request that has already been replayed once after
 * a successful refresh. If THAT replay also returns 401, we propagate the
 * error instead of looping back into another refresh attempt.
 *
 * HttpContextToken is the Angular 15+ idiomatic way to pass cross-cutting
 * metadata; it does not mutate headers and won't trigger CORS preflight.
 */
const IS_RETRY = new HttpContextToken<boolean>(() => false);

/**
 * Combined auth + auto-refresh interceptor.
 *
 * Request path:
 *   1. If a token exists and the URL is not a public auth endpoint, attach
 *      `Authorization: Bearer <access>`.
 *
 * Response path (only on 401):
 *   - Skip refresh for /auth/{login,register,refresh} and /auth/me
 *     (the latter so AuthService.bootstrap()'s failure path still works
 *     without entering the refresh loop).
 *   - Skip if the request is already a retry.
 *   - Skip if we have no refresh token (no point).
 *   - Otherwise call AuthService.refresh() (single-flight) and:
 *       • on success: replay the original request with the new Bearer.
 *       • on failure: clear state, navigate to /login (if not already
 *         there), and re-throw the ORIGINAL 401 to the caller.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Two distinct concerns were previously conflated under a single
  // `isPublicAuth` flag, which left /auth/me broken in production
  // (the access token was never attached, so the backend's jwt guard
  // would always 401 the session-validation call). Split into:
  //   - skipToken: requests that should NOT receive the access token
  //     (login/register have no token yet; /auth/refresh uses the
  //     refresh token, which AuthService.refresh() sets manually
  //     via the per-request `headers` option — the interceptor must
  //     not overwrite that header with the access token).
  //   - skipRefresh: requests where a 401 must NOT trigger the
  //     auto-refresh loop. /auth/me is included here because
  //     AuthService.bootstrap() handles its own refresh-and-retry
  //     (see the docstring there) and a second refresh attempt from
  //     the interceptor would cause an infinite loop.
  const skipToken = /\/auth\/(login|register|refresh)\b/.test(req.url);
  const skipRefresh = /\/auth\/(login|register|refresh|me)\b/.test(req.url);

  const access = auth.accessToken();
  // Attach the access token to every request except the three
  // skipToken endpoints. /auth/me is intentionally NOT in this list —
  // it needs the access token to validate the session.
  const authedReq =
    access && !skipToken ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } }) : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Anything other than 401 propagates immediately.
      if (error.status !== 401) return throwError(() => error);

      // Skip refresh for /auth/{login,register,refresh,me}.
      if (skipRefresh) return throwError(() => error);

      // Already retried once after a successful refresh → give up.
      if (req.context.get(IS_RETRY)) return throwError(() => error);

      // No refresh token: nothing to do, propagate 401.
      if (!auth.refreshToken()) return throwError(() => error);

      // Single-flight: auth.refresh() returns the same Promise for any
      // concurrent callers, so N parallel 401s trigger exactly one
      // POST /auth/refresh.
      return from(auth.refresh()).pipe(
        switchMap((newAccess) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newAccess}` },
              context: req.context.set(IS_RETRY, true),
            }),
          ),
        ),
        catchError(() => {
          // Refresh failed: state was already cleared inside auth.refresh().
          // Route to /login unless we're already on it (avoid push/pop churn).
          if (!router.url.startsWith('/login')) {
            void router.navigate(['/login']);
          }
          // Surface the original 401 to the caller (e.g. so it can show a toast).
          return throwError(() => error);
        }),
      );
    }),
  );
};
