import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, SilentResult } from '../../core/silent-http';

/** HUB-304 — reservation status (read-only hub). */
export type ReservationStatus = 'active' | 'released' | 'fulfilled' | 'cancelled';

/**
 * SoT for hub warehouse block: `GET /api/reservations?orderId=<Order.number>`.
 * `orderId` is the business number, not Mongo `_id`.
 */
export interface Reservation {
  _id: string;
  orderId: string;
  productId: string;
  warehouseId: string;
  qty: number;
  status: ReservationStatus;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * List reservations. Optional `orderNumber` maps to query `orderId`
   * (Order.number — not Mongo `_id`).
   */
  list(orderNumber?: string): Observable<SilentResult<Reservation[]>> {
    let params = new HttpParams();
    if (orderNumber) params = params.set('orderId', orderNumber);
    return silentGet<Reservation[]>(this.http, `${this.baseUrl}/reservations`, {
      params,
    });
  }
}
