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
  KitAvailability,
  KitReserveResult,
  Order,
  PatchEstimateDaysPayload,
  PatchEstimateStartPayload,
  PatchEstimateWorkerPayload,
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

  /** TZ-NX-GANTT-G14 — explicit order-scoped worker assignment override. */
  patchEstimateWorker(
    id: string,
    payload: PatchEstimateWorkerPayload,
  ): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}/estimate-worker`, payload);
  }

  /**
   * TZ-NX-SUPPLY-S2 — preview material need/available/status for one order
   * line, from the S0 `KitReserveService` (dual-read composition, no separate
   * BOM model).
   */
  getKitAvailability(
    orderId: string,
    orderItemIndex: number,
  ): Observable<SilentResult<KitAvailability>> {
    return silentGet<KitAvailability>(
      this.http,
      `${this.baseUrl}/orders/${orderId}/items/${orderItemIndex}/kit-availability`,
    );
  }

  /**
   * TZ-NX-SUPPLY-S2 — confirm: reserve ok-lines atomically, create a
   * `SupplyRequest` for short lines (soft shortage, never a silent partial
   * reserve, no OUT stock movement).
   */
  confirmKitReserve(
    orderId: string,
    orderItemIndex: number,
  ): Observable<SilentResult<KitReserveResult>> {
    return silentPost<KitReserveResult>(
      this.http,
      `${this.baseUrl}/orders/${orderId}/items/${orderItemIndex}/kit-reserve`,
      {},
    );
  }
}