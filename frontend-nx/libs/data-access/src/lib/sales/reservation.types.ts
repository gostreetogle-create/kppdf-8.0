/** Mirrors `backend/src/modules/reservation/reservation.schema.ts`. */
export type ReservationStatus = 'active' | 'released' | 'fulfilled' | 'cancelled';

export interface Reservation {
  readonly _id: string;
  readonly orderId: string;
  readonly productId: string | { readonly _id: string; readonly name?: string };
  readonly warehouseId: string | { readonly _id: string; readonly name?: string };
  readonly qty: number;
  readonly status: ReservationStatus;
  readonly zoneName?: string;
  readonly notes?: string;
  readonly expiresAt?: string;
  readonly createdAt?: string;
}

export interface ReservationsListParams {
  /** Backend filters on the plain `orderId` string field — pass `Order.number`, not `_id`. */
  readonly orderId?: string;
}
