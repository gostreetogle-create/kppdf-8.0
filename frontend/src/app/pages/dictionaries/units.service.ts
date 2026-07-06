import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';

export interface Unit {
  _id: string;
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

export interface CreateUnitPayload {
  key: string;
  label: string;
  symbol?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: { page?: number; limit?: number; search?: string; isActive?: boolean } = {}): Observable<UnitsListResponse> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', String(params.isActive));
    return this.http.get<UnitsListResponse>(`${this.baseUrl}/units`, { params: httpParams });
  }

  listActive(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.baseUrl}/units/active`);
  }

  create(payload: CreateUnitPayload): Observable<Unit> {
    return this.http.post<Unit>(`${this.baseUrl}/units`, payload);
  }

  update(key: string, payload: Partial<CreateUnitPayload>): Observable<Unit> {
    return this.http.patch<Unit>(`${this.baseUrl}/units/${key}`, payload);
  }

  remove(key: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/units/${key}`);
  }
}
