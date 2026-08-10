import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted' | 'cancelled';

export type DiscountType = 'none' | 'percent' | 'amount';

export interface ProposalItem {
  /** Product FK. May be populated to a Product object by GET endpoints. */
  productId: string;
  /** IMMUTABLE inline snapshot captured at quotation creation (plan §S1). */
  productName?: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  markupPercent?: number;
  total?: number;
  sortOrder?: number;
}

export interface ProposalVersionSummary {
  version: number;
  frozenAt: string;
}

export interface ProposalVersion {
  version: number;
  frozenAt: string;
  payload: Record<string, unknown>;
}

/** D21 / SALES-303 family role on Quotation. */
export type ProposalFamilyRole = 'solo' | 'master' | 'variant';

export interface ProposalFamilyMemberSummary {
  id: string;
  number: string;
  organizationId: string;
  familyRole: ProposalFamilyRole | string;
  familyVersion: number;
  orgMarkupPercent?: number;
  total: number;
  status: string;
}

export interface ProposalFamilyResponse {
  master: ProposalFamilyMemberSummary;
  variants: ProposalFamilyMemberSummary[];
  familyVersion: number;
}

export interface AttachOrganizationItem {
  organizationId: string;
  orgMarkupPercent?: number;
}

export interface Proposal {
  _id: string;
  number: string;
  /**
   * Backend may auto-populate as full sub-documents via
   * `.populate('organizationId' | 'counterpartyId')`. Consumers MUST
   * accept either a string ID or the populated object (dual-shape —
   * same pattern as Order.counterpartyId in orders.page.ts).
   */
  organizationId?: string | { _id: string; name?: string };
  counterpartyId?: string | { _id: string; name?: string };
  templateId?: string | { _id: string };
  templateSnapshot?: Record<string, unknown>;
  title?: string;
  date?: string;
  validUntil?: string;
  status: ProposalStatus;
  total?: number;
  discountType?: DiscountType;
  discountPercent?: number;
  discountAmount?: number;
  vatPercent?: number;
  prepaymentPercent?: number;
  productionDays?: number;
  deliveryDays?: number;
  notes?: string;
  items?: ProposalItem[];
  convertedOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
  currentVersion?: number;
  /** D21 family fields (SALES-303). Default solo when absent. */
  familyRole?: ProposalFamilyRole;
  masterId?: string;
  familyVersion?: number;
  orgMarkupPercent?: number;
}

/**
 * TZ-SALES-301 — ProposalsService, thin UI wrapper over the EXISTING
 * `backend/src/modules/quotation/quotation.controller.ts` (single КП API —
 * no duplicate proposal module was created; audit confirmed QuotationModule
 * is already registered in app.module.ts:204).
 *
 * Backend response shape: GET /quotations returns a FLAT Quotation[]
 * (no envelope) — same as /orders. Page layer owns search/sort/paginate.
 *
 * Conversion endpoints:
 *  - POST /quotations/:id/convert-to-contract
 *  - POST /quotations/:id/convert-to-order   (TZ-ORDERS-301: requires
 *    status === 'accepted'; strips commerce server-side)
 *
 * See `core/silent-http.ts` for the silent-error rationale.
 */
@Injectable({ providedIn: 'root' })
export class ProposalsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Proposal[]>> {
    return silentGet<Proposal[]>(this.http, `${this.baseUrl}/quotations`);
  }

  findById(id: string): Observable<SilentResult<Proposal>> {
    return silentGet<Proposal>(this.http, `${this.baseUrl}/quotations/${id}`);
  }

  create(payload: Partial<Proposal>): Observable<SilentResult<Proposal>> {
    return silentPost<Proposal>(this.http, `${this.baseUrl}/quotations`, payload);
  }

  update(id: string, payload: Partial<Proposal>): Observable<SilentResult<Proposal>> {
    return silentPatch<Proposal>(this.http, `${this.baseUrl}/quotations/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/quotations/${id}`);
  }

  freeze(id: string): Observable<SilentResult<Proposal>> {
    return silentPost<Proposal>(this.http, `${this.baseUrl}/quotations/${id}/freeze`, {});
  }

  listVersions(id: string): Observable<SilentResult<ProposalVersionSummary[]>> {
    return silentGet<ProposalVersionSummary[]>(
      this.http,
      `${this.baseUrl}/quotations/${id}/versions`,
    );
  }

  getVersion(id: string, version: number): Observable<SilentResult<ProposalVersion>> {
    return silentGet<ProposalVersion>(
      this.http,
      `${this.baseUrl}/quotations/${id}/versions/${version}`,
    );
  }

  duplicate(id: string): Observable<SilentResult<Proposal>> {
    return silentPost<Proposal>(this.http, `${this.baseUrl}/quotations/${id}/duplicate`, {});
  }

  convertToOrder(
    id: string,
    body: { deliveryAddress?: string; managerId?: string } = {},
  ): Observable<SilentResult<{ quotation: Proposal; orderId: string }>> {
    return silentPost<{ quotation: Proposal; orderId: string }>(
      this.http,
      `${this.baseUrl}/quotations/${id}/convert-to-order`,
      body,
    );
  }

  /** TZ-SALES-313 — GET /quotations/:id/family */
  getFamily(id: string): Observable<SilentResult<ProposalFamilyResponse>> {
    return silentGet<ProposalFamilyResponse>(this.http, `${this.baseUrl}/quotations/${id}/family`);
  }

  /** TZ-SALES-313 — POST /quotations/:id/family/attach-organizations */
  attachOrganizations(
    id: string,
    items: AttachOrganizationItem[],
  ): Observable<SilentResult<ProposalFamilyResponse>> {
    return silentPost<ProposalFamilyResponse>(
      this.http,
      `${this.baseUrl}/quotations/${id}/family/attach-organizations`,
      { items },
    );
  }

  /** TZ-SALES-313 — POST /quotations/:id/family/sync-from-master */
  syncFromMaster(id: string): Observable<SilentResult<ProposalFamilyResponse>> {
    return silentPost<ProposalFamilyResponse>(
      this.http,
      `${this.baseUrl}/quotations/${id}/family/sync-from-master`,
      {},
    );
  }
}

/** UI-only estimate: base total × (1 + markup%). Not written to BE. */
export function estimateFamilyTotal(baseTotal: number, orgMarkupPercent?: number): number {
  const pct = orgMarkupPercent ?? 0;
  return Math.round(baseTotal * (1 + pct / 100) * 100) / 100;
}
