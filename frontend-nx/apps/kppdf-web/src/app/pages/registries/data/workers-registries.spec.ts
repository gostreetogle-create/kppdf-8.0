import { of } from 'rxjs';
import type { PiPeopleService, Person, PiWorkTypesService } from '@kppdf/data-access';
import type { RegistryQueryState } from '../model/registry.types';
import { createWorkersHttpDataSource } from './workers-http-data-source';
import { createWorkersRegistryDefinition } from './workers.registry';

const ROW: Person = {
  _id: 'worker-1',
  lastName: 'Иванов',
  firstName: 'Иван',
  position: 'Сварщик',
  department: 'Цех',
  isActive: true,
  workTypeIds: ['wt-1'],
};

function peopleService(): PiPeopleService {
  return {
    list: jest.fn().mockReturnValue(
      of({ ok: true, data: { items: [ROW], total: 1, page: 2, limit: 25 } }),
    ),
  } as unknown as PiPeopleService;
}

const STATE: RegistryQueryState = {
  filters: { search: 'Иван', status: 'active' },
  page: 2,
  pageSize: 25,
  sort: null,
};

describe('Workers registry (TZ-NX-REGISTRIES-WORKERS)', () => {
  it('maps search, status, page and capped limit to the Workers API', async () => {
    const api = peopleService();
    const result = await createWorkersHttpDataSource(api).query(STATE);
    expect(result).toEqual({ rows: [ROW], total: 1 });
    expect(api.list).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
      search: 'Иван',
      isActive: true,
    });
  });

  it('declares Цех metadata, worker columns and CRUD actions', () => {
    const api = peopleService();
    const workTypes = { list: jest.fn() } as unknown as PiWorkTypesService;
    const dialogHost = { openCreate: jest.fn(), openEdit: jest.fn() };
    const definition = createWorkersRegistryDefinition({ peopleService: api, dialogHost });
    expect(definition.key).toBe('workers');
    expect(definition.title).toBe('Люди');
    expect(definition.category).toBe('Цех');
    expect(definition.source).toBe('api');
    expect(definition.paginationMode).toBe('server');
    expect(definition.columns.map((column) => column.key)).toEqual([
      'lastName', 'position', 'department', 'isActive', 'workTypeIds',
    ]);
    expect(definition.columns[0]?.format(ROW)).toBe('Иванов Иван');
    expect(definition.columns[4]?.format(ROW)).toBe('1');
    expect(definition.createAction?.label).toBe('Создать человека');
    expect(definition.rowActions?.map((action) => action.id)).toEqual(['edit', 'delete']);
    expect(definition.rowActions?.[1]?.destructive).toBe(true);
    expect(workTypes).toBeDefined();
  });
});
