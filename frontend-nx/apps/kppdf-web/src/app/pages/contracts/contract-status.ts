import type { ContractAttachmentStatus, ContractStatus } from '@kppdf/data-access';

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

export const CONTRACT_ATTACHMENT_STATUS_LABELS: Record<ContractAttachmentStatus, string> = {
  none: 'Нет файла',
  file_attached: 'Файл прикреплён',
  generated: 'Сформирован в системе',
};

export function contractAttachmentStatusLabel(status?: ContractAttachmentStatus): string {
  return status ? (CONTRACT_ATTACHMENT_STATUS_LABELS[status] ?? status) : '—';
}
