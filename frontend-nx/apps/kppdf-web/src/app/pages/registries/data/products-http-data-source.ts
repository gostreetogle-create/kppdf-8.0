import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  PRODUCTS_MAX_PAGE_SIZE,
  PiProductsService,
  type Product,
  type ProductStatus,
  type ProductsListParams,
} from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState, RegistrySort } from '../model/registry.types';

/** List rows may include `isComplex` when the API sends it (detail-only today). */
export type ProductRow = Product & { isComplex?: boolean };

const SORTABLE_PRODUCT_FIELDS = new Set<NonNullable<ProductsListParams['sortBy']>>([
  'name',
  'sku',
  'listPrice',
  'createdAt',
]);

export function mapRegistrySortToProductsParams(
  sort: RegistrySort | null,
): Pick<ProductsListParams, 'sortBy' | 'sortOrder'> {
  if (!sort) return {};
  if (!SORTABLE_PRODUCT_FIELDS.has(sort.key as NonNullable<ProductsListParams['sortBy']>)) {
    return {};
  }
  return {
    sortBy: sort.key as NonNullable<ProductsListParams['sortBy']>,
    sortOrder: sort.direction,
  };
}

/**
 * Bridges the registry engine to `GET /products` via `PiProductsService`.
 * Server-side search, status filter, pagination and sort (supported fields only).
 */
export function createProductsHttpDataSource(
  productsService: PiProductsService,
): RegistryDataSource<ProductRow> {
  return {
    async query(state: RegistryQueryState) {
      const search = state.filters['search']?.trim();
      const status = state.filters['status']?.trim() as ProductStatus | undefined;
      const limit = Math.min(state.pageSize, PRODUCTS_MAX_PAGE_SIZE);

      const res = await firstValueFrom(
        productsService.list({
          page: state.page,
          limit,
          search: search || undefined,
          status: status || undefined,
          ...mapRegistrySortToProductsParams(state.sort),
        }),
      );

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      return { rows: res.data.items, total: res.data.total };
    },
  };
}
