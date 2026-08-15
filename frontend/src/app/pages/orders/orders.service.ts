import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

export type OrderStatus =
  'draft' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface OrderItem {
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  total?: number;
  /** TZ-ORDERS-303: ответственный за изделие. */
  ownerUserId?: string | { _id: string; displayName?: string; username?: string };
  /** TZ-ORDERS-303: плановая дата отгрузки позиции. */
  plannedShipDate?: string;
  readyForWork?: boolean;
  readyAt?: string;
  readyByUserId?: string | { _id: string; displayName?: string; username?: string };
}

/** TZ-ORDERS-306: populated КП заказа (настоящее или заглушка). */
export interface OrderProposalRef {
  _id: string;
  number?: string;
  status?: string;
  /** Заглушка, созданная из прямого заказа — цены ещё не считали. */
  isStub?: boolean;
  total?: number;
}

export interface Order {
  _id: string;
  number: string;
  /**
   * Backend may auto-populate this as a full Counterparty object via
   * Mongoose `.populate('counterpartyId')`. Consumers MUST accept
   * either a string ID (unpopulated) or Counterparty object.
   * Page-level lookup table handles the dual shape — same pattern as
   * supplierId in materials.page.ts.
   */
  counterpartyId?: string | { _id: string; name?: string };
  /** TZ-ORDERS-303: площадка/объект. */
  siteId?: string | { _id: string; name?: string; address?: string };
  /**
   * КП заказа. `GET /orders/:id` отдаёт его populated, список — тоже, поэтому
   * потребитель обязан принимать и строку, и объект (как counterpartyId).
   */
  quotationId?: string | OrderProposalRef;
  contractId?: string;
  date?: string;
  plannedDate?: string;
  statusId?: string;
  status: OrderStatus;
  total?: number;
  notes?: string;
  materialsSource?: 'own' | 'customer';
  isActive?: boolean;
  items?: OrderItem[];
  deliveryAddress?: string;
  managerId?: string;
  priority?: OrderPriority;
  shipmentIds?: string[];
  reservationIds?: string[];
  /** UI-only virtual column key; readiness is calculated from items[].readyForWork. */
  readyForWork?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * TZ-NEW OrdersService — connects the operational site to
 * `backend/src/modules/order/order.controller.ts`.
 *
 * NOTE — backend response shape divergence:
 *  - GET /orders returns a FLAT ARRAY (not the canonical
 *    `{items, total, page, limit}` envelope). The backend service
 *    doesn't paginate yet — it pushes pagination/sortBy/search to
 *    client-side for v1. Page layer handles this with a local
 *    filter + flat-list render.
 *  - Business actions (reserve-stock, ship, cancel) NOT exposed in
 *    v1 — only CRUD. They exist on backend and are scheduled for a
 *    state-machine iteration when workflow rules are finalized.
 *
 * See `core/silent-http.ts` for the silent-error rationale.
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Order[]>> {
    return silentGet<Order[]>(this.http, `${this.baseUrl}/orders`);
  }

  findById(id: string): Observable<SilentResult<Order>> {
    return silentGet<Order>(this.http, `${this.baseUrl}/orders/${id}`);
  }

  create(payload: Partial<Order>): Observable<SilentResult<Order>> {
    return silentPost<Order>(this.http, `${this.baseUrl}/orders`, payload);
  }

  setLineReady(
    id: string,
    lineIndex: number,
    readyForWork: boolean,
  ): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}/items/${lineIndex}/ready`, {
      readyForWork,
    });
  }

  update(id: string, payload: Partial<Order>): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}`, payload);
  }

  /**
   * TZ-ORDERS-306: черновик КП для прямого заказа. Идемпотентно — если КП уже
   * есть, backend вернёт его с `created: false`.
   */
  createStubProposal(
    id: string,
  ): Observable<
    SilentResult<{ quotationId: string; created: boolean; quotation: OrderProposalRef }>
  > {
    return silentPost<{ quotationId: string; created: boolean; quotation: OrderProposalRef }>(
      this.http,
      `${this.baseUrl}/orders/${id}/stub-proposal`,
      {},
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/orders/${id}`);
  }
}
