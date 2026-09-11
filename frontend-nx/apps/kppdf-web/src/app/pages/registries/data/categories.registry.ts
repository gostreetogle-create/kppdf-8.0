import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import { createCategoriesHttpDataSource, categoryTypeLabel, type CategoryRow } from './categories-http-data-source';
import { buildCategoryCreateAction, buildCategoryRowActions, type CategoryRegistryDeps } from './category-registry-actions';
import { CATEGORY_TYPE_OPTIONS } from '../dialogs/category-form-dialog.component';

/**
 * TZ-NX-REG-CATEGORIES-CRUD — «Категории» registry (section «Справочники»).
 * Reuses the existing `Category` API end to end; wired into
 * material/product/module forms by the follow-up TZs of this wave.
 */
export function createCategoriesRegistryDefinition(deps: CategoryRegistryDeps): RegistryDefinition<CategoryRow> {
  return {
    key: 'categories',
    title: 'Категории',
    category: 'Справочники',
    description: 'Категории деталей, изделий и модулей (Category API).',
    source: 'api',
    paginationMode: 'client',
    rowId: (row) => row._id,
    columns: [
      { key: 'name', header: 'Название', format: (row) => row.name },
      { key: 'type', header: 'Категория чего', format: (row) => categoryTypeLabel(row.type) },
      { key: 'skuPrefix', header: 'Префикс SKU', format: (row) => row.skuPrefix },
      { key: 'parentName', header: 'Родитель', format: (row) => row.parentName },
      { key: 'isActive', header: 'Статус', format: (row) => (row.isActive ? 'Активна' : 'Архивирована') },
    ],
    filters: [
      { key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название…' },
      {
        key: 'type',
        label: 'Категория чего',
        type: 'select',
        options: CATEGORY_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
      },
    ],
    createAction: buildCategoryCreateAction(deps),
    rowActions: buildCategoryRowActions(deps),
    dataSource: createCategoriesHttpDataSource(deps.categoriesService),
    emptyMessage: 'Категории не найдены.',
  };
}

export function createCategoriesRegistry(deps: CategoryRegistryDeps): RegistryDefinition<RegistryRow> {
  return defineRegistry(createCategoriesRegistryDefinition(deps));
}
