import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  silentWrap,
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

/** TZ-ORG-ASSETS-301: слоты файлов организации. */
export const ORG_ASSET_ROLES = ['logo', 'seal', 'signature'] as const;
export type OrgAssetRole = (typeof ORG_ASSET_ROLES)[number];

export const ORG_ASSET_LABELS: Record<OrgAssetRole, string> = {
  logo: 'Логотип',
  seal: 'Печать',
  signature: 'Подпись',
};

export interface OrganizationAsset {
  role: OrgAssetRole;
  photoId: string;
  storageUrl: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

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
  /** Общая почта организации; для поставщика — адрес заявок. */
  email?: string;
  directorName?: string;
  registrationDate?: string;
  partyTypes?: string[];
  photoIds?: string[];
  /** TZ-ORG-ASSETS-301: логотип / печать / подпись, максимум один на роль. */
  assets?: OrganizationAsset[];
  /** TZ-ORG-ASSETS-301: юридический адрес для шапки документов. */
  legalAddress?: string;
  contactPersonId?: string;
  /** TZ-PARTY-301: «наша фирма» — issuer side of documents. */
  isOurCompany?: boolean;
  passportSeries?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  passportIssuedAt?: string;
  passportDivisionCode?: string;
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

/** TZ-SUPPLY-311 — контакт организации (менеджер поставщика). */
export interface OrganizationContactPerson {
  _id: string;
  lastName: string;
  firstName?: string;
  patronymic?: string;
  position?: string;
  phone?: string;
  email?: string;
}

export interface OrganizationContact {
  _id: string;
  organizationId: string;
  /** The API may return a raw ObjectId or a populated Person. */
  personId: string | OrganizationContactPerson;
  isPrimary?: boolean;
  role?: string;
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

  /** TZ-PARTY-301: «наша фирма» for document headers. 404 when not configured. */
  findCurrent(): Observable<SilentResult<Organization>> {
    return silentGet<Organization>(this.http, `${this.baseUrl}/organizations/current`);
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

  /** TZ-SUPPLY-311 — контактные лица организации (менеджеры поставщика). */
  listContacts(id: string): Observable<SilentResult<OrganizationContact[]>> {
    return silentGet<OrganizationContact[]>(
      this.http,
      `${this.baseUrl}/organizations/${id}/contacts`,
    );
  }

  /** TZ-SUPPLY-311 — привязать Person к организации как контакт. */
  addContact(
    id: string,
    personId: string,
    role?: string,
  ): Observable<SilentResult<OrganizationContact>> {
    return silentPost<OrganizationContact>(
      this.http,
      `${this.baseUrl}/organizations/${id}/contacts`,
      { personId, ...(role ? { role } : {}) },
    );
  }

  /**
   * TZ-ORG-ASSETS-301: загрузить файл в слот. PUT — слот один, повторная
   * загрузка заменяет содержимое. Печать доступна только админу (403 иначе).
   */
  putAsset(id: string, role: OrgAssetRole, file: File): Observable<SilentResult<Organization>> {
    const body = new FormData();
    body.append('file', file, file.name);
    return silentWrap(
      this.http.put<Organization>(`${this.baseUrl}/organizations/${id}/assets/${role}`, body),
    );
  }

  removeAsset(id: string, role: OrgAssetRole): Observable<SilentResult<Organization>> {
    return silentDelete<Organization>(
      this.http,
      `${this.baseUrl}/organizations/${id}/assets/${role}`,
    );
  }
}
