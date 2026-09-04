export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'in_production'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type OrderMaterialsSource = 'own' | 'customer';
export type OrderSource = 'manual' | 'desktop-import';

export interface OrderItem {
  readonly lineId?: string;
  readonly productId: string;
  readonly productName?: string;
  readonly productSku?: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly ownerUserId?: string | { readonly _id: string; readonly displayName?: string };
  readonly plannedShipDate?: string;
  readonly readyForWork?: boolean;
  readonly status?: 'pending' | 'in_production' | 'ready' | 'shipped';
}

export interface OrderItemPayload {
  readonly productId: string;
  readonly productName?: string;
  readonly productSku?: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly unitPrice?: number;
  readonly ownerUserId?: string;
  readonly plannedShipDate?: string;
  readonly readyForWork?: boolean;
}

export interface CreateOrderPayload {
  readonly number?: string;
  readonly counterpartyId: string;
  readonly siteId: string;
  readonly quotationId?: string;
  readonly contractId?: string;
  readonly date?: string;
  readonly plannedDate?: string;
  readonly status?: 'draft' | 'confirmed';
  readonly isPaid?: boolean;
  readonly paidAt?: string;
  readonly notes?: string;
  readonly materialsSource?: OrderMaterialsSource;
  readonly source?: OrderSource;
  readonly deliveryAddress?: string;
  readonly managerId?: string;
  readonly priority?: OrderPriority;
  readonly organizationId?: string;
  readonly items: readonly OrderItemPayload[];
}

export type UpdateOrderPayload = Partial<CreateOrderPayload> & {
  readonly status?: OrderStatus;
};

export interface Order {
  readonly _id: string;
  readonly number: string;
  readonly counterpartyId?: string | { readonly _id: string; readonly name?: string };
  readonly siteId?: string | { readonly _id: string; readonly name?: string; readonly address?: string };
  readonly quotationId?: string | { readonly _id: string; readonly number?: string };
  readonly organizationId?: string;
  readonly status?: OrderStatus;
  readonly date?: string;
  readonly plannedDate?: string;
  readonly priority?: OrderPriority;
  readonly isPaid?: boolean;
  readonly paidAt?: string | null;
  readonly items?: readonly OrderItem[];
  /** TZ-PRODUCTION-309: order-level Gantt days (catalog WorkType.days is fallback). */
  readonly estimateDayOverrides?: readonly EstimateDayOverride[] | null;
  /** TZ-PRODUCTION-316: per-bar start offset from visualAnchor. */
  readonly estimateStartOffsets?: readonly EstimateStartOffset[] | null;
}

/** TZ-PRODUCTION-309 composite key for order-level duration override. */
export interface EstimateDayOverride {
  readonly orderItemIndex: number;
  readonly moduleId: string;
  readonly workTypeId: string;
  readonly days: number;
}

/** TZ-PRODUCTION-316 composite key for start offset. */
export interface EstimateStartOffset {
  readonly orderItemIndex: number;
  readonly moduleId: string;
  readonly workTypeId: string;
  readonly offsetDays: number;
}

/** Body for PATCH /orders/:id/estimate-days (positive days upsert; null clears). */
export interface PatchEstimateDaysPayload {
  readonly orderItemIndex: number;
  readonly moduleId: string;
  readonly workTypeId: string;
  readonly days: number | null;
}

/** Body for PATCH /orders/:id/estimate-start (days ≥ 0 from visualAnchor; null clears). */
export interface PatchEstimateStartPayload {
  readonly orderItemIndex: number;
  readonly moduleId: string;
  readonly workTypeId: string;
  readonly offsetDays: number | null;
}
