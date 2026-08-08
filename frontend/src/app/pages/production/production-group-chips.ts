/**
 * Цех (production) Group Chip Workspace — Гант | Виды работ (TZ-NAV-302).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const PRODUCTION_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'production', label: 'Гант', route: '/production', pageKey: 'production' },
  { id: 'work-types', label: 'Виды работ', route: '/work-types', pageKey: 'work-types' },
];
