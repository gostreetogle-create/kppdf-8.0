import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  API_BASE_URL,
  silentGet,
  silentPatch,
  type SilentResult,
} from '@kppdf/util-http';
import type { WorkType, WorkTypeListParams, WorkTypeListResponse } from './work-type.types';

/**
 * TZ-NX-GANTT-G2/G5 — WorkType client for the production estimate path.
 * Backend `GET /work-types` does not paginate (returns array); `activeOnly`
 * filtering is applied client-side, wrapped in the `{ items, total }` envelope
 * (legacy parity). `update` (G5) patches the catalog — the Gantt confirms
 * «для ВСЕХ заказов» before calling it (never a silent global edit).
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

  /** TZ-NX-GANTT-G5 — catalog days PATCH (`PATCH /work-types/:id`), confirm-gated in the page. */
  update(id: string, payload: { days: number }): Observable<SilentResult<WorkType>> {
    return silentPatch<WorkType>(this.http, `${this.baseUrl}/work-types/${id}`, payload);
  }
}