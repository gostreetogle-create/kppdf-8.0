import type { GroupChip } from '@kppdf/features';

/**
 * Warehouse TOC — Остатки | Склады | Движения (TZ-NX-WH-GROUP-CHIPS).
 * PO order: the working balances screen first, not the warehouse registry —
 * matches the click-through operators actually use day to day.
 */
export const WAREHOUSE_TOC_CHIPS: readonly GroupChip[] = [
  { id: 'storage-items', label: 'Остатки', route: '/storage-items', pageKey: 'storage-items' },
  { id: 'warehouses', label: 'Склады', route: '/warehouses', pageKey: 'inventory' },
  { id: 'stock-movements', label: 'Движения', route: '/stock-movements', pageKey: 'stock-movements' },
];
