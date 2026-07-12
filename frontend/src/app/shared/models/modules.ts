import { Material } from './materials';
import { WorkType } from './work-types';

export interface ProductModuleDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: string;
}

export interface MaterialInModule {
  materialId: string | Material;
  quantity: number;
  unit?: string;
  isPurchased: boolean;
  overrideDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  sortOrder: number;
}

export interface WorkTypeInModule {
  workTypeId: string | WorkType;
  estimatedHours: number;
  sortOrder: number;
}

export interface ProductModule {
  _id: string;
  name: string;
  article?: string;
  dimensions?: ProductModuleDimensions;
  weight?: number;
  sortOrder?: number;
  workTypes: WorkTypeInModule[];
  materials: MaterialInModule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductModuleUpsertDto {
  name: string;
  article?: string;
  dimensions?: ProductModuleDimensions;
  weight?: number;
  sortOrder?: number;
  workTypes?: WorkTypeInModule[];
  materials?: MaterialInModule[];
}
