import type { ParamMap } from '@angular/router';
import type { RegistryDefinition, RegistryQueryState, RegistryRow } from './registry.types';

/** Mirrors `PI_DEFAULT_PAGE_SIZE` (`@kppdf/ui/table`, not part of its public barrel). */
export const DEFAULT_PAGE_SIZE = 10;
/** Mirrors `PI_PAGE_SIZE_OPTIONS` (`@kppdf/ui/table`). */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/**
 * Reads filters/page/pageSize/sort out of the current route's query params,
 * validating every value against the registry definition so a hand-edited
 * or stale URL can never produce an out-of-range page, an unknown sort
 * column, or a filter key the registry doesn't define.
 */
export function parseRegistryQueryState(
  params: ParamMap,
  definition: RegistryDefinition<RegistryRow>,
): RegistryQueryState {
  const filters: Record<string, string> = {};
  for (const filter of definition.filters ?? []) {
    const raw = params.get(filter.key);
    if (!raw) continue;
    if (filter.type === 'select') {
      const known = filter.options?.some((o) => o.value === raw);
      if (!known) continue;
    }
    filters[filter.key] = raw;
  }

  const pageRaw = Number(params.get('page'));
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const pageSizeRaw = Number(params.get('pageSize'));
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSizeRaw)
    ? pageSizeRaw
    : (definition.defaultPageSize ?? DEFAULT_PAGE_SIZE);

  const sortKey = params.get('sort');
  const sortDir = params.get('dir');
  let sort = definition.defaultSort ?? null;
  if (sortKey && (sortDir === 'asc' || sortDir === 'desc')) {
    const column = definition.columns.find((c) => c.key === sortKey && c.sortable);
    if (column) sort = { key: sortKey, direction: sortDir };
  }

  return { filters, page, pageSize, sort };
}

/**
 * Serializes a `RegistryQueryState` back to query params, omitting
 * anything at its default so the URL stays short and clean (empty filter,
 * page 1, default page size, no sort).
 */
export function toRegistryQueryParams(
  state: RegistryQueryState,
  definition: RegistryDefinition<RegistryRow>,
): Record<string, string | null> {
  const params: Record<string, string | null> = {};
  for (const filter of definition.filters ?? []) {
    params[filter.key] = state.filters[filter.key] || null;
  }
  params['page'] = state.page > 1 ? String(state.page) : null;
  const defaultPageSize = definition.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  params['pageSize'] = state.pageSize !== defaultPageSize ? String(state.pageSize) : null;
  params['sort'] = state.sort ? state.sort.key : null;
  params['dir'] = state.sort ? state.sort.direction : null;
  return params;
}
