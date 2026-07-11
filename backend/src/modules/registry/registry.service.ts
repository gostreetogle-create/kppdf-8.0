import { Injectable } from '@nestjs/common';

/**
 * One addressable data source in the Document Constructor picker.
 * `key` must match the suffix in BuildDocumentDto (`organizationId` →
 * source `'organization'`, etc). Russian `label` is rendered in the tool pane.
 *
 * Why hardcoded (not DB-stored)? Microsoft-Word-toolbox pattern:
 * - Backend owns the truth about which entities have which fields.
 * - Frontend dropdowns build from this registry — adding a new entity
 *   to the registry automatically surfaces it in the picker, without
 *   redeploying frontend.
 * - Future extensibility (TZ-87): migrate to a Mongo-admin-managed
 *   registry IF the 5 sources grow to 15+; for MVP 5 entries hardcoded
 *   are cleaner than CRUD overhead.
 */
export interface DataSourceDescriptor {
  key: string;
  label: string;
  /** Frontend grouping for collapsible tool-pane tab. */
  group: 'contacts' | 'catalog' | 'work';
  fields: FieldDescriptor[];
}

/**
 * One field on a data source, addressable by `dataBinding.field: 'name'`.
 * `type` chooses the renderer for that field in the canvas preview:
 * - text     → plain string
 * - number   → Intl-compatible numeric (no currency)
 * - currency → Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
 * - date     → toLocaleDateString('ru-RU')
 * - bool     → 'Да' | 'Нет'
 */
export interface FieldDescriptor {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'bool';
}

@Injectable()
export class RegistryService {
  /**
   * Returns the full catalogue of data sources available to the
   * Document Constructor. The response shape (`{ sources: [...] }`)
   * is intentionally minimal and stable; new fields can be added
   * to descriptors without breaking consumers.
   */
  getDataSources(): { sources: DataSourceDescriptor[] } {
    return { sources: DATA_SOURCES };
  }
}

/**
 * Single source of truth for the 5 entity types supported by
 * DocumentBuilder.build() (TZ-86 Фаза A.4). Adding/changing a field
 * here ripples to the entire Document Builder UI.
 */
const DATA_SOURCES: DataSourceDescriptor[] = [
  {
    key: 'organization',
    label: 'Организация',
    group: 'contacts',
    fields: [
      { key: 'name', label: 'Наименование', type: 'text' },
      { key: 'shortName', label: 'Краткое наименование', type: 'text' },
      { key: 'inn', label: 'ИНН', type: 'text' },
      { key: 'kpp', label: 'КПП', type: 'text' },
      { key: 'ogrn', label: 'ОГРН', type: 'text' },
      { key: 'legalForm', label: 'Организационно-правовая форма', type: 'text' },
      { key: 'legalType', label: 'Тип (ООО/ИП/ПАО/АО)', type: 'text' },
      { key: 'bankName', label: 'Наименование банка', type: 'text' },
      { key: 'bankBik', label: 'БИК', type: 'text' },
      { key: 'bankAccount', label: 'Расчётный счёт', type: 'text' },
      { key: 'bankCorrAccount', label: 'Корр. счёт', type: 'text' },
      { key: 'signerName', label: 'Подписант (ФИО)', type: 'text' },
      { key: 'signerPosition', label: 'Должность подписанта', type: 'text' },
      { key: 'directorName', label: 'Директор', type: 'text' },
      { key: 'website', label: 'Сайт', type: 'text' },
      { key: 'vatRate', label: 'Ставка НДС, %', type: 'number' },
      { key: 'paymentTermDays', label: 'Срок оплаты, дн.', type: 'number' },
    ],
  },
  {
    key: 'counterparty',
    label: 'Контрагент',
    group: 'contacts',
    fields: [
      { key: 'name', label: 'Наименование', type: 'text' },
      { key: 'shortName', label: 'Краткое наименование', type: 'text' },
      { key: 'inn', label: 'ИНН', type: 'text' },
      { key: 'kpp', label: 'КПП', type: 'text' },
      { key: 'ogrn', label: 'ОГРН', type: 'text' },
      { key: 'legalForm', label: 'Организационно-правовая форма', type: 'text' },
      { key: 'bankName', label: 'Наименование банка', type: 'text' },
      { key: 'bankBik', label: 'БИК', type: 'text' },
      { key: 'bankAccount', label: 'Расчётный счёт', type: 'text' },
      { key: 'bankCorrAccount', label: 'Корр. счёт', type: 'text' },
      { key: 'directorName', label: 'Директор', type: 'text' },
    ],
  },
  {
    key: 'product',
    label: 'Продукция',
    group: 'catalog',
    fields: [
      { key: 'name', label: 'Наименование', type: 'text' },
      { key: 'sku', label: 'Артикул (SKU)', type: 'text' },
      { key: 'kind', label: 'Вид (товар/услуга/работа)', type: 'text' },
      { key: 'unit', label: 'Единица измерения', type: 'text' },
      { key: 'subcategory', label: 'Подкатегория', type: 'text' },
      { key: 'description', label: 'Описание', type: 'text' },
      { key: 'listPrice', label: 'Прайсовая цена', type: 'currency' },
      { key: 'basePrice', label: 'Базовая цена', type: 'currency' },
      { key: 'costPrice', label: 'Себестоимость', type: 'currency' },
      { key: 'defaultMarkupPercent', label: 'Наценка по умолчанию, %', type: 'number' },
      { key: 'stockQty', label: 'Остаток на складе', type: 'number' },
      { key: 'weightKg', label: 'Масса, кг', type: 'number' },
    ],
  },
  {
    key: 'material',
    label: 'Материал',
    group: 'catalog',
    fields: [
      { key: 'name', label: 'Наименование', type: 'text' },
      { key: 'article', label: 'Артикул', type: 'text' },
      { key: 'sku', label: 'SKU', type: 'text' },
      { key: 'unit', label: 'Единица измерения', type: 'text' },
      { key: 'description', label: 'Описание', type: 'text' },
      { key: 'pricePerUnit', label: 'Цена за единицу', type: 'currency' },
      { key: 'stockQty', label: 'Остаток на складе', type: 'number' },
    ],
  },
  {
    key: 'work-type',
    label: 'Вид работ',
    group: 'work',
    fields: [
      { key: 'name', label: 'Наименование', type: 'text' },
      { key: 'section', label: 'Раздел', type: 'text' },
      { key: 'department', label: 'Подразделение', type: 'text' },
      { key: 'description', label: 'Описание', type: 'text' },
      { key: 'hourlyRate', label: 'Часовая ставка, ₽', type: 'currency' },
      { key: 'defaultDurationHours', label: 'Нормативная длительность, ч', type: 'number' },
      { key: 'isActive', label: 'Активен', type: 'bool' },
    ],
  },
];
