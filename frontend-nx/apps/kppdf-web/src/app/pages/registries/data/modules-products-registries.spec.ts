import { of } from 'rxjs';
import {
  PiModulesService,
  PiProductsService,
  type Product,
  type ProductModule,
} from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import { createModulesHttpDataSource, sliceClientPage } from './modules-http-data-source';
import {
  createProductsHttpDataSource,
  mapRegistrySortToProductsParams,
} from './products-http-data-source';
import { createModulesRegistryDefinition } from './modules.registry';
import { createProductsRegistryDefinition } from './products.registry';
import { formatComplexBadge } from './product-formatters';

const SAMPLE_MODULE: ProductModule = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Каркас',
  article: 'MOD-001',
  sortOrder: 1,
};

const SAMPLE_PRODUCT: Product = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Окно ПВХ',
  sku: 'WIN-01',
  kind: 'good',
  unit: 'шт',
  status: 'active',
  listPrice: 15000,
};

const BASE_STATE: RegistryQueryState = {
  filters: {},
  page: 1,
  pageSize: 25,
  sort: null,
};

function mockModulesService(overrides: Partial<PiModulesService> = {}): PiModulesService {
  return {
    list: jest.fn().mockReturnValue(of({ ok: true as const, data: [SAMPLE_MODULE] })),
    getById: jest.fn(),
    ...overrides,
  } as unknown as PiModulesService;
}

function mockProductsService(overrides: Partial<PiProductsService> = {}): PiProductsService {
  return {
    list: jest.fn().mockReturnValue(
      of({
        ok: true as const,
        data: { items: [SAMPLE_PRODUCT], total: 1, page: 1, limit: 25 },
      }),
    ),
    getById: jest.fn(),
    ...overrides,
  } as unknown as PiProductsService;
}

import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

function mockCatalogDialogHost(): CatalogRegistryDialogHost {
  return {
    openModuleCreate: jest.fn(),
    openModuleEdit: jest.fn(),
    openProductCreate: jest.fn(),
    openProductEdit: jest.fn(),
  };
}

const mockRouter = { navigate: jest.fn().mockResolvedValue(true), config: [] } as never;

describe('sliceClientPage', () => {
  it('slices items without inventing server pagination', () => {
    const items = Array.from({ length: 30 }, (_, i) => i + 1);
    expect(sliceClientPage(items, 1, 25)).toEqual({ rows: items.slice(0, 25), total: 30 });
    expect(sliceClientPage(items, 2, 25)).toEqual({ rows: items.slice(25, 30), total: 30 });
  });
});

describe('createModulesHttpDataSource (TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ)', () => {
  it('calls GET /modules without page or limit params', async () => {
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: [SAMPLE_MODULE] }));
    const dataSource = createModulesHttpDataSource(mockModulesService({ list }));

    await dataSource.query(BASE_STATE);

    expect(list).toHaveBeenCalledWith();
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('applies client-side paging to the full list', async () => {
    const modules = Array.from({ length: 30 }, (_, i) => ({
      ...SAMPLE_MODULE,
      _id: `mod-${i}`,
      name: `Module ${i}`,
    }));
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: modules }));
    const dataSource = createModulesHttpDataSource(mockModulesService({ list }));

    const page1 = await dataSource.query({ ...BASE_STATE, page: 1, pageSize: 25 });
    expect(page1.total).toBe(30);
    expect(page1.rows).toHaveLength(25);

    const page2 = await dataSource.query({ ...BASE_STATE, page: 2, pageSize: 25 });
    expect(page2.rows).toHaveLength(5);
  });

  it('throws on API error for retry banner', async () => {
    const list = jest.fn().mockReturnValue(
      of({
        ok: false as const,
        error: { error: { message: 'Forbidden' }, status: 403, statusText: 'Forbidden' },
      }),
    );
    const dataSource = createModulesHttpDataSource(mockModulesService({ list }));
    await expect(dataSource.query(BASE_STATE)).rejects.toThrow();
  });

  it('returns empty rows when API returns empty list', async () => {
    const list = jest.fn().mockReturnValue(of({ ok: true as const, data: [] }));
    const dataSource = createModulesHttpDataSource(mockModulesService({ list }));
    const result = await dataSource.query(BASE_STATE);
    expect(result).toEqual({ rows: [], total: 0 });
  });
});

