/** TZ-SUPPLY-304 — mock types and seed for «Быстрый заказ» (no API). */

export type QuickOrderStatus = 'in_progress' | 'requested' | 'ordered' | 'received' | 'cancelled';

export type QuickOrderPriority = 'urgent' | 'normal' | 'low';

export interface QuickOrderCategory {
  id: string;
  label: string;
}

/** TZ-SUPPLY-308 — supplier org; `Organization` (type=supplier) in 305. */
export interface QuickOrderSupplier {
  id: string;
  name: string;
  website?: string;
  email?: string;
  categoryIds: string[];
}

/** TZ-SUPPLY-308 — supplier manager; `Worker` with `supplierId` in 305. */
export interface QuickOrderSupplierContact {
  id: string;
  /** Live contacts retain the Person id so edits persist through PersonsService. */
  personId?: string;
  supplierId: string;
  lastName?: string;
  firstName?: string;
  patronymic?: string;
  phone?: string;
  email?: string;
  position?: string;
}

export const QUICK_ORDER_CONTACT_POSITION = 'Менеджер по продажам';

/** TZ-SUPPLY-309/312 — material photo; mock rows may omit the URL, API rows carry it. */
export interface QuickOrderMaterialPhoto {
  id: string;
  label: string;
  storageUrl?: string;
  thumbnailUrl?: string;
  originalFilename?: string;
}

/** TZ-SUPPLY-307 — material catalog entry; replaced by MaterialsService in 305. */
export interface QuickOrderMaterial {
  id: string;
  categoryId: string;
  name: string;
  article?: string;
  /** Legacy single color — kept as the first entry of `colors` for old seed rows. */
  color?: string;
  /** TZ-SUPPLY-309 — colors this material can be ordered in; an order row picks one. */
  colors?: string[];
  unit: string;
  /** TZ-SUPPLY-309 — mock photo set; `mainPhotoId` marks the starred main photo. */
  photos?: QuickOrderMaterialPhoto[];
  mainPhotoId?: string | null;
}

export interface QuickOrderCompany {
  id: string;
  name: string;
}

