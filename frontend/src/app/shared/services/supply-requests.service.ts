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

/**
 * TZ-SUPPLY-311 — контракт `/api/supply-requests` (backend TZ-SUPPLY-305).
 * Статусы/приоритеты — строковые enum, совпадающие с UI-моком 304/309.
 */
export type SupplyRequestStatus =
  'in_progress' | 'requested' | 'ordered' | 'received' | 'cancelled';

export type SupplyRequestPriority = 'urgent' | 'normal' | 'low';

export interface SupplyRequest {
  _id: string;
  title?: string;
  categoryId?: string;
  materialId?: string;
  article?: string;
  color?: string;
  productUrl?: string;
  supplierId?: string;
  supplierContactId?: string;
  companyId?: string;
  requestedBy?: string;
  orderId?: string;
  qty: number;
  unit?: string;
  neededBy?: string;
  status: SupplyRequestStatus;
  priority: SupplyRequestPriority;
  notes?: string;
  priceHint?: number;
  lineTotal?: number;
  supplierOrderDate?: string;
  responsible?: string;
  linkedSupplyTaskId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplyRequestListFilters {
  status?: SupplyRequestStatus | '';
  priority?: SupplyRequestPriority | '';
  search?: string;
  orderId?: string;
}

export type CreateSupplyRequestDto = Partial<
  Omit<SupplyRequest, '_id' | 'createdAt' | 'updatedAt'>
>;
export type UpdateSupplyRequestDto = Partial<
  Omit<SupplyRequest, '_id' | 'createdAt' | 'updatedAt'>
>;

@Injectable({ providedIn: 'root' })
export class SupplyRequestsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(filters: SupplyRequestListFilters = {}): Observable<SilentResult<SupplyRequest[]>> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.orderId) params = params.set('orderId', filters.orderId);
    return silentGet<SupplyRequest[]>(this.http, `${this.baseUrl}/supply-requests`, {
      params,
    });
  }

  findById(id: string): Observable<SilentResult<SupplyRequest>> {
    return silentGet<SupplyRequest>(this.http, `${this.baseUrl}/supply-requests/${id}`);
  }

  create(payload: CreateSupplyRequestDto): Observable<SilentResult<SupplyRequest>> {
    return silentPost<SupplyRequest>(this.http, `${this.baseUrl}/supply-requests`, payload);
  }

  update(id: string, payload: UpdateSupplyRequestDto): Observable<SilentResult<SupplyRequest>> {
    return silentPatch<SupplyRequest>(this.http, `${this.baseUrl}/supply-requests/${id}`, payload);
  }

  markOrdered(id: string): Observable<SilentResult<SupplyRequest>> {
    return silentPost<SupplyRequest>(
      this.http,
      `${this.baseUrl}/supply-requests/${id}/ordered`,
      {},
    );
  }

  markReceived(id: string): Observable<SilentResult<SupplyRequest>> {
    return silentPost<SupplyRequest>(
      this.http,
      `${this.baseUrl}/supply-requests/${id}/received`,
      {},
    );
  }

  cancel(id: string): Observable<SilentResult<SupplyRequest>> {
    return silentPost<SupplyRequest>(this.http, `${this.baseUrl}/supply-requests/${id}/cancel`, {});
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/supply-requests/${id}`);
  }
}
