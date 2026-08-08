/**
 * Logistics sibling chips — supply + shipping (TZ-UX-309).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const LOGISTICS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'supply', label: 'Закупки', route: '/supply' },
  { id: 'shipping', label: 'Отгрузка', route: '/shipping' },
];
