/** Mirrors `backend/src/modules/product-module/product-module.schema.ts`. */

export interface ModuleDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: string;
}

export interface ProductModule {
  _id: string;
  name: string;
  article: string;
  dimensions?: ModuleDimensions;
  weight?: number;
  sortOrder?: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * `GET /modules` query params (`ProductModuleController.list`).
 * When `productId` is set, returns only modules linked to that product.
 */
export interface ModulesListParams {
  productId?: string;
}

export interface CreateProductModulePayload {
  name: string;
  article: string;
  dimensions?: ModuleDimensions;
  weight?: number;
  sortOrder?: number;
}

export type UpdateProductModulePayload = Partial<CreateProductModulePayload>;
