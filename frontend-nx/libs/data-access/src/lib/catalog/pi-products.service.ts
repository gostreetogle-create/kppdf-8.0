import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type {
  CreateProductPayload,
  DuplicateProductPayload,
  ProductDetail,
  ProductsListParams,
  ProductsListResponse,
  UpdateProductPayload,
} from './product.types';

/** Server-side page size ceiling (`ProductService.findAll` clamps to 100). */
export const PRODUCTS_MAX_PAGE_SIZE = 100;

/**
 * TZ-NX-CATALOG-DATA-ACCESS-READ — read-only Products list/get.
 * Organization scope comes from JWT via `authInterceptor`; never pass
 * `organizationId` as a query param from the client.
 */
@Injectable({ providedIn: 'root' })
export class PiProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: ProductsListParams = {}): Observable<SilentResult<ProductsListResponse>> {
    const limit = Math.min(PRODUCTS_MAX_PAGE_SIZE, params.limit ?? 50);
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(limit));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (typeof params.isActive === 'boolean') {
      httpParams = httpParams.set('isActive', String(params.isActive));
    }
    if (typeof params.isComplex === 'boolean') {
      httpParams = httpParams.set('isComplex', String(params.isComplex));
    }
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    return silentGet<ProductsListResponse>(this.http, `${this.baseUrl}/products`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<ProductDetail>> {
    return silentGet<ProductDetail>(this.http, `${this.baseUrl}/products/${id}`);
  }

  create(payload: CreateProductPayload): Observable<SilentResult<ProductDetail>> {
    return silentPost<ProductDetail>(this.http, `${this.baseUrl}/products`, payload);
  }

  update(id: string, payload: UpdateProductPayload): Observable<SilentResult<ProductDetail>> {
    return silentPatch<ProductDetail>(this.http, `${this.baseUrl}/products/${id}`, payload);
  }

  duplicate(id: string, payload: DuplicateProductPayload = {}): Observable<SilentResult<ProductDetail>> {
    return silentPost<ProductDetail>(this.http, `${this.baseUrl}/products/${id}/duplicate`, payload);
  }

  archive(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/products/${id}`);
  }
}
