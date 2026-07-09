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

export type ProductKind = 'good' | 'service' | 'work';
export type ProductStatus = 'new' | 'active' | 'archived' | 'draft';

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  kind: ProductKind;
  unit: string;
  categoryId?: string;
  subcategory?: string;
  status?: ProductStatus;
  listPrice?: number;
  basePrice?: number;
  costPrice?: number;
  defaultMarkupPercent?: number;
  stockQty?: number;
  description?: string;
  notes?: string;
  photoIds?: string[];
  dimensions?: ProductDimensions;
  weightKg?: number;
  ralCode?: string;
  hasPassport?: boolean;
  hasDrawing?: boolean;
  isActive?: boolean;
  purpose?: string;
  installation?: string;
  /** EAV — extended attributes keyed by AttributeDefinition.key. */
  attributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  isActive?: boolean;
  sortBy?: 'name' | 'sku' | 'listPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * TZ-NEW ProductsService — connects the operational site to
 * `backend/src/modules/product/product.controller.ts`.
 *
 * Backend shape is canonical: `{items, total, page, limit}` from
 * `product.service.findAll`. The endpoint supports sortBy + sortOrder
 * query params (forwarded verbatim). All methods return
 * `SilentResult<T>` — the observable never errors per the
 * silent-http convention.
 *
 * Cross-domain use: the ProductsService is also injected by
 * OrderFormDialog / ContractFormDialog components to populate the
 * product picker inside the line-items FormArray. This is fine
 * because the service is `providedIn: 'root'`.
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: ProductsListParams = {},
  ): Observable<SilentResult<ProductsListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (typeof params.isActive === 'boolean') {
      httpParams = httpParams.set('isActive', String(params.isActive));
    }
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    return silentGet<ProductsListResponse>(
      this.http,
      `${this.baseUrl}/products`,
      { params: httpParams },
    );
  }

  findById(id: string): Observable<SilentResult<Product>> {
    return silentGet<Product>(this.http, `${this.baseUrl}/products/${id}`);
  }

  create(payload: Partial<Product>): Observable<SilentResult<Product>> {
    return silentPost<Product>(
      this.http,
      `${this.baseUrl}/products`,
      payload,
    );
  }

  update(
    id: string,
    payload: Partial<Product>,
  ): Observable<SilentResult<Product>> {
    return silentPatch<Product>(
      this.http,
      `${this.baseUrl}/products/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/products/${id}`);
  }
}
