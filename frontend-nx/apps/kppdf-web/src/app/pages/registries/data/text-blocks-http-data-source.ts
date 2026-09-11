import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  PiTextBlockCategoriesService,
  PiTextBlocksService,
  type TextBlock,
  type TextBlockCategory,
} from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

/**
 * TZ-NX-TEXT-PICKER-FORM — `categoryName` is a resolved "Root › Sub" label
 * (or just the leaf name if the parent lookup ever misses), never the raw
 * `categoryId` ObjectId the audit flagged as a UI smell.
 */
export type TextBlockRow = TextBlock & { readonly categoryName: string };

function resolveCategoryName(categoriesById: ReadonlyMap<string, TextBlockCategory>, id: string | undefined): string {
  if (!id) return '—';
  const leaf = categoriesById.get(id);
  if (!leaf) return '—';
  const parent = leaf.parentId ? categoriesById.get(leaf.parentId) : undefined;
  return parent ? `${parent.name} › ${leaf.name}` : leaf.name;
}

export function createTextBlocksHttpDataSource(
  service: PiTextBlocksService,
  categoriesService: PiTextBlockCategoriesService,
): RegistryDataSource<TextBlockRow> {
  return {
    async query(state: RegistryQueryState) {
      const [result, categoriesResult] = await Promise.all([
        firstValueFrom(service.list({
          categoryId: state.filters['categoryId'] || undefined,
          isActive: state.filters['isActive'] === undefined ? undefined : state.filters['isActive'] === 'true',
        })),
        firstValueFrom(categoriesService.list()),
      ]);
      if (!result.ok) throw new Error(extractErrorMessage(result.error));
      const categoriesById = new Map<string, TextBlockCategory>(
        categoriesResult.ok ? categoriesResult.data.map((c) => [c._id, c] as const) : [],
      );
      const enriched: TextBlockRow[] = result.data.map((row) => ({
        ...row,
        categoryName: resolveCategoryName(categoriesById, row.categoryId),
      }));
      const search = (state.filters['search'] ?? '').trim().toLocaleLowerCase();
      const filtered = search
        ? enriched.filter((row) => [row.name, row.slug, ...row.tags].some((value) => value.toLocaleLowerCase().includes(search)))
        : enriched;
      const start = (state.page - 1) * state.pageSize;
      return { rows: filtered.slice(start, start + state.pageSize), total: filtered.length };
    },
  };
}
