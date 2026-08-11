/**
 * Static material domain contract for MCP agents (TZD-17).
 * MATERIAL_KINDS mirrored from backend/src/modules/material/material.schema.ts.
 */

export const DOMAIN_SCHEMA_VERSION = 'tzd-17';

/** Canon sync: backend Material.materialKind enum. */
export const MATERIAL_KINDS = [
  'raw',
  'part',
  'fastener',
  'purchased',
  'other',
] as const;

export type MaterialKind = (typeof MATERIAL_KINDS)[number];

export const RECOMMENDED_UNITS = ['шт', 'м', 'м²', 'кг', 'л'] as const;

export interface MaterialDomainSchema {
  version: string;
  entity: 'material';
  materialKinds: readonly string[];
  unitConstraint: 'free-string-with-recommended';
  recommendedUnits: readonly string[];
  createProposal: {
    required: readonly string[];
    optional: readonly string[];
  };
  rules: {
    en: string[];
    ru: string[];
  };
}

export function getMaterialDomainSchema(): MaterialDomainSchema {
  return {
    version: DOMAIN_SCHEMA_VERSION,
    entity: 'material',
    materialKinds: [...MATERIAL_KINDS],
    unitConstraint: 'free-string-with-recommended',
    recommendedUnits: [...RECOMMENDED_UNITS],
    createProposal: {
      required: ['name'],
      optional: ['unit', 'article', 'sku', 'categoryId', 'materialKind'],
    },
    rules: {
      en: [
        'Category must be type=material and active when categoryId is set.',
        'Auto-SKU requires category.skuPrefix when sku is omitted and categoryId is set.',
        'name is required (non-empty after trim).',
        'Propose creates a mutation-journal proposal only — not a SoT write. Confirm separately.',
        'unit is a free string; recommended: шт, м, м², кг, л. Empty unit defaults to шт on propose.',
      ],
      ru: [
        'Категория при categoryId должна быть type=material и активной.',
        'Авто-SKU требует skuPrefix у категории, если sku не задан, а categoryId задан.',
        'name обязателен (не пустой после trim).',
        'Propose создаёт только proposal в журнале — не запись в SoT. Confirm отдельно.',
        'unit — произвольная строка; рекомендуемые: шт, м, м², кг, л. Пустой unit → шт при propose.',
      ],
    },
  };
}

export function isMaterialKind(value: string): value is MaterialKind {
  return (MATERIAL_KINDS as readonly string[]).includes(value);
}

// ── TZD-27: product passport domain ──────────────────────────────────────────

/** Canon sync: backend Product.kind enum (good | service | work). */
export const PRODUCT_KINDS = ['good', 'service', 'work'] as const;

export type ProductKind = (typeof PRODUCT_KINDS)[number];

export interface ProductDomainSchema {
  version: string;
  entity: 'product';
  productKinds: readonly string[];
  createProposal: {
    required: readonly string[];
    optional: readonly string[];
  };
  rules: {
    en: string[];
    ru: string[];
  };
}

export function getProductDomainSchema(): ProductDomainSchema {
  return {
    version: 'tzd-27',
    entity: 'product',
    productKinds: [...PRODUCT_KINDS],
    createProposal: {
      required: ['name', 'kind'],
      // TZD-43: categoryId/status добавлены как в вебе (CreateProductDto).
      optional: ['unit', 'sku', 'notes', 'categoryId', 'status'],
    },
    rules: {
      en: [
        'name and kind (good|service|work) are required.',
        'unit is a free string; empty unit defaults to шт on propose.',
        'categoryId is an optional MongoId of the product category (like web).',
        'status is optional; whitelist new|active|archived|draft, default new.',
        'Passport only — BOM/composition is NOT written via import in this wave (use web BomPanel).',
        'Before product.update: run kppdf_get_product_composition / kppdf_get_product_where_used (TZD-19).',
        'Propose creates a mutation-journal proposal only — not a SoT write. Confirm separately.',
      ],
      ru: [
        'name и kind (good|service|work) обязательны.',
        'unit — произвольная строка; пустой unit → шт при propose.',
        'categoryId — опциональный MongoId категории продукта (как в вебе).',
        'status — опционален; whitelist new|active|archived|draft, default new.',
        'Только паспорт — BOM/состав через импорт в этой волне НЕ пишется (reuse web BomPanel).',
        'Перед product.update: kppdf_get_product_composition / kppdf_get_product_where_used (TZD-19).',
        'Propose создаёт только proposal в журнале — не запись в SoT. Confirm отдельно.',
      ],
    },
  };
}

export function isProductKind(value: string): value is ProductKind {
  return (PRODUCT_KINDS as readonly string[]).includes(value);
}
