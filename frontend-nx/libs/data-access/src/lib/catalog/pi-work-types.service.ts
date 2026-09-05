import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  API_BASE_URL,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  WorkType,
  WorkTypeListParams,
  WorkTypeListResponse,
  WorkTypeUpdatePayload,
  WorkTypeWritePayload,
} from './work-type.types';

/**
 * WorkType client for the production estimate path and the NX registry.
 * Backend `GET /work-types` does not paginate (returns array); `activeOnly`
 * filtering is applied client-side, wrapped in the `{ items, total }` envelope.
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

  create(payload: WorkTypeWritePayload): Observable<SilentResult<WorkType>> {
    return silentPost<WorkType>(this.http, `${this.baseUrl}/work-types`, payload);
  }

  /** Full catalog PATCH; Gantt may still pass the narrower `{ days }` shape. */
  update(id: string, payload: WorkTypeUpdatePayload | { days: number }): Observable<SilentResult<WorkType>> {
    return silentPatch<WorkType>(this.http, `${this.baseUrl}/work-types/${id}`, payload);
  }

  /** Soft-delete (`DELETE /work-types/:id`). */
  archive(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/work-types/${id}`);
  }
}
