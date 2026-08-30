/** Mirrors `backend/src/modules/product-passport/product-passport.schema.ts`. */
export interface ProductPassport {
  readonly _id: string;
  readonly productId: string;
  readonly passportNumber: string;
  readonly productCode?: string;
  readonly warrantyCode?: string;
  readonly date?: string;
  readonly name?: string;
  readonly category?: string;
  readonly article?: string;
  readonly height?: number;
  readonly length?: number;
  readonly width?: number;
  readonly weight?: number;
  readonly description?: string;
  readonly installationSite?: string;
  readonly supplier?: string;
  readonly photo?: string;
  readonly isActive: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface ProductPassportsListParams {
  readonly productId?: string;
}
