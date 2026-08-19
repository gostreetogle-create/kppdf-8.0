/** TZ-SUPPLY-304 — mock types and seed for «Быстрый заказ» (no API). */

export type QuickOrderStatus = 'in_progress' | 'requested' | 'ordered' | 'received' | 'cancelled';

export type QuickOrderPriority = 'urgent' | 'normal' | 'low';

export interface QuickOrderCategory {
  id: string;
  label: string;
}

export interface QuickOrderSupplier {
  id: string;
  name: string;
  website?: string;
}

export interface QuickOrderCompany {
  id: string;
  name: string;
}

export interface SupplyQuickOrderRow {
  id: string;
  createdAt: Date;
  categoryId: string;
  title: string;
  article: string;
  color: string;
  qty: number;
  unit: string;
  supplierId: string | null;
  productUrl: string;
  companyId: string;
  requestedBy: string;
  orderId: string | null;
  neededBy: string;
  status: QuickOrderStatus;
  priority: QuickOrderPriority;
  notes: string;
  priceHint: number | null;
  lineTotal: number | null;
  supplierOrderDate: string;
  responsible: string;
}

export const QUICK_ORDER_STATUSES: readonly {
  value: QuickOrderStatus;
  label: string;
}[] = [
  { value: 'in_progress', label: 'В работе' },
  { value: 'requested', label: 'Запрошено у поставщика' },
  { value: 'ordered', label: 'Заказано' },
  { value: 'received', label: 'Получено' },
  { value: 'cancelled', label: 'Отменено' },
];

export const QUICK_ORDER_PRIORITIES: readonly {
  value: QuickOrderPriority;
  label: string;
  icon: string;
}[] = [
  { value: 'urgent', label: 'Срочно', icon: '🔴' },
  { value: 'normal', label: 'Обычный', icon: '○' },
  { value: 'low', label: 'Низкий', icon: '🟢' },
];

export const QUICK_ORDER_UNITS = ['шт', 'компл', 'уп', 'кг', 'м'] as const;

export const QUICK_ORDER_REQUESTED_BY = ['Производство', 'Склад', 'Офис'] as const;

export const MOCK_CATEGORIES: QuickOrderCategory[] = [
  { id: 'cat-metizy', label: 'Метизы' },
  { id: 'cat-osnastka', label: 'Оснастка' },
  { id: 'cat-podshipniki', label: 'Подшипники' },
  { id: 'cat-rashodniki', label: 'Расходники' },
  { id: 'cat-prochee', label: 'Прочее' },
];

export const MOCK_SUPPLIERS: QuickOrderSupplier[] = [
  { id: 'sup-kuban', name: 'Кубаньподшипник' },
  { id: 'sup-profrezi', name: 'profrezi.ru', website: 'https://profrezi.ru' },
];

export const MOCK_COMPANIES: QuickOrderCompany[] = [{ id: 'org-our-1', name: 'ООО «КПП ДФ»' }];

const today = new Date('2026-08-19T09:00:00');
const yesterday = new Date('2026-08-18T14:00:00');

let nextRowId = 6;

export function createQuickOrderId(): string {
  return `qo-${nextRowId++}`;
}

