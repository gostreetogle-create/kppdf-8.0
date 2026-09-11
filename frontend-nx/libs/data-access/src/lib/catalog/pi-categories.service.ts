import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type { Category, CategoriesListParams, CreateCategoryPayload, UpdateCategoryPayload } from './category.types';

/**
 * TZ-NX-REG-CATEGORIES-CRUD — thin client for `/api/categories`. `list()`
 * returns the full flat array (no pagination envelope, matches
 * `CategoryController.list()`), same shape as `PiTextBlockCategoriesService`.
 */
@Injectable({ providedIn: 'root' })
export class PiCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: CategoriesListParams = {}): Observable<SilentResult<Category[]>> {
    let query = new HttpParams();
    if (params.type) query = query.set('type', params.type);
    return silentGet<Category[]>(this.http, `${this.baseUrl}/categories`, { params: query });
  }

  getById(id: string): Observable<SilentResult<Category>> {
    return silentGet<Category>(this.http, `${this.baseUrl}/categories/${id}`);
  }

  create(payload: CreateCategoryPayload): Observable<SilentResult<Category>> {
    return silentPost<Category>(this.http, `${this.baseUrl}/categories`, payload);
  }

  update(id: string, payload: UpdateCategoryPayload): Observable<SilentResult<Category>> {
    return silentPatch<Category>(this.http, `${this.baseUrl}/categories/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/categories/${id}`);
  }
}
