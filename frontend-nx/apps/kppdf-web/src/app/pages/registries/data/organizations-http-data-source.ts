import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  ORGANIZATIONS_MAX_PAGE_SIZE,
  PiOrganizationsService,
  type Organization,
} from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type OrganizationRow = Organization;

/**
 * Bridges registry engine to `GET /organizations` with honest server pagination.
 */
export function createOrganizationsHttpDataSource(
  organizationsService: PiOrganizationsService,
): RegistryDataSource<OrganizationRow> {
  return {
    async query(state: RegistryQueryState) {
      const search = state.filters['search']?.trim();
      const type = state.filters['type']?.trim();
      const limit = Math.min(state.pageSize, ORGANIZATIONS_MAX_PAGE_SIZE);

      const res = await firstValueFrom(
        organizationsService.list({
          page: state.page,
          limit,
          search: search || undefined,
          type: type || undefined,
        }),
      );

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      return { rows: res.data.items, total: res.data.total };
    },
  };
}
