import { convertToParamMap } from '@angular/router';
import { parseRegistryQueryState, toRegistryQueryParams } from './registry-query-state';
import { defineRegistry, type RegistryDefinition, type RegistryRow } from './registry.types';

interface Row {
  readonly id: string;
  readonly name: string;
}

const DEF: RegistryDefinition<RegistryRow> = defineRegistry<Row>({
  key: 'widgets',
  title: 'Виджеты',
  source: 'demo',
  rowId: (r) => r.id,
  defaultSort: { key: 'name', direction: 'asc' },
  columns: [{ key: 'name', header: 'Название', sortable: true, format: (r) => r.name }],
  filters: [
    { key: 'search', label: 'Поиск', type: 'text' },
    {
      key: 'status',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' },
      ],
    },
  ],
  dataSource: { query: async () => ({ rows: [], total: 0 }) },
});

describe('parseRegistryQueryState (TZ-NX-REGISTRIES-PLATFORM)', () => {
  it('defaults to page 1, definition pageSize, and definition defaultSort when the URL has no params', () => {
    const state = parseRegistryQueryState(convertToParamMap({}), DEF);
    expect(state).toEqual({ filters: {}, page: 1, pageSize: 10, sort: { key: 'name', direction: 'asc' } });
  });

  it('reads a valid text filter and select filter', () => {
    const state = parseRegistryQueryState(convertToParamMap({ search: 'foo', status: 'active' }), DEF);
    expect(state.filters).toEqual({ search: 'foo', status: 'active' });
  });

  it('drops a select filter value that is not one of the registry-defined options', () => {
    const state = parseRegistryQueryState(convertToParamMap({ status: 'bogus' }), DEF);
    expect(state.filters).toEqual({});
  });

  it('falls back to page 1 for a non-positive or non-integer page param', () => {
    expect(parseRegistryQueryState(convertToParamMap({ page: '0' }), DEF).page).toBe(1);
    expect(parseRegistryQueryState(convertToParamMap({ page: '-3' }), DEF).page).toBe(1);
    expect(parseRegistryQueryState(convertToParamMap({ page: 'abc' }), DEF).page).toBe(1);
    expect(parseRegistryQueryState(convertToParamMap({ page: '3.5' }), DEF).page).toBe(1);
    expect(parseRegistryQueryState(convertToParamMap({ page: '3' }), DEF).page).toBe(3);
  });

  it('falls back to the default page size for an unsupported pageSize param', () => {
    expect(parseRegistryQueryState(convertToParamMap({ pageSize: '25' }), DEF).pageSize).toBe(25);
    expect(parseRegistryQueryState(convertToParamMap({ pageSize: '7' }), DEF).pageSize).toBe(10);
  });

  it('ignores a sort key that does not name a sortable column', () => {
    const state = parseRegistryQueryState(convertToParamMap({ sort: 'nope', dir: 'asc' }), DEF);
    expect(state.sort).toEqual({ key: 'name', direction: 'asc' });
  });

  it('accepts a sort key/dir that matches a sortable column', () => {
    const state = parseRegistryQueryState(convertToParamMap({ sort: 'name', dir: 'desc' }), DEF);
    expect(state.sort).toEqual({ key: 'name', direction: 'desc' });
  });
});

describe('toRegistryQueryParams (TZ-NX-REGISTRIES-PLATFORM)', () => {
  it('omits everything at its default value', () => {
    const params = toRegistryQueryParams(
      { filters: {}, page: 1, pageSize: 10, sort: null },
      DEF,
    );
    expect(params).toEqual({ search: null, status: null, page: null, pageSize: null, sort: null, dir: null });
  });

  it('serializes non-default filters/page/pageSize/sort', () => {
    const params = toRegistryQueryParams(
      { filters: { search: 'foo' }, page: 2, pageSize: 25, sort: { key: 'name', direction: 'desc' } },
      DEF,
    );
    expect(params).toEqual({
      search: 'foo',
      status: null,
      page: '2',
      pageSize: '25',
      sort: 'name',
      dir: 'desc',
    });
  });
});
