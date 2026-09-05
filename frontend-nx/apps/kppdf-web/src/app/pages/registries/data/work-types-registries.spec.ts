import { of } from 'rxjs';
import type { PiWorkTypesService, WorkType } from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import { createWorkTypesHttpDataSource } from './work-types-http-data-source';
import { createWorkTypesRegistryDefinition } from './work-types.registry';

const ROWS: WorkType[] = [
  { _id: 'wt-1', name: 'Сварка', section: 'Металл', isActive: true, hourlyRate: 500, days: 2, accentHue: 250 },
  { _id: 'wt-2', name: 'Покраска', section: 'Отделка', isActive: false, hourlyRate: 650, days: 3, accentHue: null },
];

const STATE: RegistryQueryState = {
  filters: { search: 'свар' },
  page: 1,
  pageSize: 25,
  sort: { key: 'name', direction: 'asc' },
};

function service(): PiWorkTypesService {
  return { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: ROWS, total: ROWS.length } })) } as unknown as PiWorkTypesService;
}

describe('WorkType registry (TZ-NX-REGISTRIES-WORK-TYPES)', () => {
  it('filters and pages the flat API response', async () => {
    const api = service();
    const result = await createWorkTypesHttpDataSource(api).query(STATE);
    expect(result).toEqual({ rows: [ROWS[0]], total: 1 });
    expect(api.list).toHaveBeenCalledWith({ activeOnly: false });
  });

  it('declares Цех metadata, required columns, create, and edit/archive actions', () => {
    const api = service();
    const dialogHost = { openCreate: jest.fn(), openEdit: jest.fn() };
    const definition = createWorkTypesRegistryDefinition({ workTypesService: api, dialogHost });
    expect(definition.key).toBe('work-types');
    expect(definition.category).toBe('Цех');
    expect(definition.source).toBe('api');
    expect(definition.columns.map((column) => column.key)).toEqual([
      'name', 'days', 'hourlyRate', 'accentHue', 'isActive',
    ]);
    expect(definition.createAction?.label).toBe('Создать вид работ');
    expect(definition.rowActions?.map((action) => action.id)).toEqual(['edit', 'delete']);
    expect(definition.rowActions?.[1]?.destructive).toBe(true);
  });
});
