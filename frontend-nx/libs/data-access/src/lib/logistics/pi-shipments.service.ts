import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  Shipment,
  ShipmentAddDocPayload,
  ShipmentListFilters,
  ShipmentUpdatePayload,
} from './shipment.types';

/** Thin NX client mirroring legacy `ShipmentsService` (TZ-NX-SHIP-S0). */
@Injectable({ providedIn: 'root' })
export class PiShipmentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(filters: ShipmentListFilters = {}): Observable<SilentResult<Shipment[]>> {
    let params = new HttpParams();
    if (filters.orderId) params = params.set('orderId', filters.orderId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.date) params = params.set('date', filters.date);
    return silentGet<Shipment[]>(this.http, `${this.baseUrl}/shipments`, { params });
  }

  findById(id: string): Observable<SilentResult<Shipment>> {
    return silentGet<Shipment>(this.http, `${this.baseUrl}/shipments/${id}`);
  }

  update(id: string, payload: ShipmentUpdatePayload): Observable<SilentResult<Shipment>> {
    return silentPatch<Shipment>(this.http, `${this.baseUrl}/shipments/${id}`, payload);
  }

  dispatch(id: string): Observable<SilentResult<Shipment>> {
    return silentPost<Shipment>(this.http, `${this.baseUrl}/shipments/${id}/dispatch`, {});
  }

  /** TZ-SHIP-433 — отмена ошибочной отгрузки (draft/scheduled, без dispatch). */
  cancelShipment(id: string): Observable<SilentResult<Shipment>> {
    return silentPost<Shipment>(this.http, `${this.baseUrl}/shipments/${id}/cancel-shipment`, {});
  }

  addDoc(id: string, payload: ShipmentAddDocPayload): Observable<SilentResult<Shipment>> {
    return silentPost<Shipment>(this.http, `${this.baseUrl}/shipments/${id}/add-doc`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/shipments/${id}`);
  }
}
