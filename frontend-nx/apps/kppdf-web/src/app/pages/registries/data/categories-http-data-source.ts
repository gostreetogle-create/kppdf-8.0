import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiCategoriesService, type Category, type CategoryType } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type CategoryRow = Category & { readonly parentName: string };

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  material: 'Детали',
  product: 'Изделия',
  module: 'Модули',
  general: 'Общая',
};

export function categoryTypeLabel(type: CategoryType): string {
  return CATEGORY_TYPE_LABELS[type] ?? type;
}

/**
 * TZ-NX-REG-CATEGORIES-CRUD. `type` filter is sent server-side (`GET
 * /categories?type=`); search/sort/pagination are client-side, same shape as
 * `text-block-categories-http-data-source.ts`. Parent-name lookup uses the
 * SAME (possibly type-filtered) result set — by convention a category's
 * parent always shares its type, so the active page already contains it;
 * an unresolvable parent (legacy mismatched data) honestly falls back to
 * "—" rather than a second unfiltered fetch.
 */
export function createCategoriesHttpDataSource(
  service: PiCategoriesService,
): RegistryDataSource<CategoryRow> {
  return {
    async query(state: RegistryQueryState) {
      const type = (state.filters['type'] as CategoryType | undefined) || undefined;
      const result = await firstValueFrom(service.list({ type }));
      if (!result.ok) throw new Error(extractErrorMessage(result.error));
      const byId = new Map(result.data.map((c) => [c._id, c] as const));
      let rows: CategoryRow[] = result.data.map((row) => ({
        ...row,
        parentName: row.parentId ? byId.get(row.parentId)?.name ?? '—' : '—',
      }));
      const search = (state.filters['search'] ?? '').trim().toLocaleLowerCase();
      if (search) {
        rows = rows.filter((row) => row.name.toLocaleLowerCase().includes(search));
      }
      rows = rows.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      const start = (state.page - 1) * state.pageSize;
      return { rows: rows.slice(start, start + state.pageSize), total: rows.length };
    },
  };
}
