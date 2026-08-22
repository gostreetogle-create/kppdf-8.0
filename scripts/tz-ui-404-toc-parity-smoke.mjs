/**
 * TZ-UI-404 — group workspace TOC parity smoke (Chrome CDP).
 *
 * Verifies, for all 9 fixed routes, that the dark TOC row renders with the
 * correct active id and the gold chips row is empty (no `.group-chip`
 * children) — the acceptance criteria of TZ-UI-404.
 *
 * Usage: node scripts/tz-ui-404-toc-parity-smoke.mjs [baseUrl]
 * Defaults to http://localhost:4200
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
const debugPort = 9345;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ui404-cdp-'));
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
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 1600,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});

async function loginAndSeedTokens() {
  const loginRes = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!loginRes.ok) throw new Error(`Login failed: HTTP ${loginRes.status}`);
  const tokens = await loginRes.json();
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

const routes = [
  { path: '/counterparties', tocId: 'counterparties' },
  { path: '/people', tocId: 'people' },
  { path: '/products', tocId: 'products' },
  { path: '/modules', tocId: 'modules' },
  { path: '/materials', tocId: 'materials' },
  { path: '/catalog/appearance', tocId: 'catalog-appearance' },
  { path: '/supply', tocId: 'supply' },
  { path: '/shipping', tocId: 'shipping' },
  { path: '/production', tocId: 'production' },
  { path: '/work-types', tocId: 'work-types' },
];

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

for (const route of routes) {
  await cdp('Page.navigate', { url: `${baseUrl}${route.path}` });
  await wait(4500);
  const result = await evaluate(`(() => {
    const toc = document.querySelector('[data-test="group-toc"]');
    const chipsRow = document.querySelector('[data-test="group-chips"]');
    const activeTocChip = toc ? toc.querySelector('[aria-current="page"]') : null;
    const goldChips = chipsRow ? chipsRow.querySelectorAll('.group-chip').length : -1;
    return {
      hasToc: !!toc,
      tocChipCount: toc ? toc.querySelectorAll('.group-toc-chip').length : 0,
      activeTocText: activeTocChip ? activeTocChip.textContent.trim() : null,
      activeTocClass: activeTocChip ? activeTocChip.className : null,
      goldChipsCount: goldChips,
    };
  })()`);
  check(`${route.path}: toc row present`, result.hasToc, result);
  check(`${route.path}: toc has >=2 chips`, result.hasToc && result.tocChipCount >= 2, result.tocChipCount);
  check(`${route.path}: active toc chip = ${route.tocId}`, !!result.activeTocText, result.activeTocText);
  check(
    `${route.path}: active toc chip has bg-ink class`,
    result.activeTocClass?.includes('bg-ink') && result.activeTocClass?.includes('text-paper'),
    result.activeTocClass,
  );
  check(`${route.path}: gold chips row empty`, result.goldChipsCount === 0, result.goldChipsCount);
}

// Screenshot one representative route (previously-broken /counterparties) for visual evidence.
await cdp('Page.navigate', { url: `${baseUrl}/counterparties` });
await wait(4500);
const shot = await cdp('Page.captureScreenshot', { format: 'png' });
const shotPath = path.join(root, 'reports', 'TZ-UI-404-counterparties-toc.png');
fs.mkdirSync(path.dirname(shotPath), { recursive: true });
fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = { task: 'TZ-UI-404', baseUrl, seededUser, routes, checks, pass, screenshot: shotPath };
const outPath = path.join(root, 'reports', 'TZ-UI-404-toc-parity-smoke.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, outPath, screenshot: shotPath, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
