import type { OrderStatus } from '@kppdf/data-access';

/** Russian lifecycle labels shared by the NX orders list and order detail (S35). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export function orderStatusLabel(status?: OrderStatus): string {
  return status ? (ORDER_STATUS_LABELS[status] ?? status) : '—';
}