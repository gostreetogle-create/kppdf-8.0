import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

export type ShipmentStatus = 'draft' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';

export interface ShipmentItem {
  lineId?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unit?: string;
}

export interface ShipmentDocumentLine {
  number: string;
  date: string;
  type: string;
  totalAmount: number;
  signatures?: string[];
  pdfUrl?: string;
  notes?: string;
}

export interface Shipment {
  _id: string;
  number: string;
  orderId: string | { _id: string; number?: string };
  counterpartyId: string | { _id: string; name?: string };
  date: string;
  recipient?: string;
  address?: string;
  status: ShipmentStatus;
  driverInfo?: string;
  warehouseId?: string;
  items: ShipmentItem[];
  notes?: string;
  docs?: ShipmentDocumentLine[];
  dispatchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ShipmentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    filters: { orderId?: string; status?: ShipmentStatus | ''; date?: string } = {},
  ): Observable<SilentResult<Shipment[]>> {
    let params = new HttpParams();
    if (filters.orderId) params = params.set('orderId', filters.orderId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.date) params = params.set('date', filters.date);
    return silentGet<Shipment[]>(this.http, `${this.baseUrl}/shipments`, { params });
  }

  findById(id: string): Observable<SilentResult<Shipment>> {
    return silentGet<Shipment>(this.http, `${this.baseUrl}/shipments/${id}`);
  }

  update(
    id: string,
    payload: Partial<
      Pick<Shipment, 'recipient' | 'address' | 'status' | 'driverInfo' | 'warehouseId' | 'notes'>
    >,
  ): Observable<SilentResult<Shipment>> {
    return silentPatch<Shipment>(this.http, `${this.baseUrl}/shipments/${id}`, payload);
  }

  dispatch(id: string): Observable<SilentResult<Shipment>> {
    return silentPost<Shipment>(this.http, `${this.baseUrl}/shipments/${id}/dispatch`, {});
  }

  /** TZ-SHIP-433 — отмена ошибочной отгрузки (draft/scheduled, без dispatch). */
  cancelShipment(id: string): Observable<SilentResult<Shipment>> {
    return silentPost<Shipment>(this.http, `${this.baseUrl}/shipments/${id}/cancel-shipment`, {});
  }

  addDoc(
    id: string,
    payload: {
      type: string;
      totalAmount: number;
      number?: string;
      date?: string;
      pdfUrl?: string;
      notes?: string;
      signatures?: string[];
    },
  ): Observable<SilentResult<Shipment>> {
    return silentPost<Shipment>(this.http, `${this.baseUrl}/shipments/${id}/add-doc`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/shipments/${id}`);
  }
}
