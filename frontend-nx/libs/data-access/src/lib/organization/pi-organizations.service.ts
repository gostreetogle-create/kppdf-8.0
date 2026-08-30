import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type {
  CreateOrganizationPayload,
  Organization,
  UpdateOrganizationPayload,
  OrganizationsListParams,
  OrganizationsListResponse,
} from './organization.types';

/** Server-side page size ceiling (`OrganizationService.findAll` clamps to 100). */
export const ORGANIZATIONS_MAX_PAGE_SIZE = 100;

/**
 * TZ-NX-ORGANIZATION-REGISTRY-READ — read-only Organization list/detail.
 * Supplier is an Organization with `type` containing `supplier`; no separate collection.
 */
@Injectable({ providedIn: 'root' })
export class PiOrganizationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: OrganizationsListParams = {}): Observable<SilentResult<OrganizationsListResponse>> {
    const limit = Math.min(ORGANIZATIONS_MAX_PAGE_SIZE, params.limit ?? 25);
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.type) httpParams = httpParams.set('type', params.type);
    return silentGet<OrganizationsListResponse>(this.http, `${this.baseUrl}/organizations`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<Organization>> {
    return silentGet<Organization>(this.http, `${this.baseUrl}/organizations/${id}`);
  }

  create(payload: CreateOrganizationPayload): Observable<SilentResult<Organization>> {
    return silentPost<Organization>(this.http, `${this.baseUrl}/organizations`, payload);
  }

  update(id: string, payload: UpdateOrganizationPayload): Observable<SilentResult<Organization>> {
    return silentPatch<Organization>(this.http, `${this.baseUrl}/organizations/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/organizations/${id}`);
  }
}
