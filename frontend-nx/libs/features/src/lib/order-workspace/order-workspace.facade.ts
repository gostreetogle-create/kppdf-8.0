/**
 * TZ-NX-ORDER-WS-FACADE-SHELL — domain facade for `OrderDetailPage`.
 *
 * Owns: order load/reload, payment fact (optimistic PATCH + revert), КП
 * (studio deep-link) and status/meta label helpers — moved as-is from the
 * page. Later waves (HEADER/COMPOSITION/EXECUTION/LOGISTICS/DOCS-CHIPS) add
 * their own signals/methods here; no status/transition rule changes.
 */
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';

/**
 * `orderStatusLabel`/`bannerTone` stay on the page (shared `order-status.ts`
 * is also used by `orders-list.page.ts` and `home.page.ts`, out of this
 * TZ's conflict keys — no reason to relocate a pure label helper across an
 * app→lib boundary just for this facade).
 */
@Injectable()
export class OrderWorkspaceFacade {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);

  readonly order = signal<Order | null>(null);
  /** Payment fact mirror: optimistically toggled, reverted on PATCH failure (isPaid не врёт). */
  readonly paid = signal(false);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заказ.');

  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.ordersApi.getById(this.id())).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.order.set(result.data ?? null);
      this.paid.set(result.data?.isPaid === true);
      this.status.set('success');
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

  private id(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }
}
