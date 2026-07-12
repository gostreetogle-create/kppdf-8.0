import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentDelete, silentGet, silentPatch, silentPost, SilentResult } from '../../core/silent-http';

export interface StorageItem {
  _id: string;
  name?: string;
  description?: string;
  warehouseId: string;
  warehouse?: { _id: string; name: string };
  productId: string;
  product?: { _id: string; name: string; sku?: string };
  zoneName?: string;
  quantity: number;
  reservedQty: number;
  minQuantity: number;
  weightKg?: number;
  isActive: boolean;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StorageItemsListResponse {
  items: StorageItem[];
  total: number;
}

export interface AdjustPayload {
  delta: number;
  reason: string;
}

/**
 * StorageItemsService — connects frontend to storage-item CRUD endpoints.
 */
@Injectable({ providedIn: 'root' })
export class StorageItemsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: { warehouseId?: string; productId?: string; lowStock?: boolean } = {}): Observable<SilentResult<StorageItemsListResponse>> {
    let httpParams = new HttpParams();
    if (params.warehouseId) httpParams = httpParams.set('warehouseId', params.warehouseId);
    if (params.productId) httpParams = httpParams.set('productId', params.productId);
    if (params.lowStock) httpParams = httpParams.set('lowStock', 'true');
    return silentGet<StorageItemsListResponse>(this.http, `${this.baseUrl}/storage-items`, { params: httpParams });
  }

  findById(id: string): Observable<SilentResult<StorageItem>> {
    return silentGet<StorageItem>(this.http, `${this.baseUrl}/storage-items/${id}`);
  }

  create(payload: Partial<StorageItem>): Observable<SilentResult<StorageItem>> {
    return silentPost<StorageItem>(this.http, `${this.baseUrl}/products/${payload.productId}/storage-items`, payload);
  }

  update(id: string, payload: Partial<StorageItem>): Observable<SilentResult<StorageItem>> {
    return silentPatch<StorageItem>(this.http, `${this.baseUrl}/storage-items/${id}`, payload);
  }

  adjust(id: string, payload: AdjustPayload): Observable<SilentResult<StorageItem>> {
    return silentPost<StorageItem>(this.http, `${this.baseUrl}/storage-items/${id}/adjust`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/storage-items/${id}`);
  }

  lowStock(): Observable<SilentResult<StorageItemsListResponse>> {
    return silentGet<StorageItemsListResponse>(this.http, `${this.baseUrl}/inventory/low-stock`);
  }
}
