import { of } from 'rxjs';
import { PiMaterialsService, type Material } from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import {
  createMaterialsHttpDataSource,
  DETAIL_MATERIAL_KINDS,
  isDetailMaterialKind,
  resolveMaterialsListKind,
} from './materials-http-data-source';
import { createMaterialsRegistryDefinition } from './materials.registry';
import { createDetailsRegistryDefinition } from './details.registry';
import { buildOpenConstructorRowAction } from './registry-constructor-action';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';

const SAMPLE_MATERIAL: Material = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Стекло 4 мм',
  article: 'STK-004',
  sku: 'M-0001',
  unit: 'м²',
  materialKind: 'raw',
  pricePerUnit: 1200,
};

function mockMaterialsService(overrides: Partial<PiMaterialsService> = {}): PiMaterialsService {
  return {
    list: jest.fn().mockReturnValue(
      of({
        ok: true as const,
        data: { items: [SAMPLE_MATERIAL], total: 1, page: 1, limit: 25 },
      }),
    ),
    getById: jest.fn(),
    ...overrides,
  } as unknown as PiMaterialsService;
}

const BASE_STATE: RegistryQueryState = {
  filters: {},
  page: 1,
  pageSize: 25,
  sort: { key: 'name', direction: 'asc' },
};

describe('createMaterialsHttpDataSource (TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ)', () => {
  it('materials mode always requests materialKind=raw', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 25 } }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'materials');

    await dataSource.query({
      ...BASE_STATE,
      filters: { search: 'glass', categoryId: 'cat-1', materialKind: 'part' },
    });

    expect(list).toHaveBeenCalledWith({
      page: 1,
      limit: 25,
      search: 'glass',
      categoryId: 'cat-1',
      materialKind: 'raw',
    });
  });

  it('details mode uses materialKind filter and defaults to part', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 25 } }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'details');

    await dataSource.query({ ...BASE_STATE, filters: { search: 'bolt' } });
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ materialKind: 'part', search: 'bolt' }),
    );

    await dataSource.query({ ...BASE_STATE, filters: { materialKind: 'fastener' } });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ materialKind: 'fastener' }));
  });

  it('ignores sort from registry state (endpoint has no sort param)', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [SAMPLE_MATERIAL], total: 1, page: 1, limit: 25 } }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'materials');
    const result = await dataSource.query(BASE_STATE);
    expect(result.rows[0]?._id).toBe(SAMPLE_MATERIAL._id);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('throws on API error for retry banner', async () => {
    const list = jest.fn().mockReturnValue(
      of({
        ok: false as const,
        error: { error: { message: 'Forbidden' }, status: 403, statusText: 'Forbidden' },
      }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'materials');
    await expect(dataSource.query(BASE_STATE)).rejects.toThrow();
  });

  it('returns empty rows when API returns empty page', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 25 } }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'details');
    const result = await dataSource.query(BASE_STATE);
    expect(result).toEqual({ rows: [], total: 0 });
  });

  it('clamps pageSize to 100', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 100 } }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'materials');
    await dataSource.query({ ...BASE_STATE, pageSize: 500 });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
  });

  it('never passes organizationId', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 25 } }),
    );
    const dataSource = createMaterialsHttpDataSource(mockMaterialsService({ list }), 'materials');
    await dataSource.query(BASE_STATE);
    const params = list.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(params).not.toHaveProperty('organizationId');
  });
});

describe('resolveMaterialsListKind', () => {
  it('partitions raw vs detail kinds', () => {
    expect(resolveMaterialsListKind('materials', { materialKind: 'part' })).toBe('raw');
    expect(resolveMaterialsListKind('details', {})).toBe('part');
    expect(resolveMaterialsListKind('details', { materialKind: 'purchased' })).toBe('purchased');
    expect(DETAIL_MATERIAL_KINDS.every(isDetailMaterialKind)).toBe(true);
  });
});

describe('registry definitions', () => {
  const mockRouter = { navigate: jest.fn().mockResolvedValue(true), config: [] } as never;
  const mockDialogHost = (): MaterialRegistryDialogHost => ({
    openCreate: jest.fn(),
    openEdit: jest.fn(),
  });

  function baseDeps() {
    return {
      materialsService: mockMaterialsService(),
      router: mockRouter,
      existingPaths: new Set(['/constructor']),
      dialogHost: mockDialogHost(),
    };
  }

  it('uses _id as rowId for materials and details', () => {
    const deps = baseDeps();
    const materials = createMaterialsRegistryDefinition(deps);
    const details = createDetailsRegistryDefinition(deps);
    expect(materials.rowId(SAMPLE_MATERIAL)).toBe(SAMPLE_MATERIAL._id);
    expect(details.rowId({ ...SAMPLE_MATERIAL, materialKind: 'part' })).toBe(SAMPLE_MATERIAL._id);
    expect(materials.source).toBe('api');
    expect(details.source).toBe('api');
  });

  it('materials registry has no stockQty column', () => {
    const def = createMaterialsRegistryDefinition(baseDeps());
    expect(def.columns.some((c) => c.key === 'stockQty')).toBe(false);
  });

  it('details registry exposes materialKind filter with detail kinds only', () => {
    const def = createDetailsRegistryDefinition(baseDeps());
    const kindFilter = def.filters?.find((f) => f.key === 'materialKind');
    expect(kindFilter?.options?.map((o) => o.value)).toEqual([...DETAIL_MATERIAL_KINDS]);
    expect(kindFilter?.options?.some((o) => o.value === 'raw')).toBe(false);
    expect(kindFilter?.emptyOptionLabel).toContain('part');
  });
});

describe('buildOpenConstructorRowAction', () => {
  it('returns undefined when /constructor route is absent', () => {
    expect(
      buildOpenConstructorRowAction({ navigate: jest.fn() } as never, new Set(['/registries'])),
    ).toBeUndefined();
  });

  it('navigates to /constructor when route exists', async () => {
    const navigate = jest.fn().mockResolvedValue(true);
    const action = buildOpenConstructorRowAction(
      { navigate } as never,
      new Set(['/constructor', '/registries']),
    );
    expect(action).toBeTruthy();
    await action!.run({} as never, { reload: jest.fn(), notify: jest.fn() });
    expect(navigate).toHaveBeenCalledWith(['/constructor']);
  });
});
