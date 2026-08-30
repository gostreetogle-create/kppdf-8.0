import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiSupplyRequestsService, type SupplyRequest } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';
import { sliceClientPage } from './modules-http-data-source';

export type SupplyRequestRow = SupplyRequest;

/**
 * Bridges registry engine to `GET /supply-requests`.
 * Backend returns up to 500 rows with no page/limit — client-side paging only.
 */
export function createSupplyRequestsHttpDataSource(
  supplyRequestsService: PiSupplyRequestsService,
): RegistryDataSource<SupplyRequestRow> {
  return {
    async query(state: RegistryQueryState) {
      const search = state.filters['search']?.trim();
      const status = state.filters['status']?.trim() as SupplyRequestRow['status'] | undefined;
      const priority = state.filters['priority']?.trim() as SupplyRequestRow['priority'] | undefined;
      const orderId = state.filters['orderId']?.trim();

      const res = await firstValueFrom(
        supplyRequestsService.list({
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
          orderId: orderId || undefined,
        }),
      );

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      return sliceClientPage(res.data, state.page, state.pageSize);
    },
  };
}
