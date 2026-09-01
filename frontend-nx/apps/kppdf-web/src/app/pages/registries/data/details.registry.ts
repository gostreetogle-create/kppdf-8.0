import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import {
  formatMaterialKind,
  formatMaterialRef,
  formatMoneyRub,
} from './material-formatters';
import {
  createMaterialsHttpDataSource,
  materialKindFilterOptions,
  type MaterialRow,
} from './materials-http-data-source';
import {
  buildMaterialCreateAction,
  buildMaterialRowActions,
  type MaterialRegistryDialogConfig,
} from './material-registry-actions';
import type { MaterialRegistryDeps } from './materials.registry';

const DETAILS_DIALOG_CONFIG: MaterialRegistryDialogConfig = {
  allowKindSelect: true,
  createLabel: 'Создать деталь',
  entityLabel: 'деталь',
};

function detailActionDeps(deps: MaterialRegistryDeps) {
  return {
    materialsService: deps.materialsService,
    dialogHost: deps.dialogHost,
    router: deps.router,
    existingPaths: deps.existingPaths,
  };
}

/**
 * TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ — «Детали» registry:
 * Material rows with kind part | fastener | purchased | other (not a separate entity).
 */
export function createDetailsRegistryDefinition(
  deps: MaterialRegistryDeps,
): RegistryDefinition<MaterialRow> {
  return {
    key: 'details',
    title: 'Детали',
    category: 'Каталог',
    description:
      'Детали, метизы и покупные позиции — те же Material, что и сырьё. API `GET /materials` принимает один `materialKind` за запрос; по умолчанию показываются только `part`, остальные виды — через фильтр.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Детали не найдены.',
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
        format: (r) => r.article ?? '—',
      },
      {
        key: 'materialKind',
        header: 'Вид',
        sortable: false,
        width: '9rem',
        format: (r) => formatMaterialKind(r.materialKind),
      },
      {
        key: 'unit',
        header: 'Ед.',
        sortable: false,
        width: '5rem',
        format: (r) => r.unit,
      },
      {
        key: 'categoryId',
        header: 'Категория',
        sortable: false,
        width: '11rem',
        format: (r) => formatMaterialRef(r.categoryId),
      },
      {
        key: 'assortment',
        header: 'Сортамент',
        sortable: false,
        width: '10rem',
        format: (r) => r.assortment ?? '—',
      },
      {
        key: 'materialGrade',
        header: 'Марка',
        sortable: false,
        width: '9rem',
        format: (r) => r.materialGrade ?? '—',
      },
      {
        key: 'pricePerUnit',
        header: 'Цена',
        sortable: false,
        numeric: true,
        align: 'end',
        width: '8rem',
        format: (r) => formatMoneyRub(r.pricePerUnit),
      },
    ],
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Название, артикул, SKU…',
        ariaLabel: 'Поиск по деталям',
      },
      {
        key: 'categoryId',
        label: 'Категория (ID)',
        type: 'text',
        placeholder: 'MongoDB ObjectId категории',
        ariaLabel: 'Фильтр по идентификатору категории',
      },
      {
        key: 'materialKind',
        label: 'Вид материала',
        type: 'select',
        ariaLabel: 'Фильтр по виду Material',
        emptyOptionLabel: 'Деталь (part, по умолчанию)',
        options: materialKindFilterOptions(),
      },
    ],
    paginationMode: 'server',
    createAction: buildMaterialCreateAction(detailActionDeps(deps), DETAILS_DIALOG_CONFIG),
    rowActions: buildMaterialRowActions(detailActionDeps(deps), DETAILS_DIALOG_CONFIG),
    dataSource: createMaterialsHttpDataSource(deps.materialsService, 'details'),
  };
}

export function createDetailsRegistry(deps: MaterialRegistryDeps) {
  return defineRegistry(createDetailsRegistryDefinition(deps));
}
