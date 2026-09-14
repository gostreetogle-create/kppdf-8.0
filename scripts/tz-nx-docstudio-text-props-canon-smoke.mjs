/**
 * TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON — live smoke (Chrome CDP).
 *
 * Creates a real studio document + text block via the API, opens it in a
 * real browser (not TestBed), and verifies:
 *  1. Токены/Значения defaults to «Значения» pressed.
 *  2. An unresolved {{counterparty.*}} token in «Значения» is visually
 *     distinct from the «Токены» chip (dashed/muted, not solid/info-color).
 *  3. Exactly ONE alignment control group is visible in the text panel (no
 *     TipTap-toolbar align buttons duplicating block.style.align).
 *
 * Usage: node scripts/tz-nx-docstudio-text-props-canon-smoke.mjs [feUrl]
 * Defaults to http://127.0.0.1:4201
 * Writes reports/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON-smoke.json + .png
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
const debugPort = 9334;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

function authHeader(token) {
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

async function createDoc(tokens) {
  const res = await fetch(`${apiBase}/studio-documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(tokens.access) },
    body: JSON.stringify({ name: 'Smoke TEXT-PROPS-CANON' }),
  });
  if (!res.ok) throw new Error(`Create doc failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function addTextBlock(tokens, docId) {
  const res = await fetch(`${apiBase}/studio-documents/${docId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(tokens.access) },
    body: JSON.stringify({
      expectedRevision: 1,
      type: 'text',
      order: 0,
      content: 'Клиент: {{counterparty.name}}',
      layout: { page: 1, x: 0.1, y: 0.2, width: 0.6, height: 0.1, zIndex: 1, rotation: 0 },
    }),
  });
  if (!res.ok) throw new Error(`Add block failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const tokens = await login();
const doc = await createDoc(tokens);
await addTextBlock(tokens, doc._id);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'text-props-canon-cdp-'));
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

const canvasShot = await cdp('Page.captureScreenshot', { format: 'png' });
const canvasShotPath = path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON-canvas.png');
fs.mkdirSync(path.dirname(canvasShotPath), { recursive: true });
fs.writeFileSync(canvasShotPath, Buffer.from(canvasShot.data, 'base64'));

const canvasState = await evaluate(`(() => {
  const el = document.querySelector('.studio-block--text .studio-block__text-body');
  return {
    hasBlock: !!el,
    html: el ? el.innerHTML : null,
    hasUnresolvedModifier: el ? el.innerHTML.includes('substitution-token--unresolved') : false,
    hasPlainChip: el ? /class="substitution-token"[^-]/.test(el.innerHTML) : false,
  };
})()`);

// Double-click the text block. Dispatched as a real bubbling MouseEvent from
// the page (not CDP Input.dispatchMouseEvent, which landed on the wrong
// stacking-context target in this app's zoomed/transformed sheet) — Angular's
// (dblclick) binding is a plain addEventListener, so a dispatched event is
// indistinguishable from a hardware one for its zone-patched listener.
const dblClickResult = await evaluate(`(() => {
  const el = document.querySelector('.studio-block--text');
  if (!el) return { ok: false, reason: 'not-found' };
  const rect = el.getBoundingClientRect();
  const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
  el.dispatchEvent(new MouseEvent('click', opts));
  el.dispatchEvent(new MouseEvent('dblclick', opts));
  return { ok: true, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height } };
})()`);
console.error('dblClickResult', JSON.stringify(dblClickResult));
await wait(1200);

const propsShot = await cdp('Page.captureScreenshot', { format: 'png' });
const propsShotPath = path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON-properties.png');
fs.writeFileSync(propsShotPath, Buffer.from(propsShot.data, 'base64'));

const panelState = await evaluate(`(() => {
  const valuesBtn = document.querySelector('[data-test="studio-token-display-mode-values"]');
  const tokensBtn = document.querySelector('[data-test="studio-token-display-mode-tokens"]');
  const alignBtns = document.querySelectorAll('[data-test^="studio-align-"]');
  const rteAlignGroups = document.querySelectorAll('.pi-rte-toolbar .pi-rte-group');
  return {
    panelVisible: !!valuesBtn,
    valuesPressed: valuesBtn ? valuesBtn.getAttribute('aria-pressed') : null,
    tokensPressed: tokensBtn ? tokensBtn.getAttribute('aria-pressed') : null,
    studioAlignButtonCount: alignBtns.length,
    rteToolbarGroupCount: rteAlignGroups.length,
  };
})()`);

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

check('block_rendered_on_canvas', canvasState.hasBlock, canvasState);
check('unresolved_token_uses_modifier_class', canvasState.hasUnresolvedModifier, canvasState.html);
check('unresolved_token_not_plain_tokens_chip', !canvasState.hasPlainChip, canvasState.html);
check('properties_panel_opened', panelState.panelVisible, panelState);
check('default_mode_is_values_pressed', panelState.valuesPressed === 'true', panelState);
check('tokens_not_pressed_by_default', panelState.tokensPressed === 'false', panelState);
check('one_studio_align_group_present', panelState.studioAlignButtonCount === 4, panelState.studioAlignButtonCount);
check(
  'rte_toolbar_has_only_bIu_group_no_align_in_compact',
  panelState.rteToolbarGroupCount === 1,
  panelState.rteToolbarGroupCount,
);

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON',
  docId: doc._id,
  feUrl: `${feUrl}/studio/${doc._id}`,
  canvasScreenshot: canvasShotPath,
  propertiesScreenshot: propsShotPath,
  canvasState,
  panelState,
  checks,
  pass,
};
const outPath = path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON-smoke.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, outPath, canvasShotPath, propsShotPath, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
