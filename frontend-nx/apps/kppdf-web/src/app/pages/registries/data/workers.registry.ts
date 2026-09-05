import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import { personDisplayName, type Person } from '@kppdf/data-access';
import { createWorkersHttpDataSource } from './workers-http-data-source';
import { buildWorkerCreateAction, buildWorkerRowActions, type WorkerRegistryDeps } from './worker-registry-actions';

export function createWorkersRegistryDefinition(
  deps: WorkerRegistryDeps,
): RegistryDefinition<Person> {
  return {
    key: 'workers',
    title: 'Люди',
    category: 'Цех',
    description: 'Люди и их навыки видов работ для назначения на Ганте.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Люди не найдены.',
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'ФИО, должность, отдел, email…',
        ariaLabel: 'Поиск по людям',
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
    columns: [
      { key: 'lastName', header: 'ФИО', sortable: false, format: (row) => personDisplayName(row) },
      { key: 'position', header: 'Должность', sortable: false, format: (row) => row.position ?? '—' },
      { key: 'department', header: 'Отдел', sortable: false, format: (row) => row.department ?? '—' },
      { key: 'isActive', header: 'Статус', sortable: false, format: (row) => row.isActive ? 'Активен' : 'Неактивен' },
      { key: 'workTypeIds', header: 'Виды работ', sortable: false, numeric: true, align: 'end', format: (row) => String(row.workTypeIds?.length ?? 0) },
    ],
    paginationMode: 'server',
    createAction: buildWorkerCreateAction(deps),
    rowActions: buildWorkerRowActions(deps),
    dataSource: createWorkersHttpDataSource(deps.peopleService),
  };
}

export function createWorkersRegistry(deps: WorkerRegistryDeps): RegistryDefinition<RegistryRow> {
  return defineRegistry(createWorkersRegistryDefinition(deps));
}
