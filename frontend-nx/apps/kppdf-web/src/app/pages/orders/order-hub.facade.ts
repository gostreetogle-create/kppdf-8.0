/**
 * TZ-NX-ORDER-HUB-FACADE — domain facade for `OrderHubTrayComponent`.
 *
 * Owns: composition/supply/reservations/shipments signals and every
 * load/ship/reserve/cancel/composition method — moved as-is from the tray.
 * Ship/reserve business rules unchanged.
 */
import { DestroyRef, Injectable, Injector, Signal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  PiCompositionService,
  PiOrdersService,
  PiReservationsService,
  PiShipmentsService,
  PiSupplyRequestsService,
  type CompositionTreeNode,
  type KitReserveResult,
  type Order,
  type Shipment,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { CompositionTreeSelectEvent } from '@kppdf/features/composition';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import {
  KitReserveConfirmDialogComponent,
  type KitReserveConfirmDialogData,
  ShipConfirmDialogComponent,
  type ShipConfirmDialogData,
  type ShipConfirmResult,
} from '@kppdf/features/order-hub';

export type SupplyCounters = { readonly ordered: number; readonly received: number; readonly total: number };
export type ReservationCounters = { readonly active: number; readonly total: number };

export const EMPTY_SUPPLY_COUNTERS: SupplyCounters = { ordered: 0, received: 0, total: 0 };
export const EMPTY_RESERVATION_COUNTERS: ReservationCounters = { active: 0, total: 0 };

/** Bound accessor — the host `OrderHubTrayComponent`'s `order` input, wired once via `bind()`. */
export interface OrderHubFacadeHost {
  order: Signal<Order>;
}

@Injectable()
export class OrderHubFacade {
  private readonly compositionApi = inject(PiCompositionService);
  private readonly supplyApi = inject(PiSupplyRequestsService);
  private readonly reservationsApi = inject(PiReservationsService);
  private readonly shipmentsApi = inject(PiShipmentsService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);

  private host!: OrderHubFacadeHost;

  /** Wire the host's `order` input signal — call once from the component constructor. */
  bind(host: OrderHubFacadeHost): void {
    this.host = host;
  }

  private order(): Order {
    return this.host.order();
  }

  readonly compositionExpanded = signal(false);
  readonly compositionLoading = signal(false);
  readonly compositionRoots = signal<readonly (CompositionTreeNode | null)[]>([]);
  readonly compositionSelectedId = signal<string | null>(null);
  private compositionLoaded = false;

  readonly supplyLoading = signal(false);
  readonly supplyError = signal<string | null>(null);
  readonly supplyCounters = signal<SupplyCounters>(EMPTY_SUPPLY_COUNTERS);

  readonly reservationLoading = signal(false);
  readonly reservationError = signal<string | null>(null);
  readonly reservationCounters = signal<ReservationCounters>(EMPTY_RESERVATION_COUNTERS);

  readonly shipmentsLoading = signal(false);
  readonly shipmentsError = signal<string | null>(null);
  readonly shipments = signal<readonly Shipment[]>([]);

  /** Row-expand-lazy (HUB-303 budget: supply=1 + reservations=1 + shipments=1). Call from `ngOnInit`. */
  init(): void {
    this.loadSupply();
    this.loadReservations();
    this.loadShipments();
  }

  onCompositionSelect(ev: CompositionTreeSelectEvent): void {
    this.compositionSelectedId.set(ev.node._id);
  }

  toggleComposition(): void {
    this.compositionExpanded.update((open) => !open);
    if (this.compositionExpanded() && !this.compositionLoaded) {
      this.loadComposition();
    }
  }

  openKitReserveConfirm(event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open<KitReserveResult | undefined, KitReserveConfirmDialogData>(
      KitReserveConfirmDialogComponent,
      {
        data: { order: this.order() },
        width: 'md',
        ariaLabel: 'Подтверждение материалов',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (result) {
        this.loadSupply();
        this.loadReservations();
      }
    });
  }

  private loadComposition(): void {
    const items = this.order().items ?? [];
    if (items.length === 0) return;
    this.compositionLoaded = true;
    this.compositionLoading.set(true);
    forkJoin(items.map((item) => this.compositionApi.getProductTree(item.productId)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.compositionLoading.set(false);
        this.compositionRoots.set(results.map((res) => (res.ok ? res.data : null)));
      });
  }

  private loadSupply(): void {
    this.supplyLoading.set(true);
    this.supplyError.set(null);
    this.supplyApi
      .list({ orderId: this.order()._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.supplyLoading.set(false);
        if (!res.ok) {
          this.supplyError.set(extractErrorMessage(res.error) || 'Не удалось загрузить задачи снабжения');
          return;
        }
        const tasks = res.data ?? [];
        this.supplyCounters.set({
          ordered: tasks.filter((task) => task.status === 'ordered').length,
          received: tasks.filter((task) => task.status === 'received').length,
          total: tasks.length,
        });
      });
  }

  /** TZ-NX-SHIP-S2 — real shipment summary for the hub tray (replaces order-status stub). */
  private loadShipments(): void {
    this.shipmentsLoading.set(true);
    this.shipmentsError.set(null);
    this.shipmentsApi
      .list({ orderId: this.order()._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.shipmentsLoading.set(false);
        if (!res.ok) {
          this.shipmentsError.set(extractErrorMessage(res.error) || 'Не удалось загрузить отгрузку');
          this.shipments.set([]);
          return;
        }
        this.shipments.set(res.data ?? []);
      });
  }

  /** TZ-SHIP-433 canon — «активная» отгрузка = не отменённая; cancelled не держит блок «Отгружен». */
  activeShipment(): Shipment | null {
    return this.shipments().find((shipment) => shipment.status !== 'cancelled') ?? null;
  }

  hasShipment(): boolean {
    return (
      this.activeShipment() !== null || this.order().status === 'shipped' || this.order().status === 'delivered'
    );
  }

  shipmentNumber(): string {
    return this.activeShipment()?.number ?? '—';
  }

  shipmentDateLabel(): string {
    const raw = this.activeShipment()?.date ?? this.activeShipment()?.createdAt;
    if (!raw) return '—';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('ru-RU');
  }

  shipmentHasDocs(): boolean {
    return (this.activeShipment()?.docs?.length ?? 0) > 0;
  }

  /** TZ-NX-SHIP-S4 / TZ-SHIP-433 canon — cancel only before dispatch (draft/scheduled, no dispatchedAt). */
  shipmentCancellable(): boolean {
    const shipment = this.activeShipment();
    if (!shipment) return false;
    return (shipment.status === 'draft' || shipment.status === 'scheduled') && !shipment.dispatchedAt;
  }

  /** TZ-NX-SHIP-S4 — undo a mistaken ship from the hub, before dispatch, without opening /shipping. */
  cancelActiveShipment(event: Event): void {
    event.stopPropagation();
    const shipment = this.activeShipment();
    if (!shipment) return;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Отменить отгрузку?',
        description: `Отменить отгрузку «${shipment.number}»? Заказ вернётся в «Готов».`,
        confirmLabel: 'Отменить',
        cancelLabel: 'Не отменять',
        variant: 'destructive',
      },
      width: 'sm',
      ariaLabel: 'Отменить отгрузку',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.shipmentsApi
        .cancelShipment(shipment._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error) || 'Не удалось отменить отгрузку');
            return;
          }
          this.toast.success('Отгрузка отменена — заказ вернулся в «Готов»');
          this.loadShipments();
        });
    });
  }

  /** TZ-NX-SHIP-S3 — mirrors legacy `canMarkShipped()` gate (TZ-DESK-430). */
  canMarkShipped(): boolean {
    const status = this.order().status;
    return status !== 'shipped' && status !== 'delivered' && status !== 'cancelled';
  }

  /** TZ-NX-SHIP-S3 — «Отгружено» без документа: confirm dialog → whole-order POST ship → reload. */
  openShipConfirm(event: Event): void {
    event.stopPropagation();
    const order = this.order();
    const ref = this.dialog.open<ShipConfirmResult | undefined, ShipConfirmDialogData>(ShipConfirmDialogComponent, {
      data: { order },
      width: 'sm',
      ariaLabel: 'Отгрузка без документа',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.ordersApi
        .ship(order._id, { ...result })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error) || 'Не удалось отметить заказ отгруженным');
            return;
          }
          this.toast.success('Заказ отмечен отгруженным');
          this.loadShipments();
        });
    });
  }

  private loadReservations(): void {
    this.reservationLoading.set(true);
    this.reservationError.set(null);
    this.reservationsApi
      .list({ orderId: this.order().number })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.reservationLoading.set(false);
        if (!res.ok) {
          this.reservationError.set(extractErrorMessage(res.error) || 'Не удалось загрузить брони');
          return;
        }
        const rows = res.data ?? [];
        this.reservationCounters.set({
          active: rows.filter((row) => row.status === 'active').length,
          total: rows.length,
        });
      });
  }
}
