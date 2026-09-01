import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { createModulesHttpDataSource, type ModuleRow } from './modules-http-data-source';
import { formatModuleDimensions } from './product-formatters';
import {
  buildModuleCreateAction,
  buildModuleRowActions,
} from './module-registry-actions';
import type { PiModulesService } from '@kppdf/data-access';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

export interface ModuleRegistryDeps {
  readonly modulesService: PiModulesService;
  readonly dialogHost: CatalogRegistryDialogHost;
}

/**
 * TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ — «Модули» registry:
 * ProductModule rows via `GET /modules` (list-all, client-side paging only).
 */
export function createModulesRegistryDefinition(
  deps: ModuleRegistryDeps,
): RegistryDefinition<ModuleRow> {
  return {
    key: 'modules',
    title: 'Модули',
    category: 'Каталог',
    description:
      'Переиспользуемые модули каталога (GET /modules). Backend отдаёт полный список без пагинации — страницы в UI нарезаются на клиенте.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Модули не найдены.',
    filters: [{ key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название или артикул…', ariaLabel: 'Поиск по модулям' }],
    columns: [
      {
        key: 'name',
        header: 'Название',
        sortable: false,
        format: (r) => r.name,
      },
      {
        key: 'article',
        header: 'Артикул',
        sortable: false,
        width: '10rem',
        format: (r) => r.article,
      },
      {
        key: 'sortOrder',
        header: 'Порядок',
        sortable: false,
        numeric: true,
        align: 'end',
        width: '7rem',
        format: (r) => (r.sortOrder !== undefined ? String(r.sortOrder) : '—'),
      },
      {
        key: 'dimensions',
        header: 'Габариты',
        sortable: false,
        width: '11rem',
        format: (r) => formatModuleDimensions(r.dimensions),
      },
      {
        key: 'weight',
        header: 'Вес',
        sortable: false,
        numeric: true,
        align: 'end',
        width: '7rem',
        format: (r) => (r.weight !== undefined ? String(r.weight) : '—'),
      },
    ],
    paginationMode: 'client',
    createAction: buildModuleCreateAction(deps),
    rowActions: buildModuleRowActions(deps),
    dataSource: createModulesHttpDataSource(deps.modulesService),
  };
}

export function createModulesRegistry(deps: ModuleRegistryDeps) {
  return defineRegistry(createModulesRegistryDefinition(deps));
}
