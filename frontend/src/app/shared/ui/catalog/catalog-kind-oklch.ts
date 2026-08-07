/**
 * Catalog kind UI accents — canon:
 * docs/audits/2026-08-07-catalog-entity-colors-audit.md
 * TZ-CATALOG-330 (defaults in code; persist → 331).
 *
 * Not RAL / color_references. Not WorkType Gantt hues.
 */

export type CatalogEntityKind = 'product' | 'module' | 'material';

export type CatalogMaterialKind = 'raw' | 'part' | 'fastener' | 'purchased' | 'other' | string;

/** Default hues (same 7-bucket spirit as work types, distinct roles). */
export const CATALOG_KIND_DEFAULT_HUES = {
  product: 45,
  module: 230,
  material: 145,
  /** Сырьё — отдельный тон от детали/метиза */
  materialRaw: 95,
} as const;

export function catalogKindHue(
  kind: CatalogEntityKind,
  materialKind?: CatalogMaterialKind | null,
): number {
  if (kind === 'material' && materialKind === 'raw') {
    return CATALOG_KIND_DEFAULT_HUES.materialRaw;
  }
  return CATALOG_KIND_DEFAULT_HUES[kind];
}

/** Solid accent (badge border / inspector dot). */
export function catalogKindOklch(
  kind: CatalogEntityKind,
  materialKind?: CatalogMaterialKind | null,
  chroma = 0.11,
  lightness = 0.62,
): string {
  const h = catalogKindHue(kind, materialKind);
  return `oklch(${lightness} ${chroma} ${h})`;
}

/** Soft row wash — alpha so light and dark paper both stay readable. */
export function catalogKindWash(
  kind: CatalogEntityKind,
  materialKind?: CatalogMaterialKind | null,
): string {
  const h = catalogKindHue(kind, materialKind);
  return `oklch(0.72 0.1 ${h} / 0.14)`;
}

export function catalogKindBorder(
  kind: CatalogEntityKind,
  materialKind?: CatalogMaterialKind | null,
): string {
  return catalogKindOklch(kind, materialKind, 0.12, 0.55);
}
