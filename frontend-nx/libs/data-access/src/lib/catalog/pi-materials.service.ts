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
  CreateMaterialPayload,
  Material,
  MaterialsListParams,
  MaterialsListResponse,
  UpdateMaterialPayload,
} from './material.types';

/** Server-side page size ceiling (`MaterialService.findAll` clamps to 100). */
export const MATERIALS_MAX_PAGE_SIZE = 100;

/**
 * Materials catalog API — list/get (TZ-NX-CATALOG-DATA-ACCESS-READ) plus
 * create/update/duplicate/archive for registry row dialogs (TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS).
 * Organization scope comes from JWT via `authInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class PiMaterialsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: MaterialsListParams = {}): Observable<SilentResult<MaterialsListResponse>> {
    const limit = Math.min(MATERIALS_MAX_PAGE_SIZE, params.limit ?? 50);
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.materialKind) httpParams = httpParams.set('materialKind', params.materialKind);
    return silentGet<MaterialsListResponse>(this.http, `${this.baseUrl}/materials`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<Material>> {
    return silentGet<Material>(this.http, `${this.baseUrl}/materials/${id}`);
  }

  create(payload: CreateMaterialPayload): Observable<SilentResult<Material>> {
    return silentPost<Material>(this.http, `${this.baseUrl}/materials`, payload);
  }

  update(id: string, payload: UpdateMaterialPayload): Observable<SilentResult<Material>> {
    return silentPatch<Material>(this.http, `${this.baseUrl}/materials/${id}`, payload);
  }

  duplicate(id: string): Observable<SilentResult<Material>> {
    return silentPost<Material>(this.http, `${this.baseUrl}/materials/${id}/duplicate`, {});
  }

  /** Soft-delete (`DELETE /materials/:id` sets `deletedAt`). */
  archive(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/materials/${id}`);
  }
}
