export interface Counterparty {
  readonly _id: string;
  readonly name: string;
  readonly shortName?: string;
}

export interface CounterpartiesListResponse {
  readonly items: Counterparty[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface CounterpartiesListParams {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly role?: string;
}