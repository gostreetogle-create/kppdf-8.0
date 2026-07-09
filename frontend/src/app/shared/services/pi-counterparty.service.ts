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
 * Counterparty represents an external party in commercial relations.
 * Distinct from Organization (which is the "us" side / supplier side
 * recorded for documents) — Counterparty receives orders, ships to them,
 * signs contracts *with* them.
 *
 * The schema lives at `backend/src/modules/counterparty/counterparty.schema.ts`.
 * The list endpoint returns paginated `{items, total, page, limit}`
 * (canonical shape). See `core/silent-http.ts` for the silent-error
 * rationale.
 *
 * Standalone Angular 20 service, no NgModule.
 */
export interface Counterparty {
  _id: string;
  name: string;
  shortName?: string;
  legalForm?: string;
  roles?: string[];
  inn: string;
  kpp?: string;
  ogrn?: string;
  bankName?: string;
  bankBik?: string;
  bankAccount?: string;
  bankCorrAccount?: string;
  signerName?: string;
  signerPosition?: string;
  isActive?: boolean;
  type?: string[];
  legalType?: 'ooo' | 'ip' | 'pao' | 'ao' | 'other';
  website?: string;
  directorName?: string;
  registrationDate?: string;
  partyTypes?: string[];
  photoIds?: string[];
  contactPersonId?: string;
  paymentTermDays?: number;
  vatRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CounterpartiesListResponse {
  items: Counterparty[];
  total: number;
  page: number;
  limit: number;
}

export interface CounterpartiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class CounterpartyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: CounterpartiesListParams = {},
  ): Observable<SilentResult<CounterpartiesListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 200));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    return silentGet<CounterpartiesListResponse>(
      this.http,
      `${this.baseUrl}/counterparties`,
      { params: httpParams },
    );
  }

  findById(id: string): Observable<SilentResult<Counterparty>> {
    return silentGet<Counterparty>(
      this.http,
      `${this.baseUrl}/counterparties/${id}`,
    );
  }

  create(payload: Partial<Counterparty>): Observable<SilentResult<Counterparty>> {
    return silentPost<Counterparty>(
      this.http,
      `${this.baseUrl}/counterparties`,
      payload,
    );
  }

  update(
    id: string,
    payload: Partial<Counterparty>,
  ): Observable<SilentResult<Counterparty>> {
    return silentPatch<Counterparty>(
      this.http,
      `${this.baseUrl}/counterparties/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(
      this.http,
      `${this.baseUrl}/counterparties/${id}`,
    );
  }
}
