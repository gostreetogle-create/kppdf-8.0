import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { CapabilitiesService } from './capabilities.service';
import { ALL_PERMISSION_KEYS } from './capabilities.metadata';

/**
 * TZ-256 §ШАГ 7 — CapabilitiesService spec.
 *
 * The service mirrors TZ-254's effectivePermissions algorithm on the
 * client. We test the four key permission-resolution cases:
 *
 *   1. null user → empty effective set
 *   2. user without admin shortcut → exact permissions
 *   3. role === 'admin' with empty perms → ALL_PERMISSION_KEYS
 *   4. permissions includes "*" with non-admin role → ALL_PERMISSION_KEYS
 *
 * Plus hasAny/hasAll semantics on the resulting Set.
 */
describe('CapabilitiesService (TZ-256 §ШАГ 1)', () => {
  let caps: CapabilitiesService;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CapabilitiesService,
        AuthService,
        // TZ-CLEANUP 2026-08-01: AuthService.createEffect internally calls
        // inject(HttpClient). Without provideHttpClient, TestBed.runInInjectionContext
        // throws NG0201 (`No provider for HttpClient`). Adding it transitively
        // satisfies the lazy AuthService → HttpClient dependency tree.
        provideHttpClient(),
      ],
    });
    caps = TestBed.inject(CapabilitiesService);
    auth = TestBed.inject(AuthService);
  });

  it('returns empty Set when no user is signed in', () => {
    auth.user.set(null);
    expect(caps.effectivePermissions().size).toBe(0);
  });

  it('returns USE-permissions exactly when role is non-admin and no wildcard', () => {
    auth.user.set({
      id: 'a',
      username: 'alice',
      email: 'a@x',
      displayName: 'A',
      role: 'manager',
      permissions: ['material:read', 'material:write'],
    });
    const eff = caps.effectivePermissions();
    expect(eff.has('material:read')).toBe(true);
    expect(eff.has('material:write')).toBe(true);
    expect(eff.has('product:write')).toBe(false);
  });

  it('admin role shortcut (role="admin" with empty permissions) → full catalog', () => {
    auth.user.set({
      id: 'a',
      username: 'root',
      email: 'a@x',
      displayName: 'A',
      role: 'admin',
      permissions: [],
    });
    const eff = caps.effectivePermissions();
    expect(eff.size).toBe(ALL_PERMISSION_KEYS.size);
    for (const k of ALL_PERMISSION_KEYS) {
      expect(eff.has(k)).toBe(true);
    }
  });

  it('wildcard "*" in permissions triggers ALL catalog for non-admin roles', () => {
    auth.user.set({
      id: 'a',
      username: 'alice',
      email: 'a@x',
      displayName: 'A',
      role: 'manager',
      permissions: ['*'],
    });
    const eff = caps.effectivePermissions();
    expect(eff.size).toBe(ALL_PERMISSION_KEYS.size);
    for (const k of ALL_PERMISSION_KEYS) {
      expect(eff.has(k)).toBe(true);
    }
  });

  describe('hasAny', () => {
    beforeEach(() => {
      auth.user.set({
        id: 'a',
        username: 'alice',
        email: 'a@x',
        displayName: 'A',
        role: 'user',
        permissions: ['material:read'],
      });
    });

    it('returns true for empty required (no gate)', () => {
      expect(caps.hasAny([])).toBe(true);
    });

    it('returns true when user holds at least one of the required', () => {
      expect(caps.hasAny(['material:read', 'product:write'])).toBe(true);
    });

    it('returns false when user holds none of the required', () => {
      expect(caps.hasAny(['product:write', 'sales:admin'])).toBe(false);
    });

    it('tolerates null/undefined required', () => {
      expect(caps.hasAny(null)).toBe(true);
      expect(caps.hasAny(undefined)).toBe(true);
    });
  });
});
