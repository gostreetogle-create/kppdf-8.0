import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentDelete, silentGet, silentPatch, silentPost, SilentResult } from '../../core/silent-http';

export interface Unit {
  _id: string;
  key: string;
  label: string;
  symbol?: string;
  category?: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
}

export interface UnitsListResponse {
  items: Unit[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUnitPayload {
  key: string;
  label: string;
  symbol?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * TZ-NEW UnitsService — wraps the units CRUD endpoints behind
 * `SilentResult` so the observable never errors and consumers can
 * handle success/failure with full type narrowing via the
 * discriminated union.
 *
 * See `frontend/src/app/core/silent-http.ts` for the rationale.
 */
@Injectable({ providedIn: 'root' })
export class UnitsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: { page?: number; limit?: number; search?: string; isActive?: boolean } = {}): Observable<SilentResult<UnitsListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', String(params.isActive));
    return silentGet<UnitsListResponse>(this.http, `${this.baseUrl}/units`, { params: httpParams });
  }

  listActive(): Observable<SilentResult<Unit[]>> {
    return silentGet<Unit[]>(this.http, `${this.baseUrl}/units/active`);
  }

  create(payload: CreateUnitPayload): Observable<SilentResult<Unit>> {
    return silentPost<Unit>(this.http, `${this.baseUrl}/units`, payload);
  }

  update(key: string, payload: Partial<CreateUnitPayload>): Observable<SilentResult<Unit>> {
    return silentPatch<Unit>(this.http, `${this.baseUrl}/units/${key}`, payload);
  }

  remove(key: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/units/${key}`);
  }
}
