import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '../../core/silent-http';

export interface AdminRole {
  id: string;
  name: string;
  label: string;
  description?: string;
  permissions: string[];
  /** Nav pageKey ACL (TZ-ADMIN-301 / ACCESS-301). */
  pages?: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminRolesListResponse {
  items: AdminRole[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminRolesListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminRoleMutationPayload {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
  pages?: string[];
}

@Injectable({ providedIn: 'root' })
export class PiRolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: AdminRolesListParams = {}): Observable<SilentResult<AdminRolesListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<AdminRolesListResponse>(this.http, `${this.baseUrl}/admin/roles`, {
      params: httpParams,
    });
  }

  create(payload: AdminRoleMutationPayload): Observable<SilentResult<AdminRole>> {
    return silentPost<AdminRole>(this.http, `${this.baseUrl}/admin/roles`, payload);
  }

  update(
    id: string,
    payload: Omit<AdminRoleMutationPayload, 'name'>,
  ): Observable<SilentResult<AdminRole>> {
    return silentPatch<AdminRole>(this.http, `${this.baseUrl}/admin/roles/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<{ success: true }>> {
    return silentDelete<{ success: true }>(this.http, `${this.baseUrl}/admin/roles/${id}`);
  }
}
