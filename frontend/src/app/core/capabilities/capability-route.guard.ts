import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CapabilitiesService } from './capabilities.service';
import type { PermissionKey } from './capabilities.metadata';

/**
 * TZ-256 §ШАГ 2 + TZ-ACCESS-303 — Capability / pageKey route guard.
 *
 * Reads:
 *   - `route.data.capabilities: PermissionKey[]` → OR via CapabilitiesService
 *   - `route.data.pageKey: string` → must be in `user.pages` (ACCESS-301)
 *
 * Empty/missing capabilities → no capability gate.
 * Missing pageKey → no page gate.
 * If both set, **both** must pass.
 *
 * Deny → `/forbidden` UrlTree (same UX as before).
 */
export const capabilityRouteGuard: CanMatchFn = (route) => {
  const caps = inject(CapabilitiesService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const data = (route.data ?? {}) as {
    capabilities?: PermissionKey[];
    pageKey?: string;
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

  return true;
};
