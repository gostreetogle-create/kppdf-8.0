import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSpecificationPreview, hasSpecificationHierarchy } from './specification-import';

test('detects hierarchy columns and builds product → module → materials tree', () => {
  const rows = [
    { level: 0, article: 'P-1', name: 'Изделие', qty: 1, unit: 'шт', kind: 'product' },
    { level: 1, article: 'M-1', name: 'Модуль', qty: 2, unit: 'шт', kind: 'module' },
    { level: 2, article: 'MAT-1', name: 'Материал 1', qty: 3, unit: 'м', kind: 'material' },
    { level: 2, article: 'MAT-2', name: 'Материал 2', qty: 4, unit: 'шт', kind: 'material' },
  ];
  const preview = buildSpecificationPreview(rows);
  assert.equal(preview.hierarchical, true);
  assert.deepEqual(preview.issues, []);
  assert.equal(preview.roots[0]?.article, 'P-1');
  assert.equal(preview.roots[0]?.children[0]?.article, 'M-1');
  assert.deepEqual(preview.roots[0]?.children[0]?.children.map((node) => node.article), ['MAT-1', 'MAT-2']);
  assert.equal(preview.roots[0]?.children[0]?.children[1]?.quantity, 4);
});

test('uses explicit parentArticle when the file order is not enough', () => {
  const preview = buildSpecificationPreview([
    { level: 0, article: 'P-1', name: 'Изделие', qty: 1, kind: 'product' },
    { level: 1, parentArticle: 'P-1', article: 'M-1', name: 'Модуль', qty: 1, kind: 'module' },
    { level: 1, parentArticle: 'M-1', article: 'MAT-1', name: 'Материал', qty: 2, kind: 'material' },
  ]);
  assert.equal(preview.issues.length, 0);
  assert.equal(preview.roots[0]?.children[0]?.children[0]?.parentArticle, 'M-1');
});

test('flat rows stay non-hierarchical and do not acquire graph errors', () => {
  assert.equal(hasSpecificationHierarchy(['article', 'name', 'qty']), false);
  const preview = buildSpecificationPreview([
    { article: 'MAT-1', name: 'Материал', qty: 2, kind: 'material' },
  ]);
  assert.equal(preview.hierarchical, false);
  assert.deepEqual(preview.issues, []);
  assert.deepEqual(preview.roots, []);
});

test('reports invalid quantity, missing parent, and duplicate composition line', () => {
  const preview = buildSpecificationPreview([
    { level: 0, article: 'P-1', name: 'Изделие', qty: 1, kind: 'product' },
    { level: 1, parentArticle: 'P-1', article: 'M-1', name: 'Модуль', qty: 1, kind: 'module' },
    { level: 2, parentArticle: 'MISSING', article: 'MAT-1', name: 'Материал', qty: 0, kind: 'material' },
    { level: 2, parentArticle: 'M-1', article: 'MAT-1', name: 'Материал', qty: 1, kind: 'material' },
    { level: 2, parentArticle: 'M-1', article: 'MAT-2', name: 'Материал', qty: 1, kind: 'material' },
    { level: 2, parentArticle: 'M-1', article: 'MAT-2', name: 'Материал', qty: 1, kind: 'material' },
  ]);
  assert.ok(preview.issues.some((issue) => issue.code === 'invalid_quantity'));
  assert.ok(preview.issues.some((issue) => issue.code === 'missing_parent'));
  assert.ok(preview.issues.some((issue) => issue.code === 'duplicate_article'));
  assert.ok(preview.issues.some((issue) => issue.code === 'duplicate_composition_line'));
});
