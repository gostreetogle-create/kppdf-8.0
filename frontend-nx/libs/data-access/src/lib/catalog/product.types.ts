/** Mirrors `backend/src/modules/product/product.schema.ts` + detail enrichments. */

export type ProductKind = 'good' | 'service' | 'work';
export type ProductStatus = 'new' | 'active' | 'archived' | 'draft';

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

export type ProductRef = string | Record<string, unknown>;

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  kind: ProductKind;
  unit: string;
  categoryId?: string | null | ProductRef;
  subcategory?: string;
  status?: ProductStatus;
  listPrice?: number;
  basePrice?: number;
  costPrice?: number;
  defaultMarkupPercent?: number;
  stockQty?: number;
  description?: string;
  notes?: string;
  photoIds?: ProductRef[];
  dimensions?: ProductDimensions;
  weightKg?: number;
  ralCode?: string | null;
  productModuleIds?: ProductRef[];
  composition?: ProductRef[];
  hasPassport?: boolean;
  hasDrawing?: boolean;
  isActive?: boolean;
  purpose?: string;
  installation?: string;
  attributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  copiedFromProductId?: string;
}

/** `ProductService.findById` adds derived `isComplex` (composition product line). */
export interface ProductDetail extends Product {
  isComplex?: boolean;
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

/** Supported query params on `GET /products` (ProductController.list). */
export interface ProductsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  isActive?: boolean;
  sortBy?: 'name' | 'sku' | 'listPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductPayload {
  name?: string;
  sku: string;
  kind: ProductKind;
  unit: string;
  categoryId?: string | null;
  subcategory?: string;
  status?: ProductStatus;
  listPrice?: number;
  basePrice?: number;
  costPrice?: number;
  defaultMarkupPercent?: number;
  stockQty?: number;
  description?: string;
  notes?: string;
  dimensions?: ProductDimensions;
  weightKg?: number;
  hasPassport?: boolean;
  hasDrawing?: boolean;
  isActive?: boolean;
  purpose?: string;
  installation?: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface DuplicateProductPayload {
  sku?: string;
  name?: string;
  description?: string;
}
