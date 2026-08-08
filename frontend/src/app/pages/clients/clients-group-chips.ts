/**
 * Clients Group Chip Workspace — Заказчики | Люди (TZ-NAV-302).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const CLIENTS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'counterparties', label: 'Заказчики', route: '/counterparties' },
  { id: 'people', label: 'Люди', route: '/people' },
];
