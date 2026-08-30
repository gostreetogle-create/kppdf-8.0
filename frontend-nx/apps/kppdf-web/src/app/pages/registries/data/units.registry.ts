import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiUnitsService, type Unit } from '@kppdf/data-access';
import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { createUnitsHttpDataSource, type UnitRow } from './units-http-data-source';
import { createRegistryCrudActions } from './registry-crud-actions';
import { createUnitsDialogHost } from './units-dialog-host';

export type { UnitRow };

function formatActive(row: UnitRow): string {
  if (row.isSystem) return row.isActive ? 'Активна (системная)' : 'Неактивна (системная)';
  return row.isActive ? 'Активна' : 'Неактивна';
}

export interface UnitsRegistryDeps { readonly unitsService: PiUnitsService; readonly dialogHost: ReturnType<typeof createUnitsDialogHost>; }

export function createUnitsRegistryDefinition(deps: UnitsRegistryDeps): RegistryDefinition<UnitRow> {
  const unitsService = deps.unitsService;
  return {
    key: 'units', title: 'Единицы измерения',
    description: 'Справочник единиц измерения (GET /units, PATCH /units/:key, DELETE /units/:key).',
    source: 'api', rowId: (row) => row.key, emptyMessage: 'Единицы измерения не найдены.',
    columns: [
      { key: 'key', header: 'Ключ', sortable: false, width: '8rem', format: (r) => r.key },
      { key: 'label', header: 'Название', sortable: false, format: (r) => r.label },
      { key: 'symbol', header: 'Обозначение', sortable: false, format: (r) => r.symbol ?? '—', width: '10rem' },
      { key: 'category', header: 'Категория', sortable: false, format: (r) => r.category ?? '—', width: '10rem' },
      { key: 'isActive', header: 'Статус', sortable: false, format: formatActive, width: '10rem' },
      { key: 'sortOrder', header: 'Порядок', sortable: false, numeric: true, align: 'end', width: '8rem', format: (r) => String(r.sortOrder) },
    ],
    filters: [
      { key: 'search', label: 'Поиск', type: 'text', placeholder: 'Ключ, название, обозначение…', ariaLabel: 'Поиск по единицам измерения' },
      { key: 'status', label: 'Статус', type: 'select', ariaLabel: 'Фильтр по статусу', options: [{ value: 'active', label: 'Активные' }, { value: 'inactive', label: 'Неактивные' }] },
    ],
    paginationMode: 'server',
    rowActions: createRegistryCrudActions<UnitRow>({
      entityLabel: 'единицу измерения',
      edit: (row, ctx) => deps.dialogHost.openEdit(row, ctx),
      remove: async (row, ctx) => {
        const result = await firstValueFrom(unitsService.remove(row.key));
        if (!result.ok) { ctx.notify(extractErrorMessage(result.error), 'error'); return; }
        ctx.notify('Единица удалена', 'success'); ctx.reload();
      },
      domainActions: [
        {
          id: 'activate', label: 'Активировать', icon: 'check', tone: 'success',
          isDisabled: (row) => row.isActive,
          disabledReason: (row) => row.isActive ? 'Единица уже активна' : null,
          run: (row, ctx) => patchIsActive(unitsService, row, true, ctx),
        },
        {
          id: 'deactivate', label: 'Деактивировать', icon: 'power', tone: 'neutral',
          isDisabled: (row) => !row.isActive,
          disabledReason: (row) => !row.isActive ? 'Единица уже неактивна' : null,
          run: (row, ctx) => patchIsActive(unitsService, row, false, ctx),
        },
      ],
    }),
    dataSource: createUnitsHttpDataSource(unitsService),
  };
}

export function createUnitsRegistry(unitsService: PiUnitsService, dialogHost: UnitsRegistryDeps['dialogHost']) {
  return defineRegistry(createUnitsRegistryDefinition({ unitsService, dialogHost }));
}

async function patchIsActive(unitsService: PiUnitsService, row: Unit, isActive: boolean, ctx: { reload: () => void; notify: (message: string, tone?: 'success' | 'error') => void }): Promise<void> {
  const result = await firstValueFrom(unitsService.update(row.key, { isActive }));
  if (!result.ok) { ctx.notify(extractErrorMessage(result.error), 'error'); return; }
  ctx.notify(isActive ? 'Единица активирована' : 'Единица деактивирована', 'success'); ctx.reload();
}
