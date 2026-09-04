/** Mirrors `backend/src/modules/worker/worker.schema.ts` (TZ-WORKERS-301). */
export interface Person {
  _id: string;
  lastName: string;
  firstName: string;
  patronymic?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  grade?: string;
  ratePerHour?: number;
  supplierId?: string;
  workTypeIds?: string[];
  organizationId?: string | null;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonListResponse {
  items: Person[];
  total: number;
  page: number;
  limit: number;
}

export interface PersonListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  supplierId?: string;
  workTypeId?: string;
}

/** Full display name (lastName + firstName + patronymic). */
export function personDisplayName(
  p: Pick<Person, 'lastName' | 'firstName' | 'patronymic'>,
): string {
  return [p.lastName, p.firstName, p.patronymic].filter(Boolean).join(' ').trim();
}