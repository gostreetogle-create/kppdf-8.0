/** Mirrors `backend/src/modules/supply/supply-task.schema.ts`. */
export type SupplyTaskStatus = 'draft' | 'confirmed' | 'ordered' | 'received';

/**
 * TZ-SUPPLY-301 — задача снабжения (потребность по линии заказа).
 * `title` is a best-effort label written at create time — the backend does
 * not populate `materialId`/`moduleId` on list/find (see `SupplyTaskService`).
 */
export interface SupplyTask {
  readonly _id: string;
  readonly orderId: string;
  readonly orderLineId?: string;
  readonly materialId?: string;
  readonly moduleId?: string;
  readonly qty: number;
  readonly status: SupplyTaskStatus;
  readonly confirmedBy?: string;
  readonly confirmedAt?: string;
  readonly notes?: string;
  readonly title?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface CreateSupplyTaskPayload {
  readonly orderId: string;
  readonly orderLineId?: string;
  readonly materialId?: string;
  readonly moduleId?: string;
  readonly qty: number;
  readonly notes?: string;
  readonly title?: string;
}

export type UpdateSupplyTaskPayload = Partial<
  Pick<CreateSupplyTaskPayload, 'qty' | 'notes' | 'title'>
>;

export interface ExplodeSupplyTasksPayload {
  readonly orderId: string;
  readonly moduleId?: string;
}

export interface ExplodeSupplyTasksResult {
  readonly created: readonly SupplyTask[];
  readonly skipped: number;
}

export interface SupplyTasksListParams {
  readonly orderId?: string;
  readonly status?: SupplyTaskStatus;
}
