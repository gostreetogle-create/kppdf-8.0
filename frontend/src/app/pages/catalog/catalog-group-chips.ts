/**
 * Catalog Group Chip Workspace — section chips (single family, no TOC row).
 * Top-nav «Каталог» enters at /products; chips switch peers.
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const CATALOG_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'products', label: 'Продукция', route: '/products' },
  { id: 'modules', label: 'Модули', route: '/modules' },
  { id: 'materials', label: 'Материалы', route: '/materials' },
  { id: 'work-types', label: 'Виды работ', route: '/work-types' },
  { id: 'people', label: 'Люди', route: '/people' },
];
