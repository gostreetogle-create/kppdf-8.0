import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { createFixtureDataSource } from './fixture-registry-data-source';

export type DepartmentStatus = 'active' | 'archived';

export interface DepartmentRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly headcount: number;
  readonly status: DepartmentStatus;
  readonly lead: string;
  readonly note: string;
}

let rows: DepartmentRow[] = [
  {
    id: 'd-1',
    code: 'PROD',
    name: 'Производство',
    headcount: 18,
    status: 'active',
    lead: 'Иванов И.И.',
    note: 'Основной цех, две смены.',
  },
  {
    id: 'd-2',
    code: 'SUPPLY',
    name: 'Снабжение',
    headcount: 4,
    status: 'active',
    lead: 'Петрова А.С.',
    note: 'Закупки материалов и логистика.',
  },
  {
    id: 'd-3',
    code: 'SALES',
    name: 'Продажи',
    headcount: 6,
    status: 'active',
    lead: 'Сидоров К.В.',
    note: 'КП, договоры, работа с заказчиками.',
  },
  {
    id: 'd-4',
    code: 'DESIGN',
    name: 'Проектирование',
    headcount: 3,
    status: 'active',
    lead: 'Кузнецова Е.П.',
    note: 'Комбайн и очередь проектирования.',
  },
  {
    id: 'd-5',
    code: 'WH',
    name: 'Склад',
    headcount: 5,
    status: 'active',
    lead: 'Морозов Д.А.',
    note: 'Остатки, движения, отгрузка.',
  },
  {
    id: 'd-6',
    code: 'ADMIN',
    name: 'Администрация',
    headcount: 2,
    status: 'active',
    lead: 'Волкова Н.М.',
    note: '',
  },
  {
    id: 'd-7',
    code: 'LEGACY',
    name: 'Старый цех №2',
    headcount: 0,
    status: 'archived',
    lead: '—',
    note: 'Закрыт, оставлен для истории.',
  },
];

function matchFilter(row: DepartmentRow, key: string, value: string): boolean {
  if (key === 'search') {
    const needle = value.trim().toLowerCase();
    return (
      row.code.toLowerCase().includes(needle) ||
      row.name.toLowerCase().includes(needle) ||
      row.lead.toLowerCase().includes(needle)
    );
  }
  if (key === 'status') {
    return row.status === value;
  }
  return true;
}

function sortAccessor(row: DepartmentRow, key: string): string | number {
  switch (key) {
    case 'code':
      return row.code;
    case 'name':
      return row.name;
    case 'headcount':
      return row.headcount;
    default:
      return '';
  }
}

export const DEPARTMENTS_REGISTRY_DEFINITION: RegistryDefinition<DepartmentRow> = {
  key: 'departments',
  title: 'Отделы',
  description: 'Демо-реестр: отделы компании (фикстура, без backend). Раскрываемые строки.',
  source: 'demo',
  rowId: (row) => row.id,
  recordCount: () => rows.length,
  defaultSort: { key: 'name', direction: 'asc' },
  emptyMessage: 'Отделы не найдены.',
  columns: [
    { key: 'code', header: 'Код', sortable: true, width: '8rem', format: (r) => r.code },
    { key: 'name', header: 'Название', sortable: true, format: (r) => r.name },
    {
      key: 'headcount',
      header: 'Численность',
      sortable: true,
      numeric: true,
      align: 'end',
      width: '10rem',
      format: (r) => String(r.headcount),
    },
    {
      key: 'status',
      header: 'Статус',
      format: (r) => (r.status === 'active' ? 'Действует' : 'Архив'),
      width: '8rem',
    },
  ],
  filters: [
    {
      key: 'search',
      label: 'Поиск',
      type: 'text',
      placeholder: 'Код, название, руководитель…',
      ariaLabel: 'Поиск по отделам',
    },
    {
      key: 'status',
      label: 'Статус',
      type: 'select',
      ariaLabel: 'Фильтр по статусу отдела',
      options: [
        { value: 'active', label: 'Действующие' },
        { value: 'archived', label: 'Архивные' },
      ],
    },
  ],
  paginationMode: 'fixture',
  expandable: {
    ariaLabel: (row) => `Подробности отдела «${row.name}»`,
    fields: (row) => [
      { label: 'Руководитель', value: row.lead },
      { label: 'Численность', value: String(row.headcount) },
      { label: 'Заметка', value: row.note || '—' },
    ],
  },
  rowActions: [
    {
      id: 'copy-code',
      label: 'Копировать код',
      icon: 'copy',
      tone: 'copy',
      run: (row, ctx) => {
        void copyToClipboard(row.code);
        ctx.notify(`Код «${row.code}» скопирован`, 'success');
      },
    },
    {
      id: 'archive',
      label: 'Архивировать',
      icon: 'archive',
      tone: 'destructive',
      destructive: true,
      isDisabled: (row) => row.status === 'archived',
      disabledReason: (row) => (row.status === 'archived' ? 'Отдел уже архивный' : null),
      confirm: {
        title: 'Архивировать отдел?',
        description: 'Отдел будет помечен архивным в демо-реестре.',
        confirmLabel: 'Архивировать',
        cancelLabel: 'Отмена',
      },
      run: (row, ctx) => {
        rows = rows.map((r) => (r.id === row.id ? { ...r, status: 'archived' as const } : r));
        ctx.notify('Отдел архивирован', 'success');
        ctx.reload();
      },
    },
  ],
  dataSource: createFixtureDataSource<DepartmentRow>({
    rows: () => rows,
    matchFilter,
    sortAccessor,
    latencyMs: 300,
    failFirstAttempt: true,
  }),
};

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard?.writeText?.(text);
  } catch {
    /* clipboard unavailable (e.g. no user gesture context in some browsers) — no-op */
  }
}

export const DEPARTMENTS_REGISTRY = defineRegistry(DEPARTMENTS_REGISTRY_DEFINITION);
