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

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUsersListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface AdminUserCreatePayload {
  username: string;
  password?: string;
  role: string;
  isActive: boolean;
  email?: string;
  displayName?: string;
}

export interface AdminUserUpdatePayload {
  username: string;
  role: string;
  isActive: boolean;
  email?: string;
  displayName?: string;
}

@Injectable({ providedIn: 'root' })
export class PiUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: AdminUsersListParams = {}): Observable<SilentResult<AdminUsersListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    return silentGet<AdminUsersListResponse>(this.http, `${this.baseUrl}/admin/users`, {
      params: httpParams,
    });
  }

  create(payload: AdminUserCreatePayload): Observable<SilentResult<AdminUser>> {
    return silentPost<AdminUser>(this.http, `${this.baseUrl}/admin/users`, payload);
  }

  update(id: string, payload: AdminUserUpdatePayload): Observable<SilentResult<AdminUser>> {
    return silentPatch<AdminUser>(this.http, `${this.baseUrl}/admin/users/${id}`, payload);
  }

  activate(id: string): Observable<SilentResult<AdminUser>> {
    return silentPost<AdminUser>(this.http, `${this.baseUrl}/admin/users/${id}/activate`, {});
  }

  deactivate(id: string): Observable<SilentResult<AdminUser>> {
    return silentPost<AdminUser>(this.http, `${this.baseUrl}/admin/users/${id}/deactivate`, {});
  }

  remove(id: string): Observable<SilentResult<AdminUser>> {
    return silentDelete<AdminUser>(this.http, `${this.baseUrl}/admin/users/${id}`);
  }

  resetPassword(id: string, newPassword: string): Observable<SilentResult<AdminUser>> {
    return silentPost<AdminUser>(this.http, `${this.baseUrl}/admin/users/${id}/reset-password`, {
      newPassword,
    });
  }
}
