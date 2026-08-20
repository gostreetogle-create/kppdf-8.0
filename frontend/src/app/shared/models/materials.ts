import { Photo } from '../services/photos.service';

export type MaterialDimensionType =
  'length' | 'width' | 'height' | 'thickness' | 'diameter' | 'depth';

export interface MaterialDimension {
  type: MaterialDimensionType;
  value: number;
  isImmutable?: boolean;
}

export interface Material {
  _id: string;
  name: string;
  /** Optional only for legacy rows; create/edit forms require an article. */
  article?: string;
  sku?: string;
  unit: string;
  categoryId?: string;
  description?: string;
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  photoIds?: Array<string | Photo>;
  mainPhotoId?: string | Photo;
  /** TZ-SUPPLY-312 — allowed order colors for this material. */
  colors?: string[];
  supplierId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialsListResponse {
  items: Material[];
  total: number;
  page: number;
  limit: number;
}

export interface MaterialsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}
