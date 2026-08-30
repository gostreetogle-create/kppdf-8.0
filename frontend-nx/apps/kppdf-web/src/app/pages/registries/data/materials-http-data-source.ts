import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  MATERIALS_MAX_PAGE_SIZE,
  PiMaterialsService,
  type Material,
  type MaterialKind,
} from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';
import { formatMaterialKind } from './material-formatters';

export type MaterialRow = Material;

/** Non-raw catalog kinds shown in the «Детали» registry. */
export const DETAIL_MATERIAL_KINDS = ['part', 'fastener', 'purchased', 'other'] as const;
export type DetailMaterialKind = (typeof DETAIL_MATERIAL_KINDS)[number];

export function isDetailMaterialKind(value: string | undefined): value is DetailMaterialKind {
  return DETAIL_MATERIAL_KINDS.includes(value as DetailMaterialKind);
}

export type MaterialsHttpDataSourceMode = 'materials' | 'details';

/**
 * Bridges the registry engine to `GET /materials` via `PiMaterialsService`.
 * Sort from `RegistryQueryState` is ignored — backend has no sort query param.
 */
export function createMaterialsHttpDataSource(
  materialsService: PiMaterialsService,
  mode: MaterialsHttpDataSourceMode,
): RegistryDataSource<MaterialRow> {
  return {
    async query(state: RegistryQueryState) {
      const search = state.filters['search']?.trim();
      const categoryId = state.filters['categoryId']?.trim();

      let materialKind: MaterialKind;
      if (mode === 'materials') {
        materialKind = 'raw';
      } else {
        const filterKind = state.filters['materialKind'];
        materialKind = isDetailMaterialKind(filterKind) ? filterKind : 'part';
      }

      const limit = Math.min(state.pageSize, MATERIALS_MAX_PAGE_SIZE);

      const res = await firstValueFrom(
        materialsService.list({
          page: state.page,
          limit,
          search: search || undefined,
          categoryId: categoryId || undefined,
          materialKind,
        }),
      );

      if (!res.ok) {
        throw new Error(extractErrorMessage(res.error));
      }

      return { rows: res.data.items, total: res.data.total };
    },
  };
}

/** Guard for tests — materials registry must never leak other kinds via API param. */
export function resolveMaterialsListKind(
  mode: MaterialsHttpDataSourceMode,
  filters: Readonly<Record<string, string>>,
): MaterialKind {
  if (mode === 'materials') return 'raw';
  const filterKind = filters['materialKind'];
  return isDetailMaterialKind(filterKind) ? filterKind : 'part';
}

export function materialKindFilterOptions(): readonly { value: DetailMaterialKind; label: string }[] {
  return DETAIL_MATERIAL_KINDS.map((value) => ({
    value,
    label: formatMaterialKind(value),
  }));
}
