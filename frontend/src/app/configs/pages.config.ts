/**
 * Page registry — all 65 tables in 8 categories.
 * Each entry is a single source of truth for: title, endpoint, icon, category, priority, role-gating, and (optionally) form fields.
 * Used by Sidebar (filtered by category + roles), TaskPanel (filtered by priority), and CrudPage (endpoint + title + fields).
 */
import type { FormFieldSpec } from '../shared/components/form-dialog/form-dialog.component';

export interface PageFieldSpec extends FormFieldSpec {
  /** Endpoint for loading relation options (e.g. '/categories') — only for type='relation' */
  endpoint?: string;
  /** Key in option-object used as label (default: 'name') */
  labelKey?: string;
  /** Key in option-object used as value (default: '_id') */
  valueKey?: string;
}

export interface PageConfig {
  id: string;
  title: string;
  endpoint: string;
  icon: string;
  category: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Lower = fill first. Phase 1 = foundation, Phase 11 = system. */
  priority: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  roles?: string[];
  description?: string;
  /** Form fields for create/edit dialog. If omitted, page is read-only. */
  fields?: PageFieldSpec[];
  /**
   * Skip on Dashboard `fetchCounts` and TaskPanel. Use for entities that:
   *   - have no list-all endpoint (sub-resources, e.g. `/products/:id/components`)
   *   - have no backend at all (e.g. showcase)
   *   - the controller's GET list is not implemented (e.g. counter test endpoint only)
   *
   * The flag is also enforced defensively by `isListable()` — a path with `:`
   * (a parent-id placeholder) is automatically treated as non-listable even
   * without this flag.
   */
  skipCount?: boolean;
}

/**
 * A page is "listable" if the backend exposes a flat `GET <path>` for it.
 *
 * Two ways a page becomes non-listable:
 *  1. Explicit `skipCount: true` in the config (no backend, or sub-resource
 *     we already know about — e.g. `entity-attribute-values` requires
 *     `:entityType/:entityId/attributes`).
 *  2. Endpoint contains a parent-id placeholder (`:`) — after stripping, the
 *     resolved URL is not a real list endpoint (defensive guard).
 *
 * Used by Dashboard (`fetchCounts`) and TaskPanel (`fetchCounts`) to avoid
 * issuing `?limit=0` requests against non-existent paths (which produce
 * noisy 404s in the console).
 */
export function isListable(p: PageConfig): boolean {
  if (p.skipCount) return false;
  if (p.endpoint.includes(':')) return false;
  return true;
}

export const CATEGORIES: { id: PageConfig['category']; title: string; icon: string }[] = [
  { id: 1, title: 'Основные', icon: '🗂' },
  { id: 2, title: 'Продукция', icon: '📦' },
  { id: 3, title: 'Производство', icon: '⚙️' },
  { id: 4, title: 'Склад', icon: '🏭' },
  { id: 5, title: 'Закупки', icon: '🛒' },
  { id: 6, title: 'Продажи', icon: '💼' },
  { id: 7, title: 'Документы + Финансы', icon: '📑' },
  { id: 8, title: 'Система', icon: '🔧' },
];

const PARTY_TYPE_OPTIONS = [
  { value: 'our-company', label: 'Наша компания' },
  { value: 'partner', label: 'Партнёр' },
  { value: 'holding', label: 'Холдинг' },
  { value: 'branch', label: 'Филиал' },
];

const LEGAL_FORM_OPTIONS = [
  { value: 'ООО', label: 'ООО' },
  { value: 'ОАО', label: 'ОАО' },
  { value: 'ЗАО', label: 'ЗАО' },
  { value: 'ПАО', label: 'ПАО' },
  { value: 'ИП', label: 'ИП' },
  { value: 'АО', label: 'АО' },
];

const LEGAL_TYPE_OPTIONS = [
  { value: 'legal', label: 'Юр. лицо' },
  { value: 'entrepreneur', label: 'ИП' },
  { value: 'individual', label: 'Физ. лицо' },
];

const COUNTERPARTY_TYPE_OPTIONS = [
  { value: 'customer', label: 'Покупатель' },
  { value: 'supplier', label: 'Поставщик' },
  { value: 'contractor', label: 'Подрядчик' },
  { value: 'manufacturer', label: 'Производитель' },
];

