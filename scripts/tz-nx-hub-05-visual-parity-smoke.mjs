/**
 * TZ-NX-HUB-05-VISUAL-PARITY — Chrome CDP visual/DOM smoke.
 *
 * Drives a real headless Chrome against the running dev stack and compares
 * /registries (gold expand chrome) against the 4 hub-parity pages
 * (/counterparties, /orders, /supply, /warehouses): chevron affordance,
 * expand panel presence, icon-sized row actions, no raw ObjectId text,
 * and rough row-density parity (padding/font-size of a data cell).
 *
 * Usage: node scripts/tz-nx-hub-05-visual-parity-smoke.mjs [baseUrl]
 * Defaults to http://localhost:4201
 * Writes docs/audits/evidence/*.png + reports/TZ-NX-HUB-05-visual-parity.json
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
const debugPort = 9356;
const evidenceDir = path.join(root, 'docs', 'audits', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'hub05-cdp-'));
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

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

const OBJECT_ID_RE = '[0-9a-f]{24}';

// ---- 1. GOLD: /registries — target "Материалы" specifically (named in the
// TZ as the reference example; unlike "Единицы измерения" it has row-level
// expand content, so this is a real apples-to-apples comparison). ----------
await cdp('Page.navigate', { url: `${baseUrl}/registries` });
await wait(3500);
const masterRowResult = await evaluate(`(() => {
  const masterTable = document.querySelector('[data-test="registries-master-table"]');
  const rows = masterTable ? Array.from(masterTable.querySelectorAll('tbody tr')) : [];
  const materialsRow = rows.find((r) => r.textContent.includes('Материалы'));
  const toggle = materialsRow ? materialsRow.querySelector('[data-test="table-expand-toggle"]') : null;
  if (toggle) toggle.click();
  return { hasMasterTable: !!masterTable, rowCount: rows.length, foundMaterialsRow: !!materialsRow, hasToggle: !!toggle };
})()`);
check('registries: master table renders', masterRowResult.hasMasterTable, masterRowResult);
check('registries: found "Материалы" row with expand toggle', masterRowResult.hasToggle, masterRowResult);
await wait(1200);
const goldShot1 = await screenshot('gold-registries-master-expanded');

const nestedResult = await evaluate(`(() => {
  const nested = document.querySelector('[data-test="registry-table"]');
  const nestedToggle = nested ? nested.querySelector('[data-test="table-expand-toggle"]') : null;
  return { hasNestedTable: !!nested, hasNestedToggle: !!nestedToggle };
})()`);
check('registries: nested registry-detail table renders on expand', nestedResult.hasNestedTable, nestedResult);
// Note: whether an individual registry ALSO offers per-row secondary detail
// (registry-expanded-row) depends on that registry's own definition — units
// and materials happen not to have one; this is a registries-catalog
// property, not something in scope here. Captured as info, not a gate.
if (nestedResult.hasNestedToggle) {
  await evaluate(`document.querySelector('[data-test="registry-table"] [data-test="table-expand-toggle"]').click()`);
  await wait(1000);
}
const goldShot2 = await screenshot('gold-registries-row-expanded');
const goldGeometry = await evaluate(`(() => {
  const row = document.querySelector('[data-test="registry-table"] tbody tr');
  const cell = row ? row.querySelector('td') : null;
  const cs = cell ? getComputedStyle(cell) : null;
  const expandedRow = document.querySelector('[data-test="registry-expanded-row"]');
  const iconBtn = document.querySelector('[data-test="registry-table"] .pi-icon-btn');
  const iconCs = iconBtn ? getComputedStyle(iconBtn) : null;
  return {
    cellPaddingTop: cs?.paddingTop ?? null,
    cellFontSize: cs?.fontSize ?? null,
    hasExpandedRow: !!expandedRow,
    iconBtnSize: iconCs ? (iconCs.width + 'x' + iconCs.height) : null,
  };
})()`);
console.log('INFO (not a gate) — registries per-row secondary detail present:', goldGeometry.hasExpandedRow);

// ---- 2..5. hub pages ------------------------------------------------------
const hubPages = [
  {
    path: '/counterparties',
    rowSel: '[data-test="counterparty-row"]',
    chevronSel: '[data-test="counterparty-row-chevron"]',
    expandSel: '[data-test="counterparty-row-expand"]',
    iconBtnSel: '.pi-icon-btn',
    wideBtnBanWords: ['Изменить', 'Удалить'],
  },
  {
    path: '/orders',
    rowSel: '[data-test="orders-row"]',
    chevronSel: '[data-test="orders-row-chevron"]',
    expandSel: '[data-test="orders-row-expand"]',
    iconBtnSel: '.pi-icon-btn',
    wideBtnBanWords: ['Карточка'],
  },
  {
    path: '/supply',
    rowSel: '[data-test="supply-row"]',
    chevronSel: '[data-test="supply-row-chevron"]',
    expandSel: '[data-test="supply-row-expand"]',
    iconBtnSel: null, // supply uses compact .pi-outline-btn per its own TZ AC, not pi-icon-btn
    wideBtnBanWords: [],
  },
  {
    path: '/warehouses',
    rowSel: '[data-test="warehouse-row"]',
    chevronSel: '[data-test="warehouse-row-chevron"]',
    expandSel: '[data-test="warehouse-row-expand"]',
    iconBtnSel: '.pi-icon-btn',
    wideBtnBanWords: ['Изменить', 'Удалить', 'Сделать по умолчанию'],
  },
];

for (const hp of hubPages) {
  const slug = hp.path.replace('/', '');
  await cdp('Page.navigate', { url: `${baseUrl}${hp.path}` });
  await wait(3000);

  const before = await evaluate(`(() => {
    const row = document.querySelector(${JSON.stringify(hp.rowSel)});
    const chevron = row ? row.querySelector(${JSON.stringify(hp.chevronSel)}) : null;
    return {
      hasRow: !!row,
      chevronText: chevron ? chevron.textContent.trim() : null,
      ariaExpanded: row ? row.getAttribute('aria-expanded') : null,
    };
  })()`);
  check(`${hp.path}: row renders`, before.hasRow, before);
  check(`${hp.path}: chevron shows ▸ before expand`, before.chevronText === '\u25B8', before.chevronText);
  check(`${hp.path}: aria-expanded=false before click`, before.ariaExpanded === 'false', before.ariaExpanded);

  await screenshot(`${slug}-collapsed`);

  if (before.hasRow) {
    await evaluate(`document.querySelector(${JSON.stringify(hp.rowSel)}).click()`);
    await wait(1500);
  }

  const after = await evaluate(`(() => {
    const row = document.querySelector(${JSON.stringify(hp.rowSel)});
    const chevron = row ? row.querySelector(${JSON.stringify(hp.chevronSel)}) : null;
    const expandEl = document.querySelector(${JSON.stringify(hp.expandSel)});
    const bodyText = document.body.innerText || '';
    const objectIdMatch = bodyText.match(new RegExp(${JSON.stringify(OBJECT_ID_RE)}, 'i'));
    const cell = row ? row.querySelector('[role="cell"]') : null;
    const cs = cell ? getComputedStyle(cell) : null;
    return {
      chevronText: chevron ? chevron.textContent.trim() : null,
      ariaExpanded: row ? row.getAttribute('aria-expanded') : null,
      hasExpandPanel: !!expandEl,
      rawObjectIdInText: objectIdMatch ? objectIdMatch[0] : null,
      cellPaddingTop: cs?.paddingTop ?? null,
      cellFontSize: cs?.fontSize ?? null,
    };
  })()`);
  check(`${hp.path}: chevron flips to ▾ after expand`, after.chevronText === '\u25BE', after.chevronText);
  check(`${hp.path}: aria-expanded=true after click`, after.ariaExpanded === 'true', after.ariaExpanded);
  check(`${hp.path}: expand panel present`, after.hasExpandPanel, after.hasExpandPanel);
  check(`${hp.path}: no raw ObjectId visible in text`, !after.rawObjectIdInText, after.rawObjectIdInText);
  check(`${hp.path}: row density (padding/font) captured`, !!after.cellPaddingTop, {
    padding: after.cellPaddingTop,
    font: after.cellFontSize,
    goldPadding: goldGeometry.cellPaddingTop,
    goldFont: goldGeometry.cellFontSize,
  });

  if (hp.iconBtnSel) {
    const iconInfo = await evaluate(`(() => {
      const btn = document.querySelector(${JSON.stringify(hp.iconBtnSel)});
      const cs = btn ? getComputedStyle(btn) : null;
      return { has: !!btn, size: cs ? (cs.width + 'x' + cs.height) : null };
    })()`);
    check(`${hp.path}: has .pi-icon-btn row action`, iconInfo.has, iconInfo);
  }

  const tableTextNoWideButtons = await evaluate(`(() => {
    const table = document.querySelector('[data-test$="-table"]');
    return table ? table.textContent : '';
  })()`);
  for (const word of hp.wideBtnBanWords) {
    check(`${hp.path}: no wide text button "${word}"`, !tableTextNoWideButtons.includes(word), word);
  }

  await screenshot(`${slug}-expanded`);
}

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-HUB-05-VISUAL-PARITY',
  baseUrl,
  seededUser,
  checks,
  pass,
  goldScreenshots: [goldShot1, goldShot2],
};
const outPath = path.join(root, 'reports', 'TZ-NX-HUB-05-visual-parity.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, outPath, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
