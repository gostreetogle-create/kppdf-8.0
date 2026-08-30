export interface Quotation {
  readonly _id: string;
  readonly number: string;
  readonly counterpartyId?: string | { readonly _id: string; readonly name?: string };
}