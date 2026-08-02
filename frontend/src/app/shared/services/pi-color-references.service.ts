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

export interface ColorReference {
  _id: string;
  slug: string;
  name: string;
  hex: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  isDefault: boolean;
  sortOrder: number;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColorReferenceListParams {
  activeOnly?: boolean;
  search?: string;
}

/**
 * TZ-PRODUCTS-301 — client for GET/POST/PATCH/DELETE /color-references.
 *
 * Contract (backend TZ-PRODUCTS-301):
 *   - `slug` is OPTIONAL on create — the server generates it from `name`
 *     (Russian→Latin transliteration, kebab-case), so the UI never has to
 *     invent an ASCII key for a Cyrillic name.
 *   - `hex` is REQUIRED and validated as `#RRGGBB` (400 on anything else).
 *   - `organizationId` is NEVER sent: the server derives it from the
 *     authenticated user (IDOR guard).
 *   - System colors («Не выбран», seed-managed) are global; mutations on
 *     them return 409 — the page disables actions up front.
 */
@Injectable({ providedIn: 'root' })
export class ColorReferencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: ColorReferenceListParams = {}): Observable<SilentResult<ColorReference[]>> {
    let httpParams = new HttpParams();
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<ColorReference[]>(this.http, `${this.baseUrl}/color-references`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<SilentResult<ColorReference>> {
    return silentGet<ColorReference>(this.http, `${this.baseUrl}/color-references/${id}`);
  }

  create(payload: {
    name: string;
    slug?: string;
    hex: string;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
  }): Observable<SilentResult<ColorReference>> {
    return silentPost<ColorReference>(this.http, `${this.baseUrl}/color-references`, payload);
  }

  update(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      hex?: string;
      description?: string;
      isActive?: boolean;
      isDefault?: boolean;
      sortOrder?: number;
    },
  ): Observable<SilentResult<ColorReference>> {
    return silentPatch<ColorReference>(
      this.http,
      `${this.baseUrl}/color-references/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/color-references/${id}`);
  }
}
