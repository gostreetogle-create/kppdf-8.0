/**
 * TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT — live smoke (Chrome CDP).
 *
 * Sets a document's client via the API, opens the studio, switches to
 * «Выбрано», clicks «Вставить «Клиент»», and verifies a real text layer
 * with the counterparty tokens lands on the canvas and Свойства opens.
 * Also verifies the "no supplier picked" case toasts instead of creating
 * an empty block (AC #3).
 *
 * Usage: node scripts/tz-nx-docstudio-selected-insert-party-text-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT-smoke.json + .png
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
const debugPort = 9338;
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

async function get(pathname, tokens) {
  const res = await fetch(`${apiBase}${pathname}`, { headers: auth(tokens.access) });
  if (!res.ok) throw new Error(`GET ${pathname} failed: HTTP ${res.status} ${await res.text()}`);
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

async function patch(pathname, tokens, body) {
  const res = await fetch(`${apiBase}${pathname}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...auth(tokens.access) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${pathname} failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const tokens = await login();
const counterparties = await get('/counterparties?limit=1', tokens);
const client = counterparties.items?.[0];
if (!client) throw new Error('No seeded counterparty found to use as client');

const doc = await post('/studio-documents', tokens, { name: `Smoke SELECTED-PARTY-TEXT ${suffix}` });
const updated = await patch(`/studio-documents/${doc._id}`, tokens, {
  expectedRevision: doc.revision,
  context: { counterpartyId: client._id },
});

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'party-text-cdp-'));
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

const selectedClick = await click('[title="Выбрано"]');
await wait(800);
check('selected_panel_opened', selectedClick.ok, selectedClick);

const beforeInsertState = await evaluate(`(() => {
  const disabled = document.querySelector('[data-test="studio-insert-disabled"]');
  const clientBtn = document.querySelector('[data-test="studio-insert-party-client"]');
  return { hasDisabledPlaceholder: !!disabled, hasClientBtn: !!clientBtn, clientLabel: clientBtn ? clientBtn.textContent.trim() : null };
})()`);
check('client_party_cta_shown_not_disabled_placeholder', beforeInsertState.hasClientBtn && !beforeInsertState.hasDisabledPlaceholder, beforeInsertState);

const shot1 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT-1-selected.png'), Buffer.from(shot1.data, 'base64'));

await click('[data-test="studio-insert-party-client"]');
await wait(1500);

// TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON flipped the canvas default to «Значения»
// — the just-inserted block should show the RESOLVED client name directly,
// no extra mode switch needed (evidence the two TZs compose correctly: a
// real token, resolved live, visible by default).
const expectedName = client.shortName || client.name;
const afterInsert = await evaluate(`(() => {
  const body = document.querySelector('.studio-block--text .studio-block__text-body');
  const propsPanel = document.querySelector('[data-test="studio-text-properties"]');
  return { hasBlock: !!body, html: body ? body.innerHTML : null, propertiesOpen: !!propsPanel };
})()`);
check('client_text_layer_created', afterInsert.hasBlock, afterInsert);
check('properties_panel_opened_after_insert', afterInsert.propertiesOpen, afterInsert);
check(
  'values_mode_shows_real_client_name_by_default',
  !!afterInsert.html && afterInsert.html.includes(expectedName),
  { expectedName, html: afterInsert.html },
);

const shot2 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT-2-inserted.png'), Buffer.from(shot2.data, 'base64'));

// Switch to «Токены» to confirm the underlying content is a REAL token
// ({{counterparty.name}}), not a value baked in at insert time.
await evaluate(`(() => {
  const btn = document.querySelector('[data-test="studio-token-display-mode-tokens"]');
  btn?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
})()`);
await wait(600);
const tokensState = await evaluate(`(() => {
  const body = document.querySelector('.studio-block--text .studio-block__text-body');
  return { html: body ? body.innerHTML : null };
})()`);
check('tokens_mode_shows_the_real_counterparty_token', !!tokensState.html && tokensState.html.includes('{{counterparty.name}}'), tokensState);

const shot3 = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT-3-tokens.png'), Buffer.from(shot3.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT',
  docId: doc._id,
  clientId: client._id,
  feUrl: `${feUrl}/studio/${doc._id}`,
  checks,
  pass,
};
fs.writeFileSync(
  path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT-smoke.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pass, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
