/**
 * Doc-constructor section chips (TZ-UX-309).
 */
import type { GroupChip } from '../../../shared/page/pi-group-workspace.component';

export const DOCUMENTS_TOC_CHIPS: readonly GroupChip[] = [
  {
    id: 'templates',
    label: 'Шаблоны',
    route: '/doc-constructor/templates',
    pageKey: 'doc-templates',
  },
  {
    id: 'documents',
    label: 'Архив',
    route: '/doc-constructor/documents',
    pageKey: 'doc-documents',
  },
  { id: 'texts', label: 'Тексты', route: '/doc-constructor/texts', pageKey: 'doc-texts' },
  { id: 'tables', label: 'Таблицы', route: '/doc-constructor/tables', pageKey: 'doc-tables' },
];

export const TABLES_SECTION_CHIPS: readonly GroupChip[] = [
  {
    id: 'all',
    label: 'Все таблицы',
    route: '/doc-constructor/tables?view=all',
    pageKey: 'doc-tables',
  },
  {
    id: 'from-data',
    label: 'Из данных',
    route: '/doc-constructor/tables?view=from-data',
    pageKey: 'doc-tables',
  },
];

/** @deprecated Use DOCUMENTS_TOC_CHIPS for the dark Documents TOC. */
export const DOCUMENTS_SECTION_CHIPS = DOCUMENTS_TOC_CHIPS;