export const PAGES: PageConfig[] = [
  // === Category 1: Основные (priority 1 — foundation) ===
  {
    id: 'counterparty',
    title: 'Контрагенты',
    endpoint: '/counterparties',
    icon: '🤝',
    category: 1,
    priority: 1,
    fields: [
      { key: 'name', label: 'Название', type: 'text', required: true },
      { key: 'shortName', label: 'Краткое название', type: 'text' },
      { key: 'inn', label: 'ИНН', type: 'text', placeholder: '10 или 12 цифр' },
      { key: 'kpp', label: 'КПП', type: 'text' },
      { key: 'legalAddress', label: 'Юр. адрес', type: 'textarea' },
      {
        key: 'type',
        label: 'Тип',
        type: 'select',
        options: COUNTERPARTY_TYPE_OPTIONS,
      },
      { key: 'legalType', label: 'Юр. форма', type: 'select', options: LEGAL_TYPE_OPTIONS },
      { key: 'contactPersonName', label: 'Контактное лицо', type: 'text' },
      { key: 'phone', label: 'Телефон', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'notes', label: 'Примечания', type: 'textarea' },
    ],
  },
  {
    id: 'organization',
    title: 'Организации',
    endpoint: '/organizations',
    icon: '🏢',
    category: 1,
    priority: 1,
    fields: [
      { key: 'name', label: 'Полное название', type: 'text', required: true },
      { key: 'shortName', label: 'Сокращённое', type: 'text' },
      { key: 'inn', label: 'ИНН', type: 'text', placeholder: '10 или 12 цифр' },
      { key: 'kpp', label: 'КПП', type: 'text' },
      { key: 'ogrn', label: 'ОГРН/ОГРНИП', type: 'text' },
      { key: 'legalForm', label: 'Орг.-правовая форма', type: 'select', options: LEGAL_FORM_OPTIONS },
      { key: 'legalType', label: 'Юр. форма', type: 'select', options: LEGAL_TYPE_OPTIONS },
      {
        key: 'type',
        label: 'Тип',
        type: 'select',
        options: PARTY_TYPE_OPTIONS,
        placeholder: 'Можно выбрать несколько — бэк принимает массивом',
      },
      { key: 'legalAddress', label: 'Юр. адрес', type: 'textarea' },
      { key: 'bankAccount', label: 'Р/с', type: 'text' },
      { key: 'bankName', label: 'Банк', type: 'text' },
      { key: 'directorName', label: 'Директор (ФИО)', type: 'text' },
      { key: 'website', label: 'Сайт', type: 'text' },
    ],
  },
  {
    id: 'person',
    title: 'Персоны',
    endpoint: '/persons',
    icon: '👤',
    category: 1,
    priority: 1,
    fields: [
      { key: 'lastName', label: 'Фамилия', type: 'text', required: true },
      { key: 'firstName', label: 'Имя', type: 'text', required: true },
      { key: 'patronymic', label: 'Отчество', type: 'text' },
      { key: 'phone', label: 'Телефон', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'position', label: 'Должность', type: 'text' },
      { key: 'birthDate', label: 'Дата рождения', type: 'date' },
      { key: 'notes', label: 'Примечания', type: 'textarea' },
    ],
  },
  { id: 'user', title: 'Пользователи', endpoint: '/users', icon: '👥', category: 1, priority: 1, roles: ['admin'] },
  { id: 'role', title: 'Роли', endpoint: '/roles', icon: '🔑', category: 1, priority: 1, roles: ['admin'] },
  { id: 'permissions', title: 'Права', endpoint: '/permissions', icon: '🛡', category: 1, priority: 1, roles: ['admin'], skipCount: true },
  { id: 'role-org', title: 'Роли в организациях', endpoint: '/org-roles', icon: '🪪', category: 1, priority: 1, roles: ['admin'] },
  { id: 'role-counterparty', title: 'Роли в контрагентах', endpoint: '/counterparty-roles', icon: '🪪', category: 1, priority: 1, roles: ['admin'] },
  { id: 'category', title: 'Категории', endpoint: '/categories', icon: '🗂', category: 1, priority: 1 },
  { id: 'status', title: 'Статусы', endpoint: '/statuses', icon: '🚦', category: 1, priority: 1, skipCount: true },
  { id: 'setting', title: 'Настройки', endpoint: '/settings', icon: '⚙', category: 1, priority: 1, roles: ['admin'] },
  { id: 'feature-flag', title: 'Feature Flags', endpoint: '/feature-flags', icon: '🚩', category: 1, priority: 1, roles: ['admin'] },

  // === Category 2: Продукция (priority 2) ===
  {
    id: 'product',
    title: 'Продукты',
    endpoint: '/products',
    icon: '📦',
    category: 2,
    priority: 2,
    fields: [
      { key: 'name', label: 'Название', type: 'text', required: true },
      { key: 'sku', label: 'Артикул (SKU)', type: 'text' },
      {
        key: 'categoryId',
        label: 'Категория',
        type: 'relation',
        endpoint: '/categories',
        labelKey: 'name',
        valueKey: '_id',
      },
      { key: 'unit', label: 'Ед. изм.', type: 'text', placeholder: 'шт, кг, м и т.п.' },
      { key: 'listPrice', label: 'Цена прайс', type: 'number' },
      { key: 'costPrice', label: 'Себестоимость', type: 'number' },
      { key: 'isActive', label: 'Активен', type: 'boolean' },
      { key: 'description', label: 'Описание', type: 'textarea' },
    ],
  },
  {
    id: 'material',
    title: 'Материалы',
    endpoint: '/materials',
    icon: '🧱',
    category: 2,
    priority: 2,
    fields: [
      { key: 'name', label: 'Название', type: 'text', required: true },
      { key: 'sku', label: 'Артикул (SKU)', type: 'text' },
      { key: 'unit', label: 'Ед. изм.', type: 'text' },
      { key: 'pricePerUnit', label: 'Цена за единицу', type: 'number' },
      { key: 'isActive', label: 'Активен', type: 'boolean' },
      { key: 'description', label: 'Описание', type: 'textarea' },
    ],
  },
  { id: 'product-component', title: 'Компоненты продуктов', endpoint: '/product-components', icon: '🧩', category: 2, priority: 2, skipCount: true },
  { id: 'product-module', title: 'Модули продуктов', endpoint: '/product-modules', icon: '🧬', category: 2, priority: 2 },
  { id: 'photo', title: 'Фотографии', endpoint: '/photos', icon: '🖼', category: 2, priority: 2 },
  { id: 'bom', title: 'Спецификации (BOM)', endpoint: '/products/:id/boms', icon: '📋', category: 2, priority: 8, skipCount: true },
  { id: 'attribute-definition', title: 'Атрибуты (определения)', endpoint: '/attribute-definitions', icon: '🏷', category: 2, priority: 8 },
  { id: 'entity-attribute-value', title: 'Значения атрибутов', endpoint: '/entity-attribute-values', icon: '💎', category: 2, priority: 8, skipCount: true },
  { id: 'product-passport', title: 'Паспорта продуктов', endpoint: '/passports', icon: '📘', category: 2, priority: 8 },
  { id: 'inventor-file', title: 'Файлы изобретателей', endpoint: '/inventor-files', icon: '📁', category: 2, priority: 8 },
  { id: 'certificate', title: 'Сертификаты', endpoint: '/certificates', icon: '📜', category: 2, priority: 8 },
  { id: 'compliance-rule', title: 'Правила соответствия', endpoint: '/compliance-rules', icon: '⚖', category: 2, priority: 8 },

  // === Category 3: Производство (priority 4) ===
  { id: 'work-center', title: 'Рабочие центры', endpoint: '/work-centers', icon: '🏗', category: 3, priority: 4 },
  { id: 'work-type', title: 'Виды работ', endpoint: '/work-types', icon: '🔨', category: 3, priority: 4 },
  { id: 'worker', title: 'Работники', endpoint: '/workers', icon: '👷', category: 3, priority: 4 },
  { id: 'routing-step', title: 'Шаги маршрута', endpoint: '/routing-steps', icon: '🛤', category: 3, priority: 4 },
  { id: 'tech-process', title: 'Техпроцессы', endpoint: '/tech-processes', icon: '⚙', category: 3, priority: 4 },
  { id: 'production-order', title: 'Производственные заказы', endpoint: '/production-orders', icon: '🏭', category: 3, priority: 7 },
  { id: 'order-task', title: 'Задачи заказов', endpoint: '/order-tasks', icon: '📌', category: 3, priority: 7 },
  { id: 'work-order', title: 'Рабочие задания', endpoint: '/work-orders', icon: '📋', category: 3, priority: 7 },
  { id: 'work-order-operation', title: 'Операции рабочих заданий', endpoint: '/work-order-operations', icon: '🔧', category: 3, priority: 7 },
  { id: 'cost-calculation', title: 'Калькуляции себестоимости', endpoint: '/cost-calculations', icon: '💰', category: 3, priority: 8 },
  { id: 'actual-cost', title: 'Фактические затраты', endpoint: '/actual-costs', icon: '💸', category: 3, priority: 8, skipCount: true },
  { id: 'order-closing', title: 'Закрытие заказов', endpoint: '/order-closings', icon: '🔒', category: 3, priority: 7 },

  // === Category 4: Склад (priority 3) ===
  { id: 'warehouse', title: 'Склады', endpoint: '/warehouses', icon: '🏭', category: 4, priority: 3 },
  { id: 'storage-item', title: 'Складские позиции', endpoint: '/storage-items', icon: '📦', category: 4, priority: 3 },
  { id: 'stock-movement', title: 'Движения товаров', endpoint: '/stock-movements', icon: '🔄', category: 4, priority: 10 },
  { id: 'reservation', title: 'Резервы', endpoint: '/reservations', icon: '🛡', category: 4, priority: 10 },
  { id: 'inventory', title: 'Инвентаризация', endpoint: '/inventory/low-stock', icon: '📊', category: 4, priority: 3 },

  // === Category 5: Закупки (priority 5) ===
  { id: 'purchase-request', title: 'Заявки на закупку', endpoint: '/purchase-requests', icon: '📝', category: 5, priority: 5 },
  { id: 'purchase-order', title: 'Заказы поставщикам', endpoint: '/purchase-orders', icon: '📦', category: 5, priority: 5 },
  { id: 'invoice', title: 'Счета', endpoint: '/invoices', icon: '🧾', category: 5, priority: 5 },
  { id: 'tender', title: 'Тендеры', endpoint: '/tenders', icon: '📢', category: 5, priority: 5 },
  { id: 'rpp', title: 'РПП (реестр)', endpoint: '/rpps', icon: '📋', category: 5, priority: 5 },
  { id: 'counter', title: 'Счётчики номеров', endpoint: '/counters', icon: '🔢', category: 5, priority: 9, roles: ['admin'], skipCount: true },

  // === Category 6: Продажи (priority 6) ===
  { id: 'quotation', title: 'Коммерческие предложения', endpoint: '/quotations', icon: '💼', category: 6, priority: 6 },
  { id: 'contract', title: 'Договоры', endpoint: '/contracts', icon: '📃', category: 6, priority: 6 },
  { id: 'order', title: 'Заказы клиентов', endpoint: '/orders', icon: '🛍', category: 6, priority: 6 },
  { id: 'shipment', title: 'Отгрузки', endpoint: '/shipments', icon: '🚚', category: 6, priority: 10 },
  { id: 'cart-session', title: 'Корзины (сессии)', endpoint: '/cart-sessions', icon: '🛒', category: 6, priority: 10, skipCount: true },
  { id: 'cart-item', title: 'Позиции корзины', endpoint: '/cart-items', icon: '🛍', category: 6, priority: 10 },

  // === Category 7: Документы + Финансы (priority 9-10) ===
  { id: 'doc-type', title: 'Типы документов', endpoint: '/doc-types', icon: '📄', category: 7, priority: 9 },
  { id: 'document-template', title: 'Шаблоны документов', endpoint: '/document-templates', icon: '📑', category: 7, priority: 9 },
  { id: 'template-block', title: 'Блоки шаблонов', endpoint: '/template-blocks', icon: '🧩', category: 7, priority: 9 },
  { id: 'table-template', title: 'Шаблоны таблиц', endpoint: '/table-templates', icon: '🗒', category: 7, priority: 9 },
  { id: 'document-table-type', title: 'Типы таблиц документов', endpoint: '/document-table-types', icon: '📊', category: 7, priority: 9 },
  { id: 'reconciliation-act', title: 'Акты сверки', endpoint: '/reconciliation-acts', icon: '⚖', category: 7, priority: 10 },
  { id: 'financial-report', title: 'Финансовые отчёты', endpoint: '/financial-reports', icon: '📈', category: 7, priority: 10 },

  // === Category 8: Система (priority 11) ===
  { id: 'audit', title: 'Аудит', endpoint: '/audit-logs', icon: '🔍', category: 8, priority: 11, roles: ['admin'] },
  { id: 'comment', title: 'Комментарии', endpoint: '/comments', icon: '💬', category: 8, priority: 11 },
  { id: 'import-jobs', title: 'Импорт (задачи)', endpoint: '/import-jobs', icon: '📥', category: 8, priority: 11, roles: ['admin'] },
  { id: 'rate-limit', title: 'Rate Limit', endpoint: '/rate-limits', icon: '⏱', category: 8, priority: 11, roles: ['admin'] },
  { id: 'interaction', title: 'Взаимодействия', endpoint: '/interactions', icon: '🤝', category: 8, priority: 11 },
  { id: 'feature-flag-list', title: 'Флаги функций', endpoint: '/feature-flags', icon: '🚩', category: 8, priority: 11, roles: ['admin'], skipCount: true },

  // === Special: UI Kit Showcase (TZ-35) — uses custom page, not CrudPage ===
  // Note: page-renderer falls back to CrudPage for entries with endpoint, but showcase
  // is a custom page handled via a special id in main-layout / app.routes.
  // The endpoint below is a placeholder — actual content comes from ShowcasePage.
  { id: 'showcase', title: 'UI Kit Showcase', endpoint: '/showcase', icon: '🎨', category: 8, priority: 12, skipCount: true, description: 'Living showcase of all UI primitives (TZ-35)' },
];
