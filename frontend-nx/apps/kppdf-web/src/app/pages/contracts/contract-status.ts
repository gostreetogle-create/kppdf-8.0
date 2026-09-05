import type { ContractStatus } from '@kppdf/data-access';

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  signed: 'Подписан',
  active: 'Действует',
  completed: 'Завершён',
  cancelled: 'Отменён',
  expired: 'Истёк',
};

export function contractStatusLabel(status?: ContractStatus): string {
  return status ? (CONTRACT_STATUS_LABELS[status] ?? status) : '—';
}
