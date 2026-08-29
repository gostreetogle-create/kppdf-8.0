import type { GroupChip } from '../../../shared/page/pi-group-workspace.component';
import { DOCUMENTS_TOC_CHIPS } from '../documents/documents-group-chips';

/** Dark TOC row — same as other doc-constructor pages. */
export const STUDIO_TOC_CHIPS = DOCUMENTS_TOC_CHIPS;

/** Gold section row — studio-only siblings (not duplicate of TOC). */
export const STUDIO_SECTION_CHIPS: readonly GroupChip[] = [
  {
    id: 'list',
    label: 'Мои документы',
    route: '/doc-constructor/studio',
    pageKey: 'doc-studio',
  },
];
