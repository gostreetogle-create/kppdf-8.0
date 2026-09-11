import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { PiCategoriesService } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import type { CategoryRegistryDialogHost } from './category-registry-dialog-host';
import type { CategoryRow } from './categories-http-data-source';
import { createRegistryCrudActions } from './registry-crud-actions';

export interface CategoryRegistryDeps {
  readonly categoriesService: PiCategoriesService;
  readonly dialogHost: CategoryRegistryDialogHost;
}

export function buildCategoryCreateAction(deps: CategoryRegistryDeps) {
  return {
    label: 'Создать категорию',
    run: (ctx: RegistryActionContext) => deps.dialogHost.openCreate(ctx),
  };
}

export function buildCategoryRowActions(deps: CategoryRegistryDeps): readonly RegistryRowAction<CategoryRow>[] {
  return createRegistryCrudActions<CategoryRow>({
    entityLabel: 'категорию',
    edit: (row, ctx) => deps.dialogHost.openEdit(row, ctx),
    remove: async (row, ctx) => {
      const result = await firstValueFrom(deps.categoriesService.remove(row._id));
      if (!result.ok) return ctx.notify(extractErrorMessage(result.error), 'error');
      ctx.notify('Категория удалена', 'success');
      ctx.reload();
    },
  });
}
