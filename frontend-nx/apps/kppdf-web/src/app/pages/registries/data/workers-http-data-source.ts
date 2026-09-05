import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiPeopleService, type Person } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type WorkerRow = Person;

/** Bridges registry query state to the org-scoped `GET /workers` envelope. */
export function createWorkersHttpDataSource(
  peopleService: PiPeopleService,
): RegistryDataSource<WorkerRow> {
  return {
    async query(state: RegistryQueryState) {
      const search = state.filters['search']?.trim();
      const status = state.filters['status']?.trim();
      const res = await firstValueFrom(
        peopleService.list({
          page: state.page,
          limit: Math.min(100, state.pageSize),
          search: search || undefined,
          isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
        }),
      );
      if (!res.ok) throw new Error(extractErrorMessage(res.error));
      return { rows: res.data.items, total: res.data.total };
    },
  };
}
