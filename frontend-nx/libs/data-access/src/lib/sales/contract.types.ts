export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled' | 'expired';
export type ContractAttachmentStatus = 'none' | 'file_attached' | 'generated';

export interface ContractItem {
  readonly productId: string;
  readonly productName?: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly unitPrice: number;
  readonly total: number;
}

/**
 * Read-only NX surface (TZ-NX-DEALS-D4) — list/detail only. Backend also owns
 * create/update/attach-file/sign/activate; those stay out of NX (known
 * limitation, `docs/pages/contracts.page.md`) — DTO needs `items[]` +
 * `organizationId` + `customerId` up front, not a thin-form fit.
 */
export interface Contract {
  readonly _id: string;
  readonly number: string;
  readonly title?: string;
  readonly proposalId?: string | { readonly _id: string; readonly number?: string };
  readonly organizationId: string | { readonly _id: string; readonly name?: string };
  readonly customerId: string | { readonly _id: string; readonly name?: string };
  readonly status: ContractStatus;
  readonly contractStatus: ContractAttachmentStatus;
  readonly items: readonly ContractItem[];
  readonly notes?: string;
  readonly totalAmount: number;
  readonly signedAt?: string;
  readonly expiresAt?: string;
  readonly packageTag?: string;
}

export interface ContractsListParams {
  readonly counterpartyId?: string;
  readonly status?: ContractStatus;
  readonly from?: string;
  readonly to?: string;
}
