import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const products = JSON.parse(fs.readFileSync(path.join(dir, 'products.normalized.json'), 'utf8'));
const raw = JSON.parse(fs.readFileSync(path.join(dir, 'tasks.raw.json'), 'utf8'));

// Known local demo set (mongosh confirmed 2026-08-06)
const mongo = [
  { sku: 'DEMO-LOCAL-PRD-GATE', name: 'Демо · Калитка цеховая', photoIds: [] },
  { sku: 'DEMO-LOCAL-PRD-DOOR', name: 'Демо · Дверь входная', photoIds: [] },
  { sku: 'DEMO-LOCAL-PRD-PANEL', name: 'Демо · Панель облицовки', photoIds: [] },
];

const bySku = new Map(mongo.map((p) => [String(p.sku || ''), p]));
const rows = products.map((p) => {
  const m = bySku.get(p.sku);
  let status = 'missing_product';
  if (m) {
    const photos = (m.photoIds || []).length;
    if (!photos) status = 'product_no_photo';
    else status = 'ok';
  }
  return {
    sku: p.sku,
    name: p.name,
    status,
    hasLocalPhoto: Boolean(p.source?.photoFile),
    mongoName: m?.name || null,
  };
});

const weak = raw
  .filter((t) => t.passport?.parseWeak)
  .map((t) => ({ taskCode: t.taskCode, title: t.titleRaw, column: t.columnName }));

const report = {
  generatedAt: new Date().toISOString(),
  mongoProductCount: mongo.length,
  yougileUniqueSkus: products.length,
  summary: {
    missing_product: rows.filter((r) => r.status === 'missing_product').length,
    product_no_photo: rows.filter((r) => r.status === 'product_no_photo').length,
    ok: rows.filter((r) => r.status === 'ok').length,
    parse_weak_tasks: weak.length,
  },
  rows: rows.sort((a, b) => a.sku.localeCompare(b.sku)),
  parseWeakTasks: weak,
  note: 'Local Mongo only has 3 DEMO SKUs without photos — all YouGile articles are missing_product until seed.',
};

fs.writeFileSync(path.join(dir, 'gap-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
