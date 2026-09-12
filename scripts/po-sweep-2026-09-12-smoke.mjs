/**
 * PO-SWEEP-CONTINUOUS-2026-09-12 — Chrome CDP smoke over stages #02-#07
 * (studio table click/select, outside-click panel dismiss, Данные vitrina
 * thumbs, table photo frame + «Фото в ячейке» props, editor/preview WYSIWYG
 * parity, chrome-rail «Документ» category menu). Same raw-CDP pattern as
 * `scripts/pre-uat-smoke-2026-09-12.mjs` (no puppeteer dependency).
 *
 * Usage: node scripts/po-sweep-2026-09-12-smoke.mjs [baseUrl]
 * Defaults to http://localhost:4201; API at KPPDF_API_BASE or
 * http://localhost:3000/api. Requires the dev server already running
 * (node start.mjs --nx).
 *
 * Creates ONE disposable studio document via the API, deletes it at the end.
 *
 * Writes:
 *   docs/audits/evidence/po-sweep-2026-09-12/*.png
 *   docs/audits/evidence/po-sweep-2026-09-12/report.json
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const baseUrl = process.argv[2] || 'http://localhost:4201';
const apiBase = process.env.KPPDF_API_BASE || 'http://localhost:3000/api';
const debugPort = 9358;
const evidenceDir = path.join(root, 'docs', 'audits', 'evidence', 'po-sweep-2026-09-12');
fs.mkdirSync(evidenceDir, { recursive: true });

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'po-sweep-cdp-'));
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
async function screenshot(name) {
  const shot = await cdp('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(evidenceDir, `${name}.png`);
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  return path.relative(root, shotPath);
}
async function click(selector) {
  return evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
}
async function dispatch(selector, type, opts = {}) {
  return evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.dispatchEvent(new MouseEvent(${JSON.stringify(type)}, { bubbles: true, ...${JSON.stringify(opts)} }));
    return true;
  })()`);
}

await cdp('Runtime.enable');
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1100, deviceScaleFactor: 1, mobile: false });
await cdp('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    window.__poSweepErrors = [];
    window.addEventListener('error', (e) => { window.__poSweepErrors.push(String(e.message || e)); });
    window.addEventListener('unhandledrejection', (e) => { window.__poSweepErrors.push('unhandledrejection: ' + String(e.reason)); });
  `,
});

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail === undefined ? null : detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''}`);
}
async function consoleErrorsSince() {
  return (await evaluate('window.__poSweepErrors || []')) ?? [];
}
async function clearConsoleErrors() {
  await evaluate('window.__poSweepErrors = []; true');
}

// ---- API login + fixture setup -------------------------------------------
const loginRes = await fetch(`${apiBase}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' }),
});
if (!loginRes.ok) throw new Error(`Login failed: HTTP ${loginRes.status}`);
const tokens = await loginRes.json();
const authHeaders = { Authorization: `Bearer ${tokens.access}`, 'Content-Type': 'application/json' };

async function apiJson(pathname, init) {
  const res = await fetch(`${apiBase}${pathname}`, { ...init, headers: { ...authHeaders, ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${pathname} -> HTTP ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const templates = await apiJson('/table-templates');
const templateList = Array.isArray(templates) ? templates : templates.items ?? templates.data ?? [];
const canonicalProducts = templateList.find((t) => t.name === 'Продукты' && t.isActive) ?? templateList.find((t) => t.isActive);
if (!canonicalProducts) throw new Error('No active table template found for smoke fixture');

const smokeDoc = await apiJson('/studio-documents', {
  method: 'POST',
  body: JSON.stringify({ name: 'PO-SWEEP-SMOKE 2026-09-12' }),
});
const smokeBlock = await apiJson(`/studio-documents/${smokeDoc._id}/blocks`, {
  method: 'POST',
  body: JSON.stringify({
    expectedRevision: smokeDoc.revision ?? 1,
    type: 'table',
    order: 0,
    title: 'Смоук — Продукты',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.15, width: 0.7, height: 0.3, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateId: canonicalProducts._id,
      tableTemplateName: canonicalProducts.name,
      tableTemplateColumns: canonicalProducts.columns,
      tableTemplateSampleRows: [canonicalProducts.columns.map(() => '')],
    },
  }),
});

await cdp('Page.navigate', { url: `${baseUrl}/login` });
await wait(1200);
await evaluate(`(() => {
  localStorage.setItem('kppdf.access', ${JSON.stringify(tokens.access)});
  localStorage.setItem('kppdf.refresh', ${JSON.stringify(tokens.refresh)});
  localStorage.removeItem('kppdf.device');
  return true;
})()`);

await clearConsoleErrors();
await cdp('Page.navigate', { url: `${baseUrl}/studio/${smokeDoc._id}` });
await wait(3500);

// ---- #02: single click selects only (no auto-open props); dblclick opens ----
const tableSel = `article.studio-block--table`;
await click(tableSel);
await wait(500);
const afterSingleClick = await evaluate(`(() => {
  const article = document.querySelector(${JSON.stringify(tableSel)});
  const panel = document.querySelector('[data-test="studio-tools-panel"]');
  return {
    hasSelectedClass: !!article?.classList.contains('selected'),
    hasResizeHandle: !!article?.querySelector('.resize-handle'),
    activeSectionAttr: panel?.getAttribute('data-active-section') ?? null,
    panelCollapsed: document.querySelector('.kp-ws-body--collapsed') != null,
  };
})()`);
check('#02a single click selects the table (selected class + resize handle)', afterSingleClick.hasSelectedClass && afterSingleClick.hasResizeHandle, afterSingleClick);
// Panel starts open on «Данные» by default (unrelated to this click) — the
// regression to guard is the section switching to 'properties' on a mere
// select, not whatever panel-open state the page loaded with.
check('#02b single click did NOT auto-open Свойства (section stays off "properties")', afterSingleClick.activeSectionAttr !== 'properties', afterSingleClick);
await screenshot('02a-table-single-click-selected');

await dispatch(tableSel, 'dblclick');
await wait(600);
const afterDblClick = await evaluate(`(() => {
  const panel = document.querySelector('[data-test="studio-tools-panel"]');
  return {
    panelCollapsed: document.querySelector('.kp-ws-body--collapsed') != null,
    activeSection: panel?.getAttribute('data-active-section') ?? null,
  };
})()`);
check('#02c dblclick opens Свойства (panel not collapsed, section=properties)', !afterDblClick.panelCollapsed && afterDblClick.activeSection === 'properties', afterDblClick);
await screenshot('02c-table-dblclick-properties');

// ---- #03: click outside chrome closes the open panel ----------------------
await click('[data-test="studio-workspace-ribbon"]');
await wait(500);
const afterOutsideClick = await evaluate(`({ panelCollapsed: document.querySelector('.kp-ws-body--collapsed') != null })`);
check('#03 click on empty ribbon (outside panel/block) closes the open panel', afterOutsideClick.panelCollapsed, afterOutsideClick);
await screenshot('03-outside-click-closed');

// ---- #04: Данные vitrina — thumb/placeholder + list fills panel -----------
await click('[data-test="shell-tool-right-elements"]'); // ensure right panel not stuck open from before, harmless if absent
await click('[data-test="shell-tool-left-data"]');
await wait(1200);
const vitrinaInfo = await evaluate(`(() => {
  const cards = [...document.querySelectorAll('[data-test="studio-data-vitrina-card"]')];
  const media = cards.map((c) => c.querySelector('[data-test="showcase-media"]'));
  const grid = document.querySelector('[data-test="studio-data-vitrina-grid"]');
  const cs = grid ? getComputedStyle(grid) : null;
  return {
    cardCount: cards.length,
    mediaSlotCount: media.filter(Boolean).length,
    gridMaxHeight: cs?.maxHeight ?? null,
  };
})()`);
check('#04a every vitrina card has a media slot (thumb or placeholder)', vitrinaInfo.cardCount === 0 || vitrinaInfo.mediaSlotCount === vitrinaInfo.cardCount, vitrinaInfo);
check('#04b vitrina grid has no artificial max-height (none/0px, panel body scrolls instead)', !vitrinaInfo.gridMaxHeight || vitrinaInfo.gridMaxHeight === 'none', vitrinaInfo);
await screenshot('04-data-vitrina');

// ---- #05: Свойства таблицы — «Фото в ячейке» section -----------------------
await click('[data-test="shell-tool-left-data"]'); // toggle Данные closed (dismiss) before reselecting table
await wait(300);
await click(tableSel);
await dispatch(tableSel, 'dblclick');
await wait(700);
const photoDisplaySection = await evaluate(`(() => {
  const section = document.querySelector('[data-test="studio-table-photo-display"]');
  const fit = document.querySelector('[data-test="studio-table-photo-fit"]');
  const maxH = document.querySelector('[data-test="studio-table-photo-max-height"]');
  return {
    present: !!section,
    fitOptions: fit ? [...fit.options].map((o) => o.textContent.trim()) : null,
    maxHeightValue: maxH?.value ?? null,
  };
})()`);
check('#05 «Фото в ячейке» section present with fit select + max-height input', photoDisplaySection.present && !!photoDisplaySection.fitOptions?.length, photoDisplaySection);
await screenshot('05-table-photo-display');

// ---- #06: editor/preview WYSIWYG parity (font-size not jarringly different) ----
const editorFontSize = await evaluate(`(() => {
  const el = document.querySelector('.table-preview table');
  return el ? getComputedStyle(el).fontSize : null;
})()`);
await click('[data-test="shell-tool-right-document"]');
await wait(300);
await click('[data-test="shell-tool-menu-item-mode-preview"]');
await wait(2500);
const previewFrameInfo = await evaluate(`(() => {
  const iframe = document.querySelector('[data-test="studio-preview-frame"]');
  if (!iframe) return { found: false };
  const cs = getComputedStyle(iframe);
  return { found: true, width: cs.width, height: cs.height, transform: cs.transform };
})()`);
check('#06a preview iframe present after switching to Просмотр, with a native size + transform scale', previewFrameInfo.found && previewFrameInfo.transform && previewFrameInfo.transform !== 'none', previewFrameInfo);
await screenshot('06-preview-mode');
await click('[data-test="shell-tool-right-document"]');
await wait(300);
await click('[data-test="shell-tool-menu-item-mode-editor"]');
await wait(800);
check('#06b editor canvas table font-size baseline captured (visual compare via screenshots)', !!editorFontSize, { editorFontSize });

// ---- #07: chrome-rail «Документ» category menu -----------------------------
const railIds = await evaluate(`[...document.querySelectorAll('[data-test="shell-rail-right"] [data-test^="shell-tool-right-"]')].map((el) => el.getAttribute('data-test'))`);
check('#07a right rail has ONE «Документ» id, no flat mode-editor/save/pdf/archive ids', railIds.includes('shell-tool-right-document') && !railIds.some((id) => /mode-editor|shell-tool-right-save|shell-tool-right-pdf|shell-tool-right-archive/.test(id)), railIds);

await click('[data-test="shell-tool-right-document"]');
await wait(400);
const menuOpen = await evaluate(`(() => {
  const menu = document.querySelector('[data-test="shell-tool-menu-document"]');
  const items = menu ? [...menu.querySelectorAll('[data-test^="shell-tool-menu-item-"]')].map((el) => el.getAttribute('data-test')) : [];
  return { open: !!menu, items };
})()`);
check('#07b clicking «Документ» opens a popover with 5 action items', menuOpen.open && menuOpen.items.length === 5, menuOpen);
await screenshot('07b-document-menu-open');

await evaluate(`document.body.click()`);
await wait(400);
const menuClosed = await evaluate(`!document.querySelector('[data-test="shell-tool-menu-document"]')`);
check('#07c clicking outside closes the «Документ» menu', menuClosed, { menuClosed });

check('final: no console errors accumulated across the smoke run', (await consoleErrorsSince()).length === 0, await consoleErrorsSince());

// ---- Cleanup ---------------------------------------------------------------
try {
  await apiJson(`/studio-documents/${smokeDoc._id}`, { method: 'DELETE' });
} catch (err) {
  console.warn('Cleanup warning (non-fatal): could not delete smoke document —', err.message);
}

const pass = checks.filter((c) => c.pass !== null).every((c) => c.pass);
const report = {
  task: 'PO-SWEEP-CONTINUOUS-2026-09-12-SMOKE',
  baseUrl,
  apiBase,
  smokeDocId: smokeDoc._id,
  smokeBlockId: smokeBlock._id,
  checks,
  pass,
};
fs.writeFileSync(path.join(evidenceDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, totalChecks: checks.length, failed: checks.filter((c) => c.pass === false).length }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
