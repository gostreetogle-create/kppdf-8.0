/**
 * Deals Group Chip Workspace — КП | Договоры | Заказы (TZ-NAV-302).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const DEALS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'proposals', label: 'КП', route: '/proposals' },
  { id: 'contracts', label: 'Договоры', route: '/contracts' },
  { id: 'orders', label: 'Заказы', route: '/orders' },
];
