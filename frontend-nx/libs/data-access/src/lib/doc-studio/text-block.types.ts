export interface TextBlockColumn {
  readonly id: string;
  readonly content: string;
  readonly width: number;
  readonly fontSize: number;
}

export interface TextBlock {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly content: string;
  readonly columns: readonly TextBlockColumn[];
  readonly isActive: boolean;
  readonly categoryId?: string;
  readonly sortOrder: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface TextBlockPayload {
  readonly name: string;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly content: string;
  readonly categoryId?: string;
  readonly sortOrder: number;
}

export interface TextBlocksListParams {
  readonly categoryId?: string;
  readonly isActive?: boolean;
}

/**
 * TZ-NX-TEXT-CAT-PARENT — `parentId` undefined/null = root (top-level)
 * category; set = subcategory (leaf). Depth is capped at 1 server-side.
 */
export interface TextBlockCategory {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly isSystem?: boolean;
  readonly isDefault?: boolean;
  readonly sortOrder: number;
  readonly organizationId?: string;
  readonly parentId?: string;
}

export interface TextBlockCategoryPayload {
  readonly name: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly isDefault?: boolean;
  readonly sortOrder?: number;
  readonly parentId?: string;
}

export interface TextBlockCategoriesListParams {
  readonly activeOnly?: boolean;
  readonly search?: string;
  /** Subcategories of this specific root. */
  readonly parentId?: string;
  /** Root (top-level) categories only. */
  readonly rootsOnly?: boolean;
}
