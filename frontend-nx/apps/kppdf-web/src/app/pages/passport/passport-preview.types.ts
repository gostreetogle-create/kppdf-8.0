/** Live catalog preview — not an immutable `ProductPassport` snapshot. */
export type PassportPreviewMode = 'live-catalog';

export type PassportFieldSource = 'live-product' | 'live-derived' | 'snapshot-only';

export interface PassportFieldDefinition {
  readonly key: string;
  /** Column label from `data/Pasports.xlsx` (sheet `pasports` or `Products`). */
  readonly label: string;
  readonly source: PassportFieldSource;
  readonly xlsxSheet: 'pasports' | 'Products';
  /** Documented backend path when mapped; absent when snapshot-only / blocked. */
  readonly backendPath?: string;
  readonly blockerNote?: string;
}

export interface PassportPreviewField {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly source: PassportFieldSource;
  readonly snapshotOnly: boolean;
}

export interface CompositionSummaryRow {
  readonly position: number;
  readonly designation: string;
  readonly name: string;
  readonly material: string;
  readonly quantity: string;
}

export interface ProductPassportPreview {
  readonly mode: PassportPreviewMode;
  readonly snapshotNotice: string;
  readonly fields: readonly PassportPreviewField[];
  readonly compositionSummary: readonly CompositionSummaryRow[];
}
