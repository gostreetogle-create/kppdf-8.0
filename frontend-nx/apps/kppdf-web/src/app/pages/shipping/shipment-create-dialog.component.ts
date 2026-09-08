import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  type Order,
  type OrderItem,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';

export interface ShipmentCreateDialogData {
  readonly orders: readonly Order[];
  readonly warehouses: readonly Warehouse[];
}

/** TZ-NX-SHIP-S1 — order → warehouse → whole/partial qty, mirrors legacy shipping create form. */
@Component({
  selector: 'pi-shipment-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, PiFormSectionComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog title="Новая отгрузка" variant="content" width="lg" [showClose]="true" (userClose)="cancel()">
      <div body class="space-y-4" data-test="shipping-create-form">
        <app-pi-form-section title="Заказ и склад" headingId="shipment-create-basics" tone="gold">
          <div class="space-y-form-field">
            <app-pi-form-field label="Заказ" htmlFor="shipment-create-order" [required]="true">
              <select
                id="shipment-create-order"
                class="pi-input w-full"
                [value]="orderId()"
                (change)="onOrderChange($event)"
                data-test="shipping-create-order"
              >
                <option value="">Выберите заказ…</option>
                @for (order of shippableOrders(); track order._id) {
                  <option [value]="order._id">{{ order.number }}</option>
                }
              </select>
            </app-pi-form-field>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-pi-form-field label="Получатель" htmlFor="shipment-create-recipient">
                <app-pi-input id="shipment-create-recipient" [value]="recipient()" (valueChange)="recipient.set($event)" data-test="shipping-create-recipient" />
              </app-pi-form-field>
              <app-pi-form-field label="Склад" htmlFor="shipment-create-warehouse" [required]="true">
                <select
                  id="shipment-create-warehouse"
                  class="pi-input w-full"
                  [value]="warehouseId()"
                  (change)="onWarehouseChange($event)"
                  data-test="shipping-create-warehouse"
                >
                  <option value="">Выберите склад…</option>
                  @for (warehouse of activeWarehouses(); track warehouse._id) {
                    <option [value]="warehouse._id">{{ warehouse.name }}</option>
                  }
                </select>
              </app-pi-form-field>
            </div>
            @if (data.warehouses.length === 0) {
              <p class="text-xs text-destructive m-0" role="alert" data-test="shipping-create-warehouses-empty">
                Нет активных складов — создайте в разделе «Склад».
              </p>
            }

            <app-pi-form-field label="Адрес" htmlFor="shipment-create-address">
              <app-pi-input id="shipment-create-address" [value]="address()" (valueChange)="address.set($event)" data-test="shipping-create-address" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        @if (order(); as ord) {
          <div class="border hairline rounded-sm overflow-hidden" data-test="shipping-create-lines">
            <div class="px-3 py-2 bg-paper-2 text-xs font-semibold">Позиции заказа — укажите количество</div>
            @for (line of ord.items ?? []; track line.lineId || $index) {
              <div class="grid grid-cols-[minmax(0,1fr)_7rem_4rem] gap-3 items-center px-3 py-2 border-t hairline text-xs">
                <div class="min-w-0">
                  <div class="truncate">{{ line.productName || 'Позиция ' + ($index + 1) }}</div>
                  <div class="text-muted-foreground">доступно: {{ line.quantity }} {{ line.unit || '' }}</div>
                </div>
                <input
                  class="pi-input text-right"
                  type="number"
                  min="0"
                  [max]="line.quantity"
                  step="any"
                  [value]="qtyFor(line, $index)"
                  (input)="onQtyInput($event, line, $index)"
                  [attr.data-test]="'shipping-create-qty-' + $index"
                />
                <span class="text-muted-foreground">{{ line.unit || 'шт' }}</span>
              </div>
            }
          </div>
        } @else {
          <p class="text-sm text-muted-foreground m-0">Выберите заказ, чтобы увидеть его позиции.</p>
        }

        @if (error()) {
          <p class="text-sm text-destructive m-0" role="alert" data-test="shipping-create-error">{{ error() }}</p>
        }
      </div>

      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" [disabled]="saving()" (click)="cancel()">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="saving() || !isKnownWarehouse(warehouseId())"
          (click)="submit()"
          data-test="shipping-create-submit"
        >
          {{ saving() ? 'Создание…' : 'Создать отгрузку' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ShipmentCreateDialogComponent {
  readonly data = inject<ShipmentCreateDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<boolean>>(PI_DIALOG_REF);
  private readonly ordersApi = inject(PiOrdersService);

  readonly saving = signal(false);
  readonly error = signal('');
  readonly orderId = signal('');
  readonly order = signal<Order | null>(null);
  readonly quantities = signal<Record<string, number>>({});
  readonly recipient = signal('');
  readonly address = signal('');
  readonly warehouseId = signal('');

  readonly shippableOrders = computed(() =>
    this.data.orders.filter((order) => !['shipped', 'delivered', 'cancelled'].includes(order.status ?? '')),
  );
  readonly activeWarehouses = computed(() => this.data.warehouses.filter((w) => w.isActive !== false));

  onOrderChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.orderId.set(id);
    const order = this.data.orders.find((candidate) => candidate._id === id) ?? null;
    this.order.set(order);
    const quantities: Record<string, number> = {};
    for (const [index, line] of (order?.items ?? []).entries()) {
      quantities[this.lineKey(line, index)] = line.quantity;
    }
    this.quantities.set(quantities);
  }

  onWarehouseChange(event: Event): void {
    this.warehouseId.set((event.target as HTMLSelectElement).value);
  }

  lineKey(line: OrderItem, index: number): string {
    return line.lineId ?? String(index);
  }

  qtyFor(line: OrderItem, index: number): number {
    return this.quantities()[this.lineKey(line, index)] ?? 0;
  }

  onQtyInput(event: Event, line: OrderItem, index: number): void {
    const value = Number((event.target as HTMLInputElement).value) || 0;
    const quantity = Math.max(0, Math.min(line.quantity, value));
    this.quantities.update((current) => ({ ...current, [this.lineKey(line, index)]: quantity }));
  }

  isKnownWarehouse(id: string): boolean {
    return !!id && this.activeWarehouses().some((warehouse) => warehouse._id === id);
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    if (!this.isKnownWarehouse(this.warehouseId())) {
      this.error.set('Выберите склад из списка');
      return;
    }
    const order = this.order();
    if (!order) {
      this.error.set('Выберите заказ');
      return;
    }
    const items = (order.items ?? [])
      .map((line, index) => ({ lineId: this.lineKey(line, index), quantity: this.qtyFor(line, index) }))
      .filter((item) => item.quantity > 0);
    if (items.length === 0) {
      this.error.set('Укажите количество хотя бы одной позиции');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(
      this.ordersApi.ship(order._id, {
        recipient: this.recipient() || undefined,
        address: this.address() || undefined,
        warehouseId: this.warehouseId() || undefined,
        items,
      }),
    );
    if (result.ok) {
      this.ref.close(true);
    } else {
      this.error.set(extractErrorMessage(result.error) || 'Не удалось создать отгрузку');
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.ref.close(false);
  }
}
