import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import { createTableTemplatesHttpDataSource } from './table-templates-http-data-source';
import { buildTableTemplateActions, buildTableTemplateCreateAction, type DocStudioDialogDeps } from './doc-studio-registry-actions';

export function createTableTemplatesRegistry(deps: DocStudioDialogDeps): RegistryDefinition<RegistryRow> {
  return defineRegistry({ key: 'table-templates', title: 'Виды таблиц', category: 'Документы', description: 'Переиспользуемые шаблоны колонок таблиц.', source: 'api', paginationMode: 'client', rowId: (row) => row._id, columns: [
    { key: 'name', header: 'Название', format: (row) => row.name },
    { key: 'category', header: 'Категория', format: (row) => row.category ?? '—' },
    { key: 'dataSource', header: 'Источник данных', format: (row) => row.dataSource ?? '—' },
    { key: 'columns', header: 'Колонки', format: (row) => `${row.columns.length}` },
    { key: 'isActive', header: 'Статус', format: (row) => row.isActive ? 'Активен' : 'Архивирован' },
  ], filters: [{ key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название или описание…' }, { key: 'category', label: 'Категория', type: 'select', options: [{ value: 'product-spec', label: 'Спецификация товара' }, { value: 'cost-calc', label: 'Калькуляция' }, { value: 'order-summary', label: 'Итоги заказа' }, { value: 'price-list', label: 'Прайс-лист' }, { value: 'custom', label: 'Пользовательский' }, { value: 'kp', label: 'КП' }] }], createAction: buildTableTemplateCreateAction(deps), rowActions: buildTableTemplateActions(deps), dataSource: createTableTemplatesHttpDataSource(deps.templates), emptyMessage: 'Виды таблиц не найдены.' });
}
