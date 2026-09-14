/**
 * TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE — live smoke (Chrome CDP).
 *
 * Opens the real «Создать текст» dialog (via studio's «Сохранить в
 * библиотеку текстов»), creates a root category and a subcategory inline
 * through the kit `app-pi-select-add-row` «+», and saves the text — the
 * full happy path AC #1 describes, with no detour through
 * /registries/text-block-categories (AC #2).
 *
 * Usage: node scripts/tz-nx-text-block-category-inline-create-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE-smoke.json + .png
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
const debugPort = 9336;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const suffix = Date.now().toString(36);

async function login() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
  return res.json();
}

async function createDoc(tokens) {
  const res = await fetch(`${apiBase}/studio-documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` },
    body: JSON.stringify({ name: `Smoke TEXT-CAT-CREATE ${suffix}` }),
  });
  if (!res.ok) throw new Error(`Create doc failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function addTextBlock(tokens, docId) {
  const res = await fetch(`${apiBase}/studio-documents/${docId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` },
    body: JSON.stringify({
      expectedRevision: 1,
      type: 'text',
      order: 0,
      content: 'Проверка inline-create категорий',
      layout: { page: 1, x: 0.1, y: 0.2, width: 0.6, height: 0.1, zIndex: 1, rotation: 0 },
    }),
  });
  if (!res.ok) throw new Error(`Add block failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const tokens = await login();
const doc = await createDoc(tokens);
await addTextBlock(tokens, doc._id);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'text-cat-create-cdp-'));
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
/**
 * Real CDP-native mouse click at the element's actual coordinates — a
 * synthetic dispatchEvent('click') did not reliably reach some of this
 * app's Angular/CDK-driven handlers (confirmed: it silently no-op'd on the
 * "Сохранить в библиотеку текстов" button until switched to this).
 */
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
/**
 * `app-pi-input`'s data-test lives on the custom-element HOST tag, not the
 * native <input> nested inside it — setting .value on the host just creates
 * a stray JS property nothing reads. Resolve to the real native input
 * first (self, if the selector already targets one).
 */
async function setInputValue(selector, value) {
  return evaluate(`(() => {
    const host = document.querySelector(${JSON.stringify(selector)});
    if (!host) return { ok: false, reason: 'not-found: ' + ${JSON.stringify(selector)} };
    const el = host.tagName === 'INPUT' ? host : host.querySelector('input');
    if (!el) return { ok: false, reason: 'no native input inside: ' + ${JSON.stringify(selector)} };
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    setter ? setter.call(el, ${JSON.stringify(value)}) : (el.value = ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return { ok: true, value: el.value };
  })()`);
}

await cdp('Runtime.enable');
await cdp('Page.enable');
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') {
    console.error('BROWSER EXCEPTION', JSON.stringify(message.params.exceptionDetails));
  }
  if (message.method === 'Runtime.consoleAPICalled' && (message.params.type === 'error' || message.params.type === 'warning')) {
    console.error('BROWSER CONSOLE', message.params.type, message.params.args.map((a) => a.value ?? a.description).join(' '));
  }
});
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

// Double-click the text block to open Свойства (same technique as the
// TEXT-PROPS-CANON smoke — real bubbling events, Angular's zone-patched
// listeners treat them exactly like hardware clicks).
const dblClickResult = await evaluate(`(() => {
  const el = document.querySelector('.studio-block--text');
  if (!el) return { ok: false, reason: 'not-found' };
  const rect = el.getBoundingClientRect();
  const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
  el.dispatchEvent(new MouseEvent('click', opts));
  el.dispatchEvent(new MouseEvent('dblclick', opts));
  return { ok: true };
})()`);
await wait(1000);

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}
check('text_block_dblclick_dispatched', dblClickResult.ok, dblClickResult);

const saveBtnClick = await click('[data-test="studio-save-text-block"]');
await wait(1000);
check('save_to_library_button_clicked', saveBtnClick.ok, saveBtnClick);

