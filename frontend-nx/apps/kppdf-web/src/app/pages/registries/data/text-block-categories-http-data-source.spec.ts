import { of } from 'rxjs';
import type { PiTextBlockCategoriesService, TextBlockCategory } from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { createTextBlockCategoriesHttpDataSource } from './text-block-categories-http-data-source';
import type { RegistryQueryState } from '../model/registry.types';

/** TZ-NX-REG-TEXT-BLOCK-CATEGORIES — flat registry replacing the master-detail page. */
describe('createTextBlockCategoriesHttpDataSource', () => {
  const state: RegistryQueryState = { filters: {}, page: 1, pageSize: 20, sort: null };

  const category = (overrides: Partial<TextBlockCategory> = {}): TextBlockCategory => ({
    _id: 'cat-1',
    name: 'Категория',
    slug: 'kategoriya',
    isActive: true,
    sortOrder: 0,
    ...overrides,
  });

  function fakeService(categories: readonly TextBlockCategory[]): PiTextBlockCategoriesService {
    return {
      list: jest.fn().mockReturnValue(of({ ok: true, data: categories } satisfies SilentResult<TextBlockCategory[]>)),
    } as unknown as PiTextBlockCategoriesService;
  }

  it('gives a root its own name as the path, and a sub the "Root › Sub" breadcrumb', async () => {
    const root = category({ _id: 'root-1', name: 'Общее' });
    const sub = category({ _id: 'sub-1', name: 'Гарантия', parentId: 'root-1' });
    const service = fakeService([sub, root]);

    const result = await createTextBlockCategoriesHttpDataSource(service).query(state);

    const byId = new Map(result.rows.map((r) => [r._id, r]));
    expect(byId.get('root-1')?.path).toBe('Общее');
    expect(byId.get('sub-1')?.path).toBe('Общее › Гарантия');
  });

  it('sorts so every root sits directly above its own subcategories', async () => {
    const rootB = category({ _id: 'root-b', name: 'Б' });
    const rootA = category({ _id: 'root-a', name: 'А' });
    const subA1 = category({ _id: 'sub-a1', name: 'Раз', parentId: 'root-a' });
    const service = fakeService([subA1, rootB, rootA]);

    const result = await createTextBlockCategoriesHttpDataSource(service).query(state);

    expect(result.rows.map((r) => r._id)).toEqual(['root-a', 'sub-a1', 'root-b']);
  });

  it('rootsOnly filter drops every subcategory', async () => {
    const root = category({ _id: 'root-1', name: 'Общее' });
    const sub = category({ _id: 'sub-1', name: 'Гарантия', parentId: 'root-1' });
    const service = fakeService([root, sub]);

    const result = await createTextBlockCategoriesHttpDataSource(service).query({
      ...state,
      filters: { rootsOnly: 'true' },
    });

    expect(result.rows.map((r) => r._id)).toEqual(['root-1']);
  });

  it('search matches by own name or full path', async () => {
    const root = category({ _id: 'root-1', name: 'Реквизиты' });
    const sub = category({ _id: 'sub-1', name: 'Поставщик', parentId: 'root-1' });
    const service = fakeService([root, sub]);

    const result = await createTextBlockCategoriesHttpDataSource(service).query({
      ...state,
      filters: { search: 'поставщик' },
    });

    expect(result.rows.map((r) => r._id)).toEqual(['sub-1']);
  });

  it('paginates the filtered/sorted set and reports the pre-slice total', async () => {
    const roots = Array.from({ length: 3 }, (_, i) => category({ _id: `r${i}`, name: `Root ${i}` }));
    const service = fakeService(roots);

    const result = await createTextBlockCategoriesHttpDataSource(service).query({
      ...state,
      page: 2,
      pageSize: 2,
    });

    expect(result.rows).toHaveLength(1);
    expect(result.total).toBe(3);
  });
});
