import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { createProductPassportsHttpDataSource, type ProductPassportRow } from './product-passports-http-data-source';
import { formatObjectIdRef } from './supply-request-formatters';
import type { PiProductPassportsService } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { simpleCrudActions, openSimpleDialog } from './registry-simple-crud';

export function createProductPassportsRegistryDefinition(service: PiProductPassportsService, dialog = undefined as PiDialogService | undefined): RegistryDefinition<ProductPassportRow> {
  const values = (row: ProductPassportRow) => ({ passportNumber: row.passportNumber, productId: row.productId });
  const actions = dialog ? simpleCrudActions(dialog, service as never, 'passport', 'паспорт', values, (ctx, value) => openSimpleDialog(dialog, 'passport', ctx, value)) : [];
  return { key: 'product-passports', title: 'Паспорта изделий', category: 'Документы', description: 'Паспорта изделий (создание требует productId).', source: 'api', rowId: (row) => row._id, defaultPageSize: 25, emptyMessage: 'Паспорта не найдены.', columns: [{ key: 'passportNumber', header: 'Паспорт №', format: (r) => r.passportNumber }, { key: 'name', header: 'Наименование', format: (r) => r.name ?? '—' }, { key: 'article', header: 'Артикул', format: (r) => r.article ?? '—' }, { key: 'productId', header: 'Изделие', format: (r) => formatObjectIdRef(r.productId) }, { key: 'date', header: 'Дата', format: (r) => r.date ?? '—' }, { key: 'category', header: 'Категория', format: (r) => r.category ?? '—' }, { key: 'isActive', header: 'Статус', format: (r) => r.isActive ? 'Активен' : 'Неактивен' }], filters: [{ key: 'search', label: 'Поиск', type: 'text' }, { key: 'productId', label: 'Изделие', type: 'text' }], paginationMode: 'client', createAction: dialog ? { label: 'Создать паспорт', run: (ctx) => openSimpleDialog(dialog, 'passport', ctx) } : undefined, rowActions: actions, dataSource: createProductPassportsHttpDataSource(service) };
}
export function createProductPassportsRegistry(service: PiProductPassportsService, dialog?: PiDialogService) { return defineRegistry(createProductPassportsRegistryDefinition(service, dialog)); }
