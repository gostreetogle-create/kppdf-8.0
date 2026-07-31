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

export interface Currency {
  _id: string;
  key: string;
  label: string;
  code: string;
  symbol: string;
  rate: number;
  isBase: boolean;
  locale: string;
  precision: number;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
}

export interface CurrenciesListResponse {
  items: Currency[];
  total: number;
  page: number;
  limit: number;
}

export interface CurrenciesListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: CurrenciesListParams = {}): Observable<SilentResult<CurrenciesListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', String(params.isActive));
    }
    return silentGet<CurrenciesListResponse>(this.http, `${this.baseUrl}/currencies`, {
      params: httpParams,
    });
  }

  findByKey(key: string): Observable<SilentResult<Currency>> {
    return silentGet<Currency>(this.http, `${this.baseUrl}/currencies/${key}`);
  }

  create(payload: Partial<Currency>): Observable<SilentResult<Currency>> {
    return silentPost<Currency>(this.http, `${this.baseUrl}/currencies`, payload);
  }

  update(key: string, payload: Partial<Currency>): Observable<SilentResult<Currency>> {
    return silentPatch<Currency>(this.http, `${this.baseUrl}/currencies/${key}`, payload);
  }

  remove(key: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/currencies/${key}`);
  }
}
