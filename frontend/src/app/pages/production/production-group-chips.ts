/**
 * Цех (production) Group Chip Workspace — Гант | Виды работ (TZ-NAV-302).
 * TZ-UI-404: siblings of one family → dark TOC row, not the gold chips row.
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const PRODUCTION_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'production', label: 'Гант', route: '/production', pageKey: 'production' },
  { id: 'work-types', label: 'Виды работ', route: '/work-types', pageKey: 'work-types' },
];
