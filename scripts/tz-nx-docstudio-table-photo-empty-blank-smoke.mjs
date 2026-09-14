/**
 * TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK — live smoke (Chrome CDP + real backend).
 *
 * Creates a table block with a photo column: one row with no photo, one row
 * with a broken (non-existent) photo URL. Verifies:
 *  - canvas: no "Нет фото" text anywhere, no <img> for the empty/broken rows,
 *    and after the broken image's onerror fires, still no text/broken-icon;
 *  - backend preview HTML (POST /studio-documents/:id/preview): no "Нет фото"
 *    text and no `pi-photo-empty` class for the empty-photo row.
 *
 * Usage: node scripts/tz-nx-docstudio-table-photo-empty-blank-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK-smoke.json + .png
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
const debugPort = 9340;
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

const doc = await post('/studio-documents', tokens, { name: `Smoke TABLE-PHOTO-EMPTY-BLANK ${suffix}` });
const columns = [
  { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
  { key: 'photo', label: 'Фото', type: 'text', width: 20, align: 'center' },
];
const blockRes = await post(`/studio-documents/${doc._id}/blocks`, tokens, {
  expectedRevision: doc.revision,
  type: 'table',
  order: 0,
  layout: { page: 1, x: 0.1, y: 0.1, width: 0.7, height: 0.3 },
  settings: {
    tableTemplateColumns: columns,
    tableTemplateSampleRows: [
      ['Без фото', ''],
      ['Битое фото', '/uploads/does-not-exist-smoke-test.webp'],
    ],
  },
});
const revisionAfterBlock = blockRes.revision ?? doc.revision;

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

// Backend preview HTML — direct proof the resolver/table-template path never emits the old label.
// Note: a MANUAL table's sample rows are rendered as-is (no on-disk file-existence
// check — that only happens for catalog live-rows via studio-data-resolver's
// localUploadFileExists), so the "Битое фото" row legitimately still gets an
// <img src="/uploads/does-not-exist-smoke-test.webp"> tag here; the AC this TZ
// cares about at the backend layer is the genuinely EMPTY "Без фото" row.
const preview = await post(`/studio-documents/${doc._id}/preview`, tokens, {});
check('backend_preview_html_has_no_photo_empty_label', !preview.html.includes('Нет фото'), { htmlLength: preview.html.length });
check('backend_preview_html_has_no_photo_empty_class', !preview.html.includes('pi-photo-empty'), {});
const emptyRowMatch = preview.html.match(/<tr>[\s\S]*?Без фото[\s\S]*?<\/tr>/);
check(
  'backend_preview_empty_photo_row_has_no_img',
  !!emptyRowMatch && !emptyRowMatch[0].includes('<img'),
  { emptyRowHtml: emptyRowMatch?.[0] },
);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'photo-empty-cdp-'));
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
await evaluate(`document.querySelector('.studio-block--table')?.scrollIntoView({ block: 'center' })`);
await wait(300);

const beforeErrorState = await evaluate(`(() => {
  const bodyText = document.body.innerText;
  const photoCells = Array.from(document.querySelectorAll('.studio-block--table .table-preview__photo-cell'));
  return {
    hasNoPhotoLabel: bodyText.includes('Нет фото'),
    photoCellCount: photoCells.length,
    firstCellHasImg: !!photoCells[0]?.querySelector('img'),
    secondCellHasImg: !!photoCells[1]?.querySelector('img'),
  };
})()`);
check('canvas_has_no_photo_empty_label_anywhere', !beforeErrorState.hasNoPhotoLabel, beforeErrorState);
check('canvas_empty_photo_row_has_no_img', !beforeErrorState.firstCellHasImg, beforeErrorState);
// Not asserted here whether the broken-URL row's <img> is still present or has
// already self-healed to blank: a real dev-server 404 for the non-existent
// upload can resolve well inside the page-load wait above, so which state we
// observe is a timing race, not part of this TZ's contract. Either way is
// correct; the "after forced error" checks below are the actual AC.

// Select the table (same double-click path as openTableBlock/tableEditRequest,
// see TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER's smoke script) purely so the
// screenshot evidence actually shows the block instead of the default
// «Данные» panel's unrelated catalog list.
await evaluate(`(() => {
  const el = document.querySelector('.studio-block--table');
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  el?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
})()`);
await wait(500);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK-1-before-error.png'), Buffer.from(shot1.data, 'base64'));

// Fire the broken photo's onerror (real 404 in a headless env may not reliably
// dispatch on its own timing-wise) — force it explicitly, same event the real
// browser sends, to prove the fallback path is blank, not "Нет фото".
await evaluate(`(() => {
  const photoCells = Array.from(document.querySelectorAll('.studio-block--table .table-preview__photo-cell'));
  const img = photoCells[1]?.querySelector('img');
  img?.dispatchEvent(new Event('error'));
  return true;
})()`);
await wait(500);

const afterErrorState = await evaluate(`(() => {
  const bodyText = document.body.innerText;
  const photoCells = Array.from(document.querySelectorAll('.studio-block--table .table-preview__photo-cell'));
  return {
    hasNoPhotoLabel: bodyText.includes('Нет фото'),
    secondCellHasImg: !!photoCells[1]?.querySelector('img'),
    secondCellText: photoCells[1]?.textContent?.trim(),
  };
})()`);
check('canvas_no_photo_empty_label_after_load_error', !afterErrorState.hasNoPhotoLabel, afterErrorState);
check('canvas_img_removed_after_load_error', !afterErrorState.secondCellHasImg, afterErrorState);
check('canvas_cell_blank_after_load_error', afterErrorState.secondCellText === '', afterErrorState);

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK-2-after-error.png'), Buffer.from(shot2.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK',
  docId: doc._id,
  revisionAfterBlock,
  feUrl: `${feUrl}/studio/${doc._id}`,
  checks,
  pass,
};
fs.writeFileSync(
  path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK-smoke.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pass, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
