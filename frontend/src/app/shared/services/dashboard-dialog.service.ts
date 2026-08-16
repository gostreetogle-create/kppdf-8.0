import { Injectable, Injector, inject } from '@angular/core';
import { extractErrorMessage } from '../../core/silent-http';
import { Order } from '../../pages/orders/orders.service';
import { ProductsService } from './products.service';
import { PiDialogService } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { onDialogCloseOnce } from '../util/on-dialog-close-once';

/**
 * Dashboard-only dialog boundary.
 * DashboardPage owns Kanban state and write paths; this coordinator owns the
 * existing lazy page-dialog imports and close callbacks.
 */
@Injectable({ providedIn: 'root' })
export class DashboardDialogService {
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly products = inject(ProductsService);

  openOrderEdit(order: Order, injector: Injector, afterClose: () => void): void {
    void import('../../pages/orders/order-form-dialog.component')
      .then(({ OrderFormDialogComponent }) => {
        const ref = this.dialog.open(OrderFormDialogComponent, {
          data: order,
          width: 'lg',
        });
        onDialogCloseOnce(ref, injector, afterClose);
      })
      .catch(() => this.toast.error('Не удалось открыть редактирование заказа.'));
  }

  openProductEdit(productId: string, injector: Injector, afterClose: () => void): void {
    const id = productId?.trim();
    if (!id || id === 'undefined' || id === 'null') {
      this.toast.error('Изделие не найдено: не указан идентификатор');
      return;
    }
    this.products.findById(id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error) || 'Изделие не найдено');
        return;
      }
      void import('../../pages/products/product-form-dialog.component')
        .then(({ ProductFormDialogComponent }) => {
          const ref = this.dialog.open(ProductFormDialogComponent, {
            data: res.data,
            width: 'lg',
          });
          onDialogCloseOnce(ref, injector, afterClose);
        })
        .catch(() => this.toast.error('Не удалось открыть редактирование изделия.'));
    });
  }
}
