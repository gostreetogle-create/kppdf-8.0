export interface Site {
  readonly _id: string;
  readonly counterpartyId: string;
  readonly name: string;
  readonly address: string;
}

/** Body for POST /sites (TZ-NX-ORDER-WS-META-INLINE — the «Объект» quick-create «+»). */
export interface CreateSitePayload {
  readonly counterpartyId: string;
  readonly name: string;
  readonly address: string;
}
