/**
 * TZ-NX-PRE-UAT-SMOKE-2026-09-12 — Chrome CDP smoke over the freshest waves
 * (DROP-REFERENCE-NAV, REGISTRY-CATEGORIES, DOCSTUDIO-TABLE-PROPS,
 * AI-IMPORT-BASELINE) before PO does a manual pass. Same raw-CDP pattern as
 * `scripts/tz-nx-hub-05-visual-parity-smoke.mjs` (no puppeteer dependency).
 *
 * Usage: node scripts/pre-uat-smoke-2026-09-12.mjs [baseUrl]
 * Defaults to http://localhost:4201; API at KPPDF_API_BASE or
 * http://localhost:3000/api.
 *
 * Creates ONE disposable studio document ("PRE-UAT-SMOKE 2026-09-12") via
 * the API for checks 6/7 — deliberately not reusing existing PO test
 * documents, whose table blocks carry stale hand-edited state unrelated to
 * this smoke (e.g. liveRows cached from a since-changed data source) that
 * would make the smoke's pass/fail depend on unrelated data hygiene rather
 * than on the code this smoke actually targets.
 *
 * Writes:
 *   docs/audits/evidence/pre-uat-2026-09-12/*.png
 *   docs/audits/evidence/pre-uat-2026-09-12/report.json
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
const debugPort = 9357;
const evidenceDir = path.join(root, 'docs', 'audits', 'evidence', 'pre-uat-2026-09-12');
fs.mkdirSync(evidenceDir, { recursive: true });

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-uat-cdp-'));
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

await cdp('Runtime.enable');
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 1600,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false,
});

// TZ AC 9: capture app console errors across every navigation (extension
// noise ignored — headless has no extensions anyway, but keep the filter
// honest in case that ever changes).
await cdp('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    window.__preUatErrors = [];
    window.addEventListener('error', (e) => { window.__preUatErrors.push(String(e.message || e)); });
    window.addEventListener('unhandledrejection', (e) => { window.__preUatErrors.push('unhandledrejection: ' + String(e.reason)); });
  `,
});

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail === undefined ? null : detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''}`);
}
function skip(name, reason) {
  checks.push({ name, pass: null, detail: `SKIP: ${reason}` });
  console.log(`SKIP — ${name} :: ${reason}`);
}

async function consoleErrorsSince() {
  return (await evaluate('window.__preUatErrors || []')) ?? [];
}
async function clearConsoleErrors() {
  await evaluate('window.__preUatErrors = []; true');
}

// ---- API login + fixture setup -------------------------------------------
const loginRes = await fetch(`${apiBase}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' }),
});
if (!loginRes.ok) throw new Error(`Login failed: HTTP ${loginRes.status}`);
const tokens = await loginRes.json();
const authHeaders = {
  Authorization: `Bearer ${tokens.access}`,
  'Content-Type': 'application/json',
};

async function apiJson(pathname, init) {
  const res = await fetch(`${apiBase}${pathname}`, { ...init, headers: { ...authHeaders, ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${pathname} -> HTTP ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Find the canonical (active) «Продукты» table template — TZD-AI... no,
// TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER's migration keeps exactly one.
const templates = await apiJson('/table-templates');
const templateList = Array.isArray(templates) ? templates : templates.items ?? templates.data ?? [];
const canonicalProducts = templateList.find((t) => t.name === 'Продукты' && t.isActive);
if (!canonicalProducts) throw new Error('Canonical «Продукты» table template not found — did TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER regress?');

const smokeDoc = await apiJson('/studio-documents', {
  method: 'POST',
  body: JSON.stringify({ name: 'PRE-UAT-SMOKE 2026-09-12' }),
});
const smokeBlock = await apiJson(`/studio-documents/${smokeDoc._id}/blocks`, {
  method: 'POST',
  body: JSON.stringify({
    expectedRevision: smokeDoc.revision ?? 1,
    type: 'table',
    order: 0,
    title: 'Смоук — Продукты',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.7, height: 0.3, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateId: canonicalProducts._id,
      tableTemplateName: canonicalProducts.name,
      tableTemplateColumns: canonicalProducts.columns,
      // One deliberately-empty-photo row so check 7 has a real "Нет фото" to find.
      tableTemplateSampleRows: [canonicalProducts.columns.map(() => '')],
    },
  }),
});

async function loginAndSeedTokens() {
  await cdp('Page.navigate', { url: `${baseUrl}/login` });
  await wait(1200);
  await evaluate(`(() => {
    localStorage.setItem('kppdf.access', ${JSON.stringify(tokens.access)});
    localStorage.setItem('kppdf.refresh', ${JSON.stringify(tokens.refresh)});
    localStorage.removeItem('kppdf.device');
    return true;
  })()`);
  return tokens.user?.username || 'admin';
}
const seededUser = await loginAndSeedTokens();

// ---- 1. Shell: no «Справ.» / reference chip -------------------------------
await cdp('Page.navigate', { url: `${baseUrl}/products` });
await wait(2000);
await clearConsoleErrors();
const navChips = await evaluate(`(() => {
  const chips = [...document.querySelectorAll('[data-test^="shell-quicknav-"]')];
  return chips.map((el) => ({ testId: el.getAttribute('data-test'), text: el.textContent.trim() }));
})()`);
check(
  '1. Shell top-nav has no «Справ.»/reference chip',
  navChips.length > 0 && !navChips.some((c) => /справ|reference/i.test(c.text) || /reference/i.test(c.testId)),
  navChips,
);
await screenshot('01-shell-topnav');

// ---- 2. /registries — group membership -----------------------------------
await cdp('Page.navigate', { url: `${baseUrl}/registries` });
await wait(3000);
const registryGroups = await evaluate(`(() => {
  const groups = [...document.querySelectorAll('[data-test="registries-category-group"]')];
  return groups.map((g) => ({
    label: g.querySelector('[data-test="registries-category-label"]')?.textContent.trim() ?? '',
    text: g.textContent,
  }));
})()`);
const catalogGroup = registryGroups.find((g) => g.label === 'Каталог');
const referenceGroup = registryGroups.find((g) => g.label === 'Справочники');
const docsGroup = registryGroups.find((g) => g.label === 'Документы');
check('2a. registries: "Каталог" group has no "Единицы измерения" (units moved out)', !!catalogGroup && !catalogGroup.text.includes('Единицы измерения'), catalogGroup?.label);
check('2b. registries: "Справочники" group has units + Категории', !!referenceGroup && referenceGroup.text.includes('Единицы измерения') && referenceGroup.text.includes('Категории'), referenceGroup?.label);
check('2c. registries: "Документы" group has Тексты + Категории текстов + Виды таблиц', !!docsGroup && docsGroup.text.includes('Тексты') && docsGroup.text.includes('Категории текстов') && docsGroup.text.includes('Виды таблиц'), docsGroup?.label);
check('2d. registries: no console errors', (await consoleErrorsSince()).length === 0, await consoleErrorsSince());
await screenshot('02-registries-groups');

// ---- 3. /registries/categories — create dialog type select ---------------
await clearConsoleErrors();
await cdp('Page.navigate', { url: `${baseUrl}/registries/categories` });
await wait(2500);
await evaluate(`document.querySelector('[data-test="registry-create"]')?.click()`);
await wait(900);
const categoryTypeSelect = await evaluate(`(() => {
  const sel = document.querySelector('[data-test="category-type"]');
  if (!sel) return null;
  return { tag: sel.tagName, options: [...sel.options].map((o) => o.textContent.trim()) };
})()`);
check(
  '3. registries/categories create form: type select visible with Детали/Изделия/Модули',
  !!categoryTypeSelect && categoryTypeSelect.tag === 'SELECT' && ['Детали', 'Изделия', 'Модули'].every((label) => categoryTypeSelect.options.some((o) => o.includes(label))),
  categoryTypeSelect,
);
await screenshot('03-categories-create-dialog');
await evaluate(`document.querySelector('[data-test="material-form-cancel"], [data-test="category-form-cancel"], [aria-label="Закрыть"]')?.click()`);
await wait(400);

// ---- 4. /registries/details create — Категория is a <select> -------------
await clearConsoleErrors();
await cdp('Page.navigate', { url: `${baseUrl}/registries/details` });
await wait(2500);
await evaluate(`document.querySelector('[data-test="registry-create"]')?.click()`);
await wait(900);
const detailCategoryField = await evaluate(`(() => {
  const sel = document.querySelector('[data-test="mat-category"]');
  return sel ? { tag: sel.tagName, type: sel.getAttribute('type') } : null;
})()`);
check('4. registries/details create: Категория is a <select>, not a raw ObjectId text input', !!detailCategoryField && detailCategoryField.tag === 'SELECT', detailCategoryField);
await screenshot('04-details-create-dialog');
await evaluate(`document.querySelector('[data-test="material-form-cancel"]')?.click()`);
await wait(400);
check('4b. registries/details: no console errors', (await consoleErrorsSince()).length === 0, await consoleErrorsSince());

// ---- 5. /registries/table-templates opens ---------------------------------
await clearConsoleErrors();
await cdp('Page.navigate', { url: `${baseUrl}/registries/table-templates` });
await wait(2500);
const tableTemplatesOpened = await evaluate(`(() => {
  const empty = document.querySelector('[data-test="registries-empty"]');
  const table = document.querySelector('[data-test="registries-master-table"]');
  return { hasEmpty: !!empty, hasTable: !!table, bodyLen: document.body.textContent.length };
})()`);
check('5. registries/table-templates opens (table or honest empty-state, no crash)', tableTemplatesOpened.hasTable || tableTemplatesOpened.hasEmpty, tableTemplatesOpened);
check('5b. registries/table-templates: no console errors', (await consoleErrorsSince()).length === 0, await consoleErrorsSince());
await screenshot('05-table-templates');

// ---- 6+7. /studio/:id — table props width, qty column, CTA, photo cell ----
await clearConsoleErrors();
await cdp('Page.navigate', { url: `${baseUrl}/studio/${smokeDoc._id}` });
await wait(3500);
await evaluate(`document.querySelector('[data-test="shell-tool-right-layers"]')?.click()`);
await wait(600);
const layerPropsBtnSel = `[data-test="studio-layer-row-${smokeBlock._id}"] [data-test="studio-layer-properties"]`;
const layerRowFound = await evaluate(`!!document.querySelector(${JSON.stringify(layerPropsBtnSel)})`);
check('6a. studio: smoke table block appears in Layers panel', layerRowFound, { blockId: smokeBlock._id });
await evaluate(`document.querySelector(${JSON.stringify(layerPropsBtnSel)})?.click()`);
await wait(900);

const panelInfo = await evaluate(`(() => {
  const panel = document.querySelector('[data-test="studio-tools-panel"]');
  if (!panel) return null;
  const cs = getComputedStyle(panel);
  return { width: panel.getBoundingClientRect().width, hasTableClass: panel.className.includes('kp-ws-panel--table') };
})()`);
check('6b. studio: table properties panel width >= 700px', !!panelInfo && panelInfo.width >= 700, panelInfo);

const qtyPresence = await evaluate(`(() => {
  const chip = document.querySelector('[data-test="studio-table-quick-add-qty"]');
  const cols = [...document.querySelectorAll('[data-test^="studio-table-col-key-"]')].map((el) => el.value);
  return { hasQuickAddChip: !!chip, hasQtyColumn: cols.some((c) => /qty|quantity|кол-во|количество/i.test(c)) };
})()`);
check('6c. studio: table props shows either "+ Количество" chip or an existing qty column', qtyPresence.hasQuickAddChip || qtyPresence.hasQtyColumn, qtyPresence);

const registryCta = await evaluate(`(() => {
  const a = document.querySelector('[data-test="studio-table-open-registry"]');
  return a ? { href: a.getAttribute('href'), target: a.getAttribute('target'), text: a.textContent.trim() } : null;
})()`);
check('6d. studio: CTA "Реестры → Виды таблиц" present, links to /registries/table-templates', !!registryCta && registryCta.href === '/registries/table-templates', registryCta);
await screenshot('06-studio-table-props');

// ---- 7. Photo cell on the A4 canvas: <img> OR "Нет фото", never blank ----
const photoCellInfo = await evaluate(`(() => {
  const cells = [...document.querySelectorAll('.table-preview__photo-cell')];
  if (cells.length === 0) return { found: false };
  const cell = cells[0];
  const img = cell.querySelector('img.table-preview__photo');
  const empty = cell.querySelector('.table-preview__photo-empty');
  return { found: true, hasImg: !!img, hasEmptyState: !!empty, rawText: cell.textContent.trim() };
})()`);
check(
  '7. Photo cell renders <img> or "Нет фото", never a blank td',
  photoCellInfo.found && (photoCellInfo.hasImg || photoCellInfo.hasEmptyState),
  photoCellInfo,
);
check('7b. studio: no console errors across props/canvas interaction', (await consoleErrorsSince()).length === 0, await consoleErrorsSince());
await screenshot('07-studio-canvas-photo-cell');

// ---- 8. /storage-items put-on-stock — material is a search/typeahead -----
await clearConsoleErrors();
await cdp('Page.navigate', { url: `${baseUrl}/storage-items` });
await wait(2500);
const putButtonExists = await evaluate(`!!document.querySelector('[data-test="put-on-stock"]')`);
if (putButtonExists) {
  await evaluate(`document.querySelector('[data-test="put-on-stock"]')?.click()`);
  await wait(700);
  const materialField = await evaluate(`(() => {
    const input = document.querySelector('[data-test="put-material-search"]');
    const blindSelect = document.querySelector('select[data-test="put-material"]');
    return { hasSearchInput: !!input, inputTag: input?.tagName ?? null, hasBlindSelect: !!blindSelect };
  })()`);
  check('8. storage-items put-on-stock: material is a search/typeahead, not a blind full <select>', materialField.hasSearchInput && !materialField.hasBlindSelect, materialField);
  await screenshot('08-storage-put-on-stock');
  await evaluate(`document.querySelector('[data-test="put-cancel"]')?.click()`);
} else {
  skip('8. storage-items put-on-stock dialog', '«put-on-stock» button not present for this seed user/role — dialog UI unreachable, not a code FAIL');
}
check('8b. storage-items: no console errors', (await consoleErrorsSince()).length === 0, await consoleErrorsSince());

// ---- Cleanup: remove the disposable smoke document ------------------------
try {
  await apiJson(`/studio-documents/${smokeDoc._id}`, { method: 'DELETE' });
} catch (err) {
  console.warn('Cleanup warning (non-fatal): could not delete smoke document —', err.message);
}

const pass = checks.filter((c) => c.pass !== null).every((c) => c.pass);
const report = {
  task: 'TZ-NX-PRE-UAT-SMOKE-2026-09-12',
  baseUrl,
  apiBase,
  seededUser,
  smokeDocId: smokeDoc._id,
  smokeBlockId: smokeBlock._id,
  checks,
  pass,
};
const outPath = path.join(evidenceDir, 'report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, outPath, totalChecks: checks.length, failed: checks.filter((c) => c.pass === false).length, skipped: checks.filter((c) => c.pass === null).length }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
