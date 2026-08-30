export const ORGANIZATION_TYPE_LABELS: Record<string, string> = {
  customer: 'Заказчик',
  supplier: 'Поставщик',
  contractor: 'Подрядчик',
  manufacturer: 'Производитель',
  partner: 'Партнёр',
};

export function formatOrganizationTypes(types: readonly string[] | undefined): string {
  if (!types?.length) return '—';
  return types.map((t) => ORGANIZATION_TYPE_LABELS[t] ?? t).join(', ');
}

export function formatOrganizationActive(isActive: boolean | undefined): string {
  if (isActive === false) return 'Неактивна';
  return 'Активна';
}
