import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

/**
 * TZ-83 Phase B: WorkType mirror of backend `WorkType` schema
 * (`backend/src/modules/work-type/work-type.schema.ts`).
 *
 * `workCenterId` may be either a string ID (unpopulated) or a populated
 * WorkCenter object — UI consumers should tolerate both shapes via
 * `String(...)` extraction. See MaterialsService / PidPhotoService for
 * the same populate-tolerant convention.
 */
export interface WorkType {
  _id: string;
  name: string;
  section?: string;
  description?: string;
  isActive: boolean;
  department?: string;
  defaultDurationHours?: number;
  workCenterId?: string | { _id: string; name: string };
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkTypeListResponse {
  items: WorkType[];
  total: number;
}

export interface WorkTypeListParams {
  workCenterId?: string;
  /** if true, server returns only isActive=true (frontend filter for picker use-case). */
  activeOnly?: boolean;
}

/**
 * TZ-83 Phase B: WorkTypesService.
 *
 * Speech pattern: silent-http Observable<SilentResult<T>> — never throws,
 * single `.subscribe(res => res.ok ? … : …)` consumer pattern.
 *
 * Routes:
 *   GET    /work-types                  → WorkType[]
 *   GET    /work-types/:id              → WorkType
 *   POST   /work-types                  → WorkType
 *   PATCH  /work-types/:id              → WorkType
 *   DELETE /work-types/:id              → void
 *
 * Backend WorkTypeController.findAll does NOT paginate (returns array).
 * Frontend wraps it in `{ items, total }` for compatibility with
 * MaterialsService list-shape convention. To enable pagination later,
 * add `?page=N&limit=M` to backend controller and update this shim.
 */
@Injectable({ providedIn: 'root' })
export class WorkTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: WorkTypeListParams = {}): Observable<SilentResult<WorkTypeListResponse>> {
    let httpParams = new HttpParams();
    if (params.workCenterId) httpParams = httpParams.set('workCenterId', params.workCenterId);
    // TZ-83 cleanup: idiomatic `map` instead of hand-rolled Observable shim.
    // Backend returns raw WorkType[]; we wrap in { items, total } so consumers
    // can treat work-types list response same shape as materials/orgs/units.
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

  findById(id: string): Observable<SilentResult<WorkType>> {
    return silentGet<WorkType>(this.http, `${this.baseUrl}/work-types/${id}`);
  }

  create(payload: Partial<WorkType>): Observable<SilentResult<WorkType>> {
    return silentPost<WorkType>(this.http, `${this.baseUrl}/work-types`, payload);
  }

  update(id: string, payload: Partial<WorkType>): Observable<SilentResult<WorkType>> {
    return silentPatch<WorkType>(this.http, `${this.baseUrl}/work-types/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/work-types/${id}`);
  }
}
