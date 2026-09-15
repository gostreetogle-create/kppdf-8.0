/**
 * TZ-NX-SHIPPING-PAGE-FACADE — domain facade for `ShippingPage`.
 *
 * Owns: list/filter/expand signals and every load/create/dispatch/cancel/
 * edit/doc method — moved as-is from the page. No route/page component
 * has an `@Input()` here, so the facade's own constructor safely
 * subscribes to `route.queryParamMap` and bootstraps `loadLookups()`
 * directly (same pattern as `WarehousesFacade`/`StockMovementsFacade`),
 * no bind()-host workaround needed.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
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
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';
import { ShipmentCreateDialogComponent, type ShipmentCreateDialogData } from './ui/shipment-create-dialog.component';
import { ShipmentEditDialogComponent, type ShipmentEditDialogData } from './ui/shipment-edit-dialog.component';
import { ShipmentDocDialogComponent, type ShipmentDocDialogData, DOC_TYPE_LABELS } from './ui/shipment-doc-dialog.component';

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: 'Черновик',
  scheduled: 'Запланирована',
  in_transit: 'В пути',
  delivered: 'Доставлена',
  cancelled: 'Отменена',
};

@Injectable()
export class ShippingFacade {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly warehousesApi = inject(PiWarehousesService);
  private readonly shipmentsApi = inject(PiShipmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statuses: readonly ShipmentStatus[] = ['draft', 'scheduled', 'in_transit', 'delivered', 'cancelled'];
  readonly shipments = signal<readonly Shipment[]>([]);
  readonly orders = signal<readonly Order[]>([]);
  readonly warehouses = signal<readonly Warehouse[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить отгрузки.');
  readonly busy = signal(false);
  readonly statusFilter = signal<ShipmentStatus | ''>('');
  readonly orderFilter = signal('');
  /** Single expand (registry pattern) — reloading the list collapses it. */
  readonly expandedId = signal<string | null>(null);
  readonly docTypeLabels = DOC_TYPE_LABELS;

  readonly orderFilterLabel = computed(() => {
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

  statusLabel(status: ShipmentStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  fmtDate(value?: string): string {
    return value ? new Date(value).toLocaleDateString('ru-RU') : '—';
  }

  orderLabel(orderId: Shipment['orderId']): string {
    if (typeof orderId === 'string') {
      return this.orders().find((order) => order._id === orderId)?.number ?? orderId.slice(-6);
    }
    return orderId.number ?? orderId._id.slice(-6);
  }

  docTypeLabel(type: string): string {
    return this.docTypeLabels[type] ?? type;
  }

  toggleExpand(shipmentId: string): void {
    this.expandedId.update((current) => (current === shipmentId ? null : shipmentId));
  }

  onRowSpace(event: Event, shipmentId: string): void {
    event.preventDefault();
    this.toggleExpand(shipmentId);
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as ShipmentStatus | '');
    this.load();
  }

  onOrderFilterChange(event: Event): void {
    const orderId = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: orderId || null },
      queryParamsHandling: 'merge',
    });
  }

  clearOrderFilter(): void {
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
