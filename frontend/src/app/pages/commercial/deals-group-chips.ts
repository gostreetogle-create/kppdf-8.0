/**
 * Deals workspace navigation (TZ-SALES-310).
 *
 * The dark TOC contains the three lifecycle surfaces. The yellow row is
 * intentionally limited to КП actions so contracts/orders never advertise a
 * proposal CTA.
 *
 * TZ-NAV-303: Комбайн убран из Сделок — он живёт в Проекте (/design/combine).
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const DEALS_TOC_CHIPS: readonly GroupChip[] = [
  { id: 'proposals', label: 'КП', route: '/proposals/create', pageKey: 'proposals' },
  { id: 'contracts', label: 'Договоры', route: '/contracts', pageKey: 'contracts' },
  { id: 'orders', label: 'Заказы', route: '/orders', pageKey: 'orders' },
];

export const KP_SECTION_CHIPS: readonly GroupChip[] = [
  { id: 'create', label: 'Создать КП', route: '/proposals/create', pageKey: 'proposals' },
  { id: 'all', label: 'Все КП', route: '/proposals', pageKey: 'proposals' },
];

/** @deprecated Use DEALS_TOC_CHIPS for the dark Deals TOC. */
export const DEALS_SECTION_CHIPS = DEALS_TOC_CHIPS;
