import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import {
  formatObjectIdRef,
  formatSupplyRequestPriority,
  formatSupplyRequestStatus,
  SUPPLY_REQUEST_PRIORITY_LABELS,
  SUPPLY_REQUEST_STATUS_LABELS,
} from './supply-request-formatters';
import {
  createSupplyRequestsHttpDataSource,
  type SupplyRequestRow,
} from './supply-requests-http-data-source';
import { SUPPLY_REQUESTS_LIST_CAP, type PiSupplyRequestsService } from '@kppdf/data-access';

/**
 * TZ-NX-SUPPLY-REQUEST-REGISTRY-READ — read-only supply quick-order lines.
 */
export function createSupplyRequestsRegistryDefinition(
  supplyRequestsService: PiSupplyRequestsService,
): RegistryDefinition<SupplyRequestRow> {
  return {
    key: 'supply-requests',
    title: 'Заявки снабжения',
    description:
      `Быстрые заявки снабжения (GET /supply-requests). Backend отдаёт до ${SUPPLY_REQUESTS_LIST_CAP} строк без server-side пагинации — страницы нарезаются на клиенте.`,
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Заявки снабжения не найдены.',
    columns: [
      {
        key: 'title',
        header: 'Наименование',
        sortable: false,
        format: (r) => r.title ?? '—',
      },
      {
        key: 'article',
        header: 'Артикул',
        sortable: false,
        width: '10rem',
        format: (r) => r.article ?? '—',
      },
      {
        key: 'qty',
        header: 'Кол-во',
        sortable: false,
        numeric: true,
        align: 'end',
        width: '6rem',
        format: (r) => String(r.qty),
      },
      {
        key: 'unit',
        header: 'Ед.',
        sortable: false,
        width: '5rem',
        format: (r) => r.unit ?? '—',
      },
      {
        key: 'status',
        header: 'Статус',
        sortable: false,
        width: '9rem',
        format: (r) => formatSupplyRequestStatus(r.status),
      },
      {
        key: 'priority',
        header: 'Приоритет',
        sortable: false,
        width: '8rem',
        format: (r) => formatSupplyRequestPriority(r.priority),
      },
      {
        key: 'supplierId',
        header: 'Поставщик (ID)',
        sortable: false,
        width: '11rem',
        format: (r) => formatObjectIdRef(r.supplierId),
      },
      {
        key: 'requestedBy',
        header: 'Заказчик',
        sortable: false,
        width: '10rem',
        format: (r) => r.requestedBy ?? '—',
      },
    ],
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Название, артикул, примечание…',
        ariaLabel: 'Поиск по заявкам снабжения',
      },
      {
        key: 'status',
        label: 'Статус',
        type: 'select',
        ariaLabel: 'Фильтр по статусу заявки',
        options: Object.entries(SUPPLY_REQUEST_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'priority',
        label: 'Приоритет',
        type: 'select',
        ariaLabel: 'Фильтр по приоритету',
        options: Object.entries(SUPPLY_REQUEST_PRIORITY_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'orderId',
        label: 'Заказ (ID)',
        type: 'text',
        placeholder: 'MongoDB ObjectId заказа',
        ariaLabel: 'Фильтр по идентификатору заказа',
      },
    ],
    paginationMode: 'client',
    dataSource: createSupplyRequestsHttpDataSource(supplyRequestsService),
  };
}

export function createSupplyRequestsRegistry(supplyRequestsService: PiSupplyRequestsService) {
  return defineRegistry(createSupplyRequestsRegistryDefinition(supplyRequestsService));
}
