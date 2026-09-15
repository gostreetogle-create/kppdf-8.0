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
 */
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, PiOrganizationsService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';

const CANCELLABLE_STATUSES = new Set(['draft', 'confirmed', 'in_production', 'ready']);

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

  load(): void {
    this.status.set('loading');
    this.organizationName.set(null);
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

  private id(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }
}
