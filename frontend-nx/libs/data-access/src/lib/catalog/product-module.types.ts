/** Mirrors `backend/src/modules/product-module/product-module.schema.ts`. */

export interface ModuleDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: string;
}

export type ModuleRef = string | Record<string, unknown>;

export interface WorkTypeInModule {
  /** `workTypeId` may be a string (unpopulated) or full WorkType (populated). */
  workTypeId: string | { _id: string; name?: string; days?: number | null; accentHue?: number | null };
  /** Intentionally unused for Gantt duration (lock D of gantt-bar.model). */
  estimatedHours?: number | null;
  sortOrder?: number;
  /** Gantt duration SoT for this module↔workType binding; null/absent falls back to WorkType.days catalog seed. */
  days?: number | null;
}

/** Normalized write shape accepted by module create/update endpoints. */
export interface ProductModuleWorkTypePayload {
  workTypeId: string;
  estimatedHours?: number;
  sortOrder?: number;
  /** Gantt duration SoT for this module↔workType binding; omit/null falls back to WorkType.days catalog seed. */
  days?: number | null;
}

export interface ProductModule {
  _id: string;
  name: string;
  article: string;
  dimensions?: ModuleDimensions;
  weight?: number;
  sortOrder?: number;
  photoIds?: ModuleRef[];
  /** ТZ-PRODUCTION: populated workTypes on detail (backend populates workTypeId). */
  workTypes?: WorkTypeInModule[];
  /** Канонический состав модуля (TZ-CATALOG-302/317); dual-read зеркало backend. */
  composition?: ModuleRef[];
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
  /** Planning links used by the Gantt; material composition remains separate. */
  workTypes?: ProductModuleWorkTypePayload[];
}

export type UpdateProductModulePayload = Partial<CreateProductModulePayload>;
