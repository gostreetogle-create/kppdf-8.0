import { NAV_CATEGORIES, NAV_CATEGORY_ORDER, filterNavCategories, matchActiveCategoryId } from './nav-categories';

describe('NAV_CATEGORIES (ported from legacy frontend/src/app/layout/app-layout.component.ts)', () => {
  it('keeps the legacy left→right category order', () => {
    expect([...NAV_CATEGORY_ORDER]).toEqual([
      'catalog',
      'clients',
      'deals',
      'design',
      'supply',
      'production',
      'warehouse',
      'docs',
      'reference',
      'registries',
      'admin',
    ]);
  });
});

describe('studio category (TZ-NX-DOCSTUDIO-S2-SHELL)', () => {
  it('links the docs category to /studio with a doc-studio pageKey', () => {
    const docs = NAV_CATEGORIES.find((c) => c.id === 'docs');
    expect(docs).toBeTruthy();
    const studio = docs!.items.find((i) => (i.path as string).endsWith('/studio'));
    expect(studio).toBeTruthy();
    expect(studio!.pageKey).toBe('doc-studio');
    expect(studio!.label).toContain('Студия');
  });

  it('shows studio item under docs when its pageKey is in the pages[] allow-list', () => {
    const existing = new Set(['/studio', '/registries', '/admin/devices']);
    const result = filterNavCategories(
      NAV_CATEGORIES,
      existing,
      ['admin-users', 'doc-studio'],
      () => true,
      'admin',
    );
    expect(result.map((c) => c.id)).toContain('docs');
    const docs = result.find((c) => c.id === 'docs');
    expect(docs!.items.map((i) => i.path as string)).toContain('/studio');
    expect(docs!.entryPath).toBe('/studio');
  });

  it('hides studio (no pageKey) under a restrictive pages[] allow-list', () => {
    const existing = new Set(['/studio', '/registries', '/admin/devices']);
    const result = filterNavCategories(
      NAV_CATEGORIES,
      existing,
      ['admin-users'],
      () => true,
      'admin',
    );
    const docs = result.find((c) => c.id === 'docs');
    // Studio is the only surviving docs route; with pageKey gated out the docs
    // category shows nothing else, so it drops entirely.
    expect(docs).toBeUndefined();
  });
});

describe('registries category (TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW)', () => {
  it('links to /registries with an honest, non-fabricated pageKey', () => {
    const cat = NAV_CATEGORIES.find((c) => c.id === 'registries');
    expect(cat).toBeTruthy();
    expect(cat!.items).toEqual([
      {
        path: '/registries',
        pageKey: 'registries',
        label: 'Реестры',
        skipPageAcl: true,
      },
    ]);
    expect(cat!.entryPath).toBe('/registries');
  });
});

describe('filterNavCategories', () => {
  const alwaysCaps = () => true;

  it('drops items whose route does not exist yet in NX', () => {
    const existing = new Set(['/admin/devices', '/admin/roles']);
    const result = filterNavCategories(NAV_CATEGORIES, existing, undefined, alwaysCaps, 'admin');

    expect(result.map((c) => c.id)).toEqual(['admin']);
    expect(result[0]!.items.map((i) => i.path)).toEqual(['/admin/devices', '/admin/roles']);
  });

  it('drops a category entirely when none of its items exist', () => {
    const existing = new Set<string>();
    const result = filterNavCategories(NAV_CATEGORIES, existing, undefined, alwaysCaps, 'admin');
    expect(result).toEqual([]);
  });

  it('respects page ACL from /auth/me', () => {
    const existing = new Set(['/admin/devices', '/admin/roles']);
    const result = filterNavCategories(NAV_CATEGORIES, existing, ['admin-users'], alwaysCaps, 'admin');
    expect(result[0]!.items.map((i) => i.path)).toEqual(['/admin/devices']);
  });

  it('respects systemRoles gating', () => {
    const existing = new Set(['/admin/devices', '/admin/roles']);
    const result = filterNavCategories(NAV_CATEGORIES, existing, undefined, alwaysCaps, 'user');
    expect(result).toEqual([]);
  });

  it('respects capability gating', () => {
    const existing = new Set(['/admin/devices', '/admin/roles']);
    const result = filterNavCategories(
      NAV_CATEGORIES,
      existing,
      undefined,
      (required) => !required?.includes('role:read'),
      'admin',
    );
    expect(result[0]!.items.map((i) => i.path)).toEqual(['/admin/devices']);
  });

  it('falls back entryPath to the first surviving item when the declared entry is filtered out', () => {
    const existing = new Set(['/admin/roles']);
    const result = filterNavCategories(NAV_CATEGORIES, existing, undefined, alwaysCaps, 'admin');
    expect(result[0]!.entryPath).toBe('/admin/roles');
  });

  it('shows registries when route exists even with restrictive pages[] (TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX)', () => {
    const existing = new Set(['/registries', '/admin/devices']);
    const result = filterNavCategories(
      NAV_CATEGORIES,
      existing,
      ['admin-users'],
      alwaysCaps,
      'admin',
    );
    expect(result.map((c) => c.id)).toEqual(['registries', 'admin']);
    expect(result[0]!.items.map((i) => i.path)).toEqual(['/registries']);
    expect(result[1]!.items.map((i) => i.path)).toEqual(['/admin/devices']);
  });

  it('hides registries when the route does not exist in NX', () => {
    const existing = new Set(['/admin/devices']);
    const result = filterNavCategories(
      NAV_CATEGORIES,
      existing,
      ['admin-users', 'registries'],
      alwaysCaps,
      'admin',
    );
    expect(result.map((c) => c.id)).toEqual(['admin']);
  });

  it('still hides non-existent business routes with restrictive pages[]', () => {
    const existing = new Set(['/registries', '/products']);
    const result = filterNavCategories(
      NAV_CATEGORIES,
      existing,
      ['products'],
      alwaysCaps,
      'admin',
    );
    expect(result.map((c) => c.id)).toEqual(['catalog', 'registries']);
    expect(result.find((c) => c.id === 'catalog')!.items.map((i) => i.path)).toEqual(['/products']);
    expect(result.find((c) => c.id === 'clients')).toBeUndefined();
  });
});

describe('matchActiveCategoryId', () => {
  const categories = [
    { id: 'admin', items: [{ path: '/admin/devices' }, { path: '/admin/roles' }] },
    { id: 'reference', items: [{ path: '/categories' }], activeAliases: ['/dictionaries/classification'] },
  ];

  it('matches exact and nested paths with a `/` boundary', () => {
    expect(matchActiveCategoryId('/admin/devices', categories)).toBe('admin');
    expect(matchActiveCategoryId('/admin/roles', categories)).toBe('admin');
  });

  it('matches activeAliases', () => {
    expect(matchActiveCategoryId('/dictionaries/classification', categories)).toBe('reference');
  });

  it('does not partial-match a longer sibling path', () => {
    expect(matchActiveCategoryId('/admin/devices-extra', categories)).toBeNull();
  });

  it('returns null for unmatched urls', () => {
    expect(matchActiveCategoryId('/login', categories)).toBeNull();
  });
});
