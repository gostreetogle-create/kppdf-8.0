import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { SupplyRequest, SupplyRequestsListParams } from './supply-request.types';

/** Backend `SupplyRequestService.findAll` hard cap — no page/limit query params. */
export const SUPPLY_REQUESTS_LIST_CAP = 500;

/**
 * TZ-NX-SUPPLY-REQUEST-REGISTRY-READ — read-only SupplyRequest list/detail.
 * List returns a plain array (max 500 rows); registry uses client-side paging.
 */
@Injectable({ providedIn: 'root' })
export class PiSupplyRequestsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: SupplyRequestsListParams = {}): Observable<SilentResult<SupplyRequest[]>> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);
    return silentGet<SupplyRequest[]>(this.http, `${this.baseUrl}/supply-requests`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<SupplyRequest>> {
    return silentGet<SupplyRequest>(this.http, `${this.baseUrl}/supply-requests/${id}`);
  }
}
