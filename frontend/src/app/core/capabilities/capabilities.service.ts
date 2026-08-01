import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import {
  ALL_PERMISSION_KEYS,
  PERMISSION_WILDCARD,
  type PermissionKey,
} from './capabilities.metadata';

/**
 * TZ-256 §ШАГ 1 — CapabilitiesService.
 *
 * Mirrors the backend `effectivePermissions()` algorithm from
 * `backend/src/common/contracts/rbac-contract.ts`. The frontend gets
 * a pre-resolved list of permission keys per user (delivered via
 * `AuthService.user().permissions []` field on /auth/me response).
 * We additionally compute the admin-class bypass: `role === 'admin'`
 * OR `permissions.includes('*')` ⇒ full catalog.
 *
 * Pure read-side. NO mutation of AuthService or signal store from
 * here. Components read `hasPermission(key)` from anywhere; the
 * underlying signal updates on token/login changes automatically.
 *
 * Why this is on the CLIENT and not fetched fresh on every request:
 *   - Latency: the user-permissions array is sent in /auth/me, no
 *     extra HTTP roundtrip per route check.
 *   - Authority: server-side `PermissionsGuard` (TZ-255) is the
 *     security-of-record; this service is UX-only (TZ-256 §0
 *     «FRONTEND VISIBILITY = UX»). Hidden buttons are NEVER the
 *     sole authorization layer.
 *
 * Backend contract: `AuthUser.permissions: string[]` is the source
 * of truth — see `frontend/src/app/core/auth.service.ts`.
 */
@Injectable({ providedIn: 'root' })
export class CapabilitiesService {
  private readonly auth = inject(AuthService);

  /**
   * Computed signal that resolves the active user's effective
   * permission set. Returns an empty Set when no user is signed in
   * (post-logout, pre-bootstrap, mid-refresh-failure).
   *
   * The input list `ALL_PERMISSION_KEYS` is the FULL union of
   * canonical keys — returned verbatim when admin shortcut fires.
   */
  readonly effectivePermissions = computed<ReadonlySet<string>>(() => {
    const user = this.auth.user();
    if (!user) return new Set();

    const granted = new Set<string>(user.permissions ?? []);
    const isAdminShortcut =
      user.role === 'admin' ||
      (user.permissions ?? []).includes(PERMISSION_WILDCARD);

    if (isAdminShortcut) {
      for (const k of ALL_PERMISSION_KEYS) granted.add(k);
    }
    return granted;
  });

  /**
   * `true` if the user holds AT LEAST one of the required keys.
   * Empty array returns `true` (no-capability-required is a passing
   * condition — backward-compatible with routes that don't gate).
   *
   * Note: `null | undefined` granting is a SAFE default — a route
   * without `data.capabilities` is publicly available to anyone
   * authenticated. Capability gating is opt-in per route.
   *
   * OR semantics — matches the canonical TZ-255 PermissionsGuard
   * (any-of composition). Routes that require AND semantics stack
   * decorators instead.
   */
  hasAny(required: readonly PermissionKey[] | null | undefined): boolean {
    if (!required || required.length === 0) return true;
    const effective = this.effectivePermissions();
    return required.some((k) => effective.has(k));
  }
}
