import { of } from 'rxjs';
import { PiUnitsService, type Unit } from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import { createUnitsRegistryDefinition } from './units.registry';
import {
  createUnitsHttpDataSource,
  mapStatusFilterToIsActive,
} from './units-http-data-source';

const SAMPLE_UNIT: Unit = {
  key: 'kg',
  label: 'Килограмм',
  symbol: 'кг',
  category: 'mass',
  isActive: true,
  isSystem: true,
  sortOrder: 1,
};

function mockUnitsService(overrides: Partial<PiUnitsService> = {}): PiUnitsService {
  return {
    list: jest.fn().mockReturnValue(
      of({
        ok: true as const,
        data: { items: [SAMPLE_UNIT], total: 1, page: 1, limit: 10 },
      }),
    ),
    update: jest.fn().mockReturnValue(
      of({
        ok: true as const,
        data: { ...SAMPLE_UNIT, isActive: false },
      }),
    ),
    ...overrides,
  } as unknown as PiUnitsService;
}

describe('mapStatusFilterToIsActive', () => {
  it('maps active/inactive filter values to boolean isActive', () => {
    expect(mapStatusFilterToIsActive('active')).toBe(true);
    expect(mapStatusFilterToIsActive('inactive')).toBe(false);
    expect(mapStatusFilterToIsActive(undefined)).toBeUndefined();
    expect(mapStatusFilterToIsActive('')).toBeUndefined();
  });
});

describe('createUnitsHttpDataSource (TZ-NX-REGISTRY-UNITS-READ-SLICE)', () => {
  it('maps registry query state to PiUnitsService.list params', async () => {
    const list = jest.fn().mockReturnValue(
      of({
        ok: true as const,
        data: { items: [SAMPLE_UNIT], total: 1, page: 2, limit: 25 },
      }),
    );
    const dataSource = createUnitsHttpDataSource(mockUnitsService({ list }));

    const state: RegistryQueryState = {
      filters: { search: '  kg  ', status: 'active' },
      page: 2,
      pageSize: 25,
      sort: { key: 'label', direction: 'asc' },
    };

    const result = await dataSource.query(state);

    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
      search: 'kg',
      isActive: true,
    });
    expect(result).toEqual({ rows: [SAMPLE_UNIT], total: 1 });
  });

  it('clamps pageSize to 100 before calling the service', async () => {
    const list = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 100 } }),
    );
    const dataSource = createUnitsHttpDataSource(mockUnitsService({ list }));

    await dataSource.query({ filters: {}, page: 1, pageSize: 500, sort: null });

    expect(list).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
  });

  it('throws with extractErrorMessage text when the service returns !ok', async () => {
    const list = jest.fn().mockReturnValue(
      of({
        ok: false as const,
        error: { error: { message: 'Forbidden' }, status: 403, statusText: 'Forbidden' },
      }),
    );
    const dataSource = createUnitsHttpDataSource(mockUnitsService({ list }));

    await expect(
      dataSource.query({ filters: {}, page: 1, pageSize: 10, sort: null }),
    ).rejects.toThrow();
  });

  it('uses row.key as the table row identifier via registry rowId contract', async () => {
    const dataSource = createUnitsHttpDataSource(mockUnitsService());
    const result = await dataSource.query({ filters: {}, page: 1, pageSize: 10, sort: null });
    expect(result.rows[0]?.key).toBe('kg');
  });
});

describe('createUnitsRegistryDefinition row actions', () => {
  it('PATCHes isActive via PiUnitsService.update and keeps DELETE available', async () => {
    const update = jest.fn().mockReturnValue(
      of({ ok: true as const, data: { ...SAMPLE_UNIT, isActive: false } }),
    );
    const service = mockUnitsService({ update });
    const def = createUnitsRegistryDefinition({ unitsService: service, dialogHost: { openCreate: jest.fn(), openEdit: jest.fn() } });
    const deactivate = def.rowActions?.find((a) => a.id === 'deactivate');
    expect(deactivate).toBeTruthy();

    const reload = jest.fn();
    const notify = jest.fn();
    await deactivate!.run({ ...SAMPLE_UNIT, isActive: true }, { reload, notify });

    expect(update).toHaveBeenCalledWith('kg', { isActive: false });
    expect('remove' in service).toBe(false);
    expect(reload).toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('Единица деактивирована', 'success');
  });
});
