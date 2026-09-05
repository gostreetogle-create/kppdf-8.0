import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentGet,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  PutOnStockPayload,
  StorageAdjustPayload,
  StorageItem,
  StorageItemsListParams,
  StorageItemsListResponse,
} from './storage-item.types';

/** Thin NX client for StorageItem balances and its existing write endpoints. */
@Injectable({ providedIn: 'root' })
export class PiStorageItemsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: StorageItemsListParams = {},
  ): Observable<SilentResult<StorageItemsListResponse>> {
    let httpParams = new HttpParams();
    if (params.warehouseId)
      httpParams = httpParams.set('warehouseId', params.warehouseId);
    if (params.materialId)
      httpParams = httpParams.set('materialId', params.materialId);
    if (params.productId)
      httpParams = httpParams.set('productId', params.productId);
    if (params.lowStock) httpParams = httpParams.set('lowStock', 'true');
    return silentGet<StorageItemsListResponse>(
      this.http,
      `${this.baseUrl}/storage-items`,
      {
        params: httpParams,
      },
    );
  }

  createForMaterial(
    materialId: string,
    payload: PutOnStockPayload,
  ): Observable<SilentResult<StorageItem>> {
    return silentPost<StorageItem>(
      this.http,
      `${this.baseUrl}/materials/${materialId}/storage-items`,
      payload,
    );
  }

  adjust(
    id: string,
    payload: StorageAdjustPayload,
  ): Observable<SilentResult<StorageItem>> {
    return silentPost<StorageItem>(
      this.http,
      `${this.baseUrl}/storage-items/${id}/adjust`,
      payload,
    );
  }
}
