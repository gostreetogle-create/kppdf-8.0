import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

/**
 * TZ-WORKERS-301 / TZ-UX-306 — frontend mirror of backend `Worker`.
 * Display name = lastName + firstName + optional patronymic (no single `name` field).
 */
export interface Person {
  _id: string;
  lastName: string;
  firstName: string;
  patronymic?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  grade?: string;
  ratePerHour?: number;
  supplierId?: string;
  workTypeIds?: string[];
  organizationId?: string | null;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePersonPayload {
  lastName: string;
  firstName: string;
  patronymic?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  grade?: string;
  ratePerHour?: number;
  supplierId?: string;
  workTypeIds?: string[];
  notes?: string;
  isActive?: boolean;
}

export type UpdatePersonPayload = Partial<CreatePersonPayload>;

export interface PersonListResponse {
  items: Person[];
  total: number;
  page: number;
  limit: number;
}

export interface PersonListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  supplierId?: string;
  workTypeId?: string;
}

/** Full display name for tables/toasts. */
export function personDisplayName(
  p: Pick<Person, 'lastName' | 'firstName' | 'patronymic'>,
): string {
  return [p.lastName, p.firstName, p.patronymic].filter(Boolean).join(' ').trim();
}

/**
 * SilentResult CRUD against `/workers` (API_BASE_URL already includes host;
 * Nest global prefix → `/api/workers` via proxy or base).
 */
@Injectable({ providedIn: 'root' })
export class PiWorkersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(opts: PersonListParams = {}): Observable<SilentResult<PersonListResponse>> {
    let params = new HttpParams();
    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.search) params = params.set('search', opts.search);
    if (opts.isActive != null) params = params.set('isActive', String(opts.isActive));
    if (opts.supplierId) params = params.set('supplierId', opts.supplierId);
    if (opts.workTypeId) params = params.set('workTypeId', opts.workTypeId);
    return silentGet<PersonListResponse>(this.http, `${this.baseUrl}/workers`, { params });
  }

  get(id: string): Observable<SilentResult<Person>> {
    return silentGet<Person>(this.http, `${this.baseUrl}/workers/${id}`);
  }

  create(payload: CreatePersonPayload): Observable<SilentResult<Person>> {
    return silentPost<Person>(this.http, `${this.baseUrl}/workers`, payload);
  }

  update(id: string, patch: UpdatePersonPayload): Observable<SilentResult<Person>> {
    return silentPatch<Person>(this.http, `${this.baseUrl}/workers/${id}`, patch);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/workers/${id}`);
  }
}
