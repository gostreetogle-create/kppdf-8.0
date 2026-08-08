/**
 * TZ-DICT-316 — FieldKey → control kind registry (audit allowlist).
 * No inventing fields outside PRODUCT_FIELD_KEYS / MODULE_FIELD_KEYS.
 */

export type QuickCreateControlKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select-kind'
  | 'select-status'
  | 'select-category'
  | 'checkbox'
  | 'dim-unit';

/** Control renderer for each allowlisted FieldKey. */
export const FIELD_CONTROL_KIND: Record<string, QuickCreateControlKind> = {
  name: 'text',
  kind: 'select-kind',
  unit: 'text',
  sku: 'text',
  listPrice: 'number',
  categoryId: 'select-category',
  isActive: 'checkbox',
  status: 'select-status',
  dimLength: 'number',
  dimWidth: 'number',
  dimHeight: 'number',
  dimUnit: 'dim-unit',
  weightKg: 'number',
  description: 'textarea',
  notes: 'textarea',
  article: 'text',
  width: 'number',
  height: 'number',
  depth: 'number',
  weight: 'number',
};

export function controlKindFor(fieldKey: string): QuickCreateControlKind {
  return FIELD_CONTROL_KIND[fieldKey] ?? 'text';
}
