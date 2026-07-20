import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentDelete, silentGet, silentPost, SilentResult } from '../../core/silent-http';

export type MovementType = 'in' | 'out' | 'adjust' | 'transfer';

export interface StockMovement {
  _id: string;
  type: MovementType;
  productId: string;
  product?: { _id: string; name: string; sku?: string };
  warehouseId: string;
  warehouse?: { _id: string; name: string };
  zoneName?: string;
  qty: number;
  documentRef?: string;
  note?: string;
  date: string;
  createdAt?: string;
}

export interface StockMovementsListResponse {
  items: StockMovement[];
  total: number;
}

export interface MovementSummary {
  period: string;
  totalIn: number;
  totalOut: number;
  totalAdjust: number;
}

/**
 * StockMovementsService — connects frontend to stock-movement endpoints.
 */
@Injectable({ providedIn: 'root' })
export class StockMovementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: {
      warehouseId?: string;
      productId?: string;
      type?: string;
      from?: string;
      to?: string;
    } = {},
  ): Observable<SilentResult<StockMovementsListResponse>> {
    let httpParams = new HttpParams();
    if (params.warehouseId) httpParams = httpParams.set('warehouseId', params.warehouseId);
    if (params.productId) httpParams = httpParams.set('productId', params.productId);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);
    return silentGet<StockMovementsListResponse>(this.http, `${this.baseUrl}/stock-movements`, {
      params: httpParams,
    });
  }

  summary(period: 'day' | 'week' | 'month' = 'month'): Observable<SilentResult<MovementSummary>> {
    return silentGet<MovementSummary>(this.http, `${this.baseUrl}/inventory/movements/summary`, {
      params: new HttpParams().set('period', period),
    });
  }

  create(payload: Partial<StockMovement>): Observable<SilentResult<StockMovement>> {
    return silentPost<StockMovement>(this.http, `${this.baseUrl}/stock-movements`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/stock-movements/${id}`);
  }
}
