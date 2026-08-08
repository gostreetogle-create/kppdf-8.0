/**
 * Doc-constructor section chips (TZ-UX-309).
 */
import type { GroupChip } from '../../../shared/page/pi-group-workspace.component';

export const DOCUMENTS_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'templates', label: 'Шаблоны', route: '/doc-constructor/templates' },
  { id: 'documents', label: 'Архив', route: '/doc-constructor/documents' },
  { id: 'texts', label: 'Тексты', route: '/doc-constructor/texts' },
  { id: 'tables', label: 'Таблицы', route: '/doc-constructor/tables' },
];
