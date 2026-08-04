import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/**
 * TZ-DICT-310 — shared chip configs for dictionary Group Chip Workspace screens.
 * Pages pick activeId; nav points at group alias routes (or first chip).
 */

export const CLASSIFICATION_CHIPS: readonly GroupChip[] = [
  { id: 'categories', label: 'Категории', route: '/categories' },
];

export const APPEARANCE_CHIPS: readonly GroupChip[] = [
  { id: 'colors', label: 'Цвета', route: '/dictionaries/color-references' },
];

/** Documents reference group (template cats + text-block cats). */
export const DOCUMENTS_REF_CHIPS: readonly GroupChip[] = [
  {
    id: 'doc-templates',
    label: 'Категории шаблонов',
    route: '/doc-template-categories',
  },
  {
    id: 'text-blocks',
    label: 'Категории текстов',
    route: '/dictionaries/text-block-categories',
  },
];
