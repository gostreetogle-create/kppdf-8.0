import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type { CreateProductPassportPayload, ProductPassport, ProductPassportsListParams, UpdateProductPassportPayload } from './product-passport.types';

/**
 * TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ — read-only ProductPassport collection
 * (distinct from computed `ProductPassportPreviewComponent` in product dialog).
 * `GET /passports` returns the full set — no server pagination.
 */
@Injectable({ providedIn: 'root' })
export class PiProductPassportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: ProductPassportsListParams = {}): Observable<SilentResult<ProductPassport[]>> {
    let httpParams = new HttpParams();
    if (params.productId) httpParams = httpParams.set('productId', params.productId);
    return silentGet<ProductPassport[]>(this.http, `${this.baseUrl}/passports`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<SilentResult<ProductPassport>> {
    return silentGet<ProductPassport>(this.http, `${this.baseUrl}/passports/${id}`);
  }

  getByProductId(productId: string): Observable<SilentResult<ProductPassport>> {
    return silentGet<ProductPassport>(this.http, `${this.baseUrl}/products/${productId}/passport`);
  }

  create(productId: string, payload: CreateProductPassportPayload): Observable<SilentResult<ProductPassport>> {
    return silentPost<ProductPassport>(this.http, `${this.baseUrl}/products/${productId}/passport`, payload);
  }

  update(id: string, payload: UpdateProductPassportPayload): Observable<SilentResult<ProductPassport>> {
    return silentPatch<ProductPassport>(this.http, `${this.baseUrl}/passports/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/passports/${id}`);
  }
}
