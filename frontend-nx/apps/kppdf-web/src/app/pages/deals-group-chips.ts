import type { GroupChip } from '@kppdf/features';

/**
 * Deals TOC — КП | Договоры | Заказы (TZ-NX-DEALS-D1-TOC-CHROME).
 * `contracts` flipped live in D4 (`/contracts` thin read-only list+card).
 */
export const DEALS_TOC_CHIPS: readonly GroupChip[] = [
  { id: 'proposals', label: 'КП', route: '/proposals', pageKey: 'proposals' },
  { id: 'contracts', label: 'Договоры', route: '/contracts', pageKey: 'contracts' },
  { id: 'orders', label: 'Заказы', route: '/orders', pageKey: 'orders' },
];
