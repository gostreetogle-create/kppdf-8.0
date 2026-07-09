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
  | 'draft'
  | 'confirmed'
  | 'in_production'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface OrderItem {
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
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
  quotationId?: string;
  contractId?: string;
  date?: string;
  plannedDate?: string;
  statusId?: string;
  status: OrderStatus;
  total?: number;
  notes?: string;
  isActive?: boolean;
  items?: OrderItem[];
  deliveryAddress?: string;
  managerId?: string;
  priority?: OrderPriority;
  shipmentIds?: string[];
  reservationIds?: string[];
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

  update(
    id: string,
    payload: Partial<Order>,
  ): Observable<SilentResult<Order>> {
    return silentPatch<Order>(
      this.http,
      `${this.baseUrl}/orders/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/orders/${id}`);
  }
}
