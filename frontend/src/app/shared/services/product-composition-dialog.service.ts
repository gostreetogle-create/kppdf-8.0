import { DestroyRef, Injectable, Injector, Type, inject } from '@angular/core';
import type { HttpErrorResponse } from '@angular/common/http';
import { Product, ProductsService } from './products.service';
import { Material, MaterialsService } from './materials.service';
import { ProductModule, ProductModulesService } from './pi-product-modules.service';
import { PiDialogService } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { onDialogCloseOnce } from '../util/on-dialog-close-once';
import type { CompositionTreeNode } from './pi-product-modules.service';

export interface ProductCompositionDialogOptions {
  parentDestroyRef: DestroyRef;
  injector: Injector;
  afterClose?: () => void;
}

/**
 * Cross-domain dialog coordinator for catalog composition.
 *
 * Shared composition UI keeps tree state and composition write-paths; this
 * service owns the page-dialog boundary so `shared/ui/composition/**` never
 * imports `pages/**` directly.
 */
@Injectable({ providedIn: 'root' })
export class ProductCompositionDialogService {
  private readonly dialog = inject(PiDialogService);
  private readonly products = inject(ProductsService);
  private readonly modules = inject(ProductModulesService);
  private readonly materials = inject(MaterialsService);
  private readonly toast = inject(PiToastService);

  openEdit(node: CompositionTreeNode, options: ProductCompositionDialogOptions): void {
    if (node.kind === 'product') {
      this.products.findById(node._id).subscribe((res) => {
        if (!res.ok || !res.data) {
          this.toast.error(res.ok ? 'Изделие не найдено' : this.errorMessage(res.error));
          return;
        }
        void import('../../pages/products/product-form-dialog.component')
          .then(({ ProductFormDialogComponent }) =>
            this.openLoaded(ProductFormDialogComponent, res.data as Product, options),
          )
          .catch(() => this.toast.error('Не удалось открыть редактирование изделия.'));
      });
      return;
    }

    if (node.kind === 'module') {
      this.modules.findById(node._id).subscribe((res) => {
        if (!res.ok || !res.data) {
          this.toast.error(res.ok ? 'Модуль не найден' : this.errorMessage(res.error));
          return;
        }
        void import('../../pages/modules/module-form-dialog.component')
          .then(({ ModuleFormDialogComponent }) =>
            this.openLoaded(ModuleFormDialogComponent, res.data as ProductModule, options),
          )
          .catch(() => this.toast.error('Не удалось открыть редактирование модуля.'));
      });
      return;
    }

    this.materials.findById(node._id).subscribe((res) => {
      if (!res.ok || !res.data) {
        this.toast.error(res.ok ? 'Материал не найден' : this.errorMessage(res.error));
        return;
      }
      void import('../../pages/materials/material-form-dialog.component')
        .then(({ MaterialFormDialogComponent }) =>
          this.openLoaded(MaterialFormDialogComponent, res.data as Material, options),
        )
        .catch(() => this.toast.error('Не удалось открыть редактирование материала.'));
    });
  }

  openMaterialCreate(options: ProductCompositionDialogOptions): Promise<unknown> {
    return new Promise((resolve, reject) => {
      void import('../../pages/materials/material-form-dialog.component')
        .then(({ MaterialFormDialogComponent }) => {
          const ref = this.dialog.open(MaterialFormDialogComponent, {
            data: null,
            width: 'lg',
            parentDestroyRef: options.parentDestroyRef,
          });
          onDialogCloseOnce(ref, options.injector, (created) => resolve(created));
        })
        .catch(reject);
    });
  }

  private openLoaded(
    component: Type<unknown>,
    data: Product | ProductModule | Material,
    options: ProductCompositionDialogOptions,
  ): void {
    const ref = this.dialog.open(component, {
      data,
      width: 'lg',
      parentDestroyRef: options.parentDestroyRef,
    });
    onDialogCloseOnce(ref, options.injector, () => options.afterClose?.());
  }

  private errorMessage(error: unknown): string {
    return extractErrorMessage(error as HttpErrorResponse) || 'Не удалось загрузить запись.';
  }
}
