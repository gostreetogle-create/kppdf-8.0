import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { Contract, ContractsListParams } from './contract.types';

/** Read-only (TZ-NX-DEALS-D4) — see `Contract` doc comment for why create/update stay out. */
@Injectable({ providedIn: 'root' })
export class PiContractsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: ContractsListParams = {}): Observable<SilentResult<Contract[]>> {
    let httpParams = new HttpParams();
    if (params.counterpartyId) httpParams = httpParams.set('counterpartyId', params.counterpartyId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);
    return silentGet<Contract[]>(this.http, `${this.baseUrl}/contracts`, { params: httpParams });
  }

  getById(id: string): Observable<SilentResult<Contract>> {
    return silentGet<Contract>(this.http, `${this.baseUrl}/contracts/${id}`);
  }
}
