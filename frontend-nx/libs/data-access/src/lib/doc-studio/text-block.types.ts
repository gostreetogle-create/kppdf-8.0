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

export interface TextBlockCategory {
  readonly _id: string;
  readonly name: string;
}
