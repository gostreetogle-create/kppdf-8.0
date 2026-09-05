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
  CreateStockMovementPayload,
  StockMovement,
  StockMovementsListParams,
  StockMovementsListResponse,
} from './stock-movement.types';

/** Thin NX client for the existing atomic stock-movement API. */
@Injectable({ providedIn: 'root' })
export class PiStockMovementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: StockMovementsListParams = {},
  ): Observable<SilentResult<StockMovementsListResponse>> {
    let httpParams = new HttpParams();
    if (params.warehouseId)
      httpParams = httpParams.set('warehouseId', params.warehouseId);
    if (params.materialId)
      httpParams = httpParams.set('materialId', params.materialId);
    if (params.productId)
      httpParams = httpParams.set('productId', params.productId);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);
    return silentGet<StockMovementsListResponse>(
      this.http,
      `${this.baseUrl}/stock-movements`,
      { params: httpParams },
    );
  }

  create(
    payload: CreateStockMovementPayload,
  ): Observable<SilentResult<StockMovement>> {
    return silentPost<StockMovement>(
      this.http,
      `${this.baseUrl}/stock-movements`,
      payload,
    );
  }
}
