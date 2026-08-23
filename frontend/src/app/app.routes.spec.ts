import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

/**
 * Route accessibility contract (post UI-Kit showcase removal).
 */
describe('app.routes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    router = TestBed.inject(Router);
  });

  it('TZ-UI-WR-506: registers /kit showcase routes', () => {
    const operational = router.config.find((r) => r.path === '');
    const kit = operational?.children?.find((c) => c.path === 'kit');
    expect(kit).toBeTruthy();
    expect(kit!.loadComponent).toBeTruthy();
    expect(kit!.children?.length).toBeGreaterThanOrEqual(4);
  });

  it('operational site (/*) still requires authGuard', () => {
    const operationalRoute = router.config.find((r) => r.path === '');
    expect(operationalRoute).toBeTruthy();
    const guards = (operationalRoute!.canMatch ?? []).map((g) => g.name ?? 'anonymous');
    expect(guards).toContain('authGuard');
  });

  it('/login uses publicOnlyGuard', () => {
    const loginRoute = router.config.find((r) => r.path === 'login');
    expect(loginRoute).toBeTruthy();
    const guards = (loginRoute!.canMatch ?? []).map((g) => g.name ?? 'anonymous');
    expect(guards).toContain('publicOnlyGuard');
  });

  it('TZ-DICT-309: /dictionaries/units redirects to measurements', () => {
    const operational = router.config.find((r) => r.path === '');
    const units = operational?.children?.find((c) => c.path === 'dictionaries/units');
    expect(units).toBeTruthy();
    expect(units!.redirectTo).toBe('dictionaries/measurements');
    expect(units!.loadComponent).toBeUndefined();
  });

  it('TZ-DICT-311: /dictionaries hub redirects to measurements', () => {
    const operational = router.config.find((r) => r.path === '');
    const hub = operational?.children?.find((c) => c.path === 'dictionaries');
    expect(hub).toBeTruthy();
    expect(hub!.redirectTo).toBe('dictionaries/measurements');
    expect(hub!.loadComponent).toBeUndefined();
  });

  it('warehouse routes include /warehouses registry', () => {
    const operational = router.config.find((r) => r.path === '');
    const warehouses = operational?.children?.find((c) => c.path === 'warehouses');
    expect(warehouses).toBeTruthy();
    expect(warehouses!.data?.['pageKey']).toBe('inventory');
  });
});
