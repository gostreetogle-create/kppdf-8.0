import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import { createTextBlocksHttpDataSource } from './text-blocks-http-data-source';
import { buildTextBlockActions, buildTextBlockCreateAction, type DocStudioDialogDeps } from './doc-studio-registry-actions';

export function createTextBlocksRegistry(deps: DocStudioDialogDeps ): RegistryDefinition<RegistryRow> {
  const service = deps.textBlocks;
  return defineRegistry({ key: 'text-blocks', title: 'Тексты', description: 'Переиспользуемые текстовые блоки.', source: 'api', paginationMode: 'client', rowId: (row) => row._id, columns: [
    { key: 'name', header: 'Название', format: (row) => row.name },
    { key: 'slug', header: 'Slug', format: (row) => row.slug },
    { key: 'tags', header: 'Теги', format: (row) => row.tags.join(', ') || '—' },
    { key: 'categoryId', header: 'Категория', format: (row) => row.categoryId ?? '—' },
    { key: 'isActive', header: 'Статус', format: (row) => row.isActive ? 'Активен' : 'Архивирован' },
    { key: 'columns', header: 'Колонки', format: (row) => `${row.columns.length}` },
  ], filters: [
    { key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название, slug, тег…' },
    { key: 'categoryId', label: 'Категория', type: 'text' },
    { key: 'isActive', label: 'Статус', type: 'select', options: [{ value: 'true', label: 'Активные' }, { value: 'false', label: 'Архивированные' }] },
  ], createAction: buildTextBlockCreateAction(deps), rowActions: buildTextBlockActions(deps), dataSource: createTextBlocksHttpDataSource(service), emptyMessage: 'Тексты не найдены.' });
}