export interface SupplyQuickOrderRow {
  id: string;
  createdAt: Date;
  categoryId: string;
  materialId: string | null;
  /** TZ-SUPPLY-309 — color chosen for this line (one of the material's `colors`). */
  color?: string;
  qty: number;
  unit: string;
  supplierId: string | null;
  supplierContactId: string | null;
  productUrl: string;
  companyId: string;
  requestedBy: string;
  orderId: string | null;
  neededBy: string;
  status: QuickOrderStatus;
  /** Registry SupplyTask created when an order-backed request reaches ordered. */
  linkedSupplyTaskId?: string | null;
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

export const MOCK_MATERIALS: QuickOrderMaterial[] = [
  {
    id: 'mat-6205',
    categoryId: 'cat-podshipniki',
    name: 'Подшипник 6205',
    article: '6205-2RS',
    unit: 'шт',
    photos: [{ id: 'ph-6205-1', label: '6205-2RS' }],
    mainPhotoId: 'ph-6205-1',
  },
  {
    id: 'mat-6206',
    categoryId: 'cat-podshipniki',
    name: 'Подшипник 6206',
    article: '6206-2RS',
    unit: 'шт',
  },
  {
    id: 'mat-608',
    categoryId: 'cat-podshipniki',
    name: 'Подшипник 608ZZ',
    article: '608ZZ',
    unit: 'шт',
  },
  {
    id: 'mat-zaglushka-20',
    categoryId: 'cat-metizy',
    name: 'Заглушка пластиковая Ø20',
    colors: ['чёрный', 'белый', 'серый'],
    unit: 'шт',
  },
  {
    id: 'mat-bolt-m8',
    categoryId: 'cat-metizy',
    name: 'Болт М8×40',
    article: 'DIN 933',
    colors: ['оцинкованный', 'нержавеющий', 'чёрный'],
    unit: 'шт',
  },
  {
    id: 'mat-gaika-m8',
    categoryId: 'cat-metizy',
    name: 'Гайка М8',
    article: 'DIN 934',
    colors: ['оцинкованная', 'нержавеющая'],
    unit: 'шт',
  },
  {
    id: 'mat-freza-d6',
    categoryId: 'cat-osnastka',
    name: 'Фреза D6 твердосплавная',
    article: 'D6-4F',
    colors: ['TiAlN', 'без покрытия'],
    unit: 'шт',
    photos: [{ id: 'ph-freza-1', label: 'D6-4F' }],
    mainPhotoId: 'ph-freza-1',
  },
  {
    id: 'mat-tsanga-er16',
    categoryId: 'cat-osnastka',
    name: 'Цанга ER16',
    article: 'ER16-6',
    colors: ['прецизионная'],
    unit: 'шт',
  },
  { id: 'mat-smazka', categoryId: 'cat-rashodniki', name: 'Смазка техническая', unit: 'уп' },
  { id: 'mat-vetosh', categoryId: 'cat-rashodniki', name: 'Ветошь обтирочная', unit: 'кг' },
  { id: 'mat-skotch', categoryId: 'cat-prochee', name: 'Скотч упаковочный', unit: 'шт' },
  { id: 'mat-marker', categoryId: 'cat-prochee', name: 'Маркер по металлу', unit: 'шт' },
];

export const MOCK_SUPPLIERS: QuickOrderSupplier[] = [
  {
    id: 'sup-kuban',
    name: 'Кубаньподшипник',
    email: 'zakaz@kubanpodshipnik.ru',
    categoryIds: ['cat-podshipniki'],
  },
  {
    id: 'sup-profrezi',
    name: 'profrezi.ru',
    website: 'https://profrezi.ru',
    email: 'sales@profrezi.ru',
    categoryIds: ['cat-osnastka'],
  },
];

export const MOCK_SUPPLIER_CONTACTS: QuickOrderSupplierContact[] = [
  {
    id: 'sc-kuban-1',
    supplierId: 'sup-kuban',
    lastName: 'Ковалёв',
    firstName: 'Игорь',
    patronymic: 'Петрович',
    phone: '+7 918 000-11-22',
    email: 'kovalev@kubanpodshipnik.ru',
    position: QUICK_ORDER_CONTACT_POSITION,
  },
  {
    id: 'sc-kuban-2',
    supplierId: 'sup-kuban',
    lastName: 'Лебедева',
    firstName: 'Ольга',
    phone: '+7 918 000-11-23',
    position: QUICK_ORDER_CONTACT_POSITION,
  },
  {
    id: 'sc-profrezi-1',
    supplierId: 'sup-profrezi',
    lastName: 'Сидоров',
    firstName: 'Анатолий',
    patronymic: 'Юрьевич',
    phone: '+7 861 200-30-40',
    email: 'sidorov@profrezi.ru',
    position: QUICK_ORDER_CONTACT_POSITION,
  },
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
      materialId: 'mat-6205',
      qty: 4,
      unit: 'шт',
      supplierId: 'sup-kuban',
      supplierContactId: 'sc-kuban-1',
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
      materialId: 'mat-zaglushka-20',
      color: 'чёрный',
      qty: 20,
      unit: 'шт',
      supplierId: null,
      supplierContactId: null,
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
      materialId: 'mat-freza-d6',
      qty: 2,
      unit: 'шт',
      supplierId: 'sup-profrezi',
      supplierContactId: 'sc-profrezi-1',
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
      materialId: 'mat-tsanga-er16',
      qty: 1,
      unit: 'шт',
      supplierId: 'sup-profrezi',
      supplierContactId: 'sc-profrezi-1',
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
      materialId: 'mat-smazka',
      qty: 1,
      unit: 'уп',
      supplierId: null,
      supplierContactId: null,
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

export function materialsForCategory(
  materials: QuickOrderMaterial[],
  categoryId: string,
): QuickOrderMaterial[] {
  if (!categoryId) return [];
  // Legacy/live catalog rows may have no categoryId yet. Keep them selectable
  // instead of rendering an empty material picker; the audit task records the
  // required backend data backfill separately.
  return materials.filter((m) => !m.categoryId || m.categoryId === categoryId);
}

export function materialLabel(materials: QuickOrderMaterial[], materialId: string | null): string {
  if (!materialId) return 'Без материала';
  return materials.find((m) => m.id === materialId)?.name ?? 'Без материала';
}

/** TZ-SUPPLY-309/312 — normalized, deduped color options, legacy `color` first. */
export function materialColorOptions(material: QuickOrderMaterial | undefined): string[] {
  if (!material) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  for (const raw of [material.color ?? '', ...(material.colors ?? [])]) {
    const color = raw.trim();
    const key = color.toLocaleLowerCase();
    if (!color || seen.has(key)) continue;
    seen.add(key);
    result.push(color);
  }
  return result;
}

/** TZ-SUPPLY-309 — starred main photo, else first photo, else null. */
export function materialMainPhoto(
  material: QuickOrderMaterial | undefined,
): QuickOrderMaterialPhoto | null {
  if (!material?.photos?.length) return null;
  return material.photos.find((p) => p.id === material.mainPhotoId) ?? material.photos[0] ?? null;
}

export function suppliersForCategory(
  suppliers: QuickOrderSupplier[],
  categoryId: string,
): QuickOrderSupplier[] {
  if (!categoryId) return [];
  // TZ-SUPPLY-311: live suppliers (empty categoryIds) match every category;
  // mock suppliers keep their category-scoped filter.
  return suppliers.filter((s) => s.categoryIds.length === 0 || s.categoryIds.includes(categoryId));
}

export function contactsForSupplier(
  contacts: QuickOrderSupplierContact[],
  supplierId: string | null,
): QuickOrderSupplierContact[] {
  if (!supplierId) return [];
  return contacts.filter((c) => c.supplierId === supplierId);
}

/** «Ковалёв И. П.» — enough to recognise the manager inside a 10rem select. */
export function contactLabel(contact: QuickOrderSupplierContact): string {
  const lastName = contact.lastName ?? '';
  const initials = [contact.firstName, contact.patronymic]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .map((part) => `${part.trim()[0]!.toUpperCase()}.`)
    .join(' ');
  return initials ? `${lastName} ${initials}` : lastName || contact.firstName || '—';
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
    materialId: null,
    qty: 1,
    unit: 'шт',
    supplierId: null,
    supplierContactId: null,
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
