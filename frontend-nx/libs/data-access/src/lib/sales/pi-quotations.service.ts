import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type {
  AttachOrganizationsPayload,
  CreateQuotationPayload,
  Quotation,
  QuotationFamilyResponse,
  UpdateQuotationPayload,
} from './quotation.types';

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

  /** Convert an accepted quotation into an order (S37) — backend guards `status === 'accepted'`. */
  convertToOrder(id: string): Observable<SilentResult<{ orderId: string }>> {
    return silentPost<{ orderId: string }>(this.http, `${this.baseUrl}/quotations/${id}/convert-to-order`, undefined);
  }

  /** KP family (SALES-303): member summary list for the family of this quotation. */
  getFamily(id: string): Observable<SilentResult<QuotationFamilyResponse>> {
    return silentGet<QuotationFamilyResponse>(this.http, `${this.baseUrl}/quotations/${id}/family`);
  }

  /** Attach organizations as variants of this КП family (idempotent per org). */
  attachOrganizations(
    id: string,
    payload: AttachOrganizationsPayload,
  ): Observable<SilentResult<QuotationFamilyResponse>> {
    return silentPost<QuotationFamilyResponse>(
      this.http,
      `${this.baseUrl}/quotations/${id}/family/attach-organizations`,
      payload,
    );
  }

  /** Copy master lines → all variants; returns the updated family. */
  syncFromMaster(id: string): Observable<SilentResult<QuotationFamilyResponse>> {
    return silentPost<QuotationFamilyResponse>(
      this.http,
      `${this.baseUrl}/quotations/${id}/family/sync-from-master`,
      undefined,
    );
  }
}