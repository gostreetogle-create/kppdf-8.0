import type { DestroyRef, Injector, WritableSignal } from '@angular/core';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import type { CompositionTreeNode } from '../../shared/services/pi-product-modules.service';
import type { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import type { ProductsService } from '../../shared/services/products.service';
import type { MaterialsService } from '../../shared/services/materials.service';
import type { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import type { PiToastService } from '../../shared/ui/toast';
import type { CompositionTreeEditEvent } from '../../shared/ui/composition/composition-tree.component';

export interface CatalogCompositionEditDeps {
  dialog: PiDialogService;
  products: ProductsService;
  modules: ProductModulesService;
  materials: MaterialsService;
  toast: PiToastService | null | undefined;
  injector: Injector;
  destroyRef: DestroyRef;
  busy: WritableSignal<boolean>;
  onSaved: () => void;
}

/** Synthetic order-line placeholders are not catalog ids. */
export function isCatalogCompositionId(id: string | undefined | null): boolean {
  const value = (id ?? '').trim();
  return value.length > 0 && !value.startsWith('line:');
}

export function isEmptyCatalogBranch(node: CompositionTreeNode): boolean {
  return (
    (node.kind === 'product' || node.kind === 'module') &&
    node.children.length === 0 &&
    isCatalogCompositionId(node._id)
  );
}

/**
 * Open the existing catalog product/module/material edit dialog (same path
 * as ProductBomPanel bom-edit). Live catalog BOM — not an order snapshot.
 */
export function openCatalogCompositionEdit(
  deps: CatalogCompositionEditDeps,
  node: CompositionTreeNode,
): void {
  if (deps.busy() || !isCatalogCompositionId(node._id)) return;
  const id = node._id;
  const kind = node.kind;
  deps.busy.set(true);

  const afterClose = (): void => {
    deps.onSaved();
  };

  if (kind === 'module') {
    deps.modules.findById(id).subscribe((res) => {
      if (!res.ok || !res.data) {
        deps.busy.set(false);
        deps.toast?.error(res.ok ? 'Модуль не найден' : extractErrorMessage(res.error));
        return;
      }
      void import('../modules/module-form-dialog.component')
        .then(({ ModuleFormDialogComponent }) => {
          const ref = deps.dialog.open(ModuleFormDialogComponent, {
            data: res.data,
            width: 'lg',
            parentDestroyRef: deps.destroyRef,
          });
          onDialogCloseOnce(ref, deps.injector, afterClose);
        })
        .catch(() => {
          deps.toast?.error('Не удалось открыть редактирование модуля.');
        })
        .finally(() => deps.busy.set(false));
    });
    return;
  }

  if (kind === 'product') {
    deps.products.findById(id).subscribe((res) => {
      if (!res.ok || !res.data) {
        deps.busy.set(false);
        deps.toast?.error(res.ok ? 'Изделие не найдено' : extractErrorMessage(res.error));
        return;
      }
      void import('../products/product-form-dialog.component')
        .then(({ ProductFormDialogComponent }) => {
          const ref = deps.dialog.open(ProductFormDialogComponent, {
            data: res.data,
            width: 'lg',
            parentDestroyRef: deps.destroyRef,
          });
          onDialogCloseOnce(ref, deps.injector, afterClose);
        })
        .catch(() => {
          deps.toast?.error('Не удалось открыть редактирование изделия.');
        })
        .finally(() => deps.busy.set(false));
    });
    return;
  }

  deps.materials.findById(id).subscribe((res) => {
    if (!res.ok || !res.data) {
      deps.busy.set(false);
      deps.toast?.error(res.ok ? 'Материал не найден' : extractErrorMessage(res.error));
      return;
    }
    void import('../materials/material-form-dialog.component')
      .then(({ MaterialFormDialogComponent }) => {
        const ref = deps.dialog.open(MaterialFormDialogComponent, {
          data: res.data,
          width: 'lg',
          parentDestroyRef: deps.destroyRef,
        });
        onDialogCloseOnce(ref, deps.injector, afterClose);
      })
      .catch(() => {
        deps.toast?.error('Не удалось открыть редактирование материала.');
      })
      .finally(() => deps.busy.set(false));
  });
}

export function openCatalogEditFromTree(
  deps: CatalogCompositionEditDeps,
  ev: CompositionTreeEditEvent,
): void {
  openCatalogCompositionEdit(deps, ev.node);
}