describe('createProductsHttpDataSource (TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ)', () => {
  it('passes server pagination and supported filters', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 2, limit: 25 } }),
    );
    const dataSource = createProductsHttpDataSource(mockProductsService({ list }));

    await dataSource.query({
      ...BASE_STATE,
      page: 2,
      pageSize: 25,
      filters: { search: 'окно', status: 'active' },
      sort: { key: 'name', direction: 'asc' },
    });

    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
      search: 'окно',
      status: 'active',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('never passes isComplex filter', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 25 } }),
    );
    const dataSource = createProductsHttpDataSource(mockProductsService({ list }));
    await dataSource.query({ ...BASE_STATE, filters: { isComplex: 'true' } });
    const params = list.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(params).not.toHaveProperty('isComplex');
  });

  it('ignores unsupported sort keys', () => {
    expect(mapRegistrySortToProductsParams({ key: 'status', direction: 'asc' })).toEqual({});
    expect(mapRegistrySortToProductsParams({ key: 'listPrice', direction: 'desc' })).toEqual({
      sortBy: 'listPrice',
      sortOrder: 'desc',
    });
  });

  it('throws on API error', async () => {
    const list = jest.fn().mockReturnValue(
      of({
        ok: false as const,
        error: { error: { message: 'Server error' }, status: 500, statusText: 'Error' },
      }),
    );
    const dataSource = createProductsHttpDataSource(mockProductsService({ list }));
    await expect(dataSource.query(BASE_STATE)).rejects.toThrow();
  });
});

describe('formatComplexBadge', () => {
  it('shows badge only when isComplex is explicitly true', () => {
    expect(formatComplexBadge({ isComplex: true })).toBe('Комплекс');
    expect(formatComplexBadge({ isComplex: false })).toBe('—');
    expect(formatComplexBadge({})).toBe('—');
  });
});

describe('registry definitions (TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ)', () => {
  const moduleDeps = {
    modulesService: mockModulesService(),
    dialogHost: mockCatalogDialogHost(),
  };
  const productDeps = {
    productsService: mockProductsService(),
    router: mockRouter,
    existingPaths: new Set(['/constructor']),
    dialogHost: mockCatalogDialogHost(),
  };

  it('uses _id as rowId for modules and products', () => {
    const modules = createModulesRegistryDefinition(moduleDeps);
    const products = createProductsRegistryDefinition(productDeps);
    expect(modules.rowId(SAMPLE_MODULE)).toBe(SAMPLE_MODULE._id);
    expect(products.rowId(SAMPLE_PRODUCT)).toBe(SAMPLE_PRODUCT._id);
  });

  it('marks modules and products as api source', () => {
    expect(createModulesRegistryDefinition(moduleDeps).source).toBe('api');
    expect(createProductsRegistryDefinition(productDeps).source).toBe('api');
  });

  it('modules registry has no filters and no sortable columns', () => {
    const def = createModulesRegistryDefinition(moduleDeps);
    expect(def.filters ?? []).toHaveLength(0);
    expect(def.columns.every((c) => !c.sortable)).toBe(true);
  });

  it('products registry has search/status filters but no isComplex filter', () => {
    const def = createProductsRegistryDefinition(productDeps);
    const keys = def.filters?.map((f) => f.key) ?? [];
    expect(keys).toContain('search');
    expect(keys).toContain('status');
    expect(keys).not.toContain('isComplex');
  });

  it('does not add a separate Complex registry key', () => {
    expect(createProductsRegistryDefinition(productDeps).key).toBe('products');
    expect(createProductsRegistryDefinition(productDeps).title).toBe('Изделия');
  });

  it('adds composition dialog row actions for modules and products', () => {
    const modules = createModulesRegistryDefinition(moduleDeps);
    const products = createProductsRegistryDefinition(productDeps);
    const moduleIds = modules.rowActions?.map((a) => a.id) ?? [];
    const productIds = products.rowActions?.map((a) => a.id) ?? [];
    expect(moduleIds).toContain('open-composition');
    expect(moduleIds).toContain('edit-module');
    expect(moduleIds).not.toContain('open-constructor');
    expect(productIds).toContain('open-composition');
    expect(productIds).toContain('open-constructor');
  });
});
