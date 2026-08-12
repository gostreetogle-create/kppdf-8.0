import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DOMAIN_SCHEMA_VERSION,
  getMaterialDomainSchema,
  getProductDomainSchema,
  MATERIAL_KINDS,
  PRODUCT_KINDS,
  PRODUCT_STATUSES,
} from './domain-schema.js';
import { DOMAIN_TOOL_NAMES, validateProduct } from './domain-tools.js';
import { INBOX_TOOL_NAMES, auditInboxRows } from './inbox-tools.js';
import {
  createBackendValidateDeps,
  slimCategory,
  validateMaterial,
  type ValidateMaterialDeps,
} from './validate-material.js';

describe('domain schema (TZD-17)', () => {
  it('contains MATERIAL_KINDS + required name + version tzd-17', () => {
    const schema = getMaterialDomainSchema();
    assert.equal(schema.version, 'tzd-17');
    assert.equal(DOMAIN_SCHEMA_VERSION, 'tzd-17');
    assert.deepEqual([...schema.materialKinds], [...MATERIAL_KINDS]);
    assert.ok(schema.createProposal.required.includes('name'));
    assert.equal(schema.unitConstraint, 'free-string-with-recommended');
  });

  it('registers domain tool names', () => {
    assert.ok(DOMAIN_TOOL_NAMES.includes('kppdf_get_domain_schema'));
    assert.ok(DOMAIN_TOOL_NAMES.includes('kppdf_list_categories'));
    assert.ok(DOMAIN_TOOL_NAMES.includes('kppdf_validate_material'));
    assert.ok(DOMAIN_TOOL_NAMES.includes('kppdf_validate_product'));
  });
});

describe('product domain schema (TZD-27)', () => {
  it('product schema requires name+kind, lists PRODUCT_KINDS', () => {
    const schema = getProductDomainSchema();
    assert.equal(schema.entity, 'product');
    assert.deepEqual([...schema.productKinds], [...PRODUCT_KINDS]);
    assert.deepEqual([...schema.productStatuses], [...PRODUCT_STATUSES]);
    assert.ok(schema.createProposal.required.includes('name'));
    assert.ok(schema.createProposal.required.includes('kind'));
    assert.ok(schema.createProposal.optional.includes('categoryId'));
    assert.ok(schema.createProposal.optional.includes('status'));
  });
});

describe('validateProduct (TZD-27)', () => {
  it('valid name+kind → ok, unit default шт', () => {
    const result = validateProduct({ name: 'Окно ПВХ', kind: 'good' });
    assert.equal(result.ok, true);
    assert.equal(result.normalized.unit, 'шт');
    assert.ok(result.infos.some((i) => i.code === 'UNIT_DEFAULT'));
  });

  it('accepts optional categoryId/status and normalizes them', () => {
    const result = validateProduct({
      name: 'ШЛ-300',
      kind: 'good',
      categoryId: '507f1f77bcf86cd799439011',
      status: 'active',
    });
    assert.equal(result.ok, true);
    assert.equal(result.normalized.categoryId, '507f1f77bcf86cd799439011');
    assert.equal(result.normalized.status, 'active');
  });

  it('rejects malformed categoryId/status', () => {
    const result = validateProduct({
      name: 'X',
      kind: 'good',
      categoryId: 'bad',
      status: 'published',
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'CATEGORY_ID_INVALID'));
    assert.ok(result.errors.some((e) => e.code === 'STATUS_INVALID'));
  });

  it('missing name / missing or invalid kind → errors', () => {
    const noName = validateProduct({ kind: 'good' });
    assert.ok(noName.errors.some((e) => e.code === 'NAME_REQUIRED'));
    const noKind = validateProduct({ name: 'X' });
    assert.ok(noKind.errors.some((e) => e.code === 'KIND_REQUIRED'));
    const badKind = validateProduct({ name: 'X', kind: 'widget' });
    assert.ok(badKind.errors.some((e) => e.code === 'KIND_INVALID'));
  });
});

