import type { Route } from '@angular/router';
import { collectPageRoutePaths } from './route-paths';
import { appRoutes } from '../app.routes';

describe('collectPageRoutePaths', () => {
  it('collects leaf loadComponent routes with their full nested path', () => {
    const routes: Route[] = [
      {
        path: '',
        loadComponent: () => Promise.resolve({} as never),
        children: [
          { path: 'admin', children: [{ path: 'devices', loadComponent: () => Promise.resolve({} as never) }] },
        ],
      },
    ];
    expect(collectPageRoutePaths(routes)).toEqual(new Set(['/admin/devices']));
  });

  it('excludes layout routes that carry both loadComponent and children (shell, kit)', () => {
    const routes: Route[] = [
      {
        path: 'kit',
        loadComponent: () => Promise.resolve({} as never),
        children: [{ path: 'overview', loadComponent: () => Promise.resolve({} as never) }],
      },
    ];
    const paths = collectPageRoutePaths(routes);
    expect(paths.has('/kit')).toBe(false);
    expect(paths.has('/kit/overview')).toBe(true);
  });

  it('matches the real app.routes.ts: admin leaf pages exist; layout containers (shell, /kit) do not; not-yet-ported pages do not', () => {
    const paths = collectPageRoutePaths(appRoutes);
    expect(paths.has('/admin/devices')).toBe(true);
    expect(paths.has('/admin/roles')).toBe(true);
    expect(paths.has('/kit')).toBe(false);
    expect(paths.has('/kit/overview')).toBe(true);
    expect(paths.has('/studio')).toBe(true);
    expect(paths.has('/orders')).toBe(true);
    expect(paths.has('/orders/:id')).toBe(true);
    expect(paths.has('/products')).toBe(false);
  });

  it('isolates /kit from operational AppShell (separate top-level layout route)', () => {
    const shell = appRoutes.find((r) => r.path === '' && r.canMatch);
    const kit = appRoutes.find((r) => r.path === 'kit');
    expect(shell?.children?.some((c) => c.path === 'kit')).toBe(false);
    expect(kit?.loadComponent).toBeTruthy();
    expect(shell?.loadComponent).toBeTruthy();
  });
});
