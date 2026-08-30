import { of } from 'rxjs';
import { Router } from '@angular/router';
import {
  PiMaterialsService,
  PiModulesService,
  PiOrganizationsService,
  PiProductPassportsService,
  PiProductsService,
  PiSupplyRequestsService,    PiUnitsService,
  PiTextBlocksService, PiTextBlockCategoriesService, PiTableTemplatesService, PiRegistryDataSourcesService,
} from '@kppdf/data-access';
import { buildRegistriesCatalogDefault } from './registries.catalog';
import { DEPARTMENTS_REGISTRY } from './departments.registry';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

function mockMaterialDialogHost(): MaterialRegistryDialogHost {
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

describe('registries.catalog (TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ)', () => {
  function mockUnitsService(): PiUnitsService {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } }),
      ),
      update: jest.fn(),
    } as unknown as PiUnitsService;
  }

  function mockMaterialsService(): PiMaterialsService {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
      ),
      getById: jest.fn(),
    } as unknown as PiMaterialsService;
  }

  function mockModulesService(): PiModulesService {
    return {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      getById: jest.fn(),
    } as unknown as PiModulesService;
  }

  function mockProductsService(): PiProductsService {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
      ),
      getById: jest.fn(),
    } as unknown as PiProductsService;
  }

  function mockRouter(paths: string[]): Router {
    return {
      config: [
        {
          path: '',
          children: paths.map((p) => ({
            path: p.replace(/^\//, ''),
            loadComponent: () => Promise.resolve({}),
          })),
        },
      ],
      navigate: jest.fn(),
    } as unknown as Router;
  }

  function mockSupplyRequestsService(): PiSupplyRequestsService {
    return {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      getById: jest.fn(),
    } as unknown as PiSupplyRequestsService;
  }

  function mockOrganizationsService(): PiOrganizationsService {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
      ),
      getById: jest.fn(),
    } as unknown as PiOrganizationsService;
  }

  function mockProductPassportsService(): PiProductPassportsService {
    return {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      getById: jest.fn(),
      getByProductId: jest.fn(),
    } as unknown as PiProductPassportsService;
  }

  function buildCatalog(paths: string[] = ['/constructor', '/registries']) {
    return buildRegistriesCatalogDefault(
      mockUnitsService(),
      mockMaterialsService(),
      mockModulesService(),
      mockProductsService(),
      mockSupplyRequestsService(),
      mockOrganizationsService(),
      mockProductPassportsService(),
      mockRouter(paths),
      mockMaterialDialogHost(),
      mockCatalogDialogHost(),
      { textBlocks: {} as PiTextBlocksService, categories: {} as PiTextBlockCategoriesService, templates: {} as PiTableTemplatesService, dataSources: {} as PiRegistryDataSourcesService } as never,
    );
  }

  it('builds catalog with all API registries + departments fixture', () => {
    const catalog = buildCatalog();
    expect(catalog.map((r) => r.key)).toEqual([
      'units',
      'materials',
      'details',
      'modules',
      'products',
      'supply-requests',
      'organizations',
      'product-passports',
      'departments',
      'text-blocks',
      'table-templates',
    ]);
    expect(new Set(catalog.map((r) => r.key)).size).toBe(11);
  });

  it('marks new supply/org/passport registries as api source', () => {
    const catalog = buildCatalog();
    expect(catalog.find((r) => r.key === 'supply-requests')?.source).toBe('api');
    expect(catalog.find((r) => r.key === 'organizations')?.source).toBe('api');
    expect(catalog.find((r) => r.key === 'product-passports')?.source).toBe('api');
    expect(catalog.find((r) => r.key === 'departments')?.source).toBe('demo');
  });

  it('preserves existing registries and departments fixture at the end', () => {
    const catalog = buildCatalog();
    expect(catalog.find((r) => r.key === 'units')?.title).toContain('Единицы');
    expect(catalog.find((r) => r.key === 'materials')?.key).toBe('materials');
    expect(catalog.find((r) => r.key === 'details')?.key).toBe('details');
    expect(catalog.find((r) => r.key === 'departments')).toBe(DEPARTMENTS_REGISTRY);
  });

  it('read-only registries have no create or row actions', () => {
    const catalog = buildCatalog();
    for (const key of ['supply-requests', 'organizations', 'product-passports'] as const) {
      const def = catalog.find((r) => r.key === key)!;
      expect(def.createAction).toBeUndefined();
      expect(def.rowActions ?? []).toHaveLength(0);
    }
  });

  it('has no complex registry key', () => {
    const catalog = buildCatalog();
    expect(catalog.some((r) => r.key === 'complex' || r.key === 'complexes')).toBe(false);
  });

  it('adds Constructor row action to products when /constructor route exists (modules use dialog only)', () => {
    const withConstructor = buildCatalog(['/constructor']);
    const withoutConstructor = buildCatalog(['/registries']);
    expect(
      withConstructor.find((r) => r.key === 'modules')?.rowActions?.some((a) => a.id === 'open-constructor'),
    ).toBe(false);
    expect(
      withConstructor.find((r) => r.key === 'products')?.rowActions?.some((a) => a.id === 'open-constructor'),
    ).toBe(true);
    expect(
      withoutConstructor.find((r) => r.key === 'products')?.rowActions?.some((a) => a.id === 'open-constructor'),
    ).toBe(false);
  });

  it('modules and products registries have composition dialog actions (TZ-NX-REGISTRIES-COMPOSITION-DIALOG)', () => {
    const catalog = buildCatalog(['/constructor']);
    const modules = catalog.find((r) => r.key === 'modules');
    const products = catalog.find((r) => r.key === 'products');
    expect(modules?.createAction?.label).toContain('Создать');
    expect(modules?.rowActions?.map((a) => a.id)).toEqual(
      expect.arrayContaining(['edit-module', 'open-composition', 'archive-module']),
    );
    expect(modules?.rowActions?.map((a) => a.id)).not.toContain('open-constructor');
    expect(products?.createAction?.label).toContain('Создать');
    expect(products?.rowActions?.map((a) => a.id)).toEqual(
      expect.arrayContaining(['edit-product', 'open-composition', 'copy-product', 'archive-product']),
    );
  });
});
