import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  CreateOrderPayload,
  Order,
  PatchEstimateDaysPayload,
  PatchEstimateStartPayload,
  UpdateOrderPayload,
} from './order.types';

@Injectable({ providedIn: 'root' })
export class PiOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Order[]>> {
    return silentGet<Order[]>(this.http, `${this.baseUrl}/orders`);
  }

  getById(id: string): Observable<SilentResult<Order>> {
    return silentGet<Order>(this.http, `${this.baseUrl}/orders/${id}`);
  }

  create(payload: CreateOrderPayload): Observable<SilentResult<Order>> {
    return silentPost<Order>(this.http, `${this.baseUrl}/orders`, payload);
  }

  update(id: string, payload: UpdateOrderPayload): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}`, payload);
  }

  /**
   * TZ-NX-GANTT-G2 — order-level estimate days override (never the WorkType
   * catalog). Mirrors legacy OrdersService.patchEstimateDays (TZ-PRODUCTION-309).
   */
  patchEstimateDays(
    id: string,
    payload: PatchEstimateDaysPayload,
  ): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}/estimate-days`, payload);
  }

  /**
   * TZ-NX-GANTT-G2 — per-bar start offset from visualAnchor (TZ-PRODUCTION-316).
   */
  patchEstimateStart(
    id: string,
    payload: PatchEstimateStartPayload,
  ): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}/estimate-start`, payload);
  }
}