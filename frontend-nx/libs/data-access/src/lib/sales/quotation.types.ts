export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'converted'
  | 'cancelled';

/** D21 / SALES-303: solo = standalone; master = family root; variant = org clone. */
export type QuotationFamilyRole = 'solo' | 'master' | 'variant';

export interface QuotationItemPayload {
  readonly productId?: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface CreateQuotationPayload {
  readonly organizationId: string;
  readonly counterpartyId?: string;
  readonly status?: QuotationStatus;
  readonly items?: readonly QuotationItemPayload[];
}

export type UpdateQuotationPayload = Partial<CreateQuotationPayload>;

export interface Quotation {
  readonly _id: string;
  readonly number: string;
  readonly status?: QuotationStatus;
  readonly studioDocumentId?: string;
  readonly counterpartyId?: string | { readonly _id: string; readonly name?: string };
  /** Family of КП (SALES-303) — mirrors `quotation.schema.ts`. */
  readonly organizationId?: string;
  readonly familyRole?: QuotationFamilyRole;
  readonly masterId?: string;
  readonly familyVersion?: number;
  readonly orgMarkupPercent?: number;
}

/** Thin family member summary — mirrors `QuotationFamilyMemberSummary` on the backend. */
export interface QuotationFamilyMemberSummary {
  readonly id: string;
  readonly number: string;
  readonly organizationId: string;
  readonly familyRole: QuotationFamilyRole;
  readonly familyVersion: number;
  readonly orgMarkupPercent?: number;
  readonly total: number;
  readonly status: QuotationStatus;
}

/** GET /quotations/:id/family + POST …/family/attach-organizations response. */
export interface QuotationFamilyResponse {
  readonly master: QuotationFamilyMemberSummary;
  readonly variants: readonly QuotationFamilyMemberSummary[];
  readonly familyVersion: number;
}

export interface AttachOrganizationItemPayload {
  readonly organizationId: string;
  readonly orgMarkupPercent?: number;
}

/** POST /quotations/:id/family/attach-organizations body. */
export interface AttachOrganizationsPayload {
  readonly items: readonly AttachOrganizationItemPayload[];
}