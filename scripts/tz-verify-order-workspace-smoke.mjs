#!/usr/bin/env node
/**
 * TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE — стендовый API-smoke для контура
 * Order Workspace (`/orders/:id`).
 *
 * Нет headless-браузера в этом окружении (Playwright не установлен в репо),
 * поэтому этот smoke бьёт напрямую в REST API теми же вызовами, что делает
 * `OrderWorkspaceFacade` — покрывает данные, не пиксели. Визуальную часть
 * (chips видны, kit-reserve dialog открывается, ready-чекбокс кликается)
 * подтверждает PO глазами после этого прогона (см. TZ п.4).
 *
 * Покрывает весь новый write-path волны Order Workspace:
 *  - PATCH items (add line + qty change) с сохранением полей необновляемых строк
 *    (backend mapItems маппит по индексу без fallback на productName/unit/etc);
 *  - PATCH items/:lineIndex/ready (новый PiOrdersService.setLineReady());
 *  - PATCH status: confirmed (draft→confirmed graph);
 *  - GET supply-requests?orderId=, GET reservations?orderId=<number>,
 *    GET shipments?orderId=<_id> — все три источника секции Исполнение/Логистика;
 *  - POST ship (whole-order) → shipped;
 *  - POST /orders/:id/cancel (новый PiOrdersService.cancel()) на отдельном заказе.
 *
 * Usage:
 *   node scripts/tz-verify-order-workspace-smoke.mjs [baseUrl]
 *   ORDER_WS_SMOKE_USER=admin ORDER_WS_SMOKE_PASS=... node scripts/tz-verify-order-workspace-smoke.mjs
 *
 * Выход: 0 — все проверки PASS; 1 — есть FAIL.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

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
const USER = env.ORDER_WS_SMOKE_USER || env.ADMIN_USERNAME || 'admin';
const PASS = env.ORDER_WS_SMOKE_PASS || env.ADMIN_PASSWORD || '';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}
function warn(name, detail = '') {
  results.push({ name, ok: null, detail });
  console.log(`WARN  ${name}${detail ? ' — ' + detail : ''}`);
}

async function req(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json };
}

const listOf = (json) => (Array.isArray(json) ? json : json?.items || json?.data || json?.results || []);
const uid = Date.now().toString(36);
const created = [];

async function main() {
  console.log(`\nORDER-WORKSPACE-SMOKE · stand ${baseUrl} · user=${USER} · ts=${new Date().toISOString()}\n`);

  // 1. Auth ------------------------------------------------------------------
  const login = await req('POST', '/api/auth/login', { body: { username: USER, password: PASS } });
  const token = login.json?.access;
  check('auth: login', login.status === 200 && typeof token === 'string' && token.length > 20,
    login.status === 200 ? 'access token получен' : `status=${login.status}`);
  if (!token) { summarize(); return; }

  // 2. Fixtures: reuse an existing counterparty+site (same pattern as
  // scripts/smoke/supply-smoke.mjs) — creating a disposable one with a fixed
  // test INN and soft-deleting it in cleanup collides on Mongo's `inn`
  // unique index (soft-delete sets `deletedAt`, doesn't drop the index
  // entry), so a second run 500s on E11000. Found live during this pass.
  const cpList = await req('GET', '/api/counterparties', { token });
  let cp = listOf(cpList.json)[0];
  if (!cp) {
    const cpRes = await req('POST', '/api/counterparties', {
      token, body: { name: `WS-СМОК-контрагент-${uid}`, roles: ['buyer'], inn: `77070${uid.padStart(5, '0').slice(-5)}` },
    });
    cp = cpRes.json;
    created.push({ kind: 'counterparty', id: cp?._id });
  }
  check('fixtures: counterparty есть/создан', Boolean(cp?._id), cp?._id);

  const siteList = await req('GET', '/api/sites', { token });
  let site = listOf(siteList.json)[0];
  if (!site && cp?._id) {
    const siteRes = await req('POST', '/api/sites', {
      token, body: { counterpartyId: cp._id, name: `WS-СМОК-объект-${uid}`, address: 'г. Смок, ул. Заказная, 1' },
    });
    site = siteRes.json;
    created.push({ kind: 'site', id: site?._id });
  }
  check('fixtures: site есть/создан', Boolean(site?._id), site?._id);

  const prod1Res = await req('POST', '/api/products', {
    token, body: { sku: `WS-SMK-1-${uid}`, kind: 'good', unit: 'шт', name: `WS-СМОК изделие 1 ${uid}` },
  });
  const prod1 = prod1Res.json;
  created.push({ kind: 'product', id: prod1?._id });
  const prod2Res = await req('POST', '/api/products', {
    token, body: { sku: `WS-SMK-2-${uid}`, kind: 'good', unit: 'шт', name: `WS-СМОК изделие 2 ${uid}` },
  });
  const prod2 = prod2Res.json;
  created.push({ kind: 'product', id: prod2?._id });
  check('fixtures: два изделия созданы', prod1Res.status === 201 && prod2Res.status === 201,
    `status=${prod1Res.status}/${prod2Res.status}`);

  if (!cp?._id || !site?._id || !prod1?._id || !prod2?._id) {
    warn('order-workspace: остальные проверки', 'фикстуры не созданы — пропуск');
    summarize();
    return;
  }

  // 3. Order A — happy path: create draft → add line → qty → ready → confirm → ship
  const orderRes = await req('POST', '/api/orders', {
    token,
    body: {
      counterpartyId: cp._id,
      siteId: site._id,
      status: 'draft',
      items: [{ productId: prod1._id, productName: prod1.name, unit: prod1.unit, quantity: 2 }],
    },
  });
  const order = orderRes.json;
  created.push({ kind: 'order', id: order?._id });
  check('order-detail: заказ создан (draft, 1 позиция)',
    orderRes.status === 201 && Boolean(order?._id) && order.items?.length === 1,
    `status=${orderRes.status} id=${order?._id}`);
  if (!order?._id) { summarize(); return; }

  // OrderWorkspaceFacade.load() equivalent — same GET the page fires on mount.
  const getRes = await req('GET', `/api/orders/${order._id}`, { token });
  check('order-detail: GET /orders/:id (facade.load())', getRes.status === 200 && getRes.json?._id === order._id,
    `status=${getRes.status}`);

  // composition: addLine — items PATCH must preserve line 0 untouched (facade.toItemPayload()).
  const addLineRes = await req('PATCH', `/api/orders/${order._id}`, {
    token,
    body: {
      items: [
        { productId: prod1._id, productName: prod1.name, unit: prod1.unit, quantity: 2 },
        { productId: prod2._id, productName: prod2.name, unit: prod2.unit, quantity: 5 },
      ],
    },
  });
  const afterAdd = addLineRes.json;
  const line0Preserved = afterAdd?.items?.[0]?.productName === prod1.name && afterAdd?.items?.[0]?.quantity === 2;
  check('composition: addLine PATCH preserves line 0 (name/unit/qty untouched)',
    addLineRes.status === 200 && afterAdd?.items?.length === 2 && line0Preserved,
    `status=${addLineRes.status} items=${afterAdd?.items?.length} line0.productName=${afterAdd?.items?.[0]?.productName}`);

  // composition: updateQty on line 1 — same PATCH shape, line 0 must still be untouched.
  const qtyRes = await req('PATCH', `/api/orders/${order._id}`, {
    token,
    body: {
      items: [
        { productId: prod1._id, productName: prod1.name, unit: prod1.unit, quantity: 2 },
        { productId: prod2._id, productName: prod2.name, unit: prod2.unit, quantity: 9 },
      ],
    },
  });
  const afterQty = qtyRes.json;
  check('composition: updateQty PATCH — line 1 qty updated, line 0 still untouched',
    qtyRes.status === 200 && afterQty?.items?.[1]?.quantity === 9 && afterQty?.items?.[0]?.productName === prod1.name,
    `status=${qtyRes.status} line1.qty=${afterQty?.items?.[1]?.quantity} line0.productName=${afterQty?.items?.[0]?.productName}`);

  // composition: toggleReady — dedicated endpoint (new PiOrdersService.setLineReady()).
  const readyRes = await req('PATCH', `/api/orders/${order._id}/items/0/ready`, { token, body: { readyForWork: true } });
  check('composition: PATCH items/0/ready (setLineReady())',
    readyRes.status === 200 && readyRes.json?.items?.[0]?.readyForWork === true,
    `status=${readyRes.status} readyForWork=${readyRes.json?.items?.[0]?.readyForWork}`);

  // execution: supply requests for this order — honest-empty is a valid PASS.
  const supplyRes = await req('GET', `/api/supply-requests?orderId=${order._id}`, { token });
  check('execution: GET supply-requests?orderId= (loadSupply())',
    supplyRes.status === 200 && Array.isArray(listOf(supplyRes.json)),
    `status=${supplyRes.status} count=${listOf(supplyRes.json).length}`);

  // header: confirm draft -> confirmed (facade.confirmOrder()).
  const confirmRes = await req('PATCH', `/api/orders/${order._id}`, { token, body: { status: 'confirmed' } });
  check('header: PATCH status confirmed (confirmOrder())',
    confirmRes.status === 200 && confirmRes.json?.status === 'confirmed',
    `status=${confirmRes.status} order.status=${confirmRes.json?.status}`);

  // logistics: reservations keyed by order.number (not _id) — the documented gotcha.
  const reservationsRes = await req('GET', `/api/reservations?orderId=${order.number}`, { token });
  check('logistics: GET reservations?orderId=<number> (loadReservations())',
    reservationsRes.status === 200 && Array.isArray(listOf(reservationsRes.json)),
    `status=${reservationsRes.status} count=${listOf(reservationsRes.json).length}`);

  // logistics: shipments keyed by order._id.
  const shipmentsBeforeRes = await req('GET', `/api/shipments?orderId=${order._id}`, { token });
  check('logistics: GET shipments?orderId=<_id> before ship (loadShipments())',
    shipmentsBeforeRes.status === 200 && listOf(shipmentsBeforeRes.json).length === 0,
    `status=${shipmentsBeforeRes.status} count=${listOf(shipmentsBeforeRes.json).length}`);

  // logistics: ship whole-order (facade.openShipConfirm() -> ordersApi.ship()).
  // Backend returns { order, shipmentId } — not the bare order (see ShipResult
  // doc comment in order.types.ts, added by this same verify pass).
  const shipRes = await req('POST', `/api/orders/${order._id}/ship`, { token, body: {} });
  check('logistics: POST /orders/:id/ship (openShipConfirm())',
    (shipRes.status === 200 || shipRes.status === 201) && shipRes.json?.order?.status === 'shipped' && Boolean(shipRes.json?.shipmentId),
    `status=${shipRes.status} order.status=${shipRes.json?.order?.status} shipmentId=${shipRes.json?.shipmentId}`);

  const shipmentsAfterRes = await req('GET', `/api/shipments?orderId=${order._id}`, { token });
  const shipmentAfter = listOf(shipmentsAfterRes.json)[0];
  if (shipmentAfter?._id) created.push({ kind: 'shipment', id: shipmentAfter._id });
  check('logistics: shipment appears after ship (hasShipment()/shipmentNumber())',
    shipmentsAfterRes.status === 200 && Boolean(shipmentAfter?.number),
    `status=${shipmentsAfterRes.status} number=${shipmentAfter?.number}`);

  // 4. Order B — separate order, exercise the new cancel() wrapper -------------
  const orderBRes = await req('POST', '/api/orders', {
    token,
    body: { counterpartyId: cp._id, siteId: site._id, status: 'draft', items: [] },
  });
  const orderB = orderBRes.json;
  created.push({ kind: 'order', id: orderB?._id });
  check('header: second order created for cancel test', orderBRes.status === 201 && Boolean(orderB?._id),
    `status=${orderBRes.status} id=${orderB?._id}`);

  if (orderB?._id) {
    const cancelRes = await req('POST', `/api/orders/${orderB._id}/cancel`, { token, body: {} });
    check('header: POST /orders/:id/cancel (new PiOrdersService.cancel())',
      (cancelRes.status === 200 || cancelRes.status === 201) && cancelRes.json?.status === 'cancelled',
      `status=${cancelRes.status} order.status=${cancelRes.json?.status}`);
  }

  // 5. Cleanup -------------------------------------------------------------------
  // Irregular plural — a naive `${kind}s` hits the wrong route (/counterpartys
  // 404s) and silently orphans fixtures, which then collide on unique fields
  // (INN) on the next run. Found + fixed during this same verify pass.
  const ROUTE_PLURAL = { counterparty: 'counterparties' };
  console.log('\n-- cleanup --');
  for (const c of created.reverse()) {
    if (!c?.id) continue;
    const plural = ROUTE_PLURAL[c.kind] || `${c.kind}s`;
    try {
      const res = await req('DELETE', `/api/${plural}/${c.id}`, { token });
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
    process.exitCode = 1;
    return;
  }
  process.exitCode = 0;
}

main().catch((e) => {
  console.error('SMOKE CRASH:', e);
  process.exitCode = 2;
});
