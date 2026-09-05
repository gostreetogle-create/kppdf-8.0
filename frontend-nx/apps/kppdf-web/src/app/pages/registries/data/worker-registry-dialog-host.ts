import type { DestroyRef, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiPeopleService, type Person } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { extractErrorMessage } from '@kppdf/util-http';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import {
  WorkerFormDialogComponent,
  type WorkerFormDialogData,
} from '../dialogs/worker-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';

export interface WorkerRegistryDialogHost {
  openCreate(ctx: RegistryActionContext): void;
  openEdit(row: Person, ctx: RegistryActionContext): void;
}

export interface WorkerRegistryDialogHostDeps {
  readonly dialog: PiDialogService;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
  readonly peopleService: PiPeopleService;
}

export function createWorkerRegistryDialogHost(
  deps: WorkerRegistryDialogHostDeps,
): WorkerRegistryDialogHost {
  function openDialog(data: WorkerFormDialogData, ctx: RegistryActionContext): void {
    const ref = deps.dialog.open<Person | null | undefined>(WorkerFormDialogComponent, {
      data,
      parentDestroyRef: deps.destroyRef,
    });
    onDialogCloseOnce(ref, deps.injector, (person) => {
      if (!person) return;
      ctx.notify(data.mode === 'edit' ? 'Человек обновлён' : 'Человек создан', 'success');
      ctx.reload();
    });
  }

  return {
    openCreate(ctx) {
      openDialog({ mode: 'create', person: null }, ctx);
    },
    openEdit(row, ctx) {
      void (async () => {
        const result = await firstValueFrom(deps.peopleService.getById(row._id));
        if (!result.ok) {
          ctx.notify(extractErrorMessage(result.error), 'error');
          return;
        }
        openDialog({ mode: 'edit', person: result.data }, ctx);
      })();
    },
  };
}
