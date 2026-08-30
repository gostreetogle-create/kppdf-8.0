import { buildRegistriesCatalogDefault } from './registries.catalog';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';
import { PiMaterialsService, PiModulesService, PiOrganizationsService, PiProductPassportsService, PiProductsService, PiSupplyRequestsService, PiUnitsService } from '@kppdf/data-access';
import { of } from 'rxjs';
import type { Router } from '@angular/router';
import type { RegistryFilter } from '../model/registry.types';

function mockDialogHost(): MaterialRegistryDialogHost {
  return { openCreate: jest.fn(), openEdit: jest.fn() };
}

function mockCatalogDialogHost(): CatalogRegistryDialogHost {
  return {
    openModuleCreate: jest.fn(),
    openModuleEdit: jest.fn(),
    openProductCreate: jest.fn(),
    openProductEdit: jest.fn(),
  };
}

function buildCatalog() {
  const router = { config: [{ path: 'constructor' }], navigate: jest.fn() } as unknown as Router;
  return buildRegistriesCatalogDefault(
    {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })),
      update: jest.fn(),
    } as unknown as PiUnitsService,
    { list: jest.fn(), getById: jest.fn() } as unknown as PiMaterialsService,
    { list: jest.fn(), getById: jest.fn() } as unknown as PiModulesService,
    { list: jest.fn(), getById: jest.fn() } as unknown as PiProductsService,
    { list: jest.fn(), getById: jest.fn() } as unknown as PiSupplyRequestsService,
  {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } })),
      getById: jest.fn(),
    } as unknown as PiOrganizationsService,
    { list: jest.fn(), getById: jest.fn(), getByProductId: jest.fn() } as unknown as PiProductPassportsService,
    router,
    mockDialogHost(),
    mockCatalogDialogHost(),
  );
}

function filterKeys(filters: readonly RegistryFilter[] | undefined): string[] {
  return (filters ?? []).map((f) => f.key);
}

describe('registry filters + pagination mode (TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY)', () => {
  const catalog = buildCatalog();

  it('units: search + status filters, server pagination', () => {
    const def = catalog.find((r) => r.key === 'units')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'status']);
    expect(def.paginationMode).toBe('server');
  });

  it('materials: search + category, server pagination, raw kind via data source', () => {
    const def = catalog.find((r) => r.key === 'materials')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'categoryId']);
    expect(def.paginationMode).toBe('server');
    expect(def.filters?.some((f) => f.key === 'materialKind')).toBe(false);
  });

  it('details: search + category + materialKind select, server pagination', () => {
    const def = catalog.find((r) => r.key === 'details')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'categoryId', 'materialKind']);
    expect(def.filters?.find((f) => f.key === 'materialKind')?.emptyOptionLabel).toContain('part');
    expect(def.paginationMode).toBe('server');
  });

  it('modules: no filters, client pagination only', () => {
    const def = catalog.find((r) => r.key === 'modules')!;
    expect(def.filters ?? []).toHaveLength(0);
    expect(def.paginationMode).toBe('client');
  });

  it('products: search + status, server pagination', () => {
    const def = catalog.find((r) => r.key === 'products')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'status']);
    expect(def.paginationMode).toBe('server');
  });

  it('departments: demo filters + fixture pagination', () => {
    const def = catalog.find((r) => r.key === 'departments')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'status']);
    expect(def.paginationMode).toBe('fixture');
  });

  it('supply-requests: search/status/priority/orderId filters, client pagination', () => {
    const def = catalog.find((r) => r.key === 'supply-requests')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'status', 'priority', 'orderId']);
    expect(def.paginationMode).toBe('client');
    expect(def.createAction).toBeUndefined();
    expect(def.rowActions ?? []).toHaveLength(0);
  });

  it('organizations: search + type filters, server pagination', () => {
    const def = catalog.find((r) => r.key === 'organizations')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'type']);
    expect(def.paginationMode).toBe('server');
    expect(def.createAction).toBeUndefined();
  });

  it('product-passports: search + productId filters, client pagination', () => {
    const def = catalog.find((r) => r.key === 'product-passports')!;
    expect(filterKeys(def.filters)).toEqual(['search', 'productId']);
    expect(def.paginationMode).toBe('client');
    expect(def.createAction).toBeUndefined();
  });
});

describe('registry toolbar layout (TZ-NX-REGISTRIES-TOOLBAR-FINALIZE)', () => {
  const catalog = buildCatalog();

  it.each([
    'units',
    'materials',
    'details',
    'modules',
    'products',
    'supply-requests',
    'organizations',
    'product-passports',
    'departments',
  ] as const)(
    '%s: toolbar has left filter-area and right trailing area',
    (key) => {
      const def = catalog.find((r) => r.key === key)!;
      const hasFilters = (def.filters ?? []).length > 0;
      expect(def.paginationMode).toBeTruthy();
      if (key === 'modules') {
        expect(hasFilters).toBe(false);
      } else {
        expect(hasFilters).toBe(true);
      }
    },
  );

  it('modules: no filter keys in definition; client pagination only', () => {
    const def = catalog.find((r) => r.key === 'modules')!;
    expect(def.filters ?? []).toHaveLength(0);
    expect(def.paginationMode).toBe('client');
    expect(def.createAction).toBeTruthy();
  });
});
