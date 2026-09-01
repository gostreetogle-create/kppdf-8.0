export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'converted'
  | 'cancelled';

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
}