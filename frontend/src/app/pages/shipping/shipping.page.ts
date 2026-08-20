import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { OrdersService, type Order, type OrderItem } from '../orders/orders.service';
import {
  ShipmentsService,
  type Shipment,
  type ShipmentStatus,
} from '../../shared/services/shipments.service';
import { LOGISTICS_SECTION_CHIPS } from '../supply/logistics-group-chips';

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: 'Черновик',
  scheduled: 'Запланирована',
  in_transit: 'В пути',
  delivered: 'Доставлена',
  cancelled: 'Отменена',
};

@Component({
  selector: 'app-shipping-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PiGroupWorkspaceComponent, ButtonComponent],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="shipping">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <select
          class="pi-input w-44"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event); reload()"
          aria-label="Фильтр по статусу отгрузки"
          data-test="shipping-status-filter"
        >
          <option value="">Все статусы</option>
          @for (status of statuses; track status) {
            <option [value]="status">{{ statusLabel(status) }}</option>
          }
        </select>
        <select
          class="pi-input w-52"
          [ngModel]="orderFilter()"
          (ngModelChange)="orderFilter.set($event); reload()"
          aria-label="Фильтр по заказу"
          data-test="shipping-order-filter"
        >
          <option value="">Все заказы</option>
          @for (order of orders(); track order._id) {
            <option [value]="order._id">{{ order.number }}</option>
          }
        </select>
        <span class="text-sm text-muted-foreground">{{ shipments().length }} отгрузок</span>
        <span class="flex-1"></span>
        <app-pi-button variant="outline" size="sm" (click)="reload()" data-test="shipping-refresh">
          Обновить
        </app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          (click)="openCreate()"
          data-test="shipping-create-toggle"
        >
          + Отгрузка
        </app-pi-button>
      </div>

      <div class="shipping-page flex flex-col gap-4 w-full min-w-0">
        @if (showCreate()) {
          <form
            class="pi-panel p-4 flex flex-col gap-3"
            (submit)="createShipment($event)"
            data-test="shipping-create-form"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <span class="eyebrow text-sunrise-warm">из заказа</span>
                <h2 class="text-base font-semibold m-0">Новая отгрузка</h2>
              </div>
              <button type="button" class="text-xs underline" (click)="closeCreate()">
                Отмена
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <label class="flex flex-col gap-1 text-xs md:col-span-1">
                <span class="text-muted-foreground">Заказ *</span>
                <select
                  class="pi-input"
                  [ngModel]="createOrderId"
                  (ngModelChange)="selectCreateOrder($event)"
                  name="createOrderId"
                  required
                  data-test="shipping-create-order"
                >
                  <option value="">Выберите заказ…</option>
                  @for (order of shippableOrders(); track order._id) {
                    <option [value]="order._id">{{ order.number }}</option>
                  }
                </select>
              </label>
              <label class="flex flex-col gap-1 text-xs">
                <span class="text-muted-foreground">Получатель</span>
                <input
                  class="pi-input"
                  [(ngModel)]="createRecipient"
                  name="recipient"
                  placeholder="Получатель"
                />
              </label>
              <label class="flex flex-col gap-1 text-xs">
                <span class="text-muted-foreground">Склад</span>
                <input
                  class="pi-input"
                  [(ngModel)]="createWarehouseId"
                  name="warehouseId"
                  placeholder="ID склада для dispatch"
                />
              </label>
            </div>
            <label class="flex flex-col gap-1 text-xs">
              <span class="text-muted-foreground">Адрес</span>
              <input
                class="pi-input"
                [(ngModel)]="createAddress"
                name="address"
                placeholder="Адрес доставки"
              />
            </label>
            @if (createOrder(); as order) {
              <div
                class="border hairline rounded-sm overflow-hidden"
                data-test="shipping-create-lines"
              >
                <div class="px-3 py-2 bg-paper-2 text-xs font-semibold">
                  Позиции заказа — укажите количество
                </div>
                @for (line of order.items ?? []; track line.lineId || $index) {
                  <div
                    class="grid grid-cols-[minmax(0,1fr)_7rem_4rem] gap-3 items-center px-3 py-2 border-t hairline text-xs"
                  >
                    <div class="min-w-0">
                      <div class="truncate">
                        {{ line.productName || 'Позиция ' + ($index + 1) }}
                      </div>
                      <div class="text-muted-foreground">
                        доступно: {{ line.quantity }} {{ line.unit || '' }}
                      </div>
                    </div>
                    <input
                      class="pi-input text-right"
                      type="number"
                      min="0"
                      [max]="line.quantity"
                      step="any"
                      [ngModel]="createQty(line, $index)"
                      (ngModelChange)="setCreateQty(line, $index, $event)"
                      [name]="'qty-' + $index"
                      [attr.data-test]="'shipping-create-qty-' + $index"
                    />
                    <span class="text-muted-foreground">{{ line.unit || 'шт' }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-muted-foreground m-0">
                Выберите заказ, чтобы увидеть его позиции.
              </p>
            }
            <div class="flex justify-end">
              <app-pi-button
                type="submit"
                variant="default"
                size="sm"
                [disabled]="busy()"
                data-test="shipping-create-submit"
              >
                Создать отгрузку
              </app-pi-button>
            </div>
          </form>
        }

        @if (loading()) {
          <p class="text-sm text-muted-foreground">Загрузка отгрузок…</p>
        } @else if (shipments().length === 0) {
          <div class="pi-dashed-panel p-8 text-center" data-test="shipping-empty">
            <p class="text-sm text-muted-foreground m-0">
              Отгрузок пока нет. Создайте первую из заказа.
            </p>
          </div>
        } @else {
          <div class="shipping-page__table" data-test="shipping-table">
            <div class="shipping-page__row shipping-page__row--head">
              <span>Номер</span><span>Заказ</span><span>Дата</span><span>Позиции</span
              ><span>Статус</span><span>Действия</span>
            </div>
            @for (shipment of shipments(); track shipment._id) {
              <div
                class="shipping-page__row"
                [class.shipping-page__row--active]="editingId() === shipment._id"
              >
                <strong>{{ shipment.number }}</strong>
                <span>{{ orderLabel(shipment.orderId) }}</span>
                <span>{{ fmtDate(shipment.date) }}</span>
                <span>{{ shipment.items.length }}</span>
                <span class="shipping-page__status" [attr.data-status]="shipment.status">{{
                  statusLabel(shipment.status)
                }}</span>
                <span class="flex items-center gap-2 flex-wrap justify-end">
                  @if (shipment.status === 'scheduled' || shipment.status === 'draft') {
                    <app-pi-button
                      variant="outline"
                      size="sm"
                      (click)="dispatch(shipment)"
                      [disabled]="busy()"
                      [attr.data-test]="'shipping-dispatch-' + shipment._id"
                    >
                      Отправить
                    </app-pi-button>
                  }
                  @if (shipment.status === 'in_transit') {
                    <app-pi-button
                      variant="outline"
                      size="sm"
                      (click)="setStatus(shipment, 'delivered')"
                      [disabled]="busy()"
                    >
                      Доставлена
                    </app-pi-button>
                  }
                  @if (shipment.status !== 'cancelled' && shipment.status !== 'delivered') {
                    <button
                      type="button"
                      class="shipping-page__text-button"
                      (click)="openEdit(shipment)"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      class="shipping-page__text-button"
                      (click)="openDoc(shipment)"
                    >
                      Документ
                    </button>
                  }
                </span>
              </div>
              @if (editingId() === shipment._id) {
                <div class="shipping-page__editor" data-test="shipping-edit-form">
                  <label
                    ><span>Получатель</span><input class="pi-input" [(ngModel)]="editRecipient"
                  /></label>
                  <label
                    ><span>Адрес</span><input class="pi-input" [(ngModel)]="editAddress"
                  /></label>
                  <label
                    ><span>Водитель / перевозчик</span
                    ><input class="pi-input" [(ngModel)]="editDriverInfo"
                  /></label>
                  <label
                    ><span>Склад</span
                    ><input class="pi-input" [(ngModel)]="editWarehouseId" placeholder="ID склада"
                  /></label>
                  <label class="shipping-page__editor-wide"
                    ><span>Примечание</span><input class="pi-input" [(ngModel)]="editNotes"
                  /></label>
                  <span class="flex items-center gap-2">
                    <app-pi-button
                      variant="default"
                      size="sm"
                      (click)="saveEdit(shipment)"
                      [disabled]="busy()"
                      >Сохранить</app-pi-button
                    >
                    <button
                      type="button"
                      class="shipping-page__text-button"
                      (click)="editingId.set(null)"
                    >
                      Отмена
                    </button>
                  </span>
                </div>
              }
              @if (docShipmentId() === shipment._id) {
                <div class="shipping-page__editor" data-test="shipping-doc-form">
                  <label
                    ><span>Тип документа</span
                    ><select class="pi-input" [(ngModel)]="docType">
                      <option value="ttn">ТТН</option>
                      <option value="upd">УПД</option>
                      <option value="invoice">Счёт</option>
                      <option value="other">Другое</option>
                    </select></label
                  >
                  <label
                    ><span>Номер</span><input class="pi-input" [(ngModel)]="docNumber"
                  /></label>
                  <label
                    ><span>Сумма</span
                    ><input class="pi-input" type="number" min="0" [(ngModel)]="docAmount"
                  /></label>
                  <label class="shipping-page__editor-wide"
                    ><span>Примечание</span><input class="pi-input" [(ngModel)]="docNotes"
                  /></label>
                  <span class="flex items-center gap-2"
                    ><app-pi-button
                      variant="default"
                      size="sm"
                      (click)="saveDoc(shipment)"
                      [disabled]="busy()"
                      >Добавить</app-pi-button
                    ><button
                      type="button"
                      class="shipping-page__text-button"
                      (click)="docShipmentId.set(null)"
                    >
                      Отмена
                    </button></span
                  >
                </div>
              }
            }
          </div>
        }
      </div>
    </app-pi-group-workspace>
  `,
  styles: [
    `
      .shipping-page__table {
        overflow: hidden;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        background: var(--color-paper);
      }
      .shipping-page__row {
        display: grid;
        grid-template-columns: 8rem minmax(7rem, 1fr) 7rem 5rem 9rem minmax(13rem, 1.5fr);
        gap: 0.75rem;
        align-items: center;
        min-height: 3.1rem;
        padding: 0.55rem 0.75rem;
        border-top: 1px solid var(--color-rule);
        font-size: 0.8125rem;
      }
      .shipping-page__row--head {
        min-height: 2.25rem;
        border-top: none;
        background: var(--color-paper-2);
        color: var(--color-muted-foreground);
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .shipping-page__row--active {
        background: var(--color-sunrise-soft);
      }
      .shipping-page__status {
        white-space: nowrap;
        color: var(--color-muted-foreground);
      }
      .shipping-page__status[data-status='in_transit'] {
        color: var(--color-info);
      }
      .shipping-page__status[data-status='delivered'] {
        color: var(--color-success);
      }
      .shipping-page__status[data-status='cancelled'] {
        color: var(--color-destructive);
      }
      .shipping-page__text-button {
        padding: 0.25rem;
        border: 0;
        background: transparent;
        color: var(--color-muted-foreground);
        font-size: 0.75rem;
        text-decoration: underline;
        cursor: pointer;
      }
      .shipping-page__text-button:hover {
        color: var(--color-ink);
      }
      .shipping-page__editor {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: end;
        padding: 0.75rem;
        border-top: 1px dashed var(--color-rule);
        background: var(--color-paper-2);
        font-size: 0.6875rem;
      }
      .shipping-page__editor label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .shipping-page__editor-wide {
        grid-column: span 2;
      }
      @media (max-width: 900px) {
        .shipping-page__row {
          grid-template-columns: 1fr 1fr;
        }
        .shipping-page__row--head {
          display: none;
        }
        .shipping-page__editor {
          grid-template-columns: 1fr;
        }
        .shipping-page__editor-wide {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class ShippingPage {
  protected readonly chips = LOGISTICS_SECTION_CHIPS;
  protected readonly statuses: ShipmentStatus[] = [
    'draft',
    'scheduled',
    'in_transit',
    'delivered',
    'cancelled',
  ];
  protected readonly shipments = signal<Shipment[]>([]);
  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly statusFilter = signal<ShipmentStatus | ''>('');
  protected readonly orderFilter = signal('');
  protected readonly showCreate = signal(false);
  protected readonly createOrderId = signal('');
  protected readonly createOrder = signal<Order | null>(null);
  protected readonly createQuantities = signal<Record<string, number>>({});
  protected createRecipient = '';
  protected createAddress = '';
  protected createWarehouseId = '';
  protected readonly editingId = signal<string | null>(null);
  protected editRecipient = '';
  protected editAddress = '';
  protected editDriverInfo = '';
  protected editWarehouseId = '';
  protected editNotes = '';
  protected readonly docShipmentId = signal<string | null>(null);
  protected docType = 'ttn';
  protected docNumber = '';
  protected docAmount = 0;
  protected docNotes = '';

  private readonly ordersSvc = inject(OrdersService);
  private readonly shipmentsSvc = inject(ShipmentsService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.ordersSvc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.orders.set(res.data ?? []);
      });
    this.reload();
  }

  protected statusLabel(status: ShipmentStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  protected fmtDate(value?: string): string {
    return value ? new Date(value).toLocaleDateString('ru-RU') : '—';
  }

  protected orderLabel(orderId: Shipment['orderId']): string {
    return typeof orderId === 'string'
      ? (this.orders().find((order) => order._id === orderId)?.number ?? orderId.slice(-6))
      : (orderId.number ?? orderId._id.slice(-6));
  }

  protected shippableOrders(): Order[] {
    return this.orders().filter(
      (order) => !['shipped', 'delivered', 'cancelled'].includes(order.status),
    );
  }

  protected reload(): void {
    this.loading.set(true);
    this.shipmentsSvc
      .list({ status: this.statusFilter(), orderId: this.orderFilter() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (res.ok) this.shipments.set(res.data ?? []);
        else this.toast.error(extractErrorMessage(res.error) || 'Не удалось загрузить отгрузки');
      });
  }

  protected openCreate(): void {
    this.showCreate.set(true);
    this.createOrderId.set('');
    this.createOrder.set(null);
    this.createQuantities.set({});
    this.createRecipient = '';
    this.createAddress = '';
    this.createWarehouseId = '';
  }

  protected closeCreate(): void {
    this.showCreate.set(false);
  }

  protected selectCreateOrder(id: string): void {
    this.createOrderId.set(id);
    const order = this.orders().find((candidate) => candidate._id === id) ?? null;
    this.createOrder.set(order);
    const quantities: Record<string, number> = {};
    for (const [index, line] of (order?.items ?? []).entries())
      quantities[this.lineKey(line, index)] = line.quantity;
    this.createQuantities.set(quantities);
  }

  protected lineKey(line: OrderItem, index: number): string {
    return line.lineId ?? String(index);
  }

  protected createQty(line: OrderItem, index: number): number {
    return this.createQuantities()[this.lineKey(line, index)] ?? 0;
  }

  protected setCreateQty(line: OrderItem, index: number, value: number | string): void {
    const quantity = Math.max(0, Math.min(line.quantity, Number(value) || 0));
    this.createQuantities.update((current) => ({
      ...current,
      [this.lineKey(line, index)]: quantity,
    }));
  }

  protected createShipment(event: Event): void {
    event.preventDefault();
    const order = this.createOrder();
    if (!order) {
      this.toast.error('Выберите заказ');
      return;
    }
    const items = (order.items ?? [])
      .map((line, index) => ({
        lineId: this.lineKey(line, index),
        quantity: this.createQty(line, index),
      }))
      .filter((item) => item.quantity > 0);
    if (items.length === 0) {
      this.toast.error('Укажите количество хотя бы одной позиции');
      return;
    }
    this.busy.set(true);
    this.ordersSvc
      .ship(order._id, {
        recipient: this.createRecipient || undefined,
        address: this.createAddress || undefined,
        warehouseId: this.createWarehouseId || undefined,
        items,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busy.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось создать отгрузку');
          return;
        }
        this.toast.success('Отгрузка создана');
        this.closeCreate();
        this.reload();
        this.ordersSvc
          .list()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((orders) => {
            if (orders.ok) this.orders.set(orders.data ?? []);
          });
      });
  }

  protected dispatch(shipment: Shipment): void {
    if (!shipment.warehouseId) {
      this.toast.error('Сначала укажите склад в редактировании отгрузки');
      this.openEdit(shipment);
      return;
    }
    this.busy.set(true);
    this.shipmentsSvc
      .dispatch(shipment._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busy.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось отправить отгрузку');
          return;
        }
        this.toast.success('Отгрузка отправлена');
        this.reload();
      });
  }

  protected setStatus(shipment: Shipment, status: ShipmentStatus): void {
    this.busy.set(true);
    this.shipmentsSvc
      .update(shipment._id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busy.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось изменить статус');
          return;
        }
        this.reload();
      });
  }

  protected openEdit(shipment: Shipment): void {
    this.editingId.set(shipment._id);
    this.docShipmentId.set(null);
    this.editRecipient = shipment.recipient ?? '';
    this.editAddress = shipment.address ?? '';
    this.editDriverInfo = shipment.driverInfo ?? '';
    this.editWarehouseId = shipment.warehouseId ?? '';
    this.editNotes = shipment.notes ?? '';
  }

  protected saveEdit(shipment: Shipment): void {
    this.busy.set(true);
    this.shipmentsSvc
      .update(shipment._id, {
        recipient: this.editRecipient,
        address: this.editAddress,
        driverInfo: this.editDriverInfo,
        notes: this.editNotes,
        warehouseId: this.editWarehouseId || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busy.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось сохранить отгрузку');
          return;
        }
        this.editingId.set(null);
        this.toast.success('Отгрузка сохранена');
        this.reload();
      });
  }

  protected openDoc(shipment: Shipment): void {
    this.docShipmentId.set(shipment._id);
    this.editingId.set(null);
    this.docNumber = '';
    this.docAmount = 0;
    this.docNotes = '';
  }

  protected saveDoc(shipment: Shipment): void {
    this.busy.set(true);
    this.shipmentsSvc
      .addDoc(shipment._id, {
        type: this.docType,
        number: this.docNumber || undefined,
        totalAmount: Number(this.docAmount) || 0,
        notes: this.docNotes || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busy.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось добавить документ');
          return;
        }
        this.docShipmentId.set(null);
        this.toast.success('Документ добавлен');
        this.reload();
      });
  }
}
