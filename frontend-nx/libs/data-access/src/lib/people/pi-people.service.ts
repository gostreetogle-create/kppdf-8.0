import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentGet,
  type SilentResult,
} from '@kppdf/util-http';
import type { Person, PersonListParams, PersonListResponse } from './person.types';

/**
 * TZ-NX-GANTT-G2 — read-only People client against `/workers` (the «Люди»
 * справочник; legacy `PiWorkersService`). Used by the production facade for
 * work-type → person labels (Gantt worker view later in G6). Backend caps
 * `limit` at 100 (`@Max(100)`, TZ-PRODUCTION-334).
 */
@Injectable({ providedIn: 'root' })
export class PiPeopleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(opts: PersonListParams = {}): Observable<SilentResult<PersonListResponse>> {
    let params = new HttpParams();
    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.search) params = params.set('search', opts.search);
    if (opts.isActive != null) params = params.set('isActive', String(opts.isActive));
    if (opts.supplierId) params = params.set('supplierId', opts.supplierId);
    if (opts.workTypeId) params = params.set('workTypeId', opts.workTypeId);
    return silentGet<PersonListResponse>(this.http, `${this.baseUrl}/workers`, { params });
  }

  getById(id: string): Observable<SilentResult<Person>> {
    return silentGet<Person>(this.http, `${this.baseUrl}/workers/${id}`);
  }
}