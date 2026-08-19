/**
 * Manager desk daily-workflow chips (TZ-DESK-406).
 *
 * One sticky `app-pi-group-workspace` chip row under the app header — the desk
 * is brand-home SoT, so «Рабочий стол» is not repeated as a crumb/H1 here.
 * The Гант studio chip is a stub until DESK-407: it carries the `view=gantt`
 * route/query but the desk page does not render that view yet.
 */
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

export const DESK_WORKFLOW_CHIPS: readonly GroupChip[] = [
  { id: 'desk', label: 'Стол', route: '/desk', queryParams: { view: 'desk' }, pageKey: 'orders' },
  { id: 'proposal', label: 'КП', route: '/proposals/create', pageKey: 'proposals' },
  {
    id: 'combine',
    label: 'Комбайн',
    route: '/desk',
    queryParams: { view: 'combine' },
    pageKey: 'orders',
  },
  {
    id: 'gantt',
    label: 'Гант',
    route: '/desk',
    queryParams: { view: 'gantt' },
    pageKey: 'production',
  },
  {
    id: 'supply',
    label: 'Снабжение',
    route: '/supply',
    queryParams: { view: 'quick' },
    pageKey: 'supply',
  },
  { id: 'shipping', label: 'Отгрузка', route: '/shipping', pageKey: 'shipping' },
];