describe('validateMaterial (TZD-17)', () => {
  function deps(overrides: Partial<ValidateMaterialDeps> = {}): ValidateMaterialDeps {
    return {
      getCategory: async () => null,
      searchMaterials: async () => [],
      ...overrides,
    };
  }

  it('empty name → ok:false + NAME_REQUIRED; never needs proposal POST', async () => {
    let postCalled = false;
    const result = await validateMaterial(
      { name: '   ' },
      {
        getCategory: async () => {
          throw new Error('should not fetch category');
        },
        searchMaterials: async () => {
          postCalled = true;
          return [];
        },
      },
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'NAME_REQUIRED'));
    // searchMaterials only runs when name is non-empty — empty name skips it
    assert.equal(postCalled, false);
  });

  it('inactive category → CATEGORY_INACTIVE', async () => {
    const result = await validateMaterial(
      { name: 'Стекло', categoryId: 'cat1' },
      deps({
        getCategory: async () => ({
          id: 'cat1',
          name: 'Стекло',
          type: 'material',
          isActive: false,
          skuPrefix: 'GL',
        }),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'CATEGORY_INACTIVE'));
  });

  it('missing category → CATEGORY_NOT_FOUND', async () => {
    const result = await validateMaterial(
      { name: 'Oak', categoryId: 'missing' },
      deps({ getCategory: async () => null }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'CATEGORY_NOT_FOUND'));
  });

  it('wrong category type → CATEGORY_WRONG_TYPE', async () => {
    const result = await validateMaterial(
      { name: 'Oak', categoryId: 'p1' },
      deps({
        getCategory: async () => ({
          id: 'p1',
          name: 'Products',
          type: 'product',
          isActive: true,
          skuPrefix: 'PR',
        }),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'CATEGORY_WRONG_TYPE'));
  });

  it('category without skuPrefix and no sku → CATEGORY_SKU_PREFIX_MISSING', async () => {
    const result = await validateMaterial(
      { name: 'Oak', categoryId: 'c1' },
      deps({
        getCategory: async () => ({
          id: 'c1',
          name: 'Wood',
          type: 'material',
          isActive: true,
          skuPrefix: null,
        }),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'CATEGORY_SKU_PREFIX_MISSING'));
  });

  it('invalid materialKind → error', async () => {
    const result = await validateMaterial(
      { name: 'Bolt', materialKind: 'widget' },
      deps(),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.code === 'MATERIAL_KIND_INVALID'));
  });

  it('empty unit → UNIT_DEFAULT info and normalized шт', async () => {
    const result = await validateMaterial({ name: 'ДВП' }, deps());
    assert.equal(result.ok, true);
    assert.ok(result.infos.some((i) => i.code === 'UNIT_DEFAULT'));
    assert.equal(result.normalized.unit, 'шт');
  });

  it('possible duplicate → warning', async () => {
    const result = await validateMaterial(
      { name: 'Стекло 4мм' },
      deps({
        searchMaterials: async () => [{ id: 'm1', name: 'Стекло 4мм' }],
      }),
    );
    assert.equal(result.ok, true);
    assert.ok(result.warnings.some((w) => w.code === 'POSSIBLE_DUPLICATE' && w.materialId === 'm1'));
  });

  it('createBackendValidateDeps never POSTs (spy)', async () => {
    const calls: string[] = [];
    const getJson = async (_b: string, _k: string, path: string) => {
      calls.push(`GET ${path}`);
      if (path.startsWith('/api/categories/')) {
        return {
          _id: 'c1',
          name: 'Wood',
          type: 'material',
          isActive: true,
          skuPrefix: 'WD',
        };
      }
      return { items: [], total: 0 };
    };
    const d = createBackendValidateDeps('http://x', 'tok', getJson);
    const result = await validateMaterial(
      { name: 'Oak', categoryId: 'c1' },
      d,
    );
    assert.equal(result.ok, true);
    assert.ok(calls.every((c) => c.startsWith('GET ')));
    assert.ok(!calls.some((c) => c.includes('mutation-journal')));
  });
});

describe('slimCategory', () => {
  it('maps id/skuPrefix null', () => {
    const slim = slimCategory({
      _id: 'x',
      name: 'A',
      type: 'material',
      isActive: true,
      skuPrefix: '',
    });
    assert.deepEqual(slim, {
      id: 'x',
      name: 'A',
      type: 'material',
      isActive: true,
      skuPrefix: null,
    });
  });
});

describe('inbox audit (TZD-17)', () => {
  it('registers audit tool name; propose still listed', () => {
    assert.ok(INBOX_TOOL_NAMES.includes('kppdf_inbox_audit_file'));
    assert.ok(INBOX_TOOL_NAMES.includes('kppdf_inbox_propose_file'));
  });

  it('auditInboxRows reports errors without journal proposals', async () => {
    const report = await auditInboxRows(
      'materials.csv',
      [
        { name: 'Oak', categoryId: 'bad' },
        { foo: 'no-name' },
        { name: 'Good', unit: 'м' },
      ],
      {
        getCategory: async (id) => {
          if (id === 'bad') return null;
          return {
            id,
            name: 'Wood',
            type: 'material',
            isActive: true,
            skuPrefix: 'WD',
          };
        },
        searchMaterials: async () => [],
      },
    );
    assert.equal(report.totalRows, 3);
    assert.equal(report.mappable, 2);
    assert.equal(report.skipped, 1);
    assert.equal(report.errors, 1);
    assert.match(report.note, /0 proposals/);
    const errRow = report.rows.find((r) => r.status === 'error');
    assert.ok(errRow?.validation?.errors.some((e) => e.code === 'CATEGORY_NOT_FOUND'));
  });
});
