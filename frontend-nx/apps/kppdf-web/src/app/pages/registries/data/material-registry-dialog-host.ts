import type { DestroyRef, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Material } from '@kppdf/data-access';
import { PiMaterialsService } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { extractErrorMessage } from '@kppdf/util-http';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import {
  MaterialFormDialogComponent,
  type MaterialFormDialogData,
} from '../dialogs/material-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';
import type { MaterialRegistryDialogConfig } from './material-registry-actions';

export interface MaterialRegistryDialogHost {
  openCreate(ctx: RegistryActionContext, config: MaterialRegistryDialogConfig): void;
  openEdit(row: Material, ctx: RegistryActionContext, config: MaterialRegistryDialogConfig): void;
}

export interface MaterialRegistryDialogHostDeps {
  readonly dialog: PiDialogService;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
  readonly materialsService: PiMaterialsService;
}

export function createMaterialRegistryDialogHost(
  deps: MaterialRegistryDialogHostDeps,
): MaterialRegistryDialogHost {
  const { dialog, destroyRef, injector, materialsService } = deps;

  function openDialog(
    data: MaterialFormDialogData,
    ctx: RegistryActionContext,
    successMessage: string,
  ): void {
    const ref = dialog.open<Material | null | undefined>(MaterialFormDialogComponent, {
      data,
      parentDestroyRef: destroyRef,
    });
    onDialogCloseOnce(ref, injector, (material) => {
      if (material) {
        ctx.notify(successMessage, 'success');
        ctx.reload();
      }
    });
  }

  return {
    openCreate(ctx, config) {
      openDialog(
        {
          mode: 'create',
          lockMaterialKind: config.lockMaterialKind,
          allowKindSelect: config.allowKindSelect,
          entityLabel: config.entityLabel,
        },
        ctx,
        `${capitalize(config.entityLabel)} создан`,
      );
    },
    openEdit(row, ctx, config) {
      void (async () => {
        const res = await firstValueFrom(materialsService.getById(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        openDialog(
          {
            mode: 'edit',
            material: res.data,
            lockMaterialKind: config.lockMaterialKind,
            allowKindSelect: config.allowKindSelect,
            entityLabel: config.entityLabel,
          },
          ctx,
          `${capitalize(config.entityLabel)} обновлён`,
        );
      })();
    },
  };
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Guard for tests — materials registry always locks raw kind. */
export function resolveLockedMaterialKind(
  lock?: import('@kppdf/data-access').MaterialKind,
): import('@kppdf/data-access').MaterialKind | undefined {
  return lock;
}
