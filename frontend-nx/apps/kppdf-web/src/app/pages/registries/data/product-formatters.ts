import type { ProductKind, ProductStatus } from '@kppdf/data-access';

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  good: 'Товар',
  service: 'Услуга',
  work: 'Работа',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  archived: 'Архив',
  draft: 'Черновик',
};

export function formatProductKind(kind: ProductKind | undefined): string {
  if (!kind) return '—';
  return PRODUCT_KIND_LABELS[kind] ?? kind;
}

export function formatProductStatus(status: ProductStatus | undefined): string {
  if (!status) return '—';
  return PRODUCT_STATUS_LABELS[status] ?? status;
}

/**
 * Shows «Комплекс» only when the API explicitly sent `isComplex: true`.
 * List endpoint does not populate this field today — badge stays empty.
 */
export function formatComplexBadge(row: { isComplex?: boolean }): string {
  return row.isComplex === true ? 'Комплекс' : '—';
}

export function formatModuleDimensions(
  dimensions?: { width?: number; height?: number; depth?: number; unit?: string },
): string {
  if (!dimensions) return '—';
  const parts = [dimensions.width, dimensions.height, dimensions.depth].filter(
    (v) => v !== undefined && v !== null,
  );
  if (!parts.length) return '—';
  const unit = dimensions.unit ? ` ${dimensions.unit}` : '';
  return `${parts.join('×')}${unit}`;
}
