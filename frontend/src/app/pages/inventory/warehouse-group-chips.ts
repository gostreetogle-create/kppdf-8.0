import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/**
 * Chip that may carry router query params. The shared workspace renders
 * route + label only; query-driven pages (storage-items, stock-movements)
 * use these extra params when they render filter chips themselves.
 */
export interface QueryGroupChip extends GroupChip {
  /** Align with GroupChip — router query values are string | null. */
  queryParams?: Record<string, string | null>;
}

export const WAREHOUSE_TOC_CHIPS: readonly GroupChip[] = [
  { id: 'inventory', label: 'Дашборд', route: '/inventory', pageKey: 'inventory' },
  { id: 'storage-items', label: 'Остатки', route: '/storage-items', pageKey: 'storage-items' },
  {
    id: 'stock-movements',
    label: 'Движения',
    route: '/stock-movements',
    pageKey: 'stock-movements',
  },
  { id: 'warehouses', label: 'Склады', route: '/warehouses', pageKey: 'inventory' },
];

/** @deprecated empty placeholder — pages build their own section chips */
export const WAREHOUSE_ENTITY_SECTION_CHIPS: readonly GroupChip[] = [];

/** Above this count of warehouses → keep select in tools instead of chips. */
export const WAREHOUSE_CHIP_MAX = 8;

/** Movement type filter chips (row 2 on /stock-movements). */
export const STOCK_MOVEMENT_TYPE_CHIPS: readonly QueryGroupChip[] = [
  { id: 'all', label: 'Все', route: '/stock-movements', queryParams: { type: null } },
  { id: 'in', label: 'Приход', route: '/stock-movements', queryParams: { type: 'in' } },
  { id: 'out', label: 'Расход', route: '/stock-movements', queryParams: { type: 'out' } },
  {
    id: 'adjust',
    label: 'Корр.',
    route: '/stock-movements',
    queryParams: { type: 'adjust' },
  },
  {
    id: 'transfer',
    label: 'Перемещ.',
    route: '/stock-movements',
    queryParams: { type: 'transfer' },
  },
];

/** Build storage-items warehouse filter chips; preserves materialId when present. */
export function buildWarehouseFilterChips(
  warehouses: readonly { _id: string; name: string }[],
  materialId = '',
): readonly QueryGroupChip[] {
  const materialParam = materialId ? materialId : null;
  const chips: QueryGroupChip[] = [
    {
      id: 'all',
      label: 'Все склады',
      route: '/storage-items',
      queryParams: { warehouseId: null, materialId: materialParam },
    },
  ];
  for (const wh of warehouses) {
    chips.push({
      id: wh._id,
      label: wh.name,
      route: '/storage-items',
      queryParams: { warehouseId: wh._id, materialId: materialParam },
    });
  }
  return chips;
}

/**
 * Build /stock-movements warehouse filter chips. Every chip preserves the
 * active type filter (`type=in/out/adjust/transfer`) in its query params so
 * switching warehouse keeps the movement type.
 */
export function buildMovementWarehouseFilterChips(
  warehouses: readonly { _id: string; name: string }[],
  type = '',
): readonly QueryGroupChip[] {
  const typeParam: string | null = type || null;
  const chips: QueryGroupChip[] = [
    {
      id: 'all',
      label: 'Все склады',
      route: '/stock-movements',
      queryParams: { warehouseId: null, type: typeParam },
    },
  ];
  for (const wh of warehouses) {
    chips.push({
      id: wh._id,
      label: wh.name,
      route: '/stock-movements',
      queryParams: { warehouseId: wh._id, type: typeParam },
    });
  }
  return chips;
}
