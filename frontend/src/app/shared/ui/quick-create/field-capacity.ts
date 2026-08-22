/**
 * TZ-UX-FORM-301/308 — Field Capacity registry for QuickCreate (kind B)
 * **and** FullEditor (kind C). One table, not two — dialogs pick the same
 * `capacityFor`/`colSpanClass`/`controlMaxClass` regardless of dialog kind.
 * Span table: docs/pages/ui-form-field-capacity.md
 * Only allowlisted FieldKeys (PRODUCT / MODULE / MATERIAL).
 */

export type FieldCapacity = 'nano' | 'xs' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Fixed 12-col spans (one value per capacity — see ui-form-field-capacity.md).
 * nano=2 xs=2 sm=4 md=4 lg=8 full=12 → product dims+weight band fits one row (10).
 */
export const CAPACITY_SPAN: Record<FieldCapacity, number> = {
  nano: 2,
  xs: 2,
  sm: 4,
  md: 4,
  lg: 8,
  full: 12,
};

/**
 * Control max-width for short numeric / unit fields (cell may be wider than
 * the value needs — a 2-col grid cell is not the same as `w-full`).
 * nano ≈ 5–6 digits (GOV.UK input width-5: dims, weight); xs ≈ unit / short
 * price. Never `w-full` — that defeats the point of a fixed max-width.
 */
export const CAPACITY_CONTROL_MAX_CLASS: Partial<Record<FieldCapacity, string>> = {
  nano: 'max-w-[5.5rem]',
  xs: 'max-w-[7rem]',
};

/**
 * Capacity per allowlisted FieldKey (audit §4).
 * Keys must stay inside PRODUCT_FIELD_KEYS ∪ MODULE_FIELD_KEYS ∪ MATERIAL_FIELD_KEYS.
 * isActive=lg so isActive+status fill a row (8+4) and do not steal dim-band
 * columns — this is a QuickCreate (kind B) layout lock, keep it lg for FullEditor too.
 */
export const FIELD_CAPACITY: Record<string, FieldCapacity> = {
  // product
  name: 'lg',
  kind: 'sm',
  unit: 'xs',
  sku: 'sm',
  listPrice: 'xs',
  categoryId: 'md',
  isActive: 'lg',
  status: 'sm',
  dimLength: 'nano',
  dimWidth: 'nano',
  dimHeight: 'nano',
  dimUnit: 'xs',
  weightKg: 'nano',
  description: 'full',
  notes: 'full',
  // product FullEditor (kind C) — subcategory/color, no QuickCreate equivalent
  subcategory: 'sm',
  ralCode: 'sm',
  // module (unit/notes shared keys already set)
  article: 'sm',
  width: 'nano',
  height: 'nano',
  depth: 'nano',
  weight: 'nano',
};

/** First key of a dimension band — force new 12-col row so nano-лента stays intact. */
const BAND_START_KEYS = new Set(['dimLength', 'width']);

export function capacityFor(fieldKey: string): FieldCapacity {
  return FIELD_CAPACITY[fieldKey] ?? 'md';
}

export function spanFor(capacity: FieldCapacity): number {
  return CAPACITY_SPAN[capacity];
}

export function spanForKey(fieldKey: string): number {
  return spanFor(capacityFor(fieldKey));
}

/** Tailwind md:col-span-* — static map so JIT keeps classes. */
const SPAN_COL_CLASS: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

export function colSpanClass(fieldKey: string, useCapacityGrid: boolean): string {
  if (!useCapacityGrid) return '';
  const span = spanForKey(fieldKey);
  const base = SPAN_COL_CLASS[span] ?? 'md:col-span-4';
  return BAND_START_KEYS.has(fieldKey) ? `${base} md:col-start-1` : base;
}

export function controlMaxClass(fieldKey: string, useCapacityGrid: boolean): string {
  if (!useCapacityGrid) return '';
  return CAPACITY_CONTROL_MAX_CLASS[capacityFor(fieldKey)] ?? '';
}
