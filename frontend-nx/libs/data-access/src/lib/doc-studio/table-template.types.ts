export const TABLE_TEMPLATE_CATEGORIES = [
  'product-spec', 'cost-calc', 'order-summary', 'price-list', 'custom', 'kp',
] as const;
export type TableTemplateCategory = (typeof TABLE_TEMPLATE_CATEGORIES)[number];
export const TABLE_COLUMN_TYPES = ['text', 'number', 'date', 'currency', 'bool'] as const;
export type TableColumnType = (typeof TABLE_COLUMN_TYPES)[number];
export const TABLE_COLUMN_ALIGNS = ['left', 'center', 'right'] as const;
export type TableColumnAlign = (typeof TABLE_COLUMN_ALIGNS)[number];

export interface TableTemplateColumn {
  readonly key: string;
  readonly label: string;
  readonly type: TableColumnType;
  readonly width: number;
  readonly align: TableColumnAlign;
  readonly format?: string;
}
export interface TableTemplate {
  readonly _id: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: TableTemplateCategory;
  readonly sortOrder: number;
  readonly columns: readonly TableTemplateColumn[];
  readonly sampleRows?: readonly Record<string, unknown>[];
  readonly isActive: boolean;
  readonly dataSource?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
export interface TableTemplatePayload {
  readonly name: string;
  readonly description?: string;
  readonly category?: TableTemplateCategory;
  readonly sortOrder: number;
  readonly columns: readonly TableTemplateColumn[];
  readonly sampleRows?: readonly unknown[][];
  readonly dataSource?: string;
}
export type RegistryFieldType = 'text' | 'number' | 'currency' | 'date' | 'bool';

export interface RegistryDataField {
  readonly key: string;
  readonly label: string;
  readonly type: RegistryFieldType;
}

export interface RegistryDataSource {
  readonly key: string;
  readonly label: string;
  readonly group?: 'contacts' | 'catalog' | 'work';
  readonly fields?: readonly RegistryDataField[];
}
