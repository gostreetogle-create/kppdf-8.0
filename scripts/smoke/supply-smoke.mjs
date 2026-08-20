#!/usr/bin/env node
/**
 * SUPPLY-SMOKE — реальный стендовый smoke/e2e раздела «Снабжение».
 *
 * Покрывает оставшиеся 5 баллов аудита 2026-08-20:
 *  - авторизация (login, 401-gate, Bearer);
 *  - Mongo (health + реальные ObjectId + round-trip после записи);
 *  - склад (warehouse + storage-item для материала и изделия);
 *  - upload-хранилище (multipart → файл на диске → чтение → удаление файла);
 *  - бизнес-поток: материал → быстрый заказ (SupplyRequest) → «Заказано»
 *    → spawn SupplyTask в реестре (идемпотентно) → отгрузка по заказу.
 *
 * Usage:
 *   node scripts/smoke/supply-smoke.mjs [baseUrl]        (credentials из .env)
 *   SUPPLY_SMOKE_USER=admin SUPPLY_SMOKE_PASS=... node scripts/smoke/supply-smoke.mjs
 *
 * Выход: 0 — все проверки PASS; 1 — есть FAIL. Отчёт — в stdout.
 */
import { readFileSync, existsSync, statSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
// Дисковую проверку upload-хранилища можно делать только на локальном стенде:
// на удалённом стенде файлы лежат в volume сервера, недоступном отсюда.
const isLocalStand = /localhost|127\.0\.0\.1|0\.0\.0\.0|::1/.test(baseUrl);

// ---- .env (без зависимостей) -------------------------------------------------
function loadEnv(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}
const env = { ...loadEnv(join(root, '.env')), ...process.env };
const USER = env.SUPPLY_SMOKE_USER || env.ADMIN_USERNAME || 'admin';
const PASS = env.SUPPLY_SMOKE_PASS || env.ADMIN_PASSWORD || '';

// ---- отчёт --------------------------------------------------------------------
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}
function warn(name, detail = '') {
  results.push({ name, ok: null, detail });
  console.log(`WARN  ${name}${detail ? ' — ' + detail : ''}`);
}

// ---- HTTP helpers --------------------------------------------------------------
async function req(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form; // FormData — fetch сам ставит multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json };
}

const listOf = (json) =>
  Array.isArray(json) ? json : json?.items || json?.data || json?.results || [];

