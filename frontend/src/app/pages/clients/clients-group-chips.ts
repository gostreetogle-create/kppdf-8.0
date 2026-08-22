/**
 * Clients Group Chip Workspace — Заказчики | Люди (TZ-NAV-302).
 * TZ-UI-404: siblings of one family → dark TOC row, not the gold chips row.
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const CLIENTS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'counterparties', label: 'Заказчики', route: '/counterparties', pageKey: 'counterparties' },
  { id: 'people', label: 'Люди', route: '/people', pageKey: 'people' },
];
