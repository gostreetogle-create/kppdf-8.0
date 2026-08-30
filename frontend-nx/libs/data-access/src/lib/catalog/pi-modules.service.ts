import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type {
  CreateProductModulePayload,
  ModulesListParams,
  ProductModule,
  UpdateProductModulePayload,
} from './product-module.types';

/**
 * TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ — read-only ProductModule list/get.
 *
 * **List-all limitation:** `GET /modules` returns the full active set in one
 * response — no `page`/`limit`/`search` query params on the backend. Registry
 * adapters may apply client-side paging only; never send fake pagination params.
 *
 * Organization scope comes from JWT via `authInterceptor`; never pass
 * `organizationId` as a query param from the client.
 */
@Injectable({ providedIn: 'root' })
export class PiModulesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: ModulesListParams = {}): Observable<SilentResult<ProductModule[]>> {
    let httpParams = new HttpParams();
    if (params.productId) {
      httpParams = httpParams.set('productId', params.productId);
    }
    return silentGet<ProductModule[]>(this.http, `${this.baseUrl}/modules`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<ProductModule>> {
    return silentGet<ProductModule>(this.http, `${this.baseUrl}/modules/${id}`);
  }

  create(payload: CreateProductModulePayload): Observable<SilentResult<ProductModule>> {
    return silentPost<ProductModule>(this.http, `${this.baseUrl}/modules`, payload);
  }

  update(id: string, payload: UpdateProductModulePayload): Observable<SilentResult<ProductModule>> {
    return silentPatch<ProductModule>(this.http, `${this.baseUrl}/modules/${id}`, payload);
  }

  /** Soft-delete (`DELETE /modules/:id` sets `deletedAt`). */
  archive(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/modules/${id}`);
  }
}
