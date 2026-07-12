import { Photo } from '../services/photos.service';

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

export interface Material {
  _id: string;
  name: string;
  article?: string;
  sku?: string;
  unit: string;
  categoryId?: string;
  description?: string;
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  photoIds?: string[];
  mainPhotoId?: string | Photo;
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
