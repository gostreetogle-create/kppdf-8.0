/**
 * TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD — live smoke (Chrome CDP).
 *
 * Seeds a root category, a subcategory, and a library text via the API,
 * opens a fresh studio document, switches to the «Элементы» panel, clicks
 * «+ Текст», and verifies the picker dialog shows the seeded text and both
 * paths (library pick, «Пустой текст») actually insert a layer.
 *
 * Usage: node scripts/tz-nx-docstudio-text-library-insert-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD-smoke.json + .png
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
const debugPort = 9337;
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
const rootCategory = await post('/text-block-categories', tokens, { name: `Смоук-корень-lib ${suffix}` });
const subCategory = await post('/text-block-categories', tokens, { name: `Смоук-лист-lib ${suffix}`, parentId: rootCategory._id });
const libraryTextName = `Смоук-текст-библиотека ${suffix}`;
const libraryText = await post('/text-blocks', tokens, {
  name: libraryTextName,
  content: '<p>Контент из библиотеки</p>',
  categoryId: subCategory._id,
});
const doc = await post('/studio-documents', tokens, { name: `Smoke TEXT-LIBRARY-INSERT ${suffix}` });

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'text-lib-insert-cdp-'));
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

// Switch to «Элементы» (right rail).
const elementsClick = await click('[title="Элементы"]');
await wait(600);
check('elements_panel_opened', elementsClick.ok, elementsClick);

const addTextClick = await click('[data-test="studio-add-text"]');
await wait(1000);
check('plus_text_clicked', addTextClick.ok, addTextClick);

const pickerState = await evaluate(`(() => {
  const dialog = document.querySelector('[data-test="studio-text-library-picker"]');
  const emptyBtn = document.querySelector('[data-test="studio-text-library-empty"]');
  const list = document.querySelector('[data-test="studio-text-library-list"]');
  const hasSeededOption = !!Array.from(document.querySelectorAll('[data-test="studio-text-library-list"] button')).find(
    (b) => b.textContent.includes(${JSON.stringify(libraryTextName)}),
  );
  return { dialogOpen: !!dialog, hasEmptyBtn: !!emptyBtn, hasList: !!list, hasSeededOption };
})()`);
check('picker_dialog_opened', pickerState.dialogOpen, pickerState);
check('has_empty_text_option', pickerState.hasEmptyBtn, pickerState);
check('shows_seeded_library_text', pickerState.hasSeededOption, pickerState);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD-1-picker.png'), Buffer.from(shot1.data, 'base64'));

// Pick the seeded library text — scroll it into view first, the list is a
// scrollable container and an off-screen element's stale rect produced a
// click outside the dialog (landed on the backdrop, silently dismissing it
// with nothing picked) before this fix.
await evaluate(`(() => {
  const btn = Array.from(document.querySelectorAll('[data-test="studio-text-library-list"] button')).find(
    (b) => b.textContent.includes(${JSON.stringify(libraryTextName)}),
  );
  btn?.scrollIntoView({ block: 'center' });
})()`);
await wait(300);
const pickResult = await evaluate(`(() => {
  const btn = Array.from(document.querySelectorAll('[data-test="studio-text-library-list"] button')).find(
    (b) => b.textContent.includes(${JSON.stringify(libraryTextName)}),
  );
  if (!btn) return { ok: false };
  const rect = btn.getBoundingClientRect();
  return { ok: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
})()`);
if (pickResult.ok) {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await cdp('Input.dispatchMouseEvent', { type, x: pickResult.x, y: pickResult.y, button: 'left', clickCount: 1 });
  }
}
await wait(1500);

const afterPick = await evaluate(`(() => {
  const block = document.querySelector('.studio-block--text .studio-block__text-body');
  return { hasBlock: !!block, html: block ? block.innerHTML : null };
})()`);
check('library_pick_closed_dialog', pickResult.ok, pickResult);
check('library_content_inserted_on_canvas', afterPick.hasBlock && afterPick.html?.includes('Контент из библиотеки'), afterPick);

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD-2-inserted.png'), Buffer.from(shot2.data, 'base64'));

// Second round: the just-created layer from round 1 is now the active
// layer and already has content — «Пустой текст» must NOT clobber it (the
// same anti-clobber guard addTextToActiveLayer always had, unit-tested
// separately for the inverse — an EMPTY active layer — in
// studio-editor-text-library-insert.spec.ts), it should just focus the
// existing block rather than creating a duplicate.
await click('[data-test="studio-add-text"]');
await wait(800);
await click('[data-test="studio-text-library-empty"]');
await wait(1200);
const afterReclickEmptyOnNonEmptyActive = await evaluate(`(() => {
  const bodies = Array.from(document.querySelectorAll('.studio-block--text .studio-block__text-body'));
  return { count: bodies.length };
})()`);
check(
  'empty_pick_does_not_clobber_nonempty_active_layer',
  afterReclickEmptyOnNonEmptyActive.count === 1,
  afterReclickEmptyOnNonEmptyActive,
);

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD',
  docId: doc._id,
  feUrl: `${feUrl}/studio/${doc._id}`,
  libraryTextName,
  checks,
  pass,
};
fs.writeFileSync(
  path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD-smoke.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pass, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
