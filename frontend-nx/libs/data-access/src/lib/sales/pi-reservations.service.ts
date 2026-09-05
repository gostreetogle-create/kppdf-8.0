import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { Reservation, ReservationsListParams } from './reservation.types';

/**
 * Read-only reservations client (TZ-NX-DEALS-D2 — order hub «Склад» lazy counters).
 * Endpoint filters on `Reservation.orderId`, a plain string mirroring `Order.number`
 * (not `_id`) — same convention as legacy.
 */
@Injectable({ providedIn: 'root' })
export class PiReservationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: ReservationsListParams = {}): Observable<SilentResult<Reservation[]>> {
    let httpParams = new HttpParams();
    if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);
    return silentGet<Reservation[]>(this.http, `${this.baseUrl}/reservations`, {
      params: httpParams,
    });
  }
}
