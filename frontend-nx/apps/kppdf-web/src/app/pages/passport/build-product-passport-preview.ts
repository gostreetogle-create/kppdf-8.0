import type { CompositionTreeNode, ProductDetail, ProductRef } from '@kppdf/data-access';
import { formatMaterialKind } from '../registries/data/material-formatters';
import { formatMaterialRef } from '../registries/data/material-formatters';
import {
  PASSPORT_NOT_SPECIFIED,
  PRODUCT_PASSPORT_FIELD_MAP,
} from './passport-field-map';
import type {
  CompositionSummaryRow,
  PassportPreviewField,
  ProductPassportPreview,
} from './passport-preview.types';

export interface BuildProductPassportPreviewInput {
  readonly product: ProductDetail;
  readonly tree?: CompositionTreeNode | null;
  readonly unitLabel?: string | null;
}

const SNAPSHOT_NOTICE =
  'Предпросмотр из live-каталога (Product / состав). Иммутабельный снимок ProductPassport — отдельная сущность, в этой задаче не создаётся.';

export function buildProductPassportPreview(
  input: BuildProductPassportPreviewInput,
): ProductPassportPreview {
  const { product, tree, unitLabel } = input;
  const values = resolveLiveValues(product, tree, unitLabel);
  const fields: PassportPreviewField[] = PRODUCT_PASSPORT_FIELD_MAP.map((def) => {
    if (def.source === 'snapshot-only') {
      return {
        key: def.key,
        label: def.label,
        value: PASSPORT_NOT_SPECIFIED,
        source: def.source,
        snapshotOnly: true,
      };
    }
    return {
      key: def.key,
      label: def.label,
      value: values[def.key] ?? PASSPORT_NOT_SPECIFIED,
      source: def.source,
      snapshotOnly: false,
    };
  });

  return {
    mode: 'live-catalog',
    snapshotNotice: SNAPSHOT_NOTICE,
    fields,
    compositionSummary: buildCompositionSummary(tree),
  };
}

function resolveLiveValues(
  product: ProductDetail,
  tree: CompositionTreeNode | null | undefined,
  unitLabel: string | null | undefined,
): Record<string, string> {
  const dimUnit = product.dimensions?.unit?.trim() || 'мм';
  return {
    photo: formatPhotoCount(product.photoIds),
    category: formatMaterialRef(product.categoryId as ProductRef | undefined),
    name: textOrMissing(product.name),
    sku: textOrMissing(product.sku),
    height: formatDimension(product.dimensions?.height, dimUnit),
    length: formatDimension(product.dimensions?.length, dimUnit),
    width: formatDimension(product.dimensions?.width, dimUnit),
    weightKg: formatWeight(product.weightKg),
    description: textOrMissing(product.description),
    installationSite: textOrMissing(product.installation),
    manufacturedFrom: deriveManufacturedFrom(tree),
    installation: textOrMissing(product.installation),
    purpose: textOrMissing(product.purpose),
    unit: formatUnit(product.unit, unitLabel),
    color: textOrMissing(product.ralCode ?? undefined),
  };
}

function textOrMissing(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : PASSPORT_NOT_SPECIFIED;
}

function formatDimension(value: number | null | undefined, unit: string): string {
  if (value == null || Number.isNaN(value)) return PASSPORT_NOT_SPECIFIED;
  return `${value} ${unit}`;
}

function formatWeight(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return PASSPORT_NOT_SPECIFIED;
  return `${value} кг`;
}

function formatUnit(unitKey: string | undefined, unitLabel: string | null | undefined): string {
  const key = unitKey?.trim();
  if (!key) return PASSPORT_NOT_SPECIFIED;
  if (unitLabel?.trim()) return `${unitLabel} (${key})`;
  return key;
}

function formatPhotoCount(photoIds: ProductRef[] | undefined): string {
  const count = photoIds?.length ?? 0;
  if (count === 0) return PASSPORT_NOT_SPECIFIED;
  return `${count} фото в каталоге`;
}

function deriveManufacturedFrom(tree: CompositionTreeNode | null | undefined): string {
  const names = collectMaterialNames(tree);
  if (!names.length) return PASSPORT_NOT_SPECIFIED;
  return names.join(', ');
}

function collectMaterialNames(node: CompositionTreeNode | null | undefined): string[] {
  if (!node) return [];
  const names: string[] = [];
  const walk = (n: CompositionTreeNode): void => {
    if (n.kind === 'material' && n.name.trim()) {
      names.push(n.name.trim());
    }
    for (const child of n.children ?? []) walk(child);
  };
  walk(node);
  return [...new Set(names)];
}

export function buildCompositionSummary(
  tree: CompositionTreeNode | null | undefined,
): CompositionSummaryRow[] {
  if (!tree?.children?.length) return [];
  return tree.children.map((child, index) => ({
    position: index + 1,
    designation: PASSPORT_NOT_SPECIFIED,
    name: child.name?.trim() || PASSPORT_NOT_SPECIFIED,
    material:
      child.kind === 'material'
        ? formatMaterialKind(child.materialKind)
        : child.kind === 'module'
          ? 'Модуль'
          : 'Изделие',
    quantity: formatQuantity(child.quantity, child.unit),
  }));
}

function formatQuantity(quantity: number, unit?: string): string {
  const u = unit?.trim();
  return u ? `${quantity} ${u}` : String(quantity);
}