/** Canon §11 — five seed rows from Excel PO. */
export function createQuickOrderSeedRows(): SupplyQuickOrderRow[] {
  return [
    {
      id: 'qo-1',
      createdAt: today,
      categoryId: 'cat-podshipniki',
      title: 'Подшипник 6205',
      article: '',
      color: '',
      qty: 4,
      unit: 'шт',
      supplierId: 'sup-kuban',
      productUrl: '',
      companyId: 'org-our-1',
      requestedBy: 'Производство',
      orderId: null,
      neededBy: '',
      status: 'in_progress',
      priority: 'urgent',
      notes: '',
      priceHint: null,
      lineTotal: null,
      supplierOrderDate: '',
      responsible: 'Менеджер',
    },
    {
      id: 'qo-2',
      createdAt: today,
      categoryId: 'cat-metizy',
      title: 'Заглушка пластиковая Ø20',
      article: '',
      color: '',
      qty: 20,
      unit: 'шт',
      supplierId: null,
      productUrl: '',
      companyId: 'org-our-1',
      requestedBy: 'Склад',
      orderId: null,
      neededBy: '',
      status: 'requested',
      priority: 'normal',
      notes: '',
      priceHint: null,
      lineTotal: null,
      supplierOrderDate: '',
      responsible: 'Менеджер',
    },
    {
      id: 'qo-3',
      createdAt: today,
      categoryId: 'cat-osnastka',
      title: 'Фреза D6 твердосплавная',
      article: '',
      color: '',
      qty: 2,
      unit: 'шт',
      supplierId: 'sup-profrezi',
      productUrl: 'https://profrezi.ru',
      companyId: 'org-our-1',
      requestedBy: 'Производство',
      orderId: null,
      neededBy: '',
      status: 'in_progress',
      priority: 'urgent',
      notes: '',
      priceHint: null,
      lineTotal: null,
      supplierOrderDate: '',
      responsible: 'Менеджер',
    },
    {
      id: 'qo-4',
      createdAt: yesterday,
      categoryId: 'cat-osnastka',
      title: 'Цанга ER16',
      article: '',
      color: '',
      qty: 1,
      unit: 'шт',
      supplierId: 'sup-profrezi',
      productUrl: '',
      companyId: 'org-our-1',
      requestedBy: 'Производство',
      orderId: null,
      neededBy: '',
      status: 'in_progress',
      priority: 'normal',
      notes: '',
      priceHint: null,
      lineTotal: null,
      supplierOrderDate: '',
      responsible: 'Менеджер',
    },
    {
      id: 'qo-5',
      createdAt: yesterday,
      categoryId: 'cat-rashodniki',
      title: 'Смазка техническая',
      article: '',
      color: '',
      qty: 1,
      unit: 'уп',
      supplierId: null,
      productUrl: '',
      companyId: 'org-our-1',
      requestedBy: 'Склад',
      orderId: null,
      neededBy: '',
      status: 'in_progress',
      priority: 'low',
      notes: '',
      priceHint: null,
      lineTotal: null,
      supplierOrderDate: '',
      responsible: 'Менеджер',
    },
  ];
}

export function prioritySortWeight(p: QuickOrderPriority): number {
  if (p === 'urgent') return 3;
  if (p === 'normal') return 2;
  return 1;
}

export function statusLabel(status: QuickOrderStatus): string {
  return QUICK_ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function priorityLabel(priority: QuickOrderPriority): string {
  return QUICK_ORDER_PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}

export function priorityIcon(priority: QuickOrderPriority): string {
  return QUICK_ORDER_PRIORITIES.find((p) => p.value === priority)?.icon ?? '○';
}

export function supplierShortLabel(
  suppliers: QuickOrderSupplier[],
  supplierId: string | null,
): string {
  if (!supplierId) return '—';
  const s = suppliers.find((x) => x.id === supplierId);
  if (!s) return '—';
  const name = s.name;
  if (name.length <= 12) return name;
  return `${name.slice(0, 12)}…`;
}

export function createEmptyQuickOrderRow(
  prefillOrderId: string | null = null,
): SupplyQuickOrderRow {
  return {
    id: createQuickOrderId(),
    createdAt: new Date(),
    categoryId: MOCK_CATEGORIES[0]!.id,
    title: '',
    article: '',
    color: '',
    qty: 1,
    unit: 'шт',
    supplierId: null,
    productUrl: '',
    companyId: MOCK_COMPANIES[0]!.id,
    requestedBy: 'Производство',
    orderId: prefillOrderId,
    neededBy: '',
    status: 'in_progress',
    priority: 'normal',
    notes: '',
    priceHint: null,
    lineTotal: null,
    supplierOrderDate: '',
    responsible: 'Менеджер',
  };
}
