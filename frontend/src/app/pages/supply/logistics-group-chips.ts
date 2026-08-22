/**
 * Logistics sibling chips — supply + shipping (TZ-UX-309).
 * TZ-UI-404: siblings of one family → dark TOC row, not the gold chips row.
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const LOGISTICS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'supply', label: 'Закупки', route: '/supply', pageKey: 'supply' },
  { id: 'shipping', label: 'Отгрузка', route: '/shipping', pageKey: 'shipping' },
];
