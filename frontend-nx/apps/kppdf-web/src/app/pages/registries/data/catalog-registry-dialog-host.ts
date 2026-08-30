import type { DestroyRef, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiModulesService,
  PiProductsService,
  type ProductDetail,
  type ProductModule,
} from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { extractErrorMessage } from '@kppdf/util-http';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import {
  ModuleFormDialogComponent,
  type ModuleFormDialogData,
} from '../dialogs/module-form-dialog.component';
import {
  ProductFormDialogComponent,
  type ProductFormDialogData,
} from '../dialogs/product-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';

export interface CatalogRegistryDialogHost {
  openModuleCreate(ctx: RegistryActionContext): void;
  openModuleEdit(row: ProductModule, ctx: RegistryActionContext, focusComposition?: boolean): void;
  openProductCreate(ctx: RegistryActionContext): void;
  openProductEdit(row: ProductDetail, ctx: RegistryActionContext, focusComposition?: boolean): void;
}

export interface CatalogRegistryDialogHostDeps {
  readonly dialog: PiDialogService;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
  readonly modulesService: PiModulesService;
  readonly productsService: PiProductsService;
}

export function createCatalogRegistryDialogHost(
  deps: CatalogRegistryDialogHostDeps,
): CatalogRegistryDialogHost {
  const { dialog, destroyRef, injector, modulesService, productsService } = deps;

  function afterModuleClose(
    ctx: RegistryActionContext,
    result: ProductModule | null | undefined,
    successVerb: string,
  ): void {
    if (result) {
      ctx.notify(`Модуль ${successVerb}`, 'success');
      ctx.reload();
    }
  }

  function afterProductClose(
    ctx: RegistryActionContext,
    result: ProductDetail | null | undefined,
    successVerb: string,
  ): void {
    if (result) {
      ctx.notify(`Изделие ${successVerb}`, 'success');
      ctx.reload();
    }
  }

  function openModuleDialog(
    data: ModuleFormDialogData,
    ctx: RegistryActionContext,
    successVerb: string,
  ): void {
    const ref = dialog.open<ProductModule | null | undefined>(ModuleFormDialogComponent, {
      data,
      parentDestroyRef: destroyRef,
      dismissOnEscape: false,
      dismissOnBackdropClick: false,
    });
    onDialogCloseOnce(ref, injector, (r) => afterModuleClose(ctx, r, successVerb));
  }

  function openProductDialog(
    data: ProductFormDialogData,
    ctx: RegistryActionContext,
    successVerb: string,
  ): void {
    const ref = dialog.open<ProductDetail | null | undefined>(ProductFormDialogComponent, {
      data,
      parentDestroyRef: destroyRef,
      dismissOnEscape: false,
      dismissOnBackdropClick: false,
    });
    onDialogCloseOnce(ref, injector, (r) => afterProductClose(ctx, r, successVerb));
  }

  return {
    openModuleCreate(ctx) {
      openModuleDialog({ mode: 'create' }, ctx, 'создан');
    },
    openModuleEdit(row, ctx, focusComposition) {
      void (async () => {
        const res = await firstValueFrom(modulesService.getById(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        openModuleDialog({ mode: 'edit', module: res.data, focusComposition }, ctx, 'обновлён');
      })();
    },
    openProductCreate(ctx) {
      openProductDialog({ mode: 'create' }, ctx, 'создано');
    },
    openProductEdit(row, ctx, focusComposition) {
      void (async () => {
        const res = await firstValueFrom(productsService.getById(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        openProductDialog({ mode: 'edit', product: res.data, focusComposition }, ctx, 'обновлено');
      })();
    },
  };
}
