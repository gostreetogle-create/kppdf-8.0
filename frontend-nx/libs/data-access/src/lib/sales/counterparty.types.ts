export interface Counterparty {
  readonly _id: string;
  readonly name: string;
  readonly shortName?: string;
  readonly inn: string;
  readonly innIsStub?: boolean;
  readonly phone?: string;
  readonly email?: string;
  readonly roles: readonly string[];
  readonly isActive: boolean;
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

/** Thin create/edit surface (TZ-NX-DEALS-D3) — not the full legacy EAV editor. */
export interface CreateCounterpartyPayload {
  readonly name: string;
  readonly inn: string;
  readonly roles: readonly string[];
  readonly phone?: string;
  readonly email?: string;
}

export type UpdateCounterpartyPayload = Partial<CreateCounterpartyPayload>;
