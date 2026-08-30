import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiUnitsService, type Unit } from '@kppdf/data-access';
import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { createUnitsHttpDataSource, type UnitRow } from './units-http-data-source';

export type { UnitRow };

function formatActive(row: UnitRow): string {
  if (row.isSystem) return row.isActive ? 'Активна (системная)' : 'Неактивна (системная)';
  return row.isActive ? 'Активна' : 'Неактивна';
}

/**
 * TZ-NX-REGISTRY-UNITS-READ-SLICE — real Units registry wired to
 * `GET /units` + `PATCH /units/:key` (read/filter/pagination/toggle-active).
 */
export function createUnitsRegistryDefinition(
  unitsService: PiUnitsService,
): RegistryDefinition<UnitRow> {
  return {
    key: 'units',
    title: 'Единицы измерения',
    description:
      'Справочник единиц измерения (реальный backend API: GET /units, PATCH /units/:key).',
    source: 'api',
    rowId: (row) => row.key,
    emptyMessage: 'Единицы измерения не найдены.',
    columns: [
      { key: 'key', header: 'Ключ', sortable: false, width: '8rem', format: (r) => r.key },
      { key: 'label', header: 'Название', sortable: false, format: (r) => r.label },
      {
        key: 'symbol',
        header: 'Обозначение',
        sortable: false,
        format: (r) => r.symbol ?? '—',
        width: '10rem',
      },
      {
        key: 'category',
        header: 'Категория',
        sortable: false,
        format: (r) => r.category ?? '—',
        width: '10rem',
      },
      {
        key: 'isActive',
        header: 'Статус',
        sortable: false,
        format: formatActive,
        width: '10rem',
      },
      {
        key: 'sortOrder',
        header: 'Порядок',
        sortable: false,
        numeric: true,
        align: 'end',
        width: '8rem',
        format: (r) => String(r.sortOrder),
      },
    ],
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Ключ, название, обозначение…',
        ariaLabel: 'Поиск по единицам измерения',
      },
      {
        key: 'status',
        label: 'Статус',
        type: 'select',
        ariaLabel: 'Фильтр по статусу',
        options: [
          { value: 'active', label: 'Активные' },
          { value: 'inactive', label: 'Неактивные' },
        ],
      },
    ],
    paginationMode: 'server',
    rowActions: [
      {
        id: 'copy-key',
        label: 'Копировать ключ',
        icon: 'copy',
        tone: 'copy',
        run: (row, ctx) => {
          void copyToClipboard(row.key);
          ctx.notify(`Ключ «${row.key}» скопирован`, 'success');
        },
      },
      {
        id: 'activate',
        label: 'Активировать',
        icon: 'check',
        tone: 'success',
        isDisabled: (row) => row.isActive,
        disabledReason: (row) => (row.isActive ? 'Единица уже активна' : null),
        run: async (row, ctx) => {
          await patchIsActive(unitsService, row, true, ctx);
        },
      },
      {
        id: 'deactivate',
        label: 'Деактивировать',
        icon: 'power',
        tone: 'neutral',
        isDisabled: (row) => !row.isActive,
        disabledReason: (row) => (!row.isActive ? 'Единица уже неактивна' : null),
        run: async (row, ctx) => {
          await patchIsActive(unitsService, row, false, ctx);
        },
      },
    ],
    dataSource: createUnitsHttpDataSource(unitsService),
  };
}

export function createUnitsRegistry(unitsService: PiUnitsService) {
  return defineRegistry(createUnitsRegistryDefinition(unitsService));
}

async function patchIsActive(
  unitsService: PiUnitsService,
  row: Unit,
  isActive: boolean,
  ctx: { reload: () => void; notify: (message: string, tone?: 'success' | 'error') => void },
): Promise<void> {
  const res = await firstValueFrom(unitsService.update(row.key, { isActive }));
  if (!res.ok) {
    ctx.notify(extractErrorMessage(res.error), 'error');
    return;
  }
  ctx.notify(isActive ? 'Единица активирована' : 'Единица деактивирована', 'success');
  ctx.reload();
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard?.writeText?.(text);
  } catch {
    /* clipboard unavailable — no-op */
  }
}
