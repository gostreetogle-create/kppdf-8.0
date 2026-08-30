import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { Quotation } from './quotation.types';

@Injectable({ providedIn: 'root' })
export class PiQuotationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Quotation[]>> {
    return silentGet<Quotation[]>(this.http, `${this.baseUrl}/quotations`);
  }

  getById(id: string): Observable<SilentResult<Quotation>> {
    return silentGet<Quotation>(this.http, `${this.baseUrl}/quotations/${id}`);
  }
}