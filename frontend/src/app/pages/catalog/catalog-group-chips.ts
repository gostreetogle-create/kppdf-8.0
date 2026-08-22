/**
 * Catalog Group Chip Workspace — Продукция | Модули | Материалы (+ Оформление).
 * Top-nav «Каталог» enters at /products.
 * TZ-UI-404: this is the dark TOC row (sibling identity), not the gold chips row —
 * the family currently has no second-level gold chips.
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const CATALOG_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'products', label: 'Продукция', route: '/products', pageKey: 'products' },
  { id: 'modules', label: 'Модули', route: '/modules', pageKey: 'modules' },
  { id: 'materials', label: 'Материалы', route: '/materials', pageKey: 'materials' },
];