const dialogState1 = await evaluate(`(() => {
  const form = document.querySelector('[data-test="text-block-form"]');
  const rootAdd = document.querySelector('[data-test="text-root-category-add"]');
  const subAdd = document.querySelector('[data-test="text-sub-category-add"]');
  return {
    formOpen: !!form,
    hasRootAdd: !!rootAdd,
    hasSubAdd: !!subAdd,
    subAddDisabled: subAdd ? subAdd.disabled : null,
    rootAddInSelectAddRow: rootAdd ? !!rootAdd.closest('app-pi-select-add-row') : false,
  };
})()`);
check('text_block_dialog_open', dialogState1.formOpen, dialogState1);
check('both_add_buttons_present', dialogState1.hasRootAdd && dialogState1.hasSubAdd, dialogState1);
check('sub_add_disabled_before_root_picked', dialogState1.subAddDisabled === true, dialogState1.subAddDisabled);
check('root_add_uses_kit_select_add_row', dialogState1.rootAddInSelectAddRow, dialogState1.rootAddInSelectAddRow);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE-1-dialog.png'), Buffer.from(shot1.data, 'base64'));

// «+» root category.
await click('[data-test="text-root-category-add"]');
await wait(800);
const rootName = `Смоук-корень ${suffix}`;
await setInputValue('[data-test="text-block-category-name"]', rootName);
await click('[data-test="text-block-category-save"]');
await wait(1200);

const afterRootCreate = await evaluate(`(() => {
  const rootSelect = document.querySelector('[data-test="text-root-category"]');
  const subAdd = document.querySelector('[data-test="text-sub-category-add"]');
  const selectedOption = rootSelect ? rootSelect.options[rootSelect.selectedIndex] : null;
  return {
    rootSelected: selectedOption ? selectedOption.textContent.trim() : null,
    rootSelectValue: rootSelect ? rootSelect.value : null,
    subAddDisabled: subAdd ? subAdd.disabled : null,
  };
})()`);
check('root_category_created_and_selected', afterRootCreate.rootSelected === rootName, afterRootCreate);
check('sub_add_enabled_after_root_picked', afterRootCreate.subAddDisabled === false, afterRootCreate.subAddDisabled);

// «+» subcategory.
await click('[data-test="text-sub-category-add"]');
await wait(800);
const subName = `Смоук-лист ${suffix}`;
await setInputValue('[data-test="text-block-category-name"]', subName);
await click('[data-test="text-block-category-save"]');
await wait(1200);

const afterSubCreate = await evaluate(`(() => {
  const subSelect = document.querySelector('[data-test="text-sub-category"]');
  const selectedOption = subSelect ? subSelect.options[subSelect.selectedIndex] : null;
  return { subSelected: selectedOption ? selectedOption.textContent.trim() : null };
})()`);
check('sub_category_created_and_selected', afterSubCreate.subSelected === subName, afterSubCreate);

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE-2-selected.png'), Buffer.from(shot2.data, 'base64'));

// Fill name + save the text itself (full AC #1 happy path). The Save
// button lives in the dialog footer, outside the <form> in the DOM (footer
// slot) — target it directly by visible label.
await setInputValue('#text-name', `Смоук-текст ${suffix}`);
const saveResult = await evaluate(`(() => {
  const buttons = Array.from(document.querySelectorAll('app-pi-dialog button'));
  const saveBtn = buttons.find((b) => b.textContent && b.textContent.trim().startsWith('Сохранение') === false && b.textContent.includes('Сохранить') && !b.textContent.includes('библиотеку'));
  if (!saveBtn) return { ok: false, reason: 'save button not found', labels: buttons.map((b) => b.textContent.trim()) };
  saveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  return { ok: true };
})()`);
await wait(1500);

const afterSave = await evaluate(`(() => ({
  formStillOpen: !!document.querySelector('[data-test="text-block-form"]'),
}))()`);
check('save_button_found_and_clicked', saveResult.ok, saveResult);
check('text_dialog_closed_after_save', afterSave.formStillOpen === false, afterSave);

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE',
  docId: doc._id,
  feUrl: `${feUrl}/studio/${doc._id}`,
  rootName,
  subName,
  checks,
  pass,
};
fs.writeFileSync(
  path.join(root, 'reports', 'TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE-smoke.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pass, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
