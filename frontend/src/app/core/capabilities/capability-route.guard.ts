import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { CapabilitiesService } from './capabilities.service';
import type { PermissionKey } from './capabilities.metadata';

/**
 * TZ-256 §ШАГ 2 — Capability-aware route guard.
 *
 * Pairs with `authGuard` (the existing authentication guard). Reads
 * `route.data.capabilities: PermissionKey[]` and asks
 * `CapabilitiesService.hasAny(keys)` for the verdict. If the user
 * doesn't have any of the required keys, returns a parsed URL to
 * `/forbidden` so Angular Router redirects without leaking the route's
 * existence via 404.
 *
 * Why CanMatchFn and not CanActivateFn:
 *   - CanMatch runs BEFORE child route resolution. A blocked user
 *     never sees the protected page's component, fragment URL, or
 *     lazy-load chunk. Cheaper and more secure.
 *   - Pattern matches the existing `authGuard` (CanMatchFn) in
 *     `frontend/src/app/core/auth.guard.ts`.
 *
 * Per TZ-256 §0 «FRONTEND VISIBILITY = UX», this guard is NOT the
 * security-of-record — `PermissionsGuard` (TZ-255) on the backend
 * remains authoritative. Hidden routes → 403 from backend → frontend
 * intercepts and shows /forbidden.
 *
 * Usage in app.routes.ts:
 *   {
 *     path: 'admin/users',
 *     canMatch: [authGuard, capabilityRouteGuard],
 *     data: { capabilities: ['user:read'] },
 *     loadComponent: () => ...,
 *   }
 *
 * @example
 *   // Empty data → bypass (true). Useful for routes that gate on
 *   // RolesGuard server-side but don't need capability metadata.
 *   data: { capabilities: [] } // → bypass
 *
 *   // Wildcard-supported via @Permissions('*'); no need here because
 *   // admin-class is auto-granted in the service.
 *   data: { capabilities: ['user:admin'] } // admin OR user:admin perms
 */
export const capabilityRouteGuard: CanMatchFn = (route) => {
  const caps = inject(CapabilitiesService);
  const router = inject(Router);

  const data = (route.data ?? {}) as { capabilities?: PermissionKey[] };
  const required = data.capabilities;

  // Empty / missing → bypass. Backward-compat with routes that pre-
  // date TZ-256 capability metadata convention.
  if (!required || required.length === 0) return true;

  // User must hold at least one of N → OR semantics (matches
  // TZ-255 PermissionsGuard decision; consistency with backend).
  if (caps.hasAny(required)) return true;

  return router.parseUrl('/forbidden');
};
