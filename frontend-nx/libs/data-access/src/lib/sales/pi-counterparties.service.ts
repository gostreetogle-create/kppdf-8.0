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
  CounterpartiesListParams,
  CounterpartiesListResponse,
  Counterparty,
  CreateCounterpartyPayload,
  UpdateCounterpartyPayload,
} from './counterparty.types';

@Injectable({ providedIn: 'root' })
export class PiCounterpartiesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: CounterpartiesListParams = {}): Observable<SilentResult<CounterpartiesListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 200));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    return silentGet<CounterpartiesListResponse>(this.http, `${this.baseUrl}/counterparties`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<Counterparty>> {
    return silentGet<Counterparty>(this.http, `${this.baseUrl}/counterparties/${id}`);
  }

  /** Thin create (TZ-NX-DEALS-D3) — not the full legacy EAV editor payload. */
  create(payload: CreateCounterpartyPayload): Observable<SilentResult<Counterparty>> {
    return silentPost<Counterparty>(this.http, `${this.baseUrl}/counterparties`, payload);
  }

  update(id: string, payload: UpdateCounterpartyPayload): Observable<SilentResult<Counterparty>> {
    return silentPatch<Counterparty>(this.http, `${this.baseUrl}/counterparties/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/counterparties/${id}`);
  }
}