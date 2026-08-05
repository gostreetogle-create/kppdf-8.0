import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/**
 * Shared chip configs for dictionary Group Chip Workspace screens.
 */

/** Top TOC — dictionary groups (row 1). */
export const DICTIONARY_TOC_CHIPS: readonly GroupChip[] = [
  { id: 'classification', label: 'Классификация', route: '/dictionaries/classification' },
  { id: 'measurements', label: 'Измерения', route: '/dictionaries/measurements' },
  { id: 'appearance', label: 'Оформление', route: '/dictionaries/appearance' },
  { id: 'documents-ref', label: 'Документы', route: '/dictionaries/documents-ref' },
];

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
