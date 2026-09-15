/**
 * TZ-NX-ORDER-WS-FACADE-SHELL — domain facade for `OrderDetailPage`.
 *
 * Owns: order load/reload, payment fact (optimistic PATCH + revert), КП
 * (studio deep-link) and status/meta label helpers — moved as-is from the
 * page. TZ-NX-ORDER-WS-HEADER adds: organization name lookup, confirm
 * (draft→confirmed PATCH) and cancel (`POST /orders/:id/cancel`), both
 * behind an `AlertDialogComponent` confirm (same pattern as `order-hub`'s
 * ship/cancel-shipment dialogs). Status transition rules unchanged — both
 * write paths reuse existing backend endpoints, no new graph edges.
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
 */
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import {
  PiCompositionService,
  PiOrdersService,
  PiOrganizationsService,
  PiProductsService,
  type CompositionTreeNode,
  type Order,
  type OrderItem,
  type OrderItemPayload,
  type Product,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';

const CANCELLABLE_STATUSES = new Set(['draft', 'confirmed', 'in_production', 'ready']);
const COMPOSITION_EDITABLE_STATUSES = new Set(['draft', 'confirmed']);

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
  private readonly productsApi = inject(PiProductsService);
  private readonly compositionApi = inject(PiCompositionService);
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
  readonly organizationName = signal<string | null>(null);
  readonly confirming = signal(false);
  readonly cancelling = signal(false);

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

  load(): void {
    this.status.set('loading');
    this.organizationName.set(null);
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
      this.loadOrganizationName(result.data?.organizationId);
      this.loadProducts();
    });
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

  private loadOrganizationName(organizationId: string | undefined): void {
    if (!organizationId) return;
    this.organizationsApi
      .getById(organizationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.ok) this.organizationName.set(result.data?.name ?? null);
      });
  }

  bannerTone(status?: string): 'warning' | 'info' | 'destructive' | 'neutral' {
    if (status === 'draft') return 'warning';
    if (status === 'cancelled') return 'destructive';
    return 'info';
  }

  counterpartyName(): string | null {
    const c = this.order()?.counterpartyId;
    if (!c) return null;
    return typeof c === 'string' ? c : (c.name ?? null);
  }

  siteName(): string | null {
    const s = this.order()?.siteId;
    if (!s) return null;
    if (typeof s === 'string') return s;
    const parts = [s.name, s.address].filter((p): p is string => !!p);
    return parts.length > 0 ? parts.join(' · ') : null;
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
