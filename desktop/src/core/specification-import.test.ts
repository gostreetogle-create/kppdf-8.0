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

test('CAD/PDM headers: позиция → level, обозначение → article, к-во → qty, вид изделия → kind', () => {
  const headers = ['Позиция', 'Обозначение', 'Длина', 'Ширина', 'Толщина', 'Масса', 'Сортамент, ГОСТ', 'Материал', 'Вид изделия', 'К-во'];
  assert.equal(hasSpecificationHierarchy(headers), true);
  const rows = [
    {
      'Позиция': '1',
      'Обозначение': '0000.0001.0000',
      'Длина': 627,
      'Ширина': 109,
      'Толщина': 80,
      'Масса': 3.13,
      'Сортамент, ГОСТ': '',
      'Материал': '',
      'Вид изделия': 'Модуль',
      'К-во': 20,
    },
    {
      'Позиция': '1.1',
      'Обозначение': '0000.0001.0001',
      'Длина': 550,
      'Ширина': 57,
      'Толщина': 57,
      'Масса': 2.524,
      'Сортамент, ГОСТ': 'Труба, 57х3,5 мм, ГОСТ 10704-91',
      'Материал': 'Ст 3 ГОСТ 380-2005',
      'Вид изделия': 'Деталь',
      'К-во': 1,
    },
    {
      'Позиция': '1.2',
      'Обозначение': '0000.0000.0019',
      'Длина': 109,
      'Ширина': 80,
      'Толщина': 79,
      'Масса': 0.532,
      'Сортамент, ГОСТ': 'Лист, 4 мм, ГОСТ 19903-2015',
      'Материал': 'Ст 3 ГОСТ 380-2005',
      'Вид изделия': 'Деталь',
      'К-во': 1,
    },
  ];
  const preview = buildSpecificationPreview(rows);
  assert.equal(preview.hierarchical, true);
  assert.deepEqual(preview.lines.map((line) => line.level), [0, 1, 1]);
  assert.equal(preview.lines[0].article, '0000.0001.0000');
  assert.equal(preview.lines[0].kind, 'module');
  assert.equal(preview.lines[0].quantity, 20);
  assert.equal(preview.lines[1].article, '0000.0001.0001');
  // «Деталь» трактуется как материал; наименование — из колонки «Сортамент, ГОСТ».
  assert.equal(preview.lines[1].kind, 'material');
  assert.equal(preview.lines[1].name, 'Труба, 57х3,5 мм, ГОСТ 10704-91');
  assert.equal(preview.lines[1].parentArticle, '0000.0001.0000');
  assert.equal(preview.roots[0]?.children.length, 2);
});

test('module roots are allowed for CAD exports where the product is not listed', () => {
  const preview = buildSpecificationPreview([
    { 'Позиция': '1', 'Обозначение': '0000.0001.0000', 'Вид изделия': 'Модуль', 'К-во': 20 },
    { 'Позиция': '1.1', 'Обозначение': '0000.0001.0001', 'Вид изделия': 'Деталь', 'К-во': 1 },
  ]);
  assert.equal(preview.hierarchical, true);
  assert.equal(preview.issues.some((issue) => issue.code === 'invalid_root'), false);
  assert.equal(preview.roots[0]?.kind, 'module');
});

test('plain integer levels keep 0-based semantics (non-positional files)', () => {
  const preview = buildSpecificationPreview([
    { level: 0, article: 'P-1', name: 'Изделие', qty: 1, kind: 'product' },
    { level: 1, article: 'M-1', name: 'Модуль', qty: 1, kind: 'module' },
  ]);
  assert.equal(preview.lines[0].level, 0);
  assert.equal(preview.lines[1].level, 1);
});
