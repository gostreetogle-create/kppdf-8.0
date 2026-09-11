/** Mirrors `backend/src/modules/category/category.schema.ts`. */

export type CategoryType = 'material' | 'product' | 'module' | 'general';

export interface Category {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly type: CategoryType;
  readonly parentId?: string;
  readonly fullPath?: string;
  readonly skuPrefix: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly description?: string;
  readonly isSystem?: boolean;
}

export interface CategoriesListParams {
  readonly type?: CategoryType;
}

export interface CreateCategoryPayload {
  readonly name: string;
  readonly slug: string;
  readonly type: CategoryType;
  readonly skuPrefix: string;
  readonly parentId?: string;
  readonly description?: string;
  readonly isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
