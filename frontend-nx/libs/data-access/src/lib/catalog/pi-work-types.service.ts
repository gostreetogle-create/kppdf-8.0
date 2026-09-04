import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  API_BASE_URL,
  silentGet,
  type SilentResult,
} from '@kppdf/util-http';
import type { WorkType, WorkTypeListParams, WorkTypeListResponse } from './work-type.types';

/**
 * TZ-NX-GANTT-G2 — read-only WorkType client for the production estimate path.
 * Backend `GET /work-types` does not paginate (returns array); `activeOnly`
 * filtering is applied client-side, wrapped in the `{ items, total }` envelope
 * (legacy parity). Write endpoints stay out of scope — catalog days are only
 * edited via the explicit confirm path in G5.
 */
@Injectable({ providedIn: 'root' })
export class PiWorkTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: WorkTypeListParams = {}): Observable<SilentResult<WorkTypeListResponse>> {
    let httpParams = new HttpParams();
    if (params.workCenterId) httpParams = httpParams.set('workCenterId', params.workCenterId);
    return silentGet<WorkType[]>(this.http, `${this.baseUrl}/work-types`, {
      params: httpParams,
    }).pipe(
      map((res) => {
        if (!res.ok) return res;
        const arr = (res.data ?? []) as WorkType[];
        const items = params.activeOnly ? arr.filter((w) => w.isActive) : arr;
        return { ok: true as const, data: { items, total: items.length } };
      }),
    );
  }

  getById(id: string): Observable<SilentResult<WorkType>> {
    return silentGet<WorkType>(this.http, `${this.baseUrl}/work-types/${id}`);
  }
}