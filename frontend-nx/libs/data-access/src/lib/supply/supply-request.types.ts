/** Mirrors `backend/src/modules/supply/supply-request.schema.ts`. */
export type SupplyRequestStatus =
  | 'in_progress'
  | 'requested'
  | 'ordered'
  | 'received'
  | 'cancelled';

export type SupplyRequestPriority = 'urgent' | 'normal' | 'low';

export interface CreateSupplyRequestPayload {
  readonly title?: string;
  readonly materialId?: string;
  readonly article?: string;
  readonly qty: number;
  readonly unit?: string;
  readonly priority?: SupplyRequestPriority;
  readonly notes?: string;
  readonly supplierId?: string;
  readonly orderId?: string;
  /** Free-text заказчик/участок — XOR with `orderId` (server clears it when orderId is set). */
  readonly orderLabel?: string;
  readonly neededBy?: string;
  readonly status?: SupplyRequestStatus;
  readonly invoiceNo?: string;
  readonly deliveryNote?: string;
  /** Independent of `status` — server auto-stamps/clears `paidAt`. */
  readonly paid?: boolean;
}

export type UpdateSupplyRequestPayload = Partial<CreateSupplyRequestPayload>;

export interface SupplyRequest {
  readonly _id: string;
  readonly title?: string;
  readonly article?: string;
  readonly color?: string;
  readonly productUrl?: string;
  readonly categoryId?: string;
  readonly materialId?: string;
  readonly supplierId?: string;
  readonly companyId?: string;
  readonly supplierContactId?: string;
  readonly requestedBy?: string;
  readonly responsible?: string;
  readonly orderId?: string;
  readonly orderLabel?: string;
  readonly qty: number;
  readonly unit?: string;
  readonly status: SupplyRequestStatus;
  readonly priority: SupplyRequestPriority;
  readonly notes?: string;
  readonly priceHint?: number;
  readonly lineTotal?: number;
  readonly neededBy?: string;
  readonly supplierOrderDate?: string;
  readonly invoiceNo?: string;
  readonly deliveryNote?: string;
  readonly paid: boolean;
  readonly paidAt?: string;
  /** Server-set from the authenticated user on create; never client-writable. */
  readonly createdBy?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface SupplyRequestsListParams {
  readonly status?: SupplyRequestStatus;
  readonly priority?: SupplyRequestPriority;
  readonly search?: string;
  readonly orderId?: string;
}
