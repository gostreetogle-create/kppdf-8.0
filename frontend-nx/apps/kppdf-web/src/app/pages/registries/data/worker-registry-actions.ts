import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { PiPeopleService, Person } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import type { WorkerRegistryDialogHost } from './worker-registry-dialog-host';

export interface WorkerRegistryDeps {
  readonly peopleService: PiPeopleService;
  readonly dialogHost: WorkerRegistryDialogHost;
}

export function buildWorkerCreateAction(deps: WorkerRegistryDeps) {
  return {
    label: 'Создать человека',
    run: (ctx: RegistryActionContext) => deps.dialogHost.openCreate(ctx),
  };
}

export function buildWorkerRowActions(deps: WorkerRegistryDeps): readonly RegistryRowAction<Person>[] {
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
        title: 'Удалить человека?',
        description: 'Человек будет архивирован и исчезнет из активного списка.',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
      },
      run: async (row, ctx) => {
        const result = await firstValueFrom(deps.peopleService.archive(row._id));
        if (!result.ok) {
          ctx.notify(extractErrorMessage(result.error), 'error');
          return;
        }
        ctx.notify('Человек удалён', 'success');
        ctx.reload();
      },
    },
  ];
}
