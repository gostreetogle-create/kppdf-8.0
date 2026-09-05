import type { DestroyRef, Injector } from '@angular/core';
import { PiWorkTypesService, type WorkType } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import {
  WorkTypeFormDialogComponent,
  type WorkTypeFormDialogData,
} from '../dialogs/work-type-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';

export interface WorkTypeRegistryDialogHost {
  openCreate(ctx: RegistryActionContext): void;
  openEdit(row: WorkType, ctx: RegistryActionContext): void;
}

export interface WorkTypeRegistryDialogHostDeps {
  readonly dialog: PiDialogService;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
  readonly workTypesService: PiWorkTypesService;
}

export function createWorkTypeRegistryDialogHost(
  deps: WorkTypeRegistryDialogHostDeps,
): WorkTypeRegistryDialogHost {
  function openDialog(data: WorkTypeFormDialogData, ctx: RegistryActionContext): void {
    const ref = deps.dialog.open<WorkType | null | undefined>(WorkTypeFormDialogComponent, {
      data,
      parentDestroyRef: deps.destroyRef,
    });
    onDialogCloseOnce(ref, deps.injector, (workType) => {
      if (!workType) return;
      ctx.notify(data.mode === 'edit' ? 'Вид работ обновлён' : 'Вид работ создан', 'success');
      ctx.reload();
    });
  }

  return {
    openCreate(ctx) {
      openDialog({ mode: 'create', workType: null }, ctx);
    },
    openEdit(row, ctx) {
      openDialog({ mode: 'edit', workType: row }, ctx);
    },
  };
}
