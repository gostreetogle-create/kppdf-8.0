import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { PiModulesService, ProductModule } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import type { ModuleRow } from './modules-http-data-source';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

export interface ModuleRegistryActionDeps {
  readonly modulesService: PiModulesService;
  readonly dialogHost: CatalogRegistryDialogHost;
}

export function buildModuleRowActions(
  deps: ModuleRegistryActionDeps,
): RegistryRowAction<ModuleRow>[] {
  return [
    {
      id: 'edit-module',
      label: 'Редактировать',
      icon: 'pencil',
      tone: 'edit',
      run: (row, ctx) => {
        deps.dialogHost.openModuleEdit(row, ctx, false);
      },
    },
    {
      id: 'open-composition',
      label: 'Открыть состав',
      icon: 'layers',
      tone: 'doc',
      run: (row, ctx) => {
        deps.dialogHost.openModuleEdit(row, ctx, true);
      },
    },
    {
      id: 'archive-module',
      label: 'Архивировать',
      icon: 'archive',
      tone: 'destructive',
      destructive: true,
      confirm: {
        title: 'Архивировать модуль?',
        description: 'Модуль будет скрыт из справочника (мягкое удаление).',
        confirmLabel: 'Архивировать',
        cancelLabel: 'Отмена',
      },
      run: async (row, ctx) => {
        const res = await firstValueFrom(deps.modulesService.archive(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        ctx.notify('Модуль архивирован', 'success');
        ctx.reload();
      },
    },
  ];
}

export function buildModuleCreateAction(deps: ModuleRegistryActionDeps) {
  return {
    label: 'Создать модуль',
    run: (ctx: RegistryActionContext) => deps.dialogHost.openModuleCreate(ctx),
  };
}

/** @internal test helper */
export function moduleRowSample(): ProductModule {
  return { _id: 'mod-1', name: 'Каркас', article: 'MOD-1' };
}
