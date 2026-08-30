import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { ProductPassport, ProductPassportsListParams } from './product-passport.types';

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
}
