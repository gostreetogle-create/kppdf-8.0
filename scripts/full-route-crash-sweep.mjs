/**
 * Full route crash-sweep (Chrome CDP) — orchestrator-run, not tied to one TZ.
 *
 * Loads every route in app.routes.ts as admin and records console
 * errors/exceptions + whether the page rendered non-trivial content.
 * Read-only: does not click into anything, just navigates + observes.
 *
 * Usage: node scripts/full-route-crash-sweep.mjs [baseUrl]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const baseUrl = process.argv[2] || 'http://localhost:4200';
const apiBase = process.env.KPPDF_API_BASE || 'http://localhost:3000/api';
const debugPort = 9355;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((c) => fs.existsSync(c));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'crash-sweep-'));
const child = spawn(
  chrome,
  [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--no-default-browser-check', `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`, 'about:blank',
  ],
  { stdio: 'ignore', detached: true },
);
child.unref();

async function waitForJson(endpoint, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const r = await fetch(`http://127.0.0.1:${debugPort}${endpoint}`); if (r.ok) return r.json(); } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('cdp not ready');
}
const pages = await waitForJson('/json/list');
const page = pages.find((p) => p.type === 'page');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { socket.addEventListener('open', res, { once: true }); socket.addEventListener('error', rej, { once: true }); });

let nextId = 0;
const pending = new Map();
let currentErrors = [];
socket.addEventListener('message', (event) => {
  const m = JSON.parse(event.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(m.error.message)); else resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') {
    currentErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    const text = (m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
    if (text) currentErrors.push(`[console.error] ${text}`);
  }
});
function cdp(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expr, awaitPromise = true) {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result?.value;
}
async function wait(ms) { await new Promise((r) => setTimeout(r, ms)); }

await cdp('Runtime.enable');
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });

async function loginAndSeedTokens() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!res.ok) throw new Error(`login failed ${res.status}`);
  const tokens = await res.json();
  await cdp('Page.navigate', { url: `${baseUrl}/login` });
  await wait(1000);
  await evaluate(`(() => { localStorage.setItem('kppdf.access', ${JSON.stringify(tokens.access)}); localStorage.setItem('kppdf.refresh', ${JSON.stringify(tokens.refresh)}); localStorage.removeItem('kppdf.device'); return true; })()`);
  return tokens.access;
}
const accessToken = await loginAndSeedTokens();

async function apiGet(pathname) {
  const r = await fetch(`${apiBase}${pathname}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) return null;
  return r.json();
}

// Resolve a real id per :id route so those aren't skipped.
const materialsList = await apiGet('/materials?limit=1');
const productsList = await apiGet('/products?limit=1');
const modulesList = await apiGet('/product-modules?limit=1').catch(() => null);
const ordersList = await apiGet('/orders?limit=1');

const idFor = {
  'materials/:id': materialsList?.items?.[0]?._id || materialsList?.data?.[0]?._id,
  'products/:id': productsList?.items?.[0]?._id || productsList?.data?.[0]?._id,
  'modules/:id': modulesList?.items?.[0]?._id || modulesList?.data?.[0]?._id,
  'orders/:id': ordersList?.items?.[0]?._id || ordersList?.data?.[0]?._id,
};

const rawRoutes = ["admin","admin/devices","admin/roles","admin/users","catalog/appearance","categories","contracts","counterparties","dashboard","design","design/combine","desk","dictionaries","dictionaries/appearance","dictionaries/classification","dictionaries/color-references","dictionaries/documents-ref","dictionaries/form-profiles","dictionaries/kind-labels","dictionaries/measurements","dictionaries/text-block-categories","dictionaries/units","doc-constructor/builder","doc-constructor/builder/:id","doc-constructor/documents","doc-constructor/tables","doc-constructor/templates","doc-constructor/texts","doc-template-categories","enroll/:token","forbidden","import-todos","inventory","legal/privacy","login","materials","materials/:id","modules","modules/:id","orders","orders/:id","organizations","people","production","products","products/:id","proposals","proposals/create","shipping","stock-movements","storage-items","supply","warehouses","work-types"];

const routes = rawRoutes
  .filter((r) => !r.includes(':token')) // enroll/:token needs a real invite token, not applicable here
  .map((r) => {
    if (r.includes(':id')) {
      const id = idFor[r];
      return id ? r.replace(':id', id) : null;
    }
    return r;
  })
  .filter(Boolean);

const results = [];
for (const route of routes) {
  currentErrors = [];
  await cdp('Page.navigate', { url: `${baseUrl}/${route}` });
  await wait(2600);
  const info = await evaluate(`(() => ({
    href: location.href,
    bodyLen: document.body.innerHTML.length,
    title: document.title,
    hasAppRoot: !!document.querySelector('app-root'),
    visibleText: (document.body.innerText || '').trim().slice(0, 120),
  }))()`).catch((e) => ({ evalError: String(e) }));
  results.push({
    route,
    redirectedTo: info?.href,
    bodyLen: info?.bodyLen ?? 0,
    title: info?.title,
    errors: [...currentErrors],
    evalError: info?.evalError,
  });
}

const crashed = results.filter((r) => r.errors.length > 0 || r.evalError || (r.bodyLen ?? 0) < 500);
const report = { baseUrl, totalRoutes: routes.length, crashedCount: crashed.length, results };
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'full-route-crash-sweep.json'), JSON.stringify(report, null, 2));

console.log(`Swept ${routes.length} routes, ${crashed.length} with issues.`);
for (const c of crashed) {
  console.log(`--- ${c.route} (bodyLen=${c.bodyLen}, redirectedTo=${c.redirectedTo}) ---`);
  for (const e of c.errors) console.log('  ' + e.slice(0, 300));
  if (c.evalError) console.log('  evalError: ' + c.evalError);
}

try { process.kill(child.pid); } catch {}
process.exit(crashed.length > 0 ? 1 : 0);
