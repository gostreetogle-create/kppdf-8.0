import type { SupplyRequestPriority, SupplyRequestStatus } from '@kppdf/data-access';

export const SUPPLY_REQUEST_STATUS_LABELS: Record<SupplyRequestStatus, string> = {
  in_progress: 'В работе',
  requested: 'Заказать',
  ordered: 'Заказано',
  received: 'Получено',
  cancelled: 'Отменено',
};

export const SUPPLY_REQUEST_PRIORITY_LABELS: Record<SupplyRequestPriority, string> = {
  urgent: 'Срочно',
  normal: 'Обычный',
  low: 'Низкий',
};

export function formatSupplyRequestStatus(status: SupplyRequestStatus | undefined): string {
  if (!status) return '—';
  return SUPPLY_REQUEST_STATUS_LABELS[status] ?? status;
}

export function formatSupplyRequestPriority(priority: SupplyRequestPriority | undefined): string {
  if (!priority) return '—';
  return SUPPLY_REQUEST_PRIORITY_LABELS[priority] ?? priority;
}

export function formatObjectIdRef(value: string | undefined): string {
  return value?.trim() ? value : '—';
}
