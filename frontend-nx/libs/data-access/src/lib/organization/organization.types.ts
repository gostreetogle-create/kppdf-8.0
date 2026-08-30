/** Mirrors `backend/src/modules/organization/organization.schema.ts` (list fields). */
export interface Organization {
  readonly _id: string;
  readonly name: string;
  readonly shortName?: string;
  readonly inn: string;
  readonly kpp?: string;
  readonly type: string[];
  readonly isOurCompany?: boolean;
  readonly isActive?: boolean;
}

export interface OrganizationsListParams {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  /** Matches organizations whose `type` array contains this value (e.g. `supplier`). */
  readonly type?: string;
}

export interface OrganizationsListResponse {
  readonly items: Organization[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
