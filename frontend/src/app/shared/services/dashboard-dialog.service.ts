import { Injectable, Injector, inject } from '@angular/core';
import { Order } from '../../pages/orders/orders.service';
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
    void import('../../pages/products/product-form-dialog.component')
      .then(({ ProductFormDialogComponent }) => {
        const ref = this.dialog.open(ProductFormDialogComponent, {
          data: { id: productId },
          width: 'lg',
        });
        onDialogCloseOnce(ref, injector, afterClose);
      })
      .catch(() => this.toast.error('Не удалось открыть редактирование изделия.'));
  }
}
