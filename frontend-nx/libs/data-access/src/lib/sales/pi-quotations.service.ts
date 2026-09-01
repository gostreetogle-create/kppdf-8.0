import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type { CreateQuotationPayload, Quotation, UpdateQuotationPayload } from './quotation.types';

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

  create(payload: CreateQuotationPayload): Observable<SilentResult<Quotation>> {
    return silentPost<Quotation>(this.http, `${this.baseUrl}/quotations`, payload);
  }

  update(id: string, payload: UpdateQuotationPayload): Observable<SilentResult<Quotation>> {
    return silentPatch<Quotation>(this.http, `${this.baseUrl}/quotations/${id}`, payload);
  }
}