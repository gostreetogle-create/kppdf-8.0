#!/usr/bin/env node
/**
 * One-shot: seed ~5 demo rows per main catalog/list entity on a running API.
 * Usage:
 *   node scripts/seed-demo-five.mjs
 *   node scripts/seed-demo-five.mjs --base http://192.168.1.103:3000
 *
 * Reads ADMIN_PASSWORD from deploy/synology/config.env (gitignored).
 * Idempotent-ish: duplicate unique sku/article may 409 (counted as skip/fail).
 * Listed in docs/FEATURE-INTEGRATION-CHECKLIST.md as optional ops helper (not a product feature).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PREFIX = 'Тест ·';
const TAG = 'DEMO5';

function loadConfig() {
  const path = join(ROOT, 'deploy/synology/config.env');
  const text = readFileSync(path, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function inn10FromSeed(seed) {
  // Build 9 digits from seed, append checksum (RF INN-10).
  const base = String(770000000 + (seed % 100000)).padStart(9, '0').slice(0, 9);
  const coeffs = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += coeffs[i] * Number(base[i]);
  const check = String((sum % 11) % 10);
  return base + check;
}

async function main() {
  const args = process.argv.slice(2);
  const baseIdx = args.indexOf('--base');
  const cfg = loadConfig();
  const host = baseIdx >= 0 ? args[baseIdx + 1] : `http://${cfg.DEPLOY_HOST || '192.168.1.103'}:3000`;
  const api = host.replace(/\/$/, '') + '/api';
  const password = cfg.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD missing in deploy/synology/config.env');

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
  if (!token) throw new Error(`no access token in login body keys=${Object.keys(login)}`);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  async function post(path, body) {
    const res = await fetch(`${api}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, json };
    }
    return { ok: true, status: res.status, json };
  }

  async function ensureFive(label, path, items) {
    let created = 0;
    let skipped = 0;
    let failed = 0;
    for (const item of items) {
      const r = await post(path, item);
      if (r.ok) {
        created++;
        console.log(`  ✔ ${label}: ${item.name || item.lastName || item.article || '?'}`);
      } else if (r.status === 409) {
        skipped++;
        console.log(`  · ${label}: skip conflict`);
      } else {
        failed++;
        console.log(`  ✖ ${label}: ${r.status} ${JSON.stringify(r.json).slice(0, 180)}`);
      }
    }
    return { label, created, skipped, failed };
  }

  const materials = [1, 2, 3, 4, 5].map((i) => ({
    name: `${PREFIX}Материал ${i}`,
    article: `${TAG}-MAT-${i}`,
    sku: `${TAG}-MAT-${i}`,
    unit: 'шт',
    materialKind: ['raw', 'part', 'fastener', 'purchased', 'other'][i - 1],
    pricePerUnit: 100 * i,
    description: `Демо для смоука ${TAG}`,
  }));

  const modules = [1, 2, 3, 4, 5].map((i) => ({
    name: `${PREFIX}Модуль ${i}`,
    article: `${TAG}-MOD-${i}`,
    dimensions: { width: 100 * i, height: 50 * i, depth: 20 * i, unit: 'мм' },
    weight: i,
    sortOrder: i,
  }));

  const products = [1, 2, 3, 4, 5].map((i) => ({
    name: `${PREFIX}Изделие ${i}`,
    sku: `${TAG}-PRD-${i}`,
    kind: 'good',
    unit: 'шт',
    status: 'active',
    listPrice: 1000 * i,
    basePrice: 800 * i,
  }));

  const workTypes = [1, 2, 3, 4, 5].map((i) => ({
    name: `${PREFIX}Вид работ ${i}`,
    section: 'Производство',
    department: 'Цех',
    isActive: true,
    defaultDurationHours: i,
    hourlyRate: 500 + i * 50,
    days: i,
  }));

  const counterparties = [1, 2, 3, 4, 5].map((i) => ({
    name: `${PREFIX}Контрагент ${i}`,
    shortName: `${TAG}-CP-${i}`,
    roles: ['customer'],
    inn: inn10FromSeed(100 + i),
    legalForm: 'ООО',
    legalType: 'ooo',
    isActive: true,
    type: ['customer'],
    partyTypes: ['customer'],
    paymentTermDays: 10,
    vatRate: 20,
  }));

  const workers = [
    ['Иванов', 'Иван'],
    ['Петров', 'Пётр'],
    ['Сидоров', 'Сидор'],
    ['Козлов', 'Кирилл'],
    ['Орлов', 'Олег'],
  ].map(([lastName, firstName], idx) => ({
    lastName,
    firstName,
    patronymic: 'Тестович',
    department: `${PREFIX}Цех ${(idx % 2) + 1}`,
    grade: `${idx + 3}-й разряд`,
    phone: `+7 (900) 000-00-0${idx + 1}`,
    isActive: true,
  }));

  const warehouses = [1, 2, 3, 4, 5].map((i) => ({
    name: `${PREFIX}Склад ${i}`,
    type: ['main', 'branch', 'transit', 'production', 'other'][i - 1],
    address: `Демо-адрес ${i}`,
    description: `Демо ${TAG}`,
    isActive: true,
    zoneNames: [`Зона A${i}`, `Зона B${i}`],
  }));

  console.log(`Seeding demo×5 via ${api} (prefix «${PREFIX}»)…`);
  const summary = [];
  summary.push(await ensureFive('materials', '/materials', materials));
  summary.push(await ensureFive('modules', '/modules', modules));
  summary.push(await ensureFive('products', '/products', products));
  summary.push(await ensureFive('work-types', '/work-types', workTypes));
  summary.push(await ensureFive('counterparties', '/counterparties', counterparties));
  summary.push(await ensureFive('workers', '/workers', workers));
  summary.push(await ensureFive('warehouses', '/warehouses', warehouses));

  console.log('\n=== Summary ===');
  for (const s of summary) {
    console.log(`${s.label}: created=${s.created} skipped=${s.skipped} failed=${s.failed}`);
  }
  const fails = summary.reduce((a, s) => a + s.failed, 0);
  if (fails) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
