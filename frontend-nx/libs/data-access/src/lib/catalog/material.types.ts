/** Mirrors `backend/src/modules/material/material.schema.ts` + list populate shapes. */

export type MaterialDimensionType =
  | 'length'
  | 'width'
  | 'height'
  | 'thickness'
  | 'diameter'
  | 'depth';

export interface MaterialDimension {
  type: MaterialDimensionType;
  value: number;
  isImmutable?: boolean;
}

export const MATERIAL_KINDS = ['raw', 'part', 'fastener', 'purchased', 'other'] as const;
export type MaterialKind = (typeof MATERIAL_KINDS)[number];

/** Populated category/photo/supplier docs vary; list/detail accept id or object. */
export type MaterialRef = string | Record<string, unknown>;

export interface Material {
  _id: string;
  name: string;
  article?: string;
  sku?: string;
  unit: string;
  categoryId?: MaterialRef;
  description?: string;
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  photoIds?: MaterialRef[];
  mainPhotoId?: MaterialRef;
  colors?: string[];
  supplierId?: MaterialRef;
  notes?: string;
  materialKind?: MaterialKind | null;
  assortment?: string;
  standardRef?: string;
  materialGrade?: string;
  weightKg?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialsListResponse {
  items: Material[];
  total: number;
  page: number;
  limit: number;
}

/** Supported query params on `GET /materials` (MaterialController.list). */
export interface MaterialsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  materialKind?: MaterialKind;
}

/** Payload for `POST /materials` — mirrors `CreateMaterialDto`. */
export interface CreateMaterialPayload {
  name: string;
  article: string;
  unit: string;
  sku?: string;
  materialKind?: MaterialKind;
  assortment?: string;
  standardRef?: string;
  materialGrade?: string;
  weightKg?: number;
  categoryId?: string;
  description?: string;
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  colors?: string[];
  photoIds?: string[];
  mainPhotoId?: string;
  supplierId?: string;
  notes?: string;
}

export type UpdateMaterialPayload = Partial<CreateMaterialPayload>;
