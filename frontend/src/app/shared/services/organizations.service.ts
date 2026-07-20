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

export const ORG_TYPES = ['customer', 'supplier', 'contractor', 'manufacturer', 'partner'] as const;
export type OrgType = (typeof ORG_TYPES)[number];

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
  type?: OrgType;
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: OrganizationsListParams = {}): Observable<SilentResult<OrganizationsListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.type) httpParams = httpParams.set('type', params.type);
    return silentGet<OrganizationsListResponse>(this.http, `${this.baseUrl}/organizations`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<SilentResult<Organization>> {
    return silentGet<Organization>(this.http, `${this.baseUrl}/organizations/${id}`);
  }

  create(payload: Partial<Organization>): Observable<SilentResult<Organization>> {
    return silentPost<Organization>(this.http, `${this.baseUrl}/organizations`, payload);
  }

  update(id: string, payload: Partial<Organization>): Observable<SilentResult<Organization>> {
    return silentPatch<Organization>(this.http, `${this.baseUrl}/organizations/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/organizations/${id}`);
  }
}
