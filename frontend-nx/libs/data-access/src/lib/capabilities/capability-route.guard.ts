import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CapabilitiesService } from './capabilities.service';
import type { PermissionKey } from './capabilities.metadata';

/**
 * TZ-256 §ШАГ 2 + TZ-ACCESS-303 + ADMIN RBAC hygiene —
 * Capability / pageKey / optional system-role route guard.
 *
 * Reads:
 *   - `route.data.capabilities: PermissionKey[]` → OR via CapabilitiesService
 *   - `route.data.pageKey: string` → must be in `user.pages` (ACCESS-301)
 *   - `route.data.systemRoles: string[]` → user.role must be one of these
 *     (mirrors backend `@Roles(...)`; e.g. admin-only `/admin/*`)
 *
 * Empty/missing capabilities → no capability gate.
 * Missing pageKey → no page gate.
 * Missing systemRoles → no role-name gate.
 * If several are set, **all** must pass.
 *
 * Deny → `/forbidden` UrlTree.
 */
export const capabilityRouteGuard: CanMatchFn = (route) => {
  const caps = inject(CapabilitiesService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const data = (route.data ?? {}) as {
    capabilities?: PermissionKey[];
    pageKey?: string;
    systemRoles?: string[];
  };

  const required = data.capabilities;
  if (required && required.length > 0 && !caps.hasAny(required)) {
    return router.parseUrl('/forbidden');
  }

  const pageKey = data.pageKey;
  if (pageKey) {
    const pages = auth.user()?.pages;
    // No pages array yet (legacy session) → do not hard-block.
    if (Array.isArray(pages) && !pages.includes(pageKey)) {
      return router.parseUrl('/forbidden');
    }
  }

  const systemRoles = data.systemRoles;
  if (systemRoles && systemRoles.length > 0) {
    const role = auth.user()?.role;
    if (!role || !systemRoles.includes(role)) {
      return router.parseUrl('/forbidden');
    }
  }

  return true;
};
