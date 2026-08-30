import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiProductPassportsService, type ProductPassport } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';
import { sliceClientPage } from './modules-http-data-source';

export type ProductPassportRow = ProductPassport;

function matchClientSearch(row: ProductPassportRow, needle: string): boolean {
  const n = needle.toLowerCase();
  return [row.passportNumber, row.name, row.article, row.productCode, row.warrantyCode]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(n));
}

/**
 * Bridges registry engine to `GET /passports`.
 * Optional `productId` filter hits the API; `search` filters client-side on the returned set.
 */
export function createProductPassportsHttpDataSource(
  productPassportsService: PiProductPassportsService,
): RegistryDataSource<ProductPassportRow> {
  return {
    async query(state: RegistryQueryState) {
      const productId = state.filters['productId']?.trim();
      const search = state.filters['search']?.trim();

      const res = await firstValueFrom(
        productPassportsService.list({
          productId: productId || undefined,
        }),
      );

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      const filtered = search
        ? res.data.filter((row) => matchClientSearch(row, search))
        : res.data;

      return sliceClientPage(filtered, state.page, state.pageSize);
    },
  };
}
