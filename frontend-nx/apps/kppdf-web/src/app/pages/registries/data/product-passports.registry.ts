import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { formatObjectIdRef } from './supply-request-formatters';
import {
  createProductPassportsHttpDataSource,
  type ProductPassportRow,
} from './product-passports-http-data-source';
import type { PiProductPassportsService } from '@kppdf/data-access';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('ru-RU');
}

/**
 * TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ — read-only ProductPassport collection registry.
 * Distinct from computed preview in product dialog (`ProductPassportPreviewComponent`).
 */
export function createProductPassportsRegistryDefinition(
  productPassportsService: PiProductPassportsService,
): RegistryDefinition<ProductPassportRow> {
  return {
    key: 'product-passports',
    title: 'Паспорта изделий',
    description:
      'Снимки паспортов из коллекции ProductPassport (GET /passports). Не путать с вычисляемым предпросмотром в диалоге изделия. Импорт из XLSX и productId-matching — отдельно.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Паспорта не найдены.',
    columns: [
      {
        key: 'passportNumber',
        header: 'Паспорт №',
        sortable: false,
        width: '9rem',
        format: (r) => r.passportNumber,
      },
      {
        key: 'name',
        header: 'Наименование',
        sortable: false,
        format: (r) => r.name ?? '—',
      },
      {
        key: 'article',
        header: 'Артикул',
        sortable: false,
        width: '9rem',
        format: (r) => r.article ?? '—',
      },
      {
        key: 'productId',
        header: 'Изделие (ID)',
        sortable: false,
        width: '11rem',
        format: (r) => formatObjectIdRef(r.productId),
      },
      {
        key: 'date',
        header: 'Дата',
        sortable: false,
        width: '8rem',
        format: (r) => formatDate(r.date),
      },
      {
        key: 'category',
        header: 'Категория',
        sortable: false,
        width: '10rem',
        format: (r) => r.category ?? '—',
      },
      {
        key: 'isActive',
        header: 'Статус',
        sortable: false,
        width: '8rem',
        format: (r) => (r.isActive ? 'Активен' : 'Неактивен'),
      },
    ],
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: '№ паспорта, название, артикул…',
        ariaLabel: 'Поиск по паспортам (на клиенте)',
      },
      {
        key: 'productId',
        label: 'Изделие (ID)',
        type: 'text',
        placeholder: 'MongoDB ObjectId изделия',
        ariaLabel: 'Фильтр по productId на API',
      },
    ],
    paginationMode: 'client',
    dataSource: createProductPassportsHttpDataSource(productPassportsService),
  };
}

export function createProductPassportsRegistry(productPassportsService: PiProductPassportsService) {
  return defineRegistry(createProductPassportsRegistryDefinition(productPassportsService));
}
