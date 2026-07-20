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
import { Photo } from './photos.service';

export type MaterialDimensionType =
  'length' | 'width' | 'height' | 'thickness' | 'diameter' | 'depth';

export interface MaterialDimension {
  type: MaterialDimensionType;
  value: number;
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
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  photoIds?: string[];
  mainPhotoId?: string | Photo;
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

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: MaterialsListParams = {}): Observable<SilentResult<MaterialsListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    return silentGet<MaterialsListResponse>(this.http, `${this.baseUrl}/materials`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<SilentResult<Material>> {
    return silentGet<Material>(this.http, `${this.baseUrl}/materials/${id}`);
  }

  create(payload: Partial<Material>): Observable<SilentResult<Material>> {
    return silentPost<Material>(this.http, `${this.baseUrl}/materials`, payload);
  }

  update(id: string, payload: Partial<Material>): Observable<SilentResult<Material>> {
    return silentPatch<Material>(this.http, `${this.baseUrl}/materials/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/materials/${id}`);
  }
}
