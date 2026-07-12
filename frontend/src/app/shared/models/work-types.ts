export interface WorkType {
  _id: string;
  name: string;
  section?: string;
  description?: string;
  isActive: boolean;
  department?: string;
  defaultDurationHours?: number;
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
  activeOnly?: boolean;
}
