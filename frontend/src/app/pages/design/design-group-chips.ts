/**
 * Design queue chips (TZ-UX-309).
 * TZ-UI-406: siblings of one family (Очередь + Комбайн) → dark TOC row, not the gold
 * chips row — same canon as TZ-UI-404 (Клиенты/Каталог/Снабжение/Цех).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const DESIGN_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'design', label: 'Очередь', route: '/design', pageKey: 'design' },
  // TZ-NAV-303: Комбайн заказов (канбан) — зона проектирования.
  { id: 'combine', label: 'Комбайн', route: '/design/combine', pageKey: 'orders' },
];
