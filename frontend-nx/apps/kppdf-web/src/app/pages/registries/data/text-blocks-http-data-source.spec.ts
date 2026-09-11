import { of } from 'rxjs';
import type { PiTextBlockCategoriesService, PiTextBlocksService, TextBlock, TextBlockCategory } from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { createTextBlocksHttpDataSource } from './text-blocks-http-data-source';
import type { RegistryQueryState } from '../model/registry.types';

/**
 * TZ-NX-TEXT-PICKER-FORM AC #4 — the registry column must show a resolved
 * category NAME ("Root › Sub"), not the raw `categoryId` ObjectId the
 * audit flagged as a UI smell.
 */
describe('createTextBlocksHttpDataSource — categoryName resolution', () => {
  const state: RegistryQueryState = { filters: {}, page: 1, pageSize: 20, sort: null };

  const block = (overrides: Partial<TextBlock> = {}): TextBlock => ({
    _id: 'tb-1',
    name: 'Реквизиты поставщика',
    slug: 'rekvizity-postavshchika',
    tags: [],
    content: '<p>x</p>',
    columns: [],
    isActive: true,
    sortOrder: 0,
    ...overrides,
  });

  const category = (overrides: Partial<TextBlockCategory> = {}): TextBlockCategory => ({
    _id: 'cat-root',
    name: 'Реквизиты',
    slug: 'rekvizity',
    isActive: true,
    sortOrder: 0,
    ...overrides,
  });

  function fakeServices(
    blocks: readonly TextBlock[],
    categories: readonly TextBlockCategory[],
  ): { textBlocks: PiTextBlocksService; categories: PiTextBlockCategoriesService } {
    return {
      textBlocks: {
        list: jest.fn().mockReturnValue(of({ ok: true, data: blocks } satisfies SilentResult<TextBlock[]>)),
      } as unknown as PiTextBlocksService,
      categories: {
        list: jest.fn().mockReturnValue(of({ ok: true, data: categories } satisfies SilentResult<TextBlockCategory[]>)),
      } as unknown as PiTextBlockCategoriesService,
    };
  }

  it('resolves "Root › Sub" for a block filed under a subcategory', async () => {
    const root = category({ _id: 'root-1', name: 'Реквизиты' });
    const sub = category({ _id: 'sub-1', name: 'Поставщик', parentId: 'root-1' });
    const { textBlocks, categories } = fakeServices(
      [block({ categoryId: 'sub-1' })],
      [root, sub],
    );

    const result = await createTextBlocksHttpDataSource(textBlocks, categories).query(state);

    expect(result.rows[0].categoryName).toBe('Реквизиты › Поставщик');
  });

  it('falls back to "—" when categoryId is missing or unresolvable', async () => {
    const { textBlocks, categories } = fakeServices(
      [block({ _id: 'no-cat', categoryId: undefined }), block({ _id: 'dead-cat', categoryId: 'gone' })],
      [],
    );

    const result = await createTextBlocksHttpDataSource(textBlocks, categories).query(state);

    expect(result.rows.map((r) => r.categoryName)).toEqual(['—', '—']);
  });

  it('still applies the name/slug/tag search filter on top of the enriched rows', async () => {
    const root = category({ _id: 'root-1', name: 'Реквизиты' });
    const { textBlocks, categories } = fakeServices(
      [block({ _id: 'a', name: 'Alpha', categoryId: 'root-1' }), block({ _id: 'b', name: 'Beta', categoryId: 'root-1' })],
      [root],
    );

    const result = await createTextBlocksHttpDataSource(textBlocks, categories).query({
      ...state,
      filters: { search: 'alpha' },
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]._id).toBe('a');
    expect(result.total).toBe(1);
  });
});
