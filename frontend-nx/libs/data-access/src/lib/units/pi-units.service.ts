import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, type SilentResult } from '@kppdf/util-http';

/** Mirrors `backend/src/modules/unit/unit.schema.ts` — canonical slug is `key`. */
export interface Unit {
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

export interface UnitsListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface UpdateUnitPayload {
  label?: string;
  symbol?: string | null;
  category?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

/** Server-side page size ceiling (`UnitService.findAll` clamps to 100). */
export const UNITS_MAX_PAGE_SIZE = 100;

/**
 * TZ-NX-REGISTRY-UNITS-READ-SLICE — real Units list + PATCH behind
 * `SilentResult` (read slice: list + toggle-active only; no create/delete).
 */
@Injectable({ providedIn: 'root' })
export class PiUnitsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: UnitsListParams = {}): Observable<SilentResult<UnitsListResponse>> {
    const limit = Math.min(UNITS_MAX_PAGE_SIZE, params.limit ?? 50);
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', String(params.isActive));
    }
    return silentGet<UnitsListResponse>(this.http, `${this.baseUrl}/units`, { params: httpParams });
  }

  update(key: string, payload: UpdateUnitPayload): Observable<SilentResult<Unit>> {
    return silentPatch<Unit>(this.http, `${this.baseUrl}/units/${key}`, payload);
  }

  remove(key: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/units/${key}`);
  }
}
