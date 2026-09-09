import { ChangeDetectionStrategy, Component, DestroyRef, Injector, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  PiShipmentsService,
  PiWarehousesService,
  type Order,
  type Shipment,
  type ShipmentStatus,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { ShipmentCreateDialogComponent, type ShipmentCreateDialogData } from './shipment-create-dialog.component';
import { ShipmentEditDialogComponent, type ShipmentEditDialogData } from './shipment-edit-dialog.component';
import { ShipmentDocDialogComponent, type ShipmentDocDialogData, DOC_TYPE_LABELS } from './shipment-doc-dialog.component';

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: 'Черновик',
  scheduled: 'Запланирована',
  in_transit: 'В пути',
  delivered: 'Доставлена',
  cancelled: 'Отменена',
};

/**
 * TZ-NX-SHIP-S1-REGISTRY — live NX `/shipping` registry, ports the legacy
 * page's essentials (list/filter/create/dispatch/cancel/edit/doc) with NX
 * dialog density instead of the legacy inline row-expando editors.
 */
@Component({
  selector: 'pi-shipping-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="shipping-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Логистика</div>
          <h1 class="font-display text-2xl m-0">Отгрузка</h1>
          <p class="text-sm text-muted-foreground m-0 mt-1">
            Реестр отгрузок: создание из заказа, отправка со склада, документы, отмена до отправки.
          </p>
        </div>
        <button class="pi-button pi-button-primary" type="button" (click)="openCreate()" data-test="shipping-create-toggle">
          + Отгрузка
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        @if (orderFilter()) {
          <span class="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-sm bg-paper-2 border hairline" data-test="shipping-order-filter-chip">
            <span>Фильтр: заказ {{ orderFilterLabel() }}</span>
            <button type="button" class="pi-outline-btn" (click)="clearOrderFilter()" data-test="shipping-order-filter-clear">
              Сбросить
            </button>
          </span>
        }
        <label class="sr-only" for="shipping-status-filter">Фильтр по статусу</label>
        <select
          id="shipping-status-filter"
          class="pi-input w-44 pi-focus-ring"
          [value]="statusFilter()"
          (change)="onStatusFilterChange($event)"
          data-test="shipping-status-filter"
        >
          <option value="">Все статусы</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ statusLabel(s) }}</option>
          }
        </select>
        <label class="sr-only" for="shipping-order-filter">Фильтр по заказу</label>
        <select
          id="shipping-order-filter"
          class="pi-input w-52 pi-focus-ring"
          [value]="orderFilter()"
          (change)="onOrderFilterChange($event)"
          data-test="shipping-order-filter"
        >
          <option value="">Все заказы</option>
          @for (order of orders(); track order._id) {
            <option [value]="order._id">{{ order.number }}</option>
          }
        </select>
        <span class="text-sm text-muted-foreground">{{ shipments().length }} отгрузок</span>
        <span class="flex-1"></span>
        <button class="pi-button pi-button-secondary" type="button" (click)="load()" data-test="shipping-refresh">
          Обновить
        </button>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="shipping-loading">Загрузка отгрузок…</div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="load()" data-test="shipping-error" />
      }
      @if (status() === 'success' && shipments().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="shipping-empty">
          <p class="text-sm text-muted-foreground m-0">Отгрузок пока нет. Создайте первую из заказа.</p>
        </div>
      }
      @if (status() === 'success' && shipments().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-x-auto bg-paper-raised" data-test="shipping-table">
          <div class="min-w-[60rem]" role="table" aria-label="Отгрузки">
            <div class="grid grid-cols-[7rem_minmax(7rem,1fr)_6rem_5rem_8rem_minmax(14rem,1.5fr)] gap-3 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
              <span role="columnheader">Номер</span>
              <span role="columnheader">Заказ</span>
              <span role="columnheader">Дата</span>
              <span role="columnheader">Позиции</span>
              <span role="columnheader">Статус</span>
              <span role="columnheader" aria-label="Действия"></span>
            </div>
            @for (shipment of shipments(); track shipment._id) {
              <div
                class="grid grid-cols-[7rem_minmax(7rem,1fr)_6rem_5rem_8rem_minmax(14rem,1.5fr)] gap-3 items-center px-4 py-3 hairline-bottom last:border-b-0 cursor-pointer pi-focus-ring"
                role="row"
                data-test="shipping-row"
                tabindex="0"
                [attr.aria-expanded]="expandedId() === shipment._id"
                (click)="toggleExpand(shipment._id)"
                (keydown.enter)="toggleExpand(shipment._id)"
                (keydown.space)="onRowSpace($event, shipment._id)"
              >
                <div role="cell"><strong>{{ shipment.number }}</strong></div>
                <div role="cell" class="truncate">{{ orderLabel(shipment.orderId) }}</div>
                <div role="cell">{{ fmtDate(shipment.date) }}</div>
                <div role="cell">{{ shipment.items.length }}</div>
                <div role="cell" [attr.data-status]="shipment.status">{{ statusLabel(shipment.status) }}</div>
                <div class="flex items-center gap-2 flex-wrap justify-end" role="cell" (click)="$event.stopPropagation()">
                  @if (shipment.status === 'scheduled' || shipment.status === 'draft') {
                    <button
                      class="pi-button pi-button-primary"
                      type="button"
                      (click)="dispatch(shipment)"
                      [disabled]="busy()"
                      [attr.data-test]="'shipping-dispatch-' + shipment._id"
                    >
                      Отправить
                    </button>
                    <button
                      class="pi-button pi-button-secondary"
                      type="button"
                      (click)="cancelShipment(shipment)"
                      [disabled]="busy()"
                      [attr.data-test]="'shipping-cancel-' + shipment._id"
                    >
                      Отменить отгрузку
                    </button>
                  }
                  @if (shipment.status === 'in_transit') {
                    <button class="pi-button pi-button-secondary" type="button" (click)="markDelivered(shipment)" [disabled]="busy()" data-test="shipping-deliver">
                      Доставлена
                    </button>
                  }
                  @if (shipment.status !== 'cancelled' && shipment.status !== 'delivered') {
                    <button
                      class="pi-button pi-button-secondary"
                      type="button"
                      (click)="openEdit(shipment)"
                      [attr.data-test]="'shipping-edit-' + shipment._id"
                    >
                      Изменить
                    </button>
                    <button class="pi-button pi-button-secondary" type="button" (click)="openDoc(shipment)" data-test="shipping-doc-open">
                      Документ
                    </button>
                  }
                </div>
              </div>
              @if (expandedId() === shipment._id) {
                <div class="px-4 py-4 hairline-bottom last:border-b-0 bg-paper-2" data-test="shipping-row-expand">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <div class="pi-label text-muted-foreground">Получатель</div>
                      <div class="text-sm">{{ shipment.recipient || '—' }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Адрес</div>
                      <div class="text-sm">{{ shipment.address || '—' }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Водитель / перевозчик</div>
                      <div class="text-sm">{{ shipment.driverInfo || '—' }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Примечание</div>
                      <div class="text-sm">{{ shipment.notes || '—' }}</div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="pi-label text-muted-foreground mb-1">Позиции</div>
                    @if (shipment.items.length === 0) {
                      <p class="text-xs text-muted-foreground m-0">Нет позиций.</p>
                    } @else {
                      <ul class="text-sm space-y-0.5 m-0 pl-4" data-test="shipping-expand-items">
                        @for (item of shipment.items; track item.lineId || item.productId) {
                          <li>{{ item.productName || item.productId }} — {{ item.quantity }} {{ item.unit || 'шт' }}</li>
                        }
                      </ul>
                    }
                  </div>
                  <div>
                    <div class="pi-label text-muted-foreground mb-1">Документы</div>
                    @if (!shipment.docs || shipment.docs.length === 0) {
                      <p class="text-xs text-muted-foreground m-0">Документов нет.</p>
                    } @else {
                      <ul class="text-sm space-y-0.5 m-0 pl-4" data-test="shipping-expand-docs">
                        @for (doc of shipment.docs; track doc.number + doc.date) {
                          <li>{{ docTypeLabel(doc.type) }} {{ doc.number }} · {{ fmtDate(doc.date) }} · {{ doc.totalAmount }} ₽</li>
                        }
                      </ul>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </main>
  `,
})
export class ShippingPage {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly warehousesApi = inject(PiWarehousesService);
  private readonly shipmentsApi = inject(PiShipmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statuses: readonly ShipmentStatus[] = ['draft', 'scheduled', 'in_transit', 'delivered', 'cancelled'];
  protected readonly shipments = signal<readonly Shipment[]>([]);
  protected readonly orders = signal<readonly Order[]>([]);
  protected readonly warehouses = signal<readonly Warehouse[]>([]);
  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly error = signal('Не удалось загрузить отгрузки.');
  protected readonly busy = signal(false);
  protected readonly statusFilter = signal<ShipmentStatus | ''>('');
  protected readonly orderFilter = signal('');
  /** Single expand (registry pattern) — reloading the list collapses it. */
  protected readonly expandedId = signal<string | null>(null);
  protected readonly docTypeLabels = DOC_TYPE_LABELS;

  protected readonly orderFilterLabel = computed(() => {
    const id = this.orderFilter();
    return id ? this.orderLabel(id) : '';
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.orderFilter.set((params.get('orderId') ?? '').trim());
      this.load();
    });
    void this.loadLookups();
  }

  protected statusLabel(status: ShipmentStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  protected fmtDate(value?: string): string {
    return value ? new Date(value).toLocaleDateString('ru-RU') : '—';
  }

  protected orderLabel(orderId: Shipment['orderId']): string {
    if (typeof orderId === 'string') {
      return this.orders().find((order) => order._id === orderId)?.number ?? orderId.slice(-6);
    }
    return orderId.number ?? orderId._id.slice(-6);
  }

  protected docTypeLabel(type: string): string {
    return this.docTypeLabels[type] ?? type;
  }

  protected toggleExpand(shipmentId: string): void {
    this.expandedId.update((current) => (current === shipmentId ? null : shipmentId));
  }

  protected onRowSpace(event: Event, shipmentId: string): void {
    event.preventDefault();
    this.toggleExpand(shipmentId);
  }

  protected onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as ShipmentStatus | '');
    this.load();
  }

  protected onOrderFilterChange(event: Event): void {
    const orderId = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: orderId || null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearOrderFilter(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: null },
      queryParamsHandling: 'merge',
    });
  }

  load(): void {
    this.status.set('loading');
    this.expandedId.set(null);
    void firstValueFrom(
      this.shipmentsApi.list({ status: this.statusFilter() || undefined, orderId: this.orderFilter() || undefined }),
    ).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.shipments.set(result.data ?? []);
      this.status.set('success');
    });
  }

  openCreate(): void {
    const ref = this.dialog.open<boolean, ShipmentCreateDialogData>(ShipmentCreateDialogComponent, {
      data: { orders: this.orders(), warehouses: this.warehouses() },
      width: 'lg',
      ariaLabel: 'Новая отгрузка',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (created) => {
      if (created) {
        this.toast.success('Отгрузка создана');
        this.load();
        void this.loadOrders();
      }
    });
  }

  openEdit(shipment: Shipment): void {
    const ref = this.dialog.open<boolean, ShipmentEditDialogData>(ShipmentEditDialogComponent, {
      data: { shipment, warehouses: this.warehouses() },
      width: 'md',
      ariaLabel: 'Изменить отгрузку',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (saved) => {
      if (saved) {
        this.toast.success('Отгрузка сохранена');
        this.load();
      }
    });
  }

  openDoc(shipment: Shipment): void {
    const ref = this.dialog.open<boolean, ShipmentDocDialogData>(ShipmentDocDialogComponent, {
      data: { shipment },
      width: 'md',
      ariaLabel: 'Добавить документ',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (saved) => {
      if (saved) {
        this.toast.success('Документ добавлен');
        this.load();
      }
    });
  }

  dispatch(shipment: Shipment): void {
    if (!shipment.warehouseId) {
      this.toast.error('Сначала укажите склад в редактировании отгрузки');
      this.openEdit(shipment);
      return;
    }
    this.busy.set(true);
    void firstValueFrom(this.shipmentsApi.dispatch(shipment._id)).then((result) => {
      this.busy.set(false);
      if (!result.ok) {
        this.toast.error(extractErrorMessage(result.error) || 'Не удалось отправить отгрузку');
        return;
      }
      this.toast.success('Отгрузка отправлена');
      this.load();
    });
  }

  /** TZ-SHIP-433 — отмена ошибочной отгрузки, confirm + reload (тот же canon, что hub cancel будет использовать позже). */
  cancelShipment(shipment: Shipment): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Отменить отгрузку?',
        description: `Отменить отгрузку «${shipment.number}»? Заказ вернётся в «Готов».`,
        confirmLabel: 'Отменить',
        cancelLabel: 'Не отменять',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.busy.set(true);
      void firstValueFrom(this.shipmentsApi.cancelShipment(shipment._id)).then((result) => {
        this.busy.set(false);
        if (!result.ok) {
          this.toast.error(extractErrorMessage(result.error) || 'Не удалось отменить отгрузку');
          return;
        }
        this.toast.success('Отгрузка отменена — заказ вернулся в «Готов»');
        this.load();
        void this.loadOrders();
      });
    });
  }

  markDelivered(shipment: Shipment): void {
    this.busy.set(true);
    void firstValueFrom(this.shipmentsApi.update(shipment._id, { status: 'delivered' })).then((result) => {
      this.busy.set(false);
      if (!result.ok) {
        this.toast.error(extractErrorMessage(result.error) || 'Не удалось изменить статус');
        return;
      }
      this.load();
    });
  }

  private async loadOrders(): Promise<void> {
    const result = await firstValueFrom(this.ordersApi.list());
    if (result.ok) this.orders.set(result.data ?? []);
  }

  private async loadLookups(): Promise<void> {
    const [orders, warehouses] = await Promise.all([
      firstValueFrom(this.ordersApi.list()),
      firstValueFrom(this.warehousesApi.list()),
    ]);
    if (orders.ok) this.orders.set(orders.data ?? []);
    if (warehouses.ok) this.warehouses.set(warehouses.data ?? []);
    else this.toast.error(extractErrorMessage(warehouses.error) || 'Не удалось загрузить список складов');
  }
}
