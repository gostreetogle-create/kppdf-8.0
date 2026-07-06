import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';

export const ORG_TYPES = [
  'customer',
  'supplier',
  'contractor',
  'manufacturer',
  'partner',
] as const;
export type OrgType = (typeof ORG_TYPES)[number];

/** Локализованные подписи для UI. */
export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  customer: 'Покупатель',
  supplier: 'Поставщик',
  contractor: 'Подрядчик',
  manufacturer: 'Производитель',
  partner: 'Партнёр',
};

export interface Organization {
  _id: string;
  name: string;
  shortName?: string;
  legalForm?: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  ogrnip?: string;
  bankName?: string;
  bankBik?: string;
  bankAccount?: string;
  bankCorrAccount?: string;
  signerName?: string;
  signerPosition?: string;
  paymentTermDays?: number;
  vatRate?: number;
  isActive?: boolean;
  type?: OrgType[];
  legalType?: 'ooo' | 'ip' | 'pao' | 'ao' | 'other';
  website?: string;
  directorName?: string;
  registrationDate?: string;
  partyTypes?: string[];
  photoIds?: string[];
  contactPersonId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationsListResponse {
  items: Organization[];
  total: number;
  page: number;
  limit: number;
}

export interface OrganizationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Фильтр по наличию типа в массиве type[] (MongoDB array-contains). */
  type?: OrgType;
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: OrganizationsListParams = {}): Observable<OrganizationsListResponse> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.type) httpParams = httpParams.set('type', params.type);
    return this.http.get<OrganizationsListResponse>(`${this.baseUrl}/organizations`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/organizations/${id}`);
  }

  create(payload: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(`${this.baseUrl}/organizations`, payload);
  }

  update(id: string, payload: Partial<Organization>): Observable<Organization> {
    return this.http.patch<Organization>(
      `${this.baseUrl}/organizations/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/organizations/${id}`);
  }
}
