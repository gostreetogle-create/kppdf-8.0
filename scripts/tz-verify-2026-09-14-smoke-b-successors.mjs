/**
 * TZ-VERIFY-2026-09-14-DOCSTUDIO-SMOKE-B — Successors regression (3/3).
 *
 * 1. Issuer select: switching «Исполнитель» persists across a full page
 *    reload (not just optimistic UI state) — the select shows the NEW org
 *    after reload, real PATCH round-trip.
 * 2. Table price/sum: a catalog-products table with `price` (listPrice
 *    alias) + `sum` columns, resolved against a REAL seeded product, shows
 *    non-empty, non-duplicate values in the backend preview HTML.
 * 3. Canvas token chip: a text block's raw {{token}} renders as a
 *    `.substitution-token` chip (not plain unresolved text) when switched
 *    from the default Значения mode into Токены.
 *
 * Usage: node scripts/tz-verify-2026-09-14-smoke-b-successors.mjs [feUrl]
 * Writes reports/TZ-VERIFY-2026-09-14-smoke-b-successors.json + .png
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const feUrl = process.argv[2] || 'http://127.0.0.1:4201';
const apiBase = process.env.KPPDF_API_BASE || 'http://127.0.0.1:3000/api';
const debugPort = 9351;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((c) => fs.existsSync(c));
if (!chrome) throw new Error('Chrome executable not found');

const suffix = Date.now().toString(36);
function auth(t) { return { Authorization: `Bearer ${t}` }; }
async function login() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
  return res.json();
}
async function get(p, tokens) {
  const res = await fetch(`${apiBase}${p}`, { headers: auth(tokens.access) });
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() };
}
async function post(p, tokens, body) {
  const res = await fetch(`${apiBase}${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth(tokens.access) }, body: JSON.stringify(body) });
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() };
}
async function patch(p, tokens, body) {
  const res = await fetch(`${apiBase}${p}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...auth(tokens.access) }, body: JSON.stringify(body) });
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() };
}

const checks = [];
function check(name, pass, detail) { checks.push({ name, pass: !!pass, detail }); }

const tokens = await login();

// --- Setup data for successors 2 & 3 ---
const orgsRes = await get('/organizations?limit=50', tokens);
const orgs = orgsRes.body.items ?? orgsRes.body.data?.items ?? [];
const issuerOrgs = orgs.filter((o) => o.isOurCompany);
check('at_least_2_isOurCompany_orgs_seeded', issuerOrgs.length >= 2, { count: issuerOrgs.length });

const productsRes = await get('/products?limit=20', tokens);
const products = productsRes.body.items ?? productsRes.body.data?.items ?? [];
const productWithPrice = products.find((p) => typeof p.listPrice === 'number' && p.listPrice > 0);
check('found_seeded_product_with_listPrice', !!productWithPrice, { product: productWithPrice && { id: productWithPrice._id, name: productWithPrice.name, listPrice: productWithPrice.listPrice } });

// --- Successor 2: price/sum table against the real product (backend preview HTML) ---
let priceSumDetail = {};
if (productWithPrice) {
  const priceDoc = await post('/studio-documents', tokens, { name: `Verify SMOKE-B price-sum ${suffix}` });
  const patchRes = await patch(`/studio-documents/${priceDoc.body._id}`, tokens, {
    expectedRevision: priceDoc.body.revision,
    context: { catalogSelections: { products: [productWithPrice._id] } },
  });
  const blockRes = await post(`/studio-documents/${priceDoc.body._id}/blocks`, tokens, {
    expectedRevision: patchRes.body.revision,
    type: 'table', order: 0,
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.7, height: 0.3 },
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование', type: 'text', width: 40, align: 'left' },
        { key: 'qty', label: 'Кол-во', type: 'number', width: 20, align: 'right' },
        { key: 'price', label: 'Цена', type: 'currency', width: 20, align: 'right' },
        { key: 'sum', label: 'Сумма', type: 'currency', width: 20, align: 'right' },
      ],
      dataSource: { type: 'catalog-products' },
    },
  });
  const docAfterAddBlock = await get(`/studio-documents/${priceDoc.body._id}`, tokens);
  const putRes = await fetch(`${apiBase}/studio-documents/${priceDoc.body._id}/data-sets/table-${blockRes.body._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth(tokens.access) },
    body: JSON.stringify({ expectedRevision: docAfterAddBlock.body.revision, dataSet: { source: { type: 'catalog-products' }, rows: [] } }),
  });
  const putBody = putRes.ok ? await putRes.json() : await putRes.text();
  check('put_dataset_for_catalog_table_succeeds', putRes.ok, { status: putRes.status, body: typeof putBody === 'string' ? putBody.slice(0, 300) : undefined });

  const preview = await post(`/studio-documents/${priceDoc.body._id}/preview`, tokens, {});
  const html = preview.body?.html ?? '';
  const rowMatch = html.match(new RegExp(`<tr>[\\s\\S]*?${productWithPrice.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?<\\/tr>`));
  const rowHtml = rowMatch ? rowMatch[0] : null;
  const cellTexts = rowHtml ? Array.from(rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map((m) => m[1].replace(/<[^>]+>/g, '').trim()) : [];
  priceSumDetail = { rowFound: !!rowHtml, cellTexts, listPrice: productWithPrice.listPrice };
  check('price_row_found_for_seeded_product', !!rowHtml, priceSumDetail);
  const priceCell = cellTexts[2] ?? '';
  const sumCell = cellTexts[3] ?? '';
  check('price_cell_non_empty', priceCell.trim().length > 0, priceSumDetail);
  check('sum_cell_non_empty', sumCell.trim().length > 0, priceSumDetail);
  check('price_and_sum_are_not_duplicated_text', priceCell.trim() !== '' && sumCell.trim() !== '' && (priceCell.trim() !== sumCell.trim() || cellTexts[1]?.trim() === '1'), priceSumDetail);
}

// --- Chrome for successors 1 & 3 (live UI) ---
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-b-successors-cdp-'));
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', detached: true });
child.unref();
async function waitForJson(endpoint, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const r = await fetch(`http://127.0.0.1:${debugPort}${endpoint}`); if (r.ok) return r.json(); } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Chrome CDP endpoint did not become ready: ' + endpoint);
}
const pages = await waitForJson('/json/list');
const page = pages.find((e) => e.type === 'page');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
});
function cdp(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expr) {
  const result = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'eval failed');
  return result.result?.value;
}
async function wait(ms) { await new Promise((r) => setTimeout(r, ms)); }
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`);
  await wait(150);
  const rect = await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()`);
  if (!rect) return { ok: false, reason: 'not-found: ' + selector };
  for (const type of ['mousePressed', 'mouseReleased']) await cdp('Input.dispatchMouseEvent', { type, x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  return { ok: true };
}
async function clickAt(x, y) {
  for (const type of ['mousePressed', 'mouseReleased']) await cdp('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
}

await cdp('Runtime.enable');
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp('Page.navigate', { url: `${feUrl}/login` });
await wait(1200);
await evaluate(`(() => { localStorage.setItem('kppdf.access', ${JSON.stringify(tokens.access)}); localStorage.setItem('kppdf.refresh', ${JSON.stringify(tokens.refresh)}); localStorage.removeItem('kppdf.device'); return true; })()`);

// --- Successor 1: issuer select persists across reload ---
const issuerDoc = await post('/studio-documents', tokens, { name: `Verify SMOKE-B issuer ${suffix}` });
await cdp('Page.navigate', { url: `${feUrl}/studio/${issuerDoc.body._id}` });
await wait(3000);

// Данные panel is open by default (activeSection defaults to 'data') — no need to click the rail tool (which would toggle it closed).
await click('[data-test="studio-data-toc-more"]');
await wait(400);

// The listbox panel is always in the DOM ([hidden]="!open()"), so reading
// .textContent on the whole [data-test="studio-issuer-select"] wrapper
// picks up every option's text regardless of open state — read only the
// trigger's own projected label instead.
const beforeIssuerText = await evaluate(`document.querySelector('[data-test="studio-issuer-select"] app-pi-select-trigger')?.textContent?.trim() || null`);
check('issuer_select_visible_before_switch', !!beforeIssuerText, { beforeIssuerText });

const targetOrg = issuerOrgs.find((o) => (o.shortName || o.name) !== beforeIssuerText) ?? issuerOrgs[0];
const openIssuer = await click('[data-test="studio-issuer-select"]');
await wait(400);
// A synthetic dispatchEvent('click') on the option didn't register with this
// CDK-driven listbox (same class of issue as elsewhere in this wave) — use a
// real CDP mouse click at the option's own screen coordinates instead.
const optionRect = await evaluate(`(() => {
  const opts = Array.from(document.querySelectorAll('[data-test="studio-issuer-select"] [role="option"]'));
  const target = ${JSON.stringify(targetOrg?.shortName || targetOrg?.name || '')};
  const opt = opts.find((o) => o.textContent.trim() === target);
  if (!opt) return { ok: false, optionTexts: opts.map((o) => o.textContent.trim()) };
  const r = opt.getBoundingClientRect();
  return { ok: true, x: r.left + r.width / 2, y: r.top + r.height / 2 };
})()`);
let optionClick = { ok: false };
if (optionRect.ok) {
  await clickAt(optionRect.x, optionRect.y);
  optionClick = { ok: true };
}
check('issuer_option_clicked', openIssuer.ok && optionRect.ok && optionClick.ok, { openIssuer, optionRect, optionClick, target: targetOrg?.shortName || targetOrg?.name });
await wait(1200);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-smoke-b-1-issuer-before-reload.png'), Buffer.from(shot1.data, 'base64'));

// Full reload — proves real persistence, not just optimistic local state.
await cdp('Page.navigate', { url: `${feUrl}/studio/${issuerDoc.body._id}` });
await wait(3000);
await click('[data-test="studio-data-toc-more"]');
await wait(400);
const afterReloadIssuerText = await evaluate(`document.querySelector('[data-test="studio-issuer-select"] app-pi-select-trigger')?.textContent?.trim() || null`);
check(
  'issuer_select_shows_new_org_after_full_reload',
  !!afterReloadIssuerText && afterReloadIssuerText.replace(/\s*▾\s*$/, '').trim() === (targetOrg?.shortName || targetOrg?.name),
  { afterReloadIssuerText, expected: targetOrg?.shortName || targetOrg?.name },
);

const docAfterReload = await get(`/studio-documents/${issuerDoc.body._id}`, tokens);
check('backend_organizationId_actually_changed', docAfterReload.body.organizationId === targetOrg?._id, { backendOrgId: docAfterReload.body.organizationId, expected: targetOrg?._id });

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-smoke-b-2-issuer-after-reload.png'), Buffer.from(shot2.data, 'base64'));

// --- Successor 3: token chip visible in Токены mode ---
const tokenDoc = await post('/studio-documents', tokens, { name: `Verify SMOKE-B token-chip ${suffix}` });
await post(`/studio-documents/${tokenDoc.body._id}/blocks`, tokens, {
  expectedRevision: tokenDoc.body.revision,
  type: 'text', order: 0,
  content: '<p>{{counterparty.name}}</p>',
  layout: { page: 1, x: 0.1, y: 0.1, width: 0.6, height: 0.1 },
});
await cdp('Page.navigate', { url: `${feUrl}/studio/${tokenDoc.body._id}` });
await wait(3000);

const defaultModeState = await evaluate(`(() => {
  const body = document.querySelector('.studio-block--text .studio-block__text-body');
  return { html: body ? body.innerHTML : null, hasUnresolvedClass: !!body?.querySelector('.substitution-token--unresolved') };
})()`);
check('default_mode_shows_unresolved_chip_not_plain_text', defaultModeState.hasUnresolvedClass, defaultModeState);

// Свойства (and its Токены/Значения toggle) only render once the text block
// is selected — a plain click just selects, double-click opens Свойства
// (same TZ-NX-PO-SWEEP-02 pattern every other block-Properties smoke in this
// wave already had to account for).
const dblClickResult = await evaluate(`(() => {
  const el = document.querySelector('.studio-block--text');
  if (!el) return { ok: false, reason: 'not-found' };
  const rect = el.getBoundingClientRect();
  const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
  el.dispatchEvent(new MouseEvent('click', opts));
  el.dispatchEvent(new MouseEvent('dblclick', opts));
  return { ok: true };
})()`);
check('text_block_double_clicked_to_open_properties', dblClickResult.ok, dblClickResult);
await wait(800);

const tokensToggle = await click('[data-test="studio-token-display-mode-tokens"]');
check('tokens_toggle_clicked', tokensToggle.ok, tokensToggle);
await wait(600);

const tokensModeState = await evaluate(`(() => {
  const body = document.querySelector('.studio-block--text .studio-block__text-body');
  const chip = body?.querySelector('.substitution-token');
  return {
    html: body ? body.innerHTML : null,
    hasChip: !!chip,
    chipHasUnresolvedClass: chip ? chip.classList.contains('substitution-token--unresolved') : null,
    chipText: chip ? chip.textContent : null,
  };
})()`);
check('tokens_mode_renders_a_substitution_token_chip', tokensModeState.hasChip, tokensModeState);
check('tokens_mode_chip_is_plain_not_unresolved_variant', tokensModeState.hasChip && tokensModeState.chipHasUnresolvedClass === false, tokensModeState);
check('tokens_mode_chip_text_is_the_raw_token', tokensModeState.chipText === '{{counterparty.name}}', tokensModeState);

const shot3 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-smoke-b-3-token-chip.png'), Buffer.from(shot3.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = {
  task: 'VERIFY-SMOKE-B-SUCCESSORS',
  issuerDocId: issuerDoc.body._id,
  priceDocId: productWithPrice ? undefined : null,
  tokenDocId: tokenDoc.body._id,
  priceSumDetail,
  checks,
  pass,
};
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-smoke-b-successors.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, checks }, null, 2));

try { process.kill(child.pid); } catch { /* ignore */ }
process.exit(pass ? 0 : 1);
