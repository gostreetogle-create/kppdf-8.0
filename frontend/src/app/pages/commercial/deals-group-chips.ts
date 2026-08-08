/**
 * Deals Group Chip Workspace — КП | Договоры | Заказы (TZ-NAV-302).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const DEALS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'proposals', label: 'КП', route: '/proposals', pageKey: 'proposals' },
  { id: 'contracts', label: 'Договоры', route: '/contracts', pageKey: 'contracts' },
  { id: 'orders', label: 'Заказы', route: '/orders', pageKey: 'orders' },
];
