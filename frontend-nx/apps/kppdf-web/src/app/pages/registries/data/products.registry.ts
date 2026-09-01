import type { Router } from '@angular/router';
import type { ProductStatus } from '@kppdf/data-access';
import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { formatMaterialRef, formatMoneyRub } from './material-formatters';
import {
  formatComplexBadge,
  formatProductKind,
  formatProductStatus,
} from './product-formatters';
import { createProductsHttpDataSource, type ProductRow } from './products-http-data-source';
import {
  buildProductCreateAction,
  buildProductRowActions,
} from './product-registry-actions';
import type { PiProductsService } from '@kppdf/data-access';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

export interface ProductRegistryDeps {
  readonly productsService: PiProductsService;
  readonly dialogHost: CatalogRegistryDialogHost;
  readonly router: Router;
  readonly existingPaths: ReadonlySet<string>;
}

const PRODUCT_STATUS_OPTIONS: readonly { value: ProductStatus; label: string }[] = [
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'draft', label: 'Черновик' },
  { value: 'archived', label: 'Архив' },
];

/**
 * TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ — «Изделия» registry:
 * Product rows via `GET /products`. Комплекс — derived Product (product-line
 * in composition), not a separate collection or registry. Badge «Комплекс»
 * appears only when the API explicitly sends `isComplex` on the row.
 */
export function createProductsRegistryDefinition(
  deps: ProductRegistryDeps,
): RegistryDefinition<ProductRow> {
  return {
    key: 'products',
    title: 'Изделия',
    category: 'Каталог',
    description:
      'Изделия каталога (GET /products). Комплекс — производное Product с product-line в составе; отдельной коллекции Complex и реестра «Комплексы» нет.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Изделия не найдены.',
    columns: [
      {
        key: 'name',
        header: 'Название',
        sortable: true,
        format: (r) => r.name,
      },
      {
        key: 'sku',
        header: 'Артикул',
        sortable: true,
        width: '10rem',
        format: (r) => r.sku ?? '—',
      },
      {
        key: 'kind',
        header: 'Тип',
        sortable: false,
        width: '8rem',
        format: (r) => formatProductKind(r.kind),
      },
      {
        key: 'status',
        header: 'Статус',
        sortable: false,
        width: '9rem',
        format: (r) => formatProductStatus(r.status),
      },
      {
        key: 'isComplex',
        header: 'Комплекс',
        sortable: false,
        width: '8rem',
        format: (r) => formatComplexBadge(r),
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
        key: 'listPrice',
        header: 'Цена',
        sortable: true,
        numeric: true,
        align: 'end',
        width: '8rem',
        format: (r) => formatMoneyRub(r.listPrice),
      },
    ],
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Название, артикул…',
        ariaLabel: 'Поиск по изделиям',
      },
      {
        key: 'status',
        label: 'Статус',
        type: 'select',
        ariaLabel: 'Фильтр по статусу изделия',
        options: PRODUCT_STATUS_OPTIONS,
      },
      {
        key: 'isComplex',
        label: 'Комплекс',
        type: 'select',
        ariaLabel: 'Фильтр: комплекс или обычное изделие',
        emptyOptionLabel: 'Все',
        options: [
          { value: 'true', label: 'Комплекс' },
          { value: 'false', label: 'Обычное' },
        ],
      },
    ],
    paginationMode: 'server',
    createAction: buildProductCreateAction(deps),
    rowActions: buildProductRowActions(deps),
    dataSource: createProductsHttpDataSource(deps.productsService),
  };
}

export function createProductsRegistry(deps: ProductRegistryDeps) {
  return defineRegistry(createProductsRegistryDefinition(deps));
}
