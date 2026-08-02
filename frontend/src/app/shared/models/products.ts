export type ProductKind = 'good' | 'service' | 'work';
export type ProductStatus = 'new' | 'active' | 'archived' | 'draft';

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  kind: ProductKind;
  unit: string;
  /** Explicitly nullable: clearing the color in the form sends `null` (TZ-PRODUCTS-302). */
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
  photoIds?: string[];
  dimensions?: ProductDimensions;
  weightKg?: number;
  /** Explicitly nullable: choosing «Не выбран» clears ralCode to `null` (TZ-PRODUCTS-302). */
  ralCode?: string | null;
  hasPassport?: boolean;
  hasDrawing?: boolean;
  isActive?: boolean;
  purpose?: string;
  installation?: string;
  attributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

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
