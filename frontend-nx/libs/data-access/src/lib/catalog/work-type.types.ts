/** Mirrors `backend/src/modules/work-type/work-type.schema.ts` (legacy parity). */
export interface WorkType {
  _id: string;
  name: string;
  section?: string;
  description?: string;
  isActive: boolean;
  department?: string;
  defaultDurationHours?: number;
  /** Calendar days for Gantt estimation (TZ-PRODUCTION-302). Null allowed. */
  days?: number | null;
  /** Optional Gantt/UI accent hue 0–359. Absent → hash from id. */
  accentHue?: number | null;
  workCenterId?: string | { _id: string; name: string };
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkTypeListResponse {
  items: WorkType[];
  total: number;
}

export interface WorkTypeListParams {
  workCenterId?: string;
  /** if true, server returns only isActive=true (frontend filter for picker use-case). */
  activeOnly?: boolean;
}

/** Fields accepted by the WorkType create/PATCH endpoints. */
export interface WorkTypeWritePayload {
  name: string;
  section?: string;
  department?: string;
  description?: string;
  defaultDurationHours?: number;
  hourlyRate: number;
  days?: number | null;
  accentHue?: number | null;
  isActive?: boolean;
  workCenterId?: string;
}

export type WorkTypeUpdatePayload = Partial<WorkTypeWritePayload> & Pick<WorkTypeWritePayload, 'hourlyRate'>;
