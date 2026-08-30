import type { DestroyRef, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Unit } from '@kppdf/data-access';
import { PiUnitsService } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import { UnitFormDialogComponent } from '../dialogs/unit-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';

export interface UnitsDialogHost {
  openEdit: (row: Unit, ctx: RegistryActionContext) => void | Promise<void>;
}

export interface UnitsDialogHostDeps {
  readonly dialog: PiDialogService;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
  readonly unitsService: PiUnitsService;
}

export function createUnitsDialogHost(deps: UnitsDialogHostDeps): UnitsDialogHost {
  const { dialog, destroyRef, injector } = deps;

  return {
    openEdit(row, ctx) {
      const ref = dialog.open<Unit | null | undefined>(UnitFormDialogComponent, {
        data: { unit: row },
        parentDestroyRef: destroyRef,
      });
      onDialogCloseOnce(ref, injector, (unit) => {
        if (unit) {
          ctx.notify('Единица обновлена', 'success');
          ctx.reload();
        }
      });
    },
  };
}
