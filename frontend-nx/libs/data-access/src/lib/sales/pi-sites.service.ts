import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, silentPost, type SilentResult } from '@kppdf/util-http';
import type { CreateSitePayload, Site } from './site.types';

@Injectable({ providedIn: 'root' })
export class PiSitesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(counterpartyId: string): Observable<SilentResult<Site[]>> {
    const params = new HttpParams().set('counterpartyId', counterpartyId);
    return silentGet<Site[]>(this.http, `${this.baseUrl}/sites`, { params });
  }

  ensureDefault(counterpartyId: string): Observable<SilentResult<Site>> {
    return silentPost<Site>(this.http, `${this.baseUrl}/sites/ensure-default`, { counterpartyId });
  }

  /**
   * TZ-NX-ORDER-WS-META-INLINE — backend `POST /sites` already existed
   * (`SiteController.create`), just had no frontend caller yet.
   */
  create(payload: CreateSitePayload): Observable<SilentResult<Site>> {
    return silentPost<Site>(this.http, `${this.baseUrl}/sites`, payload);
  }
}
