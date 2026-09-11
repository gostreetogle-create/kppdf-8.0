import { of } from 'rxjs';
import type { PiCategoriesService, Category } from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { createCategoriesHttpDataSource, categoryTypeLabel } from './categories-http-data-source';
import type { RegistryQueryState } from '../model/registry.types';

describe('createCategoriesHttpDataSource', () => {
  const state: RegistryQueryState = { filters: {}, page: 1, pageSize: 20, sort: null };

  const cat = (overrides: Partial<Category> = {}): Category => ({
    _id: 'c1',
    name: 'Металлы',
    slug: 'metally',
    type: 'material',
    skuPrefix: 'MTL',
    sortOrder: 0,
    isActive: true,
    ...overrides,
  });

  function fakeService(categories: readonly Category[]): PiCategoriesService {
    return {
      list: jest.fn().mockReturnValue(of({ ok: true, data: categories } satisfies SilentResult<Category[]>)),
    } as unknown as PiCategoriesService;
  }

  it('sends the type filter to the server and resolves the parent name from the same result set', async () => {
    const root = cat({ _id: 'root-1', name: 'Металлы' });
    const child = cat({ _id: 'child-1', name: 'Крепёж', parentId: 'root-1' });
    const service = fakeService([root, child]);

    const result = await createCategoriesHttpDataSource(service).query({ ...state, filters: { type: 'material' } });

    expect(service.list).toHaveBeenCalledWith({ type: 'material' });
    const byId = new Map(result.rows.map((r) => [r._id, r]));
    expect(byId.get('root-1')?.parentName).toBe('—');
    expect(byId.get('child-1')?.parentName).toBe('Металлы');
  });

  it('falls back to "—" for an unresolvable parent', async () => {
    const service = fakeService([cat({ _id: 'orphan', parentId: 'gone' })]);

    const result = await createCategoriesHttpDataSource(service).query(state);

    expect(result.rows[0].parentName).toBe('—');
  });

  it('search filters client-side by name', async () => {
    const service = fakeService([cat({ _id: 'a', name: 'Металлы' }), cat({ _id: 'b', name: 'Пластик' })]);

    const result = await createCategoriesHttpDataSource(service).query({ ...state, filters: { search: 'плас' } });

    expect(result.rows.map((r) => r._id)).toEqual(['b']);
  });

  it('sorts rows by name and paginates the result', async () => {
    const service = fakeService([cat({ _id: 'b', name: 'Пластик' }), cat({ _id: 'a', name: 'Металлы' })]);

    const result = await createCategoriesHttpDataSource(service).query({ ...state, page: 1, pageSize: 1 });

    expect(result.rows.map((r) => r._id)).toEqual(['a']);
    expect(result.total).toBe(2);
  });
});

describe('categoryTypeLabel', () => {
  it('maps every wireable type to its RU label from the audit', () => {
    expect(categoryTypeLabel('material')).toBe('Детали');
    expect(categoryTypeLabel('product')).toBe('Изделия');
    expect(categoryTypeLabel('module')).toBe('Модули');
    expect(categoryTypeLabel('general')).toBe('Общая');
  });
});
