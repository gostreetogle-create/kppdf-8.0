/** Mirrors `backend/src/modules/supply/supply-request.schema.ts`. */
export type SupplyRequestStatus =
  | 'in_progress'
  | 'requested'
  | 'ordered'
  | 'received'
  | 'cancelled';

export type SupplyRequestPriority = 'urgent' | 'normal' | 'low';

export interface CreateSupplyRequestPayload {
  readonly title: string;
  readonly qty: number;
  readonly unit?: string;
  readonly priority?: SupplyRequestPriority;
  readonly notes?: string;
  readonly article?: string;
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
  readonly qty: number;
  readonly unit?: string;
  readonly status: SupplyRequestStatus;
  readonly priority: SupplyRequestPriority;
  readonly notes?: string;
  readonly priceHint?: number;
  readonly lineTotal?: number;
  readonly neededBy?: string;
  readonly supplierOrderDate?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface SupplyRequestsListParams {
  readonly status?: SupplyRequestStatus;
  readonly priority?: SupplyRequestPriority;
  readonly search?: string;
  readonly orderId?: string;
}
