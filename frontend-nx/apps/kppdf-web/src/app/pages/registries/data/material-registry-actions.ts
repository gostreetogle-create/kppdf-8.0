import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { MaterialKind, PiMaterialsService } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import { buildOpenConstructorRowAction } from './registry-constructor-action';
import type { MaterialRow } from './materials-http-data-source';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';

export interface MaterialRegistryDialogConfig {
  readonly lockMaterialKind?: MaterialKind;
  readonly allowKindSelect: boolean;
  readonly createLabel: string;
  readonly entityLabel: string;
}

export interface MaterialRegistryActionDeps {
  readonly materialsService: PiMaterialsService;
  readonly dialogHost: MaterialRegistryDialogHost;
  readonly router: import('@angular/router').Router;
  readonly existingPaths: ReadonlySet<string>;
}

export function buildMaterialCreateAction(
  deps: MaterialRegistryActionDeps,
  config: MaterialRegistryDialogConfig,
) {
  return {
    label: config.createLabel,
    run: (ctx: RegistryActionContext) => {
      deps.dialogHost.openCreate(ctx, config);
    },
  };
}

export function buildMaterialRowActions(
  deps: MaterialRegistryActionDeps,
  config: MaterialRegistryDialogConfig,
): RegistryRowAction<MaterialRow>[] {
  const actions: RegistryRowAction<MaterialRow>[] = [
    {
      id: 'edit-material',
      label: 'Редактировать',
      icon: 'pencil',
      tone: 'edit',
      run: (row, ctx) => {
        deps.dialogHost.openEdit(row, ctx, config);
      },
    },
    {
      id: 'copy-material',
      label: 'Копировать',
      icon: 'copy',
      tone: 'copy',
      run: async (row, ctx) => {
        const res = await firstValueFrom(deps.materialsService.duplicate(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        ctx.notify('Копия создана', 'success');
        ctx.reload();
      },
    },
    {
      id: 'archive-material',
      label: 'Архивировать',
      icon: 'archive',
      tone: 'destructive',
      destructive: true,
      confirm: {
        title: 'Архивировать запись?',
        description: 'Запись будет скрыта из справочника (мягкое удаление).',
        confirmLabel: 'Архивировать',
        cancelLabel: 'Отмена',
      },
      run: async (row, ctx) => {
        const res = await firstValueFrom(deps.materialsService.archive(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        ctx.notify('Запись архивирована', 'success');
        ctx.reload();
      },
    },
  ];

  const openConstructor = buildOpenConstructorRowAction<MaterialRow>(deps.router, deps.existingPaths);
  if (openConstructor) actions.push(openConstructor);

  return actions;
}
