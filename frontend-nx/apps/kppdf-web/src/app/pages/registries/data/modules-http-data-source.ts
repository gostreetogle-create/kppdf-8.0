import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiModulesService, type ProductModule } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type ModuleRow = ProductModule;

/** Client-side page slice for list-all endpoints (no server pagination). */
export function sliceClientPage<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): { rows: T[]; total: number } {
  const total = items.length;
  const start = Math.max(0, (page - 1) * pageSize);
  return { rows: items.slice(start, start + pageSize), total };
}

/**
 * Bridges the registry engine to `GET /modules` via `PiModulesService`.
 * Backend returns the full active set — no page/limit/search params.
 * Registry page/sort are applied client-side only; sort is ignored.
 */
export function createModulesHttpDataSource(
  modulesService: PiModulesService,
): RegistryDataSource<ModuleRow> {
  return {
    async query(state: RegistryQueryState) {
      const res = await firstValueFrom(modulesService.list());

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      return sliceClientPage(res.data, state.page, state.pageSize);
    },
  };
}
