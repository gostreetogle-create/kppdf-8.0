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

/** TZ-ORDERS-303 — площадка/объект заказчика. */
export interface Site {
  _id: string;
  counterpartyId: string;
  name: string;
  address: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteUpsertDto {
  counterpartyId: string;
  name: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class SiteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listByCounterparty(counterpartyId: string): Observable<SilentResult<Site[]>> {
    const params = new HttpParams().set('counterpartyId', counterpartyId);
    return silentGet<Site[]>(this.http, `${this.baseUrl}/sites`, { params });
  }

  /** TZ-ORDERS-336 — same helper as КП→заказ convert. */
  ensureDefaultForCounterparty(counterpartyId: string): Observable<SilentResult<Site>> {
    return silentPost<Site>(this.http, `${this.baseUrl}/sites/ensure-default`, {
      counterpartyId,
    });
  }

  create(payload: SiteUpsertDto): Observable<SilentResult<Site>> {
    return silentPost<Site>(this.http, `${this.baseUrl}/sites`, payload);
  }

  update(
    id: string,
    payload: Partial<Pick<Site, 'name' | 'address'>>,
  ): Observable<SilentResult<Site>> {
    return silentPatch<Site>(this.http, `${this.baseUrl}/sites/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/sites/${id}`);
  }
}
