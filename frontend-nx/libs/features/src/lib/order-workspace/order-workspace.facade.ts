/**
 * TZ-NX-ORDER-WS-FACADE-SHELL — domain facade for `OrderDetailPage`.
 *
 * Owns: order load/reload, payment fact (optimistic PATCH + revert), КП
 * (studio deep-link) and status/meta label helpers — moved as-is from the
 * page. TZ-NX-ORDER-WS-HEADER adds: confirm (draft→confirmed PATCH) and
 * cancel (`POST /orders/:id/cancel`), both behind an `AlertDialogComponent`
 * confirm (same pattern as `order-hub`'s ship/cancel-shipment dialogs).
 * Status transition rules unchanged — both write paths reuse existing
 * backend endpoints, no new graph edges.
 *
 * TZ-NX-ORDER-WS-COMPOSITION adds: add/qty/remove/ready line writes + a
 * lazy per-line composition tree. Backend `mapItems` maps items **by
 * array index** and only falls back to the previous line's `lineId`/
 * `boardLane`/`status`/`readyForWork` — `productName`/`productSku`/`unit`/
 * `ownerUserId`/`plannedShipDate` have NO fallback, so every items PATCH
 * here resends the full existing payload for untouched lines (`toItemPayload`)
 * to avoid silently wiping them. Items are writable only in `draft`/
 * `confirmed` (`PLAN_EDITABLE_FROZEN`/`HARD_FROZEN` block the rest) —
 * `canEditComposition()` is the honest gate. Ready toggle uses the
 * dedicated `PATCH .../ready` endpoint, not the general items PATCH.
 *
 * TZ-NX-ORDER-WS-EXECUTION adds: supply counters (`PiSupplyRequestsService.list({orderId})`,
 * same shape as `order-hub.facade.ts`'s `loadSupply()`), «Подтвердить материалы»
 * reusing the same `KitReserveConfirmDialogComponent`, and a deficit
 * short-list derived from the *already-loaded* supply-requests response
 * (pending — not yet ordered/received/cancelled) — no extra
 * `getKitAvailability` calls per line, so no fake "всё ОК"/invented short.
 *
 * TZ-NX-ORDER-WS-LOGISTICS ports `order-hub.facade.ts`'s reservations +
 * shipment logic verbatim (same APIs/gates/formulas, no second write-path):
 * reservations key by `order.number` (not `_id` — documented gotcha),
 * shipments key by `order._id`; `activeShipment()` = first non-cancelled;
 * ship/cancel-shipment reuse `ShipConfirmDialogComponent`/`PiOrdersService.ship()`/
 * `PiShipmentsService.cancelShipment()` exactly as the hub tray does.
 *
 * TZ-NX-ORDER-WS-META-INLINE adds: editable Наша фирма/Заказчик/Объект —
 * was a dead-end «—» with no write. `organizationId` needed a one-line
 * backend fix (`OrderService.update` validated it via the DTO but never
 * applied it to the document — see the PATCH-graph comment on `setOrganization`).
 * Changing `counterpartyId` MUST carry a matching `siteId` in the **same**
 * PATCH — the backend's `sites.assertBelongsTo` check runs on every update
 * that touches either field, and rejects a stale site left over from the
 * old counterparty; `setCounterparty` resolves the new counterparty's
 * default site via `PiSitesService.ensureDefault` first, exactly like
 * `order-create.page.ts` does at creation time, then PATCHes both fields
 * together. `createOrganization`/`createCounterparty`/`createSite` open
 * their dialogs from the *page* (not here) — this facade lives in
 * `libs/features`, those dialogs live in `apps/kppdf-web`, and NX module
 * boundaries don't let a lib import an app. This facade only ever
 * receives the finished payload back.
 */
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import {
  PiCompositionService,
  PiCounterpartiesService,
  PiOrdersService,
  PiOrganizationsService,
  PiSitesService,
  PiProductsService,
  PiReservationsService,
  PiShipmentsService,
  PiSupplyRequestsService,
  type CompositionTreeNode,
  type Counterparty,
  type CreateCounterpartyPayload,
  type CreateOrganizationPayload,
  type CreateSitePayload,
  type KitReserveResult,
  type Order,
  type OrderItem,
  type OrderItemPayload,
  type Organization,
  type Product,
  type ProductDetail,
  type Shipment,
  type Site,
  type SupplyRequest,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import {
  KitReserveConfirmDialogComponent,
  type KitReserveConfirmDialogData,
} from '../order-hub/ui/kit-reserve-confirm-dialog.component';
import {
  ProductFormDialogComponent,
  type ProductFormDialogData,
} from '../registry-forms/ui/product-form-dialog.component';
import {
  ShipConfirmDialogComponent,
  type ShipConfirmDialogData,
  type ShipConfirmResult,
} from '../order-hub/ui/ship-confirm-dialog.component';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';

const CANCELLABLE_STATUSES = new Set(['draft', 'confirmed', 'in_production', 'ready']);
const COMPOSITION_EDITABLE_STATUSES = new Set(['draft', 'confirmed']);
const PENDING_SUPPLY_STATUSES = new Set(['requested', 'in_progress']);
export type SupplyCounters = { readonly total: number; readonly ordered: number; readonly received: number };
export const EMPTY_SUPPLY_COUNTERS: SupplyCounters = { total: 0, ordered: 0, received: 0 };
export type ReservationCounters = { readonly active: number; readonly total: number };
export const EMPTY_RESERVATION_COUNTERS: ReservationCounters = { active: 0, total: 0 };

/**
 * `orderStatusLabel`/`bannerTone` stay on the page (shared `order-status.ts`
 * is also used by `orders-list.page.ts` and `home.page.ts`, out of this
 * TZ's conflict keys — no reason to relocate a pure label helper across an
 * app→lib boundary just for this facade).
 */
@Injectable()
export class OrderWorkspaceFacade {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly organizationsApi = inject(PiOrganizationsService);
  private readonly counterpartiesApi = inject(PiCounterpartiesService);
  private readonly sitesApi = inject(PiSitesService);
  private readonly productsApi = inject(PiProductsService);
  private readonly compositionApi = inject(PiCompositionService);
  private readonly supplyApi = inject(PiSupplyRequestsService);
  private readonly reservationsApi = inject(PiReservationsService);
  private readonly shipmentsApi = inject(PiShipmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly order = signal<Order | null>(null);
  /** Payment fact mirror: optimistically toggled, reverted on PATCH failure (isPaid не врёт). */
  readonly paid = signal(false);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заказ.');
  readonly confirming = signal(false);
  readonly cancelling = signal(false);

  /** TZ-NX-ORDER-WS-META-INLINE — Наша фирма/Заказчик/Объект picker options + in-flight flag. */
  readonly organizations = signal<readonly Organization[]>([]);
  private organizationsLoaded = false;
  readonly counterparties = signal<readonly Counterparty[]>([]);
  private counterpartiesLoaded = false;
  /** Sites for the order's *current* counterparty — reloaded on every counterparty change. */
  readonly sites = signal<readonly Site[]>([]);
  readonly savingMeta = signal(false);

  readonly products = signal<readonly Product[]>([]);
  private productsLoaded = false;
  readonly addingLine = signal(false);
  readonly savingLineIndex = signal<number | null>(null);
  readonly removingLineIndex = signal<number | null>(null);
  readonly expandedLineIndex = signal<number | null>(null);
  readonly lineTrees = signal<Record<number, CompositionTreeNode | null>>({});
  readonly lineTreeLoading = signal<number | null>(null);
  /** Add-line draft fields — plain mutable (not signals), same pattern as `SupplyFacade`'s inline-create fields. */
  newLineProductId = '';
  newLineQty = 1;

  readonly supplyLoading = signal(false);
  readonly supplyError = signal<string | null>(null);
  readonly supplyCounters = signal<SupplyCounters>(EMPTY_SUPPLY_COUNTERS);
  /** Deficit short-list — pending (not yet ordered/received/cancelled) supply requests, shown only if non-empty. */
  readonly pendingSupplyRequests = signal<readonly SupplyRequest[]>([]);

  readonly reservationLoading = signal(false);
  readonly reservationError = signal<string | null>(null);
  readonly reservationCounters = signal<ReservationCounters>(EMPTY_RESERVATION_COUNTERS);

  readonly shipmentsLoading = signal(false);
  readonly shipmentsError = signal<string | null>(null);
  readonly shipments = signal<readonly Shipment[]>([]);

  load(): void {
    this.status.set('loading');
    this.expandedLineIndex.set(null);
    this.lineTrees.set({});
    void firstValueFrom(this.ordersApi.getById(this.id())).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.order.set(result.data ?? null);
      this.paid.set(result.data?.isPaid === true);
      this.status.set('success');
      this.loadOrganizations();
      this.loadCounterparties();
      const currentCounterpartyId = this.counterpartyId();
      if (currentCounterpartyId) this.loadSites(currentCounterpartyId);
      this.loadProducts();
      this.loadSupply();
      this.loadReservations();
      this.loadShipments();
    });
  }

  private loadOrganizations(): void {
    if (this.organizationsLoaded) return;
    this.organizationsLoaded = true;
    this.organizationsApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.ok) this.organizations.set(result.data?.items ?? []);
      });
  }

  private loadCounterparties(): void {
    if (this.counterpartiesLoaded) return;
    this.counterpartiesLoaded = true;
    this.counterpartiesApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.ok) this.counterparties.set(result.data?.items ?? []);
      });
  }

  private loadSites(counterpartyId: string): void {
    this.sitesApi
      .list(counterpartyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.ok) this.sites.set(result.data ?? []);
      });
  }

  /** Current order's organization id — plain string, `Order.organizationId` is never populated. */
  organizationId(): string {
    return this.order()?.organizationId ?? '';
  }

  /** Current order's counterparty id, unwrapped from the populated-or-plain union. */
  counterpartyId(): string {
    const c = this.order()?.counterpartyId;
    if (!c) return '';
    return typeof c === 'string' ? c : c._id;
  }

  /** Current order's site id, unwrapped from the populated-or-plain union. */
  siteId(): string {
    const s = this.order()?.siteId;
    if (!s) return '';
    return typeof s === 'string' ? s : s._id;
  }

  /**
   * TZ-NX-ORDER-WS-META-INLINE — needed a one-line backend fix first
   * (`OrderService.update` validated `organizationId` via the inherited
   * DTO but never applied it to the document — PATCH returned 200 and
   * silently did nothing). Unlike `counterpartyId`/`siteId`, org has no
   * cross-field invariant, so a lone PATCH is safe.
   */
  async setOrganization(organizationId: string): Promise<void> {
    const order = this.order();
    if (!order || !organizationId) return;
    this.savingMeta.set(true);
    const result = await firstValueFrom(this.ordersApi.update(order._id, { organizationId }));
    this.savingMeta.set(false);
    if (!result.ok) {
      this.toast.error('Не удалось назначить фирму', { description: extractErrorMessage(result.error) });
      return;
    }
    if (result.data) this.order.set(result.data);
  }

  /**
   * Backend's `sites.assertBelongsTo` runs on every PATCH touching
   * `counterpartyId` or `siteId` — changing counterparty alone would leave
   * the order's old site orphaned and get rejected. Resolve the new
   * counterparty's default site first (same `ensureDefault` call
   * `order-create.page.ts` makes at creation time) and PATCH both fields
   * together.
   */
  async setCounterparty(counterpartyId: string): Promise<void> {
    const order = this.order();
    if (!order || !counterpartyId) return;
    this.savingMeta.set(true);
    const site = await firstValueFrom(this.sitesApi.ensureDefault(counterpartyId));
    if (!site.ok) {
      this.savingMeta.set(false);
      this.toast.error('Не удалось определить объект нового заказчика', {
        description: extractErrorMessage(site.error),
      });
      return;
    }
    const result = await firstValueFrom(
      this.ordersApi.update(order._id, { counterpartyId, siteId: site.data._id }),
    );
    this.savingMeta.set(false);
    if (!result.ok) {
      this.toast.error('Не удалось сменить заказчика', { description: extractErrorMessage(result.error) });
      return;
    }
    if (result.data) this.order.set(result.data);
    this.loadSites(counterpartyId);
  }

  /** Site change within the same counterparty — no cross-field invariant to resolve first. */
  async setSite(siteId: string): Promise<void> {
    const order = this.order();
    if (!order || !siteId) return;
    this.savingMeta.set(true);
    const result = await firstValueFrom(this.ordersApi.update(order._id, { siteId }));
    this.savingMeta.set(false);
    if (!result.ok) {
      this.toast.error('Не удалось сменить объект', { description: extractErrorMessage(result.error) });
      return;
    }
    if (result.data) this.order.set(result.data);
  }

  async createOrganization(payload: CreateOrganizationPayload): Promise<void> {
    const result = await firstValueFrom(this.organizationsApi.create(payload));
    if (!result.ok) {
      this.toast.error('Не удалось создать фирму', { description: extractErrorMessage(result.error) });
      return;
    }
    this.organizations.update((list) => [...list, result.data]);
    await this.setOrganization(result.data._id);
  }

  async createCounterparty(payload: CreateCounterpartyPayload): Promise<void> {
    const result = await firstValueFrom(this.counterpartiesApi.create(payload));
    if (!result.ok) {
      this.toast.error('Не удалось создать заказчика', { description: extractErrorMessage(result.error) });
      return;
    }
    this.counterparties.update((list) => [...list, result.data]);
    await this.setCounterparty(result.data._id);
  }

  async createSite(payload: CreateSitePayload): Promise<void> {
    const result = await firstValueFrom(this.sitesApi.create(payload));
    if (!result.ok) {
      this.toast.error('Не удалось создать объект', { description: extractErrorMessage(result.error) });
      return;
    }
    this.sites.update((list) => [...list, result.data]);
    await this.setSite(result.data._id);
  }

  private loadProducts(): void {
    if (this.productsLoaded) return;
    this.productsLoaded = true;
    this.productsApi
      .list({ isActive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.ok) this.products.set(result.data?.items ?? []);
      });
  }

  /**
   * TZ-NX-ORDER-WS-PRODUCT-SELECT-ADD — reuses the existing
   * `ProductFormDialogComponent` (registry-forms; already lives in this
   * same lib, unlike the org/counterparty/site dialogs). It owns its own
   * create POST internally and closes with the saved `ProductDetail`; on
   * success the new product is appended to the picker list and selected
   * — NOT auto-added as a line (the manager still presses «Добавить
   * позицию», same rule as `createOrganization`/`createCounterparty`/
   * `createSite` never auto-committing beyond the field they fill).
   */
  openCreateProduct(): void {
    const ref = this.dialog.open<ProductDetail | null | undefined, ProductFormDialogData>(
      ProductFormDialogComponent,
      {
        data: { mode: 'create' },
        parentDestroyRef: this.destroyRef,
        dismissOnEscape: false,
        dismissOnBackdropClick: false,
      },
    );
    onDialogCloseOnce(ref, this.injector, (product) => {
      if (!product) return;
      this.products.update((list) => [...list, product]);
      this.newLineProductId = product._id;
    });
  }

  loadSupply(): void {
    const order = this.order();
    if (!order) return;
    this.supplyLoading.set(true);
    this.supplyError.set(null);
    this.supplyApi
      .list({ orderId: order._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.supplyLoading.set(false);
        if (!result.ok) {
          this.supplyError.set(extractErrorMessage(result.error) || 'Не удалось загрузить задачи снабжения');
          return;
        }
        const requests = result.data ?? [];
        this.supplyCounters.set({
          total: requests.length,
          ordered: requests.filter((r) => r.status === 'ordered').length,
          received: requests.filter((r) => r.status === 'received').length,
        });
        this.pendingSupplyRequests.set(requests.filter((r) => PENDING_SUPPLY_STATUSES.has(r.status)));
      });
  }

  openKitReserveConfirm(): void {
    const order = this.order();
    if (!order) return;
    const ref = this.dialog.open<KitReserveResult | undefined, KitReserveConfirmDialogData>(
      KitReserveConfirmDialogComponent,
      {
        data: { order },
        width: 'md',
        ariaLabel: 'Подтверждение материалов',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (result) this.loadSupply();
    });
  }

  /** Reservations key by `order.number` — `Reservation.orderId` stores the number, not `_id` (same gotcha as the hub tray). */
  loadReservations(): void {
    const order = this.order();
    if (!order) return;
    this.reservationLoading.set(true);
    this.reservationError.set(null);
    this.reservationsApi
      .list({ orderId: order.number })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.reservationLoading.set(false);
        if (!result.ok) {
          this.reservationError.set(extractErrorMessage(result.error) || 'Не удалось загрузить брони');
          return;
        }
        const rows = result.data ?? [];
        this.reservationCounters.set({
          active: rows.filter((row) => row.status === 'active').length,
          total: rows.length,
        });
      });
  }

  loadShipments(): void {
    const order = this.order();
    if (!order) return;
    this.shipmentsLoading.set(true);
    this.shipmentsError.set(null);
    this.shipmentsApi
      .list({ orderId: order._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.shipmentsLoading.set(false);
        if (!result.ok) {
          this.shipmentsError.set(extractErrorMessage(result.error) || 'Не удалось загрузить отгрузку');
          this.shipments.set([]);
          return;
        }
        this.shipments.set(result.data ?? []);
      });
  }

  /** TZ-SHIP-433 canon — «активная» отгрузка = не отменённая. */
  activeShipment(): Shipment | null {
    return this.shipments().find((shipment) => shipment.status !== 'cancelled') ?? null;
  }

  hasShipment(): boolean {
    const status = this.order()?.status;
    return this.activeShipment() !== null || status === 'shipped' || status === 'delivered';
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

  /** TZ-SHIP-433 canon — cancel only before dispatch (draft/scheduled, no dispatchedAt). */
  shipmentCancellable(): boolean {
    const shipment = this.activeShipment();
    if (!shipment) return false;
    return (shipment.status === 'draft' || shipment.status === 'scheduled') && !shipment.dispatchedAt;
  }

  cancelActiveShipment(): void {
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
        .subscribe((result) => {
          if (!result.ok) {
            this.toast.error(extractErrorMessage(result.error) || 'Не удалось отменить отгрузку');
            return;
          }
          this.toast.success('Отгрузка отменена — заказ вернулся в «Готов»');
          this.loadShipments();
        });
    });
  }

  /** Mirrors legacy `canMarkShipped()` gate (TZ-DESK-430 / order-hub TZ-NX-SHIP-S3). */
  canMarkShipped(): boolean {
    const status = this.order()?.status;
    return status !== 'shipped' && status !== 'delivered' && status !== 'cancelled';
  }

  /** «Отгружено» без документа: confirm dialog → whole-order POST ship → reload. */
  openShipConfirm(): void {
    const order = this.order();
    if (!order) return;
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

  /** Same formula as the orders-list "Готовность X/Y" — `items[].readyForWork`, never `OrderItem.status`. */
  readyLineCount(): number {
    return (this.order()?.items ?? []).filter((it) => it.readyForWork === true).length;
  }

  totalLineCount(): number {
    return (this.order()?.items ?? []).length;
  }

  bannerTone(status?: string): 'warning' | 'info' | 'destructive' | 'neutral' {
    if (status === 'draft') return 'warning';
    if (status === 'cancelled') return 'destructive';
    return 'info';
  }

  quotationId(): string | null {
    const q = this.order()?.quotationId;
    if (!q) return null;
    return typeof q === 'string' ? q : (q._id ?? null);
  }

  quotationNumber(): string | null {
    const q = this.order()?.quotationId;
    if (!q || typeof q === 'string') return null;
    return q.number ?? null;
  }

  async setPaid(paid: boolean, control?: HTMLInputElement): Promise<void> {
    const current = this.order();
    if (!current) return;
    const previous = this.paid();
    this.paid.set(paid);
    const result = await firstValueFrom(this.ordersApi.update(current._id, { isPaid: paid }));
    if (!result.ok) {
      this.toast.error('Не удалось сохранить отметку оплаты', {
        description: extractErrorMessage(result.error),
      });
      this.paid.set(previous);
      // Angular rewrites the checkbox only when the bound value changes; a failed
      // PATCH leaves the native toggle flipped, so re-assert the control itself.
      if (control) control.checked = previous;
      return;
    }
    if (result.data) {
      this.order.set(result.data);
      this.paid.set(result.data.isPaid === true);
    }
  }

  openQuotationInStudio(): void {
    const quotationId = this.quotationId();
    if (!quotationId) return;
    void this.router.navigate(['/studio'], { queryParams: { quotationId } });
  }

  fmtDate(value?: string): string {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('ru-RU');
  }

  /** TZ-SWEEP-401 PATCH graph: draft is the only status this header offers to confirm from. */
  canConfirm(): boolean {
    return this.order()?.status === 'draft';
  }

  /** Hide the CTA once the order is already cancelled/shipped/delivered — nothing to cancel. */
  canCancel(): boolean {
    const status = this.order()?.status;
    return !!status && CANCELLABLE_STATUSES.has(status);
  }

  confirmOrder(): void {
    const order = this.order();
    if (!order) return;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Подтвердить заказ?',
        description: `Заказ №${order.number} перейдёт в статус «Подтверждён».`,
        confirmLabel: 'Подтвердить',
        cancelLabel: 'Отмена',
        variant: 'default',
      },
      width: 'sm',
      ariaLabel: 'Подтвердить заказ',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.confirming.set(true);
      this.ordersApi
        .update(order._id, { status: 'confirmed' })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          this.confirming.set(false);
          if (!result.ok) {
            this.toast.error('Не удалось подтвердить заказ', {
              description: extractErrorMessage(result.error),
            });
            return;
          }
          if (result.data) this.order.set(result.data);
        });
    });
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Отменить заказ?',
        description: `Заказ №${order.number} будет отменён, брони сняты. Действие необратимо.`,
        confirmLabel: 'Отменить заказ',
        cancelLabel: 'Не отменять',
        variant: 'destructive',
      },
      width: 'sm',
      ariaLabel: 'Отменить заказ',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.cancelling.set(true);
      this.ordersApi
        .cancel(order._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          this.cancelling.set(false);
          if (!result.ok) {
            this.toast.error('Не удалось отменить заказ', {
              description: extractErrorMessage(result.error),
            });
            return;
          }
          if (result.data) this.order.set(result.data);
        });
    });
  }

  /** TZ-SWEEP-401: `PLAN_EDITABLE_FROZEN`/`HARD_FROZEN` block items PATCH outside draft/confirmed. */
  canEditComposition(): boolean {
    const status = this.order()?.status;
    return !!status && COMPOSITION_EDITABLE_STATUSES.has(status);
  }

  private toItemPayload(item: OrderItem): OrderItemPayload {
    return {
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unit: item.unit,
      ownerUserId: typeof item.ownerUserId === 'string' ? item.ownerUserId : item.ownerUserId?._id,
      plannedShipDate: item.plannedShipDate,
      readyForWork: item.readyForWork,
    };
  }

  toggleLineTree(index: number): void {
    const wasOpen = this.expandedLineIndex() === index;
    this.expandedLineIndex.set(wasOpen ? null : index);
    if (wasOpen) return;
    if (this.lineTrees()[index] !== undefined) return; // already cached (incl. cached null on failure)
    const item = this.order()?.items?.[index];
    if (!item) return;
    this.lineTreeLoading.set(index);
    this.compositionApi
      .getProductTree(item.productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.lineTreeLoading.set(null);
        this.lineTrees.update((cache) => ({ ...cache, [index]: result.ok ? result.data : null }));
      });
  }

  async updateQty(index: number, quantity: number): Promise<void> {
    const order = this.order();
    const items = order?.items;
    if (!order || !items || quantity <= 0) return;
    const payload: OrderItemPayload[] = items.map((it, i) =>
      i === index ? { ...this.toItemPayload(it), quantity } : this.toItemPayload(it),
    );
    this.savingLineIndex.set(index);
    const result = await firstValueFrom(this.ordersApi.update(order._id, { items: payload }));
    this.savingLineIndex.set(null);
    if (!result.ok) {
      this.toast.error('Не удалось изменить количество', { description: extractErrorMessage(result.error) });
      return;
    }
    if (result.data) this.order.set(result.data);
  }

  async toggleReady(index: number, readyForWork: boolean): Promise<void> {
    const order = this.order();
    if (!order) return;
    this.savingLineIndex.set(index);
    const result = await firstValueFrom(this.ordersApi.setLineReady(order._id, index, readyForWork));
    this.savingLineIndex.set(null);
    if (!result.ok) {
      this.toast.error('Не удалось изменить готовность строки', { description: extractErrorMessage(result.error) });
      return;
    }
    if (result.data) this.order.set(result.data);
  }

  removeLine(index: number): void {
    const order = this.order();
    const item = order?.items?.[index];
    if (!order || !item) return;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить позицию?',
        description: `«${item.productName ?? item.productId}» будет удалена из заказа.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Не удалять',
        variant: 'destructive',
      },
      width: 'sm',
      ariaLabel: 'Удалить позицию',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      const items = order.items ?? [];
      const payload: OrderItemPayload[] = items.filter((_, i) => i !== index).map((it) => this.toItemPayload(it));
      this.removingLineIndex.set(index);
      this.ordersApi
        .update(order._id, { items: payload })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          this.removingLineIndex.set(null);
          if (!result.ok) {
            // Backend rejects a non-trailing delete (line already left `prep`) with an honest RU message.
            this.toast.error('Не удалось удалить позицию', { description: extractErrorMessage(result.error) });
            return;
          }
          if (result.data) this.order.set(result.data);
          this.expandedLineIndex.set(null);
        });
    });
  }

  async addLine(): Promise<void> {
    const order = this.order();
    if (!order || !this.newLineProductId) return;
    const product = this.products().find((p) => p._id === this.newLineProductId);
    if (!product) return;
    const qty = this.newLineQty > 0 ? this.newLineQty : 1;
    const existing = (order.items ?? []).map((it) => this.toItemPayload(it));
    const payload: OrderItemPayload[] = [
      ...existing,
      { productId: product._id, productName: product.name, unit: product.unit, quantity: qty },
    ];
    this.addingLine.set(true);
    const result = await firstValueFrom(this.ordersApi.update(order._id, { items: payload }));
    this.addingLine.set(false);
    if (!result.ok) {
      this.toast.error('Не удалось добавить позицию', { description: extractErrorMessage(result.error) });
      return;
    }
    if (result.data) this.order.set(result.data);
    this.newLineProductId = '';
    this.newLineQty = 1;
  }

  private id(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }
}
