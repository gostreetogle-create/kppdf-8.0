import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { capabilityRouteGuard as _capabilityRouteGuard } from './capability-route.guard';
import { AuthService } from '../auth.service';
import { ALL_PERMISSION_KEYS } from './capabilities.metadata';

/**
 * TZ-256 §ШАГ 7 — capabilityRouteGuard spec.
 *
 * We bind the `capabilityRouteGuard` symbol under a local alias because
 * Angular `Router` resolves the type lazily; the spec imports the
 * function directly. Test cases:
 *
 *   1. Missing data / empty capabilities → bypass (true)
 *   2. User has required → bypass (true)
 *   3. User lacks required → redirect to /forbidden (UrlTree)
 *
 * Accessing the function directly avoids the CanMatchFn wrapper's
 * `inject()` calls — we must run them inside an Angular DI context,
 * which `TestBed.runInInjectionContext` provides.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const capabilityRouteGuard: any = _capabilityRouteGuard;

function invoke(routeData: { capabilities?: string[] }): boolean | UrlTree {
  return TestBed.runInInjectionContext(() =>
    capabilityRouteGuard(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { data: routeData } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [] as any,
    ),
  );
}

describe('capabilityRouteGuard (TZ-256 §ШАГ 2)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthService,
        // TZ-CLEANUP 2026-08-01: AuthService injects HttpClient lazily; guards
        // that read `auth.user()` may trigger it depending on the implementation.
        // Adding provideHttpClient ensures NG0201 is not raised at fixture
        // resolution time, keeping the spec di-graph well-formed.
        provideHttpClient(),
      ],
    });
  });

  it('bypasses when data.capabilities is missing', () => {
    TestBed.inject(AuthService).user.set(null);
    expect(invoke({})).toBe(true);
  });

  it('bypasses when data.capabilities is an empty array (no gate)', () => {
    TestBed.inject(AuthService).user.set(null);
    expect(invoke({ capabilities: [] })).toBe(true);
  });

  it('bypasses when user holds at least one required (OR semantics)', () => {
    TestBed.inject(AuthService).user.set({
      id: 'a',
      username: 'a',
      email: 'a@x',
      displayName: 'A',
      role: 'manager',
      permissions: ['material:read'],
    });
    expect(invoke({ capabilities: ['material:read', 'material:write'] })).toBe(true);
  });

  it('redirects to /forbidden when user holds none of the required', () => {
    TestBed.inject(AuthService).user.set({
      id: 'a',
      username: 'a',
      email: 'a@x',
      displayName: 'A',
      role: 'user',
      permissions: ['material:read'],
    });
    const result = invoke({ capabilities: ['user:admin', 'role:admin'] });
    expect(result instanceof UrlTree).toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toBe('/forbidden');
  });

  it('TZ-262: manager with only user:read is blocked from user:admin-gated route', () => {
    // Backend GET /api/admin/users requires @Permissions('user:admin').
    // A manager holding only `user:read` (self-service) must NOT pass
    // the route gate — direct navigation to /admin/users → /forbidden.
    TestBed.inject(AuthService).user.set({
      id: 'm',
      username: 'm',
      email: 'm@x',
      displayName: 'M',
      role: 'manager',
      permissions: ['user:read'],
    });
    expect(invoke({ capabilities: ['user:read'] })).toBe(true); // still allowed on read-gated routes
    const result = invoke({ capabilities: ['user:admin'] });
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/forbidden');
  });

  it('admin shortcut: user with role="admin" and empty perms bypasses gate', () => {
    TestBed.inject(AuthService).user.set({
      id: 'a',
      username: 'a',
      email: 'a@x',
      displayName: 'A',
      role: 'admin',
      permissions: [],
    });
    // ALL catalog keys should pass.
    expect(invoke({ capabilities: ['user:admin'] })).toBe(true);
    expect(invoke({ capabilities: ['system:write'] })).toBe(true);
  });

  it('wildcard "*" in user.permissions bypasses any gate', () => {
    TestBed.inject(AuthService).user.set({
      id: 'a',
      username: 'a',
      email: 'a@x',
      displayName: 'A',
      role: 'manager',
      permissions: ['*'],
    });
    expect(invoke({ capabilities: [...ALL_PERMISSION_KEYS] })).toBe(true);
  });

  it('unauthenticated user (null) is redirected to /forbidden', () => {
    // The authGuard runs before this one in the canMatch chain and
    // would normally bounce null users to /login. If capabilityRouteGuard
    // IS reached for an unauthenticated request (e.g. due to a
    // missing authGuard on a route), the verdict must be /forbidden
    // — not a silent pass-through.
    TestBed.inject(AuthService).user.set(null);
    const result = invoke({ capabilities: ['material:read'] });
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/forbidden');
  });

  it('Router instance is well-formed (sanity)', () => {
    expect(TestBed.inject(Router)).toBeDefined();
  });
});
