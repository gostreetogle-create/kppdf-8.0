import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Allow only AUTHENTICATED users. Used by every protected page
 * (e.g. /home, future /counterparties, /products, …).
 */
export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};

/**
 * Allow only UNAUTHENTICATED users. Used by /login — if you already have
 * a session, this kicks you to /home instead of showing the login form.
 */
export const publicOnlyGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  return router.parseUrl('/home');
};
