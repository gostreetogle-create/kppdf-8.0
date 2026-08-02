import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, type SilentResult } from '../../core/silent-http';

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
}
