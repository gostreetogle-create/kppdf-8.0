#!/usr/bin/env node
/**
 * Local Mongo demo seed via running API (writes real documents — not FE hardcode).
 *
 * Usage:
 *   node scripts/seed-local-demo.mjs
 *   node scripts/seed-local-demo.mjs --base http://127.0.0.1:3000
 *
 * Reads ADMIN_PASSWORD from repo-root `.env` (fallback: backend/.env).
 * Idempotent by stable keys (sku / article / order number / name markers).
 * Safe for local/dev only — refuses NODE_ENV=production.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MARK = 'DEMO-LOCAL';
const PREFIX = 'Демо · ';

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function loadConfig() {
  return {
    ...loadEnvFile(join(ROOT, 'backend', '.env')),
    ...loadEnvFile(join(ROOT, '.env')),
  };
}

function isoDaysFromToday(offset) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

function inn10FromSeed(seed) {
  const base = String(770000000 + (seed % 100000)).padStart(9, '0').slice(0, 9);
  const coeffs = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += coeffs[i] * Number(base[i]);
  return base + String((sum % 11) % 10);
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data when NODE_ENV=production');
  }

  const args = process.argv.slice(2);
  const baseIdx = args.indexOf('--base');
  const cfg = loadConfig();
  const host =
    baseIdx >= 0 ? args[baseIdx + 1] : `http://127.0.0.1:${cfg.PORT || 3000}`;
  const api = host.replace(/\/$/, '') + '/api';
  const password = cfg.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD missing in .env');

  const loginRes = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password }),
  });
  if (!loginRes.ok) {
    throw new Error(`login ${loginRes.status}: ${await loginRes.text()}`);
  }
  const login = await loginRes.json();
  const token = login.access || login.accessToken || login.access_token || login.token;
  if (!token) throw new Error('no access token in login response');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  async function req(method, path, body) {
    const res = await fetch(`${api}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    return { ok: res.ok, status: res.status, json };
  }

  async function getList(path) {
    const r = await req('GET', path);
    if (!r.ok) return [];
    if (Array.isArray(r.json)) return r.json;
    if (Array.isArray(r.json?.items)) return r.json.items;
    if (Array.isArray(r.json?.data)) return r.json.data;
    return [];
  }

  async function ensureBy(label, listPath, createPath, match, body) {
    const list = await getList(listPath);
    const existing = list.find(match);
    if (existing) {
      console.log(`  · ${label}: exists`);
      return { created: false, doc: existing };
    }
    const r = await req('POST', createPath, body);
    if (!r.ok) {
      console.log(`  ✖ ${label}: ${r.status} ${JSON.stringify(r.json).slice(0, 220)}`);
      return { created: false, doc: null, failed: true };
    }
    console.log(`  ✔ ${label}: created`);
    return { created: true, doc: r.json };
  }

  console.log(`Seeding local demo into ${api} (marker ${MARK})…`);

  // ── Counterparties ────────────────────────────────────────────
  const cps = [];
  for (const i of [1, 2, 3]) {
    const name = `${PREFIX}Клиент ${i}`;
    const r = await ensureBy(
      `counterparty ${i}`,
      '/counterparties?limit=100',
      '/counterparties',
      (x) => x.name === name || x.shortName === `${MARK}-CP-${i}`,
      {
        name,
        shortName: `${MARK}-CP-${i}`,
        roles: ['customer'],
        inn: inn10FromSeed(200 + i),
        legalForm: 'ООО',
        legalType: 'ooo',
        isActive: true,
        type: ['customer'],
        partyTypes: ['customer'],
        paymentTermDays: 10,
        vatRate: 20,
      },
    );
    if (r.doc) cps.push(r.doc);
  }
  if (cps.length === 0) {
    const existing = await getList('/counterparties?limit=20');
    if (existing[0]) cps.push(existing[0]);
  }
  const counterpartyId = cps[0]?._id;
  if (!counterpartyId) throw new Error('No counterparty available for orders');

  // ── Materials ─────────────────────────────────────────────────
  for (const i of [1, 2, 3, 4, 5]) {
    await ensureBy(
      `material ${i}`,
      '/materials?limit=100',
      '/materials',
      (x) => x.sku === `${MARK}-MAT-${i}` || x.article === `${MARK}-MAT-${i}`,
      {
        name: `${PREFIX}Материал ${i}`,
        article: `${MARK}-MAT-${i}`,
        sku: `${MARK}-MAT-${i}`,
        unit: 'шт',
        materialKind: ['raw', 'part', 'fastener', 'purchased', 'other'][i - 1],
        pricePerUnit: 100 * i,
        description: `Локальный демо-сид ${MARK}`,
      },
    );
  }

  // ── Work types (with days for Gantt) ───────────────────────────
  const workTypeDefs = [
    { key: 'weld', name: `${PREFIX}Сварка`, days: 2 },
    { key: 'paint', name: `${PREFIX}Покраска`, days: 3 },
    { key: 'wood', name: `${PREFIX}Столярка`, days: 4 },
    { key: 'asm', name: `${PREFIX}Сборка`, days: 2 },
    { key: 'pack', name: `${PREFIX}Упаковка`, days: 1 },
  ];
  const workTypes = {};
  for (const wt of workTypeDefs) {
    const r = await ensureBy(
      `work-type ${wt.key}`,
      '/work-types?limit=100',
      '/work-types',
      (x) => x.name === wt.name,
      {
        name: wt.name,
        section: 'Производство',
        department: 'Цех',
        isActive: true,
        defaultDurationHours: wt.days * 8,
        hourlyRate: 800,
        days: wt.days,
      },
    );
    if (r.doc) workTypes[wt.key] = r.doc;
  }

  // ── Modules with workTypes ────────────────────────────────────
  const moduleDefs = [
    {
      article: `${MARK}-MOD-FRAME`,
      name: `${PREFIX}Каркас`,
      wts: ['weld', 'paint'],
    },
    {
      article: `${MARK}-MOD-PANEL`,
      name: `${PREFIX}Панель`,
      wts: ['wood', 'paint'],
    },
    {
      article: `${MARK}-MOD-FINAL`,
      name: `${PREFIX}Финиш`,
      wts: ['asm', 'pack'],
    },
  ];
  const modules = {};
  for (const [idx, mod] of moduleDefs.entries()) {
    const workTypeRows = mod.wts
      .map((k, sortOrder) => {
        const id = workTypes[k]?._id;
        return id ? { workTypeId: id, estimatedHours: 8, sortOrder } : null;
      })
      .filter(Boolean);
    const r = await ensureBy(
      `module ${mod.article}`,
      '/modules',
      '/modules',
      (x) => x.article === mod.article || x.name === mod.name,
      {
        name: mod.name,
        article: mod.article,
        dimensions: { width: 1000, height: 600, depth: 40, unit: 'мм' },
        weight: idx + 1,
        sortOrder: idx,
        workTypes: workTypeRows,
      },
    );
    if (r.doc) {
      modules[mod.article] = r.doc;
      // If module existed without workTypes, patch them in.
      if (
        (!r.doc.workTypes || r.doc.workTypes.length === 0) &&
        workTypeRows.length > 0
      ) {
        await req('PATCH', `/modules/${r.doc._id}`, {
          name: mod.name,
          article: mod.article,
          workTypes: workTypeRows,
          sortOrder: idx,
        });
        console.log(`  ~ module ${mod.article}: workTypes patched`);
      }
    }
  }

  // ── Products + composition ────────────────────────────────────
  const productDefs = [
    {
      sku: `${MARK}-PRD-GATE`,
      name: `${PREFIX}Калитка цеховая`,
      mods: [`${MARK}-MOD-FRAME`, `${MARK}-MOD-FINAL`],
      price: 45000,
    },
    {
      sku: `${MARK}-PRD-DOOR`,
      name: `${PREFIX}Дверь входная`,
      mods: [`${MARK}-MOD-FRAME`, `${MARK}-MOD-PANEL`, `${MARK}-MOD-FINAL`],
      price: 78000,
    },
    {
      sku: `${MARK}-PRD-PANEL`,
      name: `${PREFIX}Панель облицовки`,
      mods: [`${MARK}-MOD-PANEL`],
      price: 12000,
    },
  ];
  const products = {};
  for (const p of productDefs) {
    const r = await ensureBy(
      `product ${p.sku}`,
      '/products?limit=100',
      '/products',
      (x) => x.sku === p.sku || x.name === p.name,
      {
        name: p.name,
        sku: p.sku,
        kind: 'good',
        unit: 'шт',
        status: 'active',
        listPrice: p.price,
        basePrice: Math.round(p.price * 0.8),
        isActive: true,
      },
    );
    if (!r.doc) continue;
    products[p.sku] = r.doc;
    const composition = await getList(`/products/${r.doc._id}/composition`).catch(() => []);
    // composition endpoint returns array directly
    const compRes = await req('GET', `/products/${r.doc._id}/composition`);
    const lines = Array.isArray(compRes.json)
      ? compRes.json
      : Array.isArray(compRes.json?.items)
        ? compRes.json.items
        : [];
    for (const [sortOrder, article] of p.mods.entries()) {
      const mod = modules[article];
      if (!mod) continue;
      const already = lines.some(
        (l) => l.lineType === 'module' && String(l.refId) === String(mod._id),
      );
      if (already) continue;
      const add = await req('POST', `/products/${r.doc._id}/composition`, {
        lineType: 'module',
        refId: mod._id,
        quantity: 1,
        sortOrder,
        unit: 'шт',
      });
      if (add.ok) console.log(`  ✔ composition ${p.sku} ← ${article}`);
      else
        console.log(
          `  ✖ composition ${p.sku}: ${add.status} ${JSON.stringify(add.json).slice(0, 180)}`,
        );
    }
  }

  // ── Workers ───────────────────────────────────────────────────
  const people = [
    ['Иванов', 'Иван'],
    ['Петров', 'Пётр'],
    ['Сидоров', 'Сидор'],
    ['Козлова', 'Анна'],
    ['Орлов', 'Олег'],
  ];
  for (const [idx, [lastName, firstName]] of people.entries()) {
    await ensureBy(
      `worker ${lastName}`,
      '/workers?limit=100',
      '/workers',
      (x) =>
        x.lastName === lastName &&
        x.firstName === firstName &&
        x.department === `${PREFIX}Цех`,
      {
        lastName,
        firstName,
        patronymic: 'Демович',
        department: `${PREFIX}Цех`,
        grade: `${(idx % 3) + 3}-й разряд`,
        phone: `+7 (900) 100-20-0${idx + 1}`,
        isActive: true,
      },
    );
  }

  // ── Warehouses ────────────────────────────────────────────────
  for (const i of [1, 2, 3]) {
    await ensureBy(
      `warehouse ${i}`,
      '/warehouses?limit=100',
      '/warehouses',
      (x) => x.name === `${PREFIX}Склад ${i}`,
      {
        name: `${PREFIX}Склад ${i}`,
        type: ['main', 'production', 'branch'][i - 1],
        address: `Локальный адрес ${i}`,
        description: `Демо ${MARK}`,
        isActive: true,
        zoneNames: [`Зона A${i}`, `Зона B${i}`],
      },
    );
  }

  // ── Orders for Gantt ──────────────────────────────────────────
  const orderDefs = [
    {
      number: `${MARK}-ORD-001`,
      status: 'in_production',
      plannedOffset: 0,
      sku: `${MARK}-PRD-GATE`,
      qty: 1,
    },
    {
      number: `${MARK}-ORD-002`,
      status: 'confirmed',
      plannedOffset: 3,
      sku: `${MARK}-PRD-DOOR`,
      qty: 2,
    },
    {
      number: `${MARK}-ORD-003`,
      status: 'draft',
      plannedOffset: -1,
      sku: `${MARK}-PRD-PANEL`,
      qty: 4,
    },
    {
      number: `${MARK}-ORD-004`,
      status: 'ready',
      plannedOffset: -5,
      sku: `${MARK}-PRD-GATE`,
      qty: 1,
    },
    {
      number: `${MARK}-ORD-005`,
      status: 'in_production',
      plannedOffset: 7,
      sku: `${MARK}-PRD-DOOR`,
      qty: 1,
    },
  ];

  for (const o of orderDefs) {
    const product = products[o.sku];
    if (!product) {
      console.log(`  ✖ order ${o.number}: product ${o.sku} missing`);
      continue;
    }
    await ensureBy(
      `order ${o.number}`,
      '/orders?limit=100',
      '/orders',
      (x) => x.number === o.number,
      {
        number: o.number,
        counterpartyId,
        date: isoDaysFromToday(o.plannedOffset - 2),
        plannedDate: isoDaysFromToday(o.plannedOffset),
        status: o.status,
        priority: 'normal',
        notes: `Локальный демо-заказ ${MARK} для проверки Ганта`,
        items: [
          {
            productId: product._id,
            productName: product.name,
            productSku: product.sku,
            quantity: o.qty,
            unit: 'шт',
            unitPrice: product.listPrice ?? 0,
          },
        ],
      },
    );
  }

  console.log('\nDone. Open /production — calendar should fill from DEMO-LOCAL orders.');
  console.log('Re-run is safe (skip-if-exists).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
