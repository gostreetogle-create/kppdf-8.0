/**
 * Dry-run material validation (TZD-17).
 * Read-only: no proposal POST, no SoT write.
 */

import { BackendError } from './backend.js';
import { MATERIAL_KINDS, isMaterialKind } from './domain-schema.js';
import { withQuery } from './query.js';

export interface ValidateMaterialInput {
  name?: string;
  unit?: string;
  article?: string;
  sku?: string;
  categoryId?: string;
  materialKind?: string;
}

export interface ValidationIssue {
  code: string;
  message: string;
  materialId?: string;
}

export interface ValidateMaterialResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
  normalized: {
    name: string;
    unit: string;
    article?: string;
    sku?: string;
    categoryId?: string;
    materialKind?: string;
  };
}

export interface CategorySnapshot {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  skuPrefix: string | null;
}

export interface MaterialHit {
  id: string;
  name: string;
  article?: string;
}

export interface ValidateMaterialDeps {
  getCategory: (id: string) => Promise<CategorySnapshot | null>;
  searchMaterials: (search: string) => Promise<MaterialHit[]>;
}

function idOf(raw: Record<string, unknown>): string {
  const id = raw.id ?? raw._id;
  return id === undefined || id === null ? '' : String(id);
}

/** Normalize a category API document into CategorySnapshot. */
export function slimCategory(raw: unknown): CategorySnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  const id = idOf(c);
  if (!id) return null;
  const skuRaw = c.skuPrefix;
  return {
    id,
    name: String(c.name ?? ''),
    type: String(c.type ?? ''),
    isActive: c.isActive !== false,
    skuPrefix:
      skuRaw === undefined || skuRaw === null || String(skuRaw).trim() === ''
        ? null
        : String(skuRaw),
  };
}

/** Extract material hits from list envelope or array. */
export function slimMaterialHits(payload: unknown): MaterialHit[] {
  const items = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown }).items)
      ? ((payload as { items: unknown[] }).items)
      : [];
  const out: MaterialHit[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const m = item as Record<string, unknown>;
    const id = idOf(m);
    if (!id) continue;
    const hit: MaterialHit = { id, name: String(m.name ?? '') };
    if (m.article !== undefined && m.article !== null && String(m.article).trim()) {
      hit.article = String(m.article).trim();
    }
    out.push(hit);
  }
  return out;
}

/**
 * Build deps that call Nest read APIs only (GET categories / materials).
 * Never POSTs to mutation-journal.
 */
export function createBackendValidateDeps(
  apiBaseUrl: string,
  apiKey: string,
  getJson: (base: string, key: string, path: string) => Promise<unknown>,
): ValidateMaterialDeps {
  return {
    async getCategory(id: string) {
      try {
        const raw = await getJson(apiBaseUrl, apiKey, `/api/categories/${encodeURIComponent(id)}`);
        return slimCategory(raw);
      } catch (err) {
        if (err instanceof BackendError && (err.status === 404 || err.status === 400)) {
          return null;
        }
        throw err;
      }
    },
    async searchMaterials(search: string) {
      const path = withQuery('/api/materials', { page: 1, limit: 20, search });
      const raw = await getJson(apiBaseUrl, apiKey, path);
      return slimMaterialHits(raw);
    },
  };
}

function normEq(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function validateMaterial(
  input: ValidateMaterialInput,
  deps: ValidateMaterialDeps,
): Promise<ValidateMaterialResult> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const infos: ValidationIssue[] = [];

  const name = (input.name ?? '').trim();
  const unitRaw = input.unit?.trim() ?? '';
  const unit = unitRaw || 'шт';
  const article = input.article?.trim() || undefined;
  const sku = input.sku?.trim() || undefined;
  const categoryId = input.categoryId?.trim() || undefined;
  const materialKind = input.materialKind?.trim() || undefined;

  if (!name) {
    errors.push({
      code: 'NAME_REQUIRED',
      message: 'name is required (empty or whitespace). / name обязателен.',
    });
  }

  if (!unitRaw) {
    infos.push({
      code: 'UNIT_DEFAULT',
      message: 'unit → шт (default). / единица по умолчанию «шт».',
    });
  }

  if (materialKind !== undefined) {
    if (!isMaterialKind(materialKind)) {
      errors.push({
        code: 'MATERIAL_KIND_INVALID',
        message: `materialKind «${materialKind}» not in [${MATERIAL_KINDS.join(', ')}].`,
      });
    }
  }

  if (categoryId) {
    const category = await deps.getCategory(categoryId);
    if (!category) {
      errors.push({
        code: 'CATEGORY_NOT_FOUND',
        message: `Category ${categoryId} not found. / Категория не найдена.`,
      });
    } else if (category.type !== 'material') {
      errors.push({
        code: 'CATEGORY_WRONG_TYPE',
        message: `Category «${category.name}» type=${category.type}, expected material.`,
      });
    } else if (!category.isActive) {
      errors.push({
        code: 'CATEGORY_INACTIVE',
        message: `Category «${category.name}» is inactive. / Категория неактивна.`,
      });
    } else if (!sku && !category.skuPrefix) {
      errors.push({
        code: 'CATEGORY_SKU_PREFIX_MISSING',
        message:
          `Category «${category.name}» has no skuPrefix; auto-SKU impossible without sku. ` +
          `/ У категории нет skuPrefix — задайте sku вручную или настройте префикс.`,
      });
    }
  }

  if (name) {
    try {
      const hits = await deps.searchMaterials(name);
      for (const hit of hits) {
        if (normEq(hit.name, name) || (article && hit.article && normEq(hit.article, article))) {
          warnings.push({
            code: 'POSSIBLE_DUPLICATE',
            message: `Similar material «${hit.name}» (${hit.id}). / Возможный дубль.`,
            materialId: hit.id,
          });
        }
      }
    } catch {
      // Duplicate check is best-effort; do not fail validation on search errors.
      infos.push({
        code: 'DUPLICATE_CHECK_SKIPPED',
        message: 'Could not search existing materials for duplicates.',
      });
    }
  }

  const normalized: ValidateMaterialResult['normalized'] = {
    name,
    unit,
  };
  if (article) normalized.article = article;
  if (sku) normalized.sku = sku;
  if (categoryId) normalized.categoryId = categoryId;
  if (materialKind) normalized.materialKind = materialKind;

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos,
    normalized,
  };
}
