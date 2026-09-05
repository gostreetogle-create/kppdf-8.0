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
  Person,
  PersonListParams,
  PersonListResponse,
  PersonUpdatePayload,
  PersonWritePayload,
} from './person.types';

/** API client for the org-scoped Worker/People registry and Gantt labels. */
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

  create(payload: PersonWritePayload): Observable<SilentResult<Person>> {
    return silentPost<Person>(this.http, `${this.baseUrl}/workers`, payload);
  }

  update(id: string, payload: PersonUpdatePayload): Observable<SilentResult<Person>> {
    return silentPatch<Person>(this.http, `${this.baseUrl}/workers/${id}`, payload);
  }

  /** Soft-delete (`DELETE /workers/:id`). */
  archive(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/workers/${id}`);
  }
}
