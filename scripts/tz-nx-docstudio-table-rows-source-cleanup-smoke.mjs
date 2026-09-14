/**
 * TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP — live smoke (Chrome CDP).
 *
 * Two documents:
 *  - Doc A: a fresh manual table created via Elements → «+ Таблица (слой)».
 *    Свойства must still show the plain «Источник строк» select (AC #3 —
 *    manual/КП/заказ/«+ Таблица» keeps the select).
 *  - Doc B: a table block pre-wired to a catalog source (as if just
 *    Insert'ed from «Выбрано»), created via the API. Свойства must show NO
 *    source control at all — no status line, no «Обновить строки», no
 *    «Сменить…», no bare select (AC #1).
 *
 * AC #2 ("add/remove in Выбрано updates the sheet without a button") is
 * `onCatalogSelectionChange`'s own re-`putDataSet` behavior, unchanged by
 * this TZ and already covered by existing `studio-editor-catalog-insert.spec.ts`
 * unit tests — not re-verified here.
 *
 * Usage: node scripts/tz-nx-docstudio-table-rows-source-cleanup-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP-smoke.json + .png
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
const debugPort = 9342;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const suffix = Date.now().toString(36);

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

async function login() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
  return res.json();
}

async function post(pathname, tokens, body) {
  const res = await fetch(`${apiBase}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth(tokens.access) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${pathname} failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const tokens = await login();

const docA = await post('/studio-documents', tokens, { name: `Smoke ROWS-SOURCE-CLEANUP A (manual) ${suffix}` });

const docB = await post('/studio-documents', tokens, { name: `Smoke ROWS-SOURCE-CLEANUP B (catalog) ${suffix}` });
await post(`/studio-documents/${docB._id}/blocks`, tokens, {
  expectedRevision: docB.revision,
  type: 'table',
  order: 0,
  layout: { page: 1, x: 0.1, y: 0.1, width: 0.7, height: 0.3 },
  settings: {
    tableTemplateColumns: [
      { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
      { key: 'qty', label: 'Кол-во', type: 'number', width: 40, align: 'right' },
    ],
    dataSource: { type: 'catalog-products' },
    liveRows: [['Стол', '1'], ['Стул', '4']],
  },
});

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rows-source-cleanup-cdp-'));
const child = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore', detached: true },
);
child.unref();

async function waitForJson(endpoint, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}${endpoint}`);
      if (response.ok) return response.json();
    } catch {
      /* retry */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Chrome CDP endpoint did not become ready: ${endpoint}`);
}

const pages = await waitForJson('/json/list');
const page = pages.find((entry) => entry.type === 'page');
if (!page?.webSocketDebuggerUrl) throw new Error('Chrome page websocket not found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    console.error('BROWSER EXCEPTION', JSON.stringify(message.params.exceptionDetails.text || message.params.exceptionDetails));
  }
});
function cdp(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression, awaitPromise = true) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
  }
  return result.result?.value;
}
async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: 'center' })`);
  await wait(150);
  const rect = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!rect) return { ok: false, reason: 'not-found: ' + selector };
  for (const type of ['mousePressed', 'mouseReleased']) {
    await cdp('Input.dispatchMouseEvent', { type, x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  }
  return { ok: true };
}
async function doubleClickJs(selector) {
  return evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return { ok: false };
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
    return { ok: true };
  })()`);
}

await cdp('Runtime.enable');
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });

await cdp('Page.navigate', { url: `${feUrl}/login` });
await wait(1200);
await evaluate(`(() => {
  localStorage.setItem('kppdf.access', ${JSON.stringify(tokens.access)});
  localStorage.setItem('kppdf.refresh', ${JSON.stringify(tokens.refresh)});
  localStorage.removeItem('kppdf.device');
  return true;
})()`);

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

// --- Doc A: fresh manual table via Elements -> + Таблица (слой) ---
await cdp('Page.navigate', { url: `${feUrl}/studio/${docA._id}` });
await wait(3000);

const elementsOpen = await click('[data-test="shell-tool-right-elements"]');
await wait(400);
check('doc_a_elements_panel_opened', elementsOpen.ok, elementsOpen);

const addTableClick = await click('[data-test="studio-add-table"]');
await wait(1200);
check('doc_a_table_created', addTableClick.ok, addTableClick);

await doubleClickJs('.studio-block--table');
await wait(500);

const docAState = await evaluate(`(() => ({
  hasSourceSelect: !!document.querySelector('[data-test="studio-table-source-select"]'),
  hasSourceStatus: !!document.querySelector('[data-test="studio-table-source-status"]'),
}))()`);
check('doc_a_manual_table_still_shows_source_select', docAState.hasSourceSelect, docAState);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP-1-manual-select.png'), Buffer.from(shot1.data, 'base64'));

// --- Doc B: pre-wired catalog table (as if just Insert'ed) ---
await cdp('Page.navigate', { url: `${feUrl}/studio/${docB._id}` });
await wait(3000);

await doubleClickJs('.studio-block--table');
await wait(500);

const docBState = await evaluate(`(() => ({
  hasSourceSelect: !!document.querySelector('[data-test="studio-table-source-select"]'),
  hasSourceStatus: !!document.querySelector('[data-test="studio-table-source-status"]'),
  hasRefreshButton: !!document.querySelector('[data-test="studio-table-refresh-rows"]'),
  hasChangeSourceButton: !!document.querySelector('[data-test="studio-table-change-source"]'),
  bodyHasIzVybrano: document.body.innerText.includes('Из Выбрано'),
  bodyHasObnovit: document.body.innerText.includes('Обновить строки'),
  bodyHasSmenit: document.body.innerText.includes('Сменить'),
}))()`);
check('doc_b_catalog_table_has_no_source_select', !docBState.hasSourceSelect, docBState);
check('doc_b_catalog_table_has_no_source_status', !docBState.hasSourceStatus, docBState);
check('doc_b_catalog_table_has_no_refresh_button', !docBState.hasRefreshButton, docBState);
check('doc_b_catalog_table_has_no_change_source_button', !docBState.hasChangeSourceButton, docBState);
check('doc_b_no_iz_vybrano_text_anywhere', !docBState.bodyHasIzVybrano, docBState);
check('doc_b_no_obnovit_stroki_text_anywhere', !docBState.bodyHasObnovit, docBState);
check('doc_b_no_smenit_text_anywhere', !docBState.bodyHasSmenit, docBState);

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP-2-catalog-no-control.png'), Buffer.from(shot2.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP',
  docAId: docA._id,
  docBId: docB._id,
  feUrl: `${feUrl}/studio/${docA._id}`,
  checks,
  pass,
};
fs.writeFileSync(
  path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP-smoke.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pass, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
