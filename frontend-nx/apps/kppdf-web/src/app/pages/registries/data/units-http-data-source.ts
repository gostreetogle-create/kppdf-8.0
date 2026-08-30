import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  PiUnitsService,
  UNITS_MAX_PAGE_SIZE,
  type Unit,
} from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type UnitRow = Unit;

/** Maps registry `status` filter values to backend `isActive` query param. */
export function mapStatusFilterToIsActive(status: string | undefined): boolean | undefined {
  if (status === 'active') return true;
  if (status === 'inactive') return false;
  return undefined;
}

/**
 * First real (non-fixture) `RegistryDataSource` — bridges the generic
 * registry engine to `GET /units` with server-side search/filter/pagination.
 * Sort from `RegistryQueryState` is intentionally ignored (backend has no
 * sort query param; fixed `{sortOrder:1,key:1}` order server-side).
 */
export function createUnitsHttpDataSource(unitsService: PiUnitsService): RegistryDataSource<UnitRow> {
  return {
    async query(state: RegistryQueryState) {
      const search = state.filters['search']?.trim();
      const isActive = mapStatusFilterToIsActive(state.filters['status']);
      const limit = Math.min(state.pageSize, UNITS_MAX_PAGE_SIZE);

      const res = await firstValueFrom(
        unitsService.list({
          page: state.page,
          limit,
          search: search || undefined,
          isActive,
        }),
      );

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      return { rows: res.data.items, total: res.data.total };
    },
  };
}
