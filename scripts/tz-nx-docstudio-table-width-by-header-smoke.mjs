/**
 * TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER — live smoke (Chrome CDP).
 *
 * Creates a table block with three equal-weight columns (short "Артикул",
 * capped "Фото", long "Наименование"), opens it in the studio, selects the
 * table (auto-opens Свойства), clicks «По заголовкам», and verifies the
 * canvas `<th>` widths actually change (name >> photo) and still sum to
 * ~100%. Also verifies AC #2 (manual edit after the fit still lands on the
 * canvas) and AC #3 (opening a document fresh, without clicking the button,
 * leaves the original equal widths alone — no silent auto-fit on load).
 *
 * Usage: node scripts/tz-nx-docstudio-table-width-by-header-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER-smoke.json + .png
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
const debugPort = 9339;
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

const doc = await post('/studio-documents', tokens, { name: `Smoke TABLE-WIDTH-BY-HEADER ${suffix}` });
const columns = [
  { key: 'sku', label: 'Артикул', type: 'text', width: 20, align: 'left' },
  { key: 'photo', label: 'Фото', type: 'text', width: 20, align: 'left' },
  { key: 'name', label: 'Наименование', type: 'text', width: 20, align: 'left' },
];
const blockRes = await post(`/studio-documents/${doc._id}/blocks`, tokens, {
  expectedRevision: doc.revision,
  type: 'table',
  order: 0,
  layout: { page: 1, x: 0.1, y: 0.1, width: 0.7, height: 0.3 },
  settings: {
    tableTemplateColumns: columns,
    tableTemplateSampleRows: [['A-1', '', 'Стол']],
  },
});
const revisionAfterBlock = blockRes.revision ?? doc.revision;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'table-width-cdp-'));
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
async function readThWidths() {
  return evaluate(`(() => {
    const ths = Array.from(document.querySelectorAll('.studio-block--table .table-preview th'));
    return ths.map((th) => th.style.width);
  })()`);
}
async function readWidthInputs() {
  return evaluate(`(() => {
    const inputs = Array.from(document.querySelectorAll('[data-test^="studio-table-col-width-"]'));
    return inputs.map((el) => Number(el.value));
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

await cdp('Page.navigate', { url: `${feUrl}/studio/${doc._id}` });
await wait(3000);

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

// AC #3: open old document, no click yet — widths as they were (equal split from
// equal weights: 100/3, rounded — the last column absorbs the rounding remainder,
// same as columnWidthPercents' own contract, so allow +/-1pp not exact equality).
const thWidthsBeforeClick = await readThWidths();
const pctBeforeClick = thWidthsBeforeClick.map((w) => parseFloat(String(w).replace('%', '')));
check(
  'open_without_click_keeps_original_widths_equal_split',
  pctBeforeClick.length === 3 && pctBeforeClick.every((p) => Math.abs(p - 100 / 3) <= 1),
  thWidthsBeforeClick,
);

// TZ-NX-PO-SWEEP-02: a single click on a canvas block only selects it, it never
// auto-opens Свойства any more (page.md's older "клик = выделение + авто-открытие"
// line predates that sweep) — table Свойства opens on DOUBLE click
// (`openTableBlock` -> `tableEditRequest` -> `openLayerProperties`). Real CDP
// Input.dispatchMouseEvent's synthetic pointerdown/click sequence didn't reliably
// produce a native `dblclick` in this headless build, so dispatch it directly.
const selectResult = await evaluate(`(() => {
  const el = document.querySelector('.studio-block--table');
  if (!el) return { ok: false };
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
  return { ok: true };
})()`);
await wait(500);
check('table_selected_and_properties_opened_on_dblclick', selectResult.ok, selectResult);

const propertiesOpen = await evaluate(`!!document.querySelector('[data-test="studio-table-properties"]')`);
check('properties_panel_open', propertiesOpen);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER-1-before.png'), Buffer.from(shot1.data, 'base64'));

const fitClick = await click('[data-test="studio-table-widths-by-header"]');
check('by_header_button_clicked', fitClick.ok, fitClick);
await wait(1500);

const widthInputsAfterFit = await readWidthInputs();
const thWidthsAfterFit = await readThWidths();
const parsePct = (s) => parseFloat(String(s).replace('%', ''));
const thPctAfterFit = thWidthsAfterFit.map(parsePct);
check(
  'name_column_wider_than_photo_after_fit',
  thPctAfterFit[2] > thPctAfterFit[1],
  { widthInputsAfterFit, thWidthsAfterFit },
);
const sumPct = Math.round(thPctAfterFit.reduce((a, b) => a + b, 0));
check('percents_sum_to_100_after_fit', sumPct === 100, { sumPct, thWidthsAfterFit });

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER-2-after-fit.png'), Buffer.from(shot2.data, 'base64'));

// AC #2: manual edit of one width input after the fit still lands on the canvas.
await evaluate(`(() => {
  const input = document.querySelector('[data-test="studio-table-col-width-0"]');
  input.value = '77';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await wait(1500);
const thWidthsAfterManualEdit = await readThWidths();
const thPctAfterManualEdit = thWidthsAfterManualEdit.map(parsePct);
check(
  'manual_edit_after_fit_changes_canvas_width',
  thPctAfterManualEdit[0] > thPctAfterFit[0],
  { before: thPctAfterFit, after: thPctAfterManualEdit },
);

const shot3 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER-3-manual-edit.png'), Buffer.from(shot3.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER',
  docId: doc._id,
  revisionAfterBlock,
  feUrl: `${feUrl}/studio/${doc._id}`,
  checks,
  pass,
};
fs.writeFileSync(
  path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER-smoke.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pass, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
