import type { Router } from '@angular/router';
import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import {
  formatMaterialRef,
  formatMoneyRub,
} from './material-formatters';
import {
  createMaterialsHttpDataSource,
  type MaterialRow,
} from './materials-http-data-source';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';
import {
  buildMaterialCreateAction,
  buildMaterialRowActions,
  type MaterialRegistryDialogConfig,
} from './material-registry-actions';
import type { PiMaterialsService } from '@kppdf/data-access';

export interface MaterialRegistryDeps {
  readonly materialsService: PiMaterialsService;
  readonly router: Router;
  readonly existingPaths: ReadonlySet<string>;
  readonly dialogHost: MaterialRegistryDialogHost;
}

const MATERIALS_DIALOG_CONFIG: MaterialRegistryDialogConfig = {
  lockMaterialKind: 'raw',
  allowKindSelect: false,
  createLabel: 'Создать материал',
  entityLabel: 'материал',
};

const SHARED_COLUMNS = [
  {
    key: 'name' as const,
    header: 'Название',
    sortable: false,
    format: (r: MaterialRow) => r.name,
  },
  {
    key: 'article' as const,
    header: 'Артикул',
    sortable: false,
    width: '10rem',
    format: (r: MaterialRow) => r.article ?? '—',
  },
  {
    key: 'sku' as const,
    header: 'Внутр. код',
    sortable: false,
    width: '9rem',
    format: (r: MaterialRow) => r.sku ?? '—',
  },
  {
    key: 'unit' as const,
    header: 'Ед.',
    sortable: false,
    width: '5rem',
    format: (r: MaterialRow) => r.unit,
  },
  {
    key: 'categoryId' as const,
    header: 'Категория',
    sortable: false,
    width: '11rem',
    format: (r: MaterialRow) => formatMaterialRef(r.categoryId),
  },
  {
    key: 'materialGrade' as const,
    header: 'Марка',
    sortable: false,
    width: '9rem',
    format: (r: MaterialRow) => r.materialGrade ?? '—',
  },
  {
    key: 'assortment' as const,
    header: 'Сортамент',
    sortable: false,
    width: '10rem',
    format: (r: MaterialRow) => r.assortment ?? '—',
  },
  {
    key: 'pricePerUnit' as const,
    header: 'Цена',
    sortable: false,
    numeric: true,
    align: 'end' as const,
    width: '8rem',
    format: (r: MaterialRow) => formatMoneyRub(r.pricePerUnit),
  },
];

function buildSharedFilters() {
  return [
    {
      key: 'search',
      label: 'Поиск',
      type: 'text' as const,
      placeholder: 'Название, артикул, SKU…',
      ariaLabel: 'Поиск по материалам',
    },
    {
      key: 'categoryId',
      label: 'Категория (ID)',
      type: 'text' as const,
      placeholder: 'MongoDB ObjectId категории',
      ariaLabel: 'Фильтр по идентификатору категории',
    },
  ];
}

function materialActionDeps(deps: MaterialRegistryDeps) {
  return {
    materialsService: deps.materialsService,
    dialogHost: deps.dialogHost,
    router: deps.router,
    existingPaths: deps.existingPaths,
  };
}

/**
 * TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ + TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS —
 * «Материалы» registry: Material rows with `materialKind = raw`.
 */
export function createMaterialsRegistryDefinition(
  deps: MaterialRegistryDeps,
): RegistryDefinition<MaterialRow> {
  const actionDeps = materialActionDeps(deps);
  return {
    key: 'materials',
    title: 'Материалы',
    category: 'Каталог',
    description:
      'Сырьё и листовые материалы каталога (GET /materials, materialKind=raw). Деталь — тот же Material с другим kind, см. реестр «Детали».',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Материалы не найдены.',
    columns: SHARED_COLUMNS,
    filters: buildSharedFilters(),
    paginationMode: 'server',
    createAction: buildMaterialCreateAction(actionDeps, MATERIALS_DIALOG_CONFIG),
    rowActions: buildMaterialRowActions(actionDeps, MATERIALS_DIALOG_CONFIG),
    dataSource: createMaterialsHttpDataSource(deps.materialsService, 'materials'),
  };
}

export function createMaterialsRegistry(deps: MaterialRegistryDeps) {
  return defineRegistry(createMaterialsRegistryDefinition(deps));
}
