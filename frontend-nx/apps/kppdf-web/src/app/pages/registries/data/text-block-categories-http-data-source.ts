import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiTextBlockCategoriesService, type TextBlockCategory } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

/**
 * TZ-NX-REG-TEXT-BLOCK-CATEGORIES — flat registry row for a root **or**
 * subcategory. `path` is the audit's "Root › Sub" breadcrumb (just the
 * root's own name when the row itself is a root) — sorting rows by `path`
 * naturally groups each root directly above its own subcategories, since a
 * root's path is always a string-prefix of its children's paths.
 */
export type TextBlockCategoryRow = TextBlockCategory & { readonly path: string };

function resolvePath(byId: ReadonlyMap<string, TextBlockCategory>, row: TextBlockCategory): string {
  if (!row.parentId) return row.name;
  const parent = byId.get(row.parentId);
  return parent ? `${parent.name} › ${row.name}` : row.name;
}

export function createTextBlockCategoriesHttpDataSource(
  service: PiTextBlockCategoriesService,
): RegistryDataSource<TextBlockCategoryRow> {
  return {
    async query(state: RegistryQueryState) {
      const result = await firstValueFrom(service.list());
      if (!result.ok) throw new Error(extractErrorMessage(result.error));
      const byId = new Map(result.data.map((c) => [c._id, c] as const));
      let rows: TextBlockCategoryRow[] = result.data.map((row) => ({
        ...row,
        path: resolvePath(byId, row),
      }));
      if (state.filters['rootsOnly'] === 'true') {
        rows = rows.filter((row) => !row.parentId);
      }
      const search = (state.filters['search'] ?? '').trim().toLocaleLowerCase();
      if (search) {
        rows = rows.filter((row) => row.name.toLocaleLowerCase().includes(search) || row.path.toLocaleLowerCase().includes(search));
      }
      rows = rows.slice().sort((a, b) => a.path.localeCompare(b.path, 'ru'));
      const start = (state.page - 1) * state.pageSize;
      return { rows: rows.slice(start, start + state.pageSize), total: rows.length };
    },
  };
}
