import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Attaches a Bearer access token to every outgoing request that targets
 * the backend, EXCEPT the public auth endpoints (login / register /
 * refresh) — those don't have a token to begin with.
 *
 * Functional interceptor (no DI class boilerplate) — Angular 15+ pattern.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();

  if (!token) return next(req);

  // Skip public auth endpoints — they don't expect Authorization headers.
  if (/\/auth\/(login|register|refresh)\b/.test(req.url)) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