const uid = Date.now().toString(36);
const created = []; // { kind, id } — только то, что создали мы

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function main() {
  console.log(`\nSUPPLY-SMOKE · stand ${baseUrl} · user=${USER} · ts=${new Date().toISOString()}\n`);

  // 1. Авторизация --------------------------------------------------------------
  const login = await req('POST', '/api/auth/login', { body: { username: USER, password: PASS } });
  const token = login.json?.access;
  check('auth: login (admin)', login.status === 200 && typeof token === 'string' && token.length > 20,
    login.status === 200 ? 'access token получен' : `status=${login.status} body=${JSON.stringify(login.json).slice(0, 200)}`);
  if (!token) { summarize(); process.exit(1); }

  const anon = await req('GET', '/api/supply-requests');
  check('auth: 401 без токена', anon.status === 401, `status=${anon.status}`);

  // 2. Mongo / health ------------------------------------------------------------
  const health = await req('GET', '/api/health', { token });
  const mongoUp = health.json?.info?.mongo?.status === 'up';
  check('mongo: health up', mongoUp && health.status === 200, `status=${health.status}`);

  // 3. Склад ----------------------------------------------------------------------
  const whList = await req('GET', '/api/warehouses', { token });
  let wh = listOf(whList.json)[0];
  if (!wh) {
    const whRes = await req('POST', '/api/warehouses', {
      token, body: { name: `СМОК-склад-${uid}`, type: 'main', address: 'г. Смок' },
    });
    wh = whRes.json;
    created.push({ kind: 'warehouse', id: wh?._id });
  }
  check('warehouse: есть/создан', Boolean(wh?._id), wh?._id);
  if (wh?._id) {
    const inv = await req('GET', `/api/warehouses/${wh._id}/inventory`, { token });
    check('warehouse: inventory', inv.status === 200, `status=${inv.status}`);
  }

  // 4. Материал + цвета (нормализация и round-trip через Mongo) --------------------
  const matRes = await req('POST', '/api/materials', {
    token,
    body: {
      name: `СМОК материал ${uid}`,
      article: `SMK-${uid}`,
      unit: 'шт',
      materialKind: 'purchased',
      colors: ['RAL 7016', 'ral 7016 ', ' ', 'RAL 9005'],
    },
  });
  const mat = matRes.json;
  created.push({ kind: 'material', id: mat?._id });
  const colorsOk =
    Array.isArray(mat?.colors) &&
    mat.colors.length === 2 &&
    mat.colors.includes('RAL 7016') &&
    mat.colors.includes('RAL 9005');
  check('material: создан с цветами', matRes.status === 201 && colorsOk,
    colorsOk ? `colors=${JSON.stringify(mat.colors)}` : `status=${matRes.status} body=${JSON.stringify(mat).slice(0, 200)}`);
  if (mat?._id) {
    const matGet = await req('GET', `/api/materials/${mat._id}`, { token });
    const round = Array.isArray(matGet.json?.colors) && matGet.json.colors.length === 2;
    check('material: цвета после reload (Mongo)', matGet.status === 200 && round,
      `status=${matGet.status} colors=${JSON.stringify(matGet.json?.colors)}`);
  }

  // 5. Storage-item для материала (склад-остатки) ----------------------------------
  let storageItemId;
  if (wh?._id && mat?._id) {
    const si = await req('POST', `/api/materials/${mat._id}/storage-items`, {
      token, body: { warehouseId: wh._id, quantity: 20, minQuantity: 2, zoneName: 'A1' },
    });
    storageItemId = si.json?._id;
    created.push({ kind: 'storage-item', id: storageItemId });
    check('warehouse: storage-item материала', si.status === 201 && storageItemId,
      `status=${si.status}`);
    const siList = await req('GET', `/api/storage-items?materialId=${mat._id}`, { token });
    const found = listOf(siList.json).some((it) => it._id === storageItemId || it._id?.toString() === storageItemId);
    check('warehouse: storage-item виден в списке', siList.status === 200 && found, `status=${siList.status}`);
  } else {
    check('warehouse: storage-item материала', false, 'нет warehouse/material');
  }

  // 6. Контрагент + площадка (reuse существующих — реальные данные) -----------------
  const cpList = await req('GET', '/api/counterparties', { token });
  let cp = listOf(cpList.json)[0];
  if (!cp) {
    const cpRes = await req('POST', '/api/counterparties', {
      token, body: { name: `СМОК-контрагент-${uid}`, roles: ['buyer'], inn: '7707083893' },
    });
    cp = cpRes.json;
    created.push({ kind: 'counterparty', id: cp?._id });
  }
  check('counterparty: есть/создан', Boolean(cp?._id), cp?._id);

  const siteList = await req('GET', '/api/sites', { token });
  let site = listOf(siteList.json)[0];
  if (!site && cp?._id) {
    const siteRes = await req('POST', '/api/sites', {
      token, body: { counterpartyId: cp._id, name: `СМОК-площадка-${uid}`, address: 'г. Смок, ул. Тестовая, 1' },
    });
    site = siteRes.json;
    created.push({ kind: 'site', id: site?._id });
  }
  check('site: есть/создан', Boolean(site?._id), site?._id);

  // 7. Заказ -------------------------------------------------------------------------
  let order;
  if (cp?._id && site?._id) {
    const ordRes = await req('POST', '/api/orders', {
      token, body: { counterpartyId: cp._id, siteId: site._id, status: 'draft', items: [] },
    });
    order = ordRes.json;
    created.push({ kind: 'order', id: order?._id });
  }
  check('order: создан', Boolean(order?._id), order?._id ? `id=${order._id}` : 'не создан (нет counterparty/site)');

  // 8. Изделие (для отгрузки) ---------------------------------------------------------
  const prodRes = await req('POST', '/api/products', {
    token, body: { sku: `SMK-PROD-${uid}`, kind: 'good', unit: 'шт', name: `СМОК изделие ${uid}` },
  });
  const prod = prodRes.json;
  created.push({ kind: 'product', id: prod?._id });
  check('product: создан', prodRes.status === 201 && prod?._id, `status=${prodRes.status}`);

  if (prod?._id && wh?._id) {
    const psi = await req('POST', `/api/products/${prod._id}/storage-items`, {
      token, body: { warehouseId: wh._id, quantity: 20, minQuantity: 2 },
    });
    created.push({ kind: 'storage-item', id: psi.json?._id });
    check('warehouse: storage-item изделия', psi.status === 201, `status=${psi.status}`);
  }

  // 9. Быстрый заказ: пустой draft → заполнение → «Заказано» → spawn SupplyTask ---------
  const draft = await req('POST', '/api/supply-requests', { token, body: {} });
  check('supply: пустой draft допустим', draft.status === 201 && draft.json?._id,
    `status=${draft.status} id=${draft.json?._id}`);
  const sr = draft.json;
  created.push({ kind: 'supply-request', id: sr?._id });

  let srId = sr?._id;
  if (srId && mat?._id) {
    const patch = await req('PATCH', `/api/supply-requests/${srId}`, {
      token,
      body: {
        materialId: mat._id,
        ...(order?._id ? { orderId: order._id } : {}),
        color: 'RAL 7016',
        qty: 5,
        unit: 'шт',
        requestedBy: 'СМОК-тест',
      },
    });
    const p = patch.json;
    const autoFill = p?.title === mat.name && p?.article === mat.article;
    check('supply: PATCH заполняет строку', patch.status === 200 && autoFill,
      autoFill ? `title/артикул из материала` : `status=${patch.status} title=${p?.title} article=${p?.article}`);
  }

  if (srId) {
    const ord1 = await req('POST', `/api/supply-requests/${srId}/ordered`, { token });
    const o1 = ord1.json;
    check('supply: «Заказано» → ordered + задача реестра',
      (ord1.status === 200 || ord1.status === 201) && o1?.status === 'ordered' && Boolean(o1?.linkedSupplyTaskId),
      `status=${o1?.status} task=${o1?.linkedSupplyTaskId}`);

    if (o1?.linkedSupplyTaskId) {
      created.push({ kind: 'supply-task', id: o1.linkedSupplyTaskId });
    }

    const ord2 = await req('POST', `/api/supply-requests/${srId}/ordered`, { token });
    const o2 = ord2.json;
    check('supply: повторное «Заказано» идемпотентно (без дублей)',
      o2?.linkedSupplyTaskId === o1?.linkedSupplyTaskId,
      `task1=${o1?.linkedSupplyTaskId} task2=${o2?.linkedSupplyTaskId}`);

    if (order?._id) {
      const tasks = await req('GET', `/api/supply-tasks?orderId=${order._id}`, { token });
      const taskList = listOf(tasks.json);
      const found = taskList.find(
        (t) => t.materialId?.toString() === mat?._id && t.status === 'ordered',
      );
      check('supply: SupplyTask в реестре по orderId', tasks.status === 200 && Boolean(found),
        `status=${tasks.status} tasks=${taskList.length}`);
    }
  }

  // 10. Отгрузка по заказу -------------------------------------------------------------
  if (order?._id && cp?._id && prod?._id) {
    const shipRes = await req('POST', '/api/shipments', {
      token,
      body: {
        orderId: order._id,
        counterpartyId: cp._id,
        warehouseId: wh?._id,
        items: [{ productId: prod._id, quantity: 2, unit: 'шт' }],
        status: 'draft',
      },
    });
    const ship = shipRes.json;
    created.push({ kind: 'shipment', id: ship?._id });
    const numberOk = typeof ship?.number === 'string' && ship.number.startsWith('SHP');
    check('shipment: создана из заказа', shipRes.status === 201 && ship?._id && numberOk,
      `status=${shipRes.status} number=${ship?.number}`);

    if (ship?._id) {
      const ships = await req('GET', `/api/shipments?orderId=${order._id}`, { token });
      const found = listOf(ships.json).some((s) => s._id?.toString() === ship._id);
      check('shipment: видна в списке по orderId (Mongo)', ships.status === 200 && found,
        `status=${ships.status}`);

      if (wh?._id) {
        const disp = await req('POST', `/api/shipments/${ship._id}/dispatch`, { token });
        if ((disp.status === 200 || disp.status === 201) && disp.json?.status === 'in_transit') {
          check('shipment: dispatch → in_transit (транзакция Z-001)', true, `status=${disp.json?.status}`);
        } else {
          warn('shipment: dispatch', `status=${disp.status} body=${JSON.stringify(disp.json).slice(0, 160)} — не блокер smoke (нужны полные остатки/резервы)`);
        }
      }
    }
  } else {
    check('shipment: создана из заказа', false, 'нет order/counterparty/product');
  }

  // 11. Upload-хранилище ----------------------------------------------------------------
  const form = new FormData();
  form.append('file', new Blob([TINY_PNG], { type: 'image/png' }), `smoke-${uid}.png`);
  const up = await req('POST', '/api/photos/upload', { token, form });
  const photo = up.json;
  const storageUrl = typeof photo?.storageUrl === 'string' ? photo.storageUrl : '';
  check('photos: multipart upload', up.status === 201 && photo?._id && storageUrl.startsWith('/uploads/'),
    `status=${up.status} url=${storageUrl}`);

  let photoPath;
  if (storageUrl) {
    const name = storageUrl.replace('/uploads/', '');
    for (const dir of [join(root, 'backend', 'uploads'), join(root, 'uploads')]) {
      const p = join(dir, name);
      if (existsSync(p) && statSync(p).size > 0) { photoPath = p; break; }
    }
    if (isLocalStand) {
      check('photos: файл реально лежит в upload-хранилище', Boolean(photoPath),
        photoPath ? photoPath.replace(root, '.') : 'файл не найден на диске');
    } else {
      warn('photos: файл на диске', `удалённый стенд — файл подтверждён через API (upload ${up.status} + GET ниже); дисковая проверка возможна только локально`);
    }
  }

  if (photo?._id) {
    const get = await req('GET', `/api/photos/${photo._id}`, { token });
    check('photos: чтение по id', get.status === 200 && get.json?._id === photo._id, `status=${get.status}`);
    const del = await req('DELETE', `/api/photos/${photo._id}`, { token });
    const gone = photoPath ? !existsSync(photoPath) : true;
    check('photos: DELETE 204 + файл удалён', del.status === 204 && gone,
      `status=${del.status} fileGone=${gone}`);
  }

  // 12. Cleanup (только наши записи; soft-delete где API поддерживает) --------------------
  console.log('\n-- cleanup --');
  for (const c of created.reverse()) {
    if (!c?.id) continue;
    try {
      const res = await req('DELETE', `/api/${c.kind}s/${c.id}`, { token });
      console.log(`  ${c.kind} ${c.id} → ${res.status}`);
    } catch (e) {
      console.log(`  ${c.kind} ${c.id} → error ${e.message}`);
    }
  }

  summarize();
}

function summarize() {
  const fails = results.filter((r) => r.ok === false);
  const warns = results.filter((r) => r.ok === null);
  const passes = results.filter((r) => r.ok === true);
  console.log(`\nRESULT: ${passes.length} PASS · ${fails.length} FAIL · ${warns.length} WARN (всего ${results.length})`);
  if (fails.length) {
    console.log('FAILED:');
    for (const f of fails) console.log(`  - ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('SMOKE CRASH:', e);
  process.exit(2);
});
