import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { PiWorkTypesService, WorkType } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import type { WorkTypeRegistryDialogHost } from './work-type-registry-dialog-host';

export interface WorkTypeRegistryDeps {
  readonly workTypesService: PiWorkTypesService;
  readonly dialogHost: WorkTypeRegistryDialogHost;
}

export function buildWorkTypeCreateAction(deps: WorkTypeRegistryDeps) {
  return {
    label: 'Создать вид работ',
    run: (ctx: RegistryActionContext) => deps.dialogHost.openCreate(ctx),
  };
}

export function buildWorkTypeRowActions(deps: WorkTypeRegistryDeps): readonly RegistryRowAction<WorkType>[] {
  return [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: 'pencil',
      tone: 'edit',
      run: (row, ctx) => deps.dialogHost.openEdit(row, ctx),
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: 'x',
      tone: 'destructive',
      destructive: true,
      confirm: {
        title: 'Удалить вид работ?',
        description: 'Вид работ будет архивирован и исчезнет из активного списка.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      },
      run: async (row, ctx) => {
        const result = await firstValueFrom(deps.workTypesService.archive(row._id));
        if (!result.ok) {
          ctx.notify(extractErrorMessage(result.error), 'error');
          return;
        }
        ctx.notify('Вид работ удалён', 'success');
        ctx.reload();
      },
    },
  ];
}
