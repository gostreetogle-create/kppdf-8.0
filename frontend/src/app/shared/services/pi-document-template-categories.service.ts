import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentGet,
  silentPost,
  silentPatch,
  silentDelete,
  SilentResult,
} from '../../core/silent-http';

export interface DocumentTemplateCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isSystem: boolean;
  isDefault: boolean;
  sortOrder: number;
  description?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentTemplateCategoryListParams {
  activeOnly?: boolean;
  search?: string;
}

/**
 * TZ-DOC-308 — client for GET/POST/PATCH/DELETE /document-template-categories.
 *
 * Contract (backend TZ-DOC-307): `slug` is OPTIONAL on create — the server
 * generates it from `name` (Russian→Latin transliteration), so the UI never
 * has to invent an ASCII key for a Cyrillic name.
 */
@Injectable({ providedIn: 'root' })
export class DocumentTemplateCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: DocumentTemplateCategoryListParams = {},
  ): Observable<SilentResult<DocumentTemplateCategory[]>> {
    let httpParams = new HttpParams();
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<DocumentTemplateCategory[]>(
      this.http,
      `${this.baseUrl}/document-template-categories`,
      { params: httpParams },
    );
  }

  findById(id: string): Observable<SilentResult<DocumentTemplateCategory>> {
    return silentGet<DocumentTemplateCategory>(
      this.http,
      `${this.baseUrl}/document-template-categories/${id}`,
    );
  }

  create(payload: {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
  }): Observable<SilentResult<DocumentTemplateCategory>> {
    return silentPost<DocumentTemplateCategory>(
      this.http,
      `${this.baseUrl}/document-template-categories`,
      payload,
    );
  }

  update(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
      isDefault?: boolean;
      sortOrder?: number;
    },
  ): Observable<SilentResult<DocumentTemplateCategory>> {
    return silentPatch<DocumentTemplateCategory>(
      this.http,
      `${this.baseUrl}/document-template-categories/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/document-template-categories/${id}`);
  }
}
