import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { PiModulesService, ProductModule } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import type { ModuleRow } from './modules-http-data-source';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';
import { createRegistryCrudActions, copyName } from './registry-crud-actions';

export interface ModuleRegistryActionDeps { readonly modulesService: PiModulesService; readonly dialogHost: CatalogRegistryDialogHost; }

export function buildModuleRowActions(deps: ModuleRegistryActionDeps): RegistryRowAction<ModuleRow>[] {
  return [...createRegistryCrudActions<ModuleRow>({
    entityLabel: 'модуль',
    edit: (row, ctx) => deps.dialogHost.openModuleEdit(row, ctx, false),
    copy: (row, ctx) => deps.dialogHost.openModuleCreate(ctx),
    remove: async (row, ctx) => {
      const result = await firstValueFrom(deps.modulesService.archive(row._id));
      if (!result.ok) { ctx.notify(extractErrorMessage(result.error), 'error'); return; }
      ctx.notify('Модуль удалён', 'success'); ctx.reload();
    },
    domainActions: [{ id: 'open-composition', label: 'Открыть состав', icon: 'layers', tone: 'doc', run: (row, ctx) => deps.dialogHost.openModuleEdit(row, ctx, true) }],
  })];
}

export function buildModuleCreateAction(deps: ModuleRegistryActionDeps) { return { label: 'Создать модуль', run: (ctx: RegistryActionContext) => deps.dialogHost.openModuleCreate(ctx) }; }
export function moduleCopyName(row: ModuleRow): string { return copyName(row.name); }
export function moduleRowSample(): ProductModule { return { _id: 'mod-1', name: 'Каркас', article: 'MOD-1' }; }
