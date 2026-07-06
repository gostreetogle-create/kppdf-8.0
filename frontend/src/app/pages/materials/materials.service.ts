import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';

export type MaterialDimensionType =
  | 'length'
  | 'width'
  | 'height'
  | 'thickness'
  | 'diameter'
  | 'depth';

export interface MaterialDimension {
  type: MaterialDimensionType;
  value: number;
  /** true = downstream не может менять (например, толщина листа). */
  isImmutable?: boolean;
}

export interface Material {
  _id: string;
  name: string;
  article?: string;
  sku?: string;
  unit: string;
  categoryId?: string;
  description?: string;
  /** Цена за единицу. Всегда в RUB — поле валюты отсутствует (политика). */
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  photoIds?: string[];
  mainPhotoId?: string;
  supplierId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialsListResponse {
  items: Material[];
  total: number;
  page: number;
  limit: number;
}

export interface MaterialsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

/**
 * TZ-NEW MaterialsService — connects the Paper & Ink editorial site
 * to `backend/src/modules/material/material.controller.ts`.
 *
 * List endpoint requires `admin` or `manager` role; the default
 * seeded admin (AdminSeed) has wildcard permissions, so it can read.
 *
 * Standalone Angular 20 service, no NgModule.
 */
@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: MaterialsListParams = {}): Observable<MaterialsListResponse> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    return this.http.get<MaterialsListResponse>(`${this.baseUrl}/materials`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.baseUrl}/materials/${id}`);
  }

  create(payload: Partial<Material>): Observable<Material> {
    return this.http.post<Material>(`${this.baseUrl}/materials`, payload);
  }

  update(id: string, payload: Partial<Material>): Observable<Material> {
    return this.http.patch<Material>(
      `${this.baseUrl}/materials/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/materials/${id}`);
  }
}
