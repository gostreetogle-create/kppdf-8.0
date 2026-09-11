import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import { createTextBlockCategoriesHttpDataSource, type TextBlockCategoryRow } from './text-block-categories-http-data-source';
import {
  buildTextBlockCategoryActions,
  buildTextBlockCategoryCreateAction,
  type DocStudioDialogDeps,
} from './doc-studio-registry-actions';

/**
 * TZ-NX-REG-TEXT-BLOCK-CATEGORIES — flat registry replacing the standalone
 * `/dictionaries/text-block-categories` master-detail page (audit
 * 2026-09-11-reference-nav-vs-registries.md). `path` column carries the
 * root→sub breadcrumb in place of the old page's two-tier layout.
 */
export function createTextBlockCategoriesRegistry(deps: DocStudioDialogDeps): RegistryDefinition<RegistryRow> {
  const service = deps.categories;
  return defineRegistry<TextBlockCategoryRow>({
    key: 'text-block-categories',
    title: 'Категории текстов',
    category: 'Документы',
    description: 'Дерево категорий для текстовых блоков (корень → подкатегория).',
    source: 'api',
    paginationMode: 'client',
    rowId: (row) => row._id,
    columns: [
      { key: 'name', header: 'Имя', format: (row) => row.name },
      { key: 'path', header: 'Путь', format: (row) => row.path },
      { key: 'isSystem', header: 'Системная', format: (row) => (row.isSystem ? 'Да' : '—') },
      { key: 'isDefault', header: 'По умолчанию', format: (row) => (row.isDefault ? 'Да' : '—') },
      { key: 'isActive', header: 'Статус', format: (row) => (row.isActive ? 'Активна' : 'Архивирована') },
    ],
    filters: [
      { key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название…' },
      {
        key: 'rootsOnly',
        label: 'Только корневые',
        type: 'select',
        options: [{ value: 'true', label: 'Только корневые' }],
      },
    ],
    createAction: buildTextBlockCategoryCreateAction(deps),
    rowActions: buildTextBlockCategoryActions(deps),
    dataSource: createTextBlockCategoriesHttpDataSource(service),
    emptyMessage: 'Категории не найдены.',
  });
}
