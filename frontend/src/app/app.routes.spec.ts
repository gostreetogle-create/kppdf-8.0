import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

/**
 * TZ-92b: route accessibility contract.
 *
 * The /kit/* route subtree is intentionally PUBLIC (no authGuard).
 * These tests pin that contract so future contributors can't accidentally
 * add canMatch: [authGuard] and break browser-use visual verify.
 */
describe('app.routes (TZ-92b contract)', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    router = TestBed.inject(Router);
  });

  const publicKitPaths = [
    '/kit',
    '/kit/overview',
    '/kit/foundations',
    '/kit/basics',
    '/kit/forms',
    '/kit/overlays',
    '/kit/navigation',
    '/kit/playground/theme',
    '/kit/playground/code',
  ];

  it.each(publicKitPaths)(
    '%s should NOT have canMatch that blocks anonymous access',
    async (path) => {
      const kitRoute = router.config.find((r) => r.path === 'kit');
      expect(kitRoute).toBeTruthy();

      if (path === '/kit') {
        const guards = (kitRoute!.canMatch ?? []).map(
          (g) => g.name ?? 'anonymous',
        );
        expect(guards).not.toContain('authGuard');
        return;
      }

      const childPath = path.replace('/kit/', '');
      const child = kitRoute!.children?.find((c) => c.path === childPath);
      expect(child).toBeTruthy();
      const guards = (child!.canMatch ?? []).map(
        (g) => g.name ?? 'anonymous',
      );
      expect(guards).not.toContain('authGuard');
    },
  );

  it('operational site (/*) still requires authGuard', () => {
    const operationalRoute = router.config.find((r) => r.path === '');
    expect(operationalRoute).toBeTruthy();
    const guards = (operationalRoute!.canMatch ?? []).map(
      (g) => g.name ?? 'anonymous',
    );
    expect(guards).toContain('authGuard');
  });

  it('/login uses publicOnlyGuard', () => {
    const loginRoute = router.config.find((r) => r.path === 'login');
    expect(loginRoute).toBeTruthy();
    const guards = (loginRoute!.canMatch ?? []).map(
      (g) => g.name ?? 'anonymous',
    );
    expect(guards).toContain('publicOnlyGuard');
  });
});
