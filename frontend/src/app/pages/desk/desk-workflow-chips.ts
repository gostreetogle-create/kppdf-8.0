/**
 * Manager desk daily-workflow chips (TZ-DESK-406).
 *
 * One sticky `app-pi-group-workspace` chip row under the app header — the desk
 * is brand-home SoT, so «Рабочий стол» is not repeated as a crumb/H1 here.
 * The Гант studio chip is a stub until DESK-407: it carries the `view=gantt`
 * route/query but the desk page does not render that view yet.
 *
 * DESK-426: chips are the ONLY legal cross-page path out of an expanded order
 * (PO canon — tray never navigates). When a row is expanded the desk page
 * builds chips through `deskWorkflowChips(orderId)` so every chip except the
 * bare desk carries the order context:
 *
 * | Chip    | Route               | Query when expanded                          |
 * |---------|---------------------|----------------------------------------------|
 * | Стол    | /desk               | view=desk, orderId                           |
 * | КП      | /proposals/create   | source=order, sourceId=orderId               |
 * | Комбайн | /desk               | view=combine, orderId                        |
 * | Гант    | /desk               | view=gantt, orderId                          |
 * | Снабжение| /supply            | view=quick, orderId, from=desk               |
 * | Отгрузка| /shipping           | orderId, from=desk                           |
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

/**
 * DESK-426 — chips with the expanded order context merged in. `orderId === null`
 * returns the static constant (bare desk). Order context rules:
 *  - Стол keeps its expand (`view=desk&orderId=…`);
 *  - КП deep-links a new proposal prefilled from the order (`source=order`);
 *  - supply/shipping get `orderId` + `from=desk` for the filter + «На стол».
 */
export function deskWorkflowChips(orderId: string | null): readonly GroupChip[] {
  if (!orderId) return DESK_WORKFLOW_CHIPS;
  return DESK_WORKFLOW_CHIPS.map((chip): GroupChip => {
    switch (chip.id) {
      case 'desk':
        return {
          ...chip,
          queryParams: { ...(chip.queryParams ?? {}), orderId },
        };
      case 'proposal':
        return { ...chip, queryParams: { source: 'order', sourceId: orderId } };
      case 'supply':
      case 'shipping':
        return {
          ...chip,
          queryParams: { ...(chip.queryParams ?? {}), orderId, from: 'desk' },
        };
      default:
        // combine/gantt keep their desk stub view + the order.
        return {
          ...chip,
          queryParams: { ...(chip.queryParams ?? {}), orderId },
        };
    }
  });
}
