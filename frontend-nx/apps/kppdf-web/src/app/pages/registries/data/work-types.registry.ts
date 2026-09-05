import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import type { WorkType } from '@kppdf/data-access';
import { createWorkTypesHttpDataSource } from './work-types-http-data-source';
import { buildWorkTypeCreateAction, buildWorkTypeRowActions, type WorkTypeRegistryDeps } from './work-type-registry-actions';

export function createWorkTypesRegistryDefinition(
  deps: WorkTypeRegistryDeps,
): RegistryDefinition<WorkType> {
  return {
    key: 'work-types',
    title: 'Виды работ',
    category: 'Цех',
    description: 'Рабочий справочник норм, ставок и цветов для планирования на Ганте.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Виды работ не найдены.',
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Название, секция, отдел…',
        ariaLabel: 'Поиск по видам работ',
      },
    ],
    columns: [
      { key: 'name', header: 'Название', sortable: true, format: (row) => row.name },
      { key: 'days', header: 'Дней', sortable: true, numeric: true, align: 'end', format: (row) => row.days == null ? '—' : String(row.days) },
      { key: 'hourlyRate', header: '₽/час', sortable: true, numeric: true, align: 'end', format: (row) => `${row.hourlyRate ?? 0}` },
      { key: 'accentHue', header: 'Цвет', sortable: true, numeric: true, align: 'end', format: (row) => row.accentHue == null ? 'Авто' : String(row.accentHue) },
      { key: 'isActive', header: 'Статус', sortable: true, format: (row) => row.isActive ? 'Активен' : 'Неактивен' },
    ],
    paginationMode: 'client',
    createAction: buildWorkTypeCreateAction(deps),
    rowActions: buildWorkTypeRowActions(deps),
    dataSource: createWorkTypesHttpDataSource(deps.workTypesService),
  };
}

export function createWorkTypesRegistry(deps: WorkTypeRegistryDeps): RegistryDefinition<RegistryRow> {
  return defineRegistry(createWorkTypesRegistryDefinition(deps));
}
