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
