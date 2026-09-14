/**
 * TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS — live smoke #1 (independent verify).
 *
 * Re-verifies TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE (f3ac3c69), which had
 * only BE unit coverage in the original wave, no live smoke. Creates a
 * studio document with an image block pointing at a REAL uploaded file
 * (queried live from an existing product's photoIds, not a placeholder),
 * calls POST :id/preview, and confirms the local /uploads/ URL was inlined
 * to a data: URI. Then opens the document in the real browser, switches to
 * Просмотр, and confirms the <img> inside the preview iframe actually shows
 * the photo (not a broken-image icon).
 *
 * Usage: node scripts/tz-verify-2026-09-14-preview-uploads-inline-smoke.mjs [feUrl]
 * Writes reports/TZ-VERIFY-2026-09-14-preview-uploads-inline-smoke.json + .png
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
const debugPort = 9350;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const suffix = Date.now().toString(36);
function auth(token) { return { Authorization: `Bearer ${token}` }; }

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

const tokens = await login();

const productsRes = await get('/products?limit=20', tokens);
const products = productsRes.items ?? productsRes.data?.items ?? [];
const productWithPhoto = products.find((p) => Array.isArray(p.photoIds) && p.photoIds.length > 0 && p.photoIds[0].storageUrl);
if (!productWithPhoto) throw new Error('No seeded product with a real photo found — cannot verify real-file inlining');
const photoUrl = productWithPhoto.photoIds[0].storageUrl;

const doc = await post('/studio-documents', tokens, { name: `Verify PREVIEW-UPLOADS-INLINE ${suffix}` });
await post(`/studio-documents/${doc._id}/blocks`, tokens, {
  expectedRevision: doc.revision,
  type: 'image',
  order: 0,
  content: photoUrl,
  layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.3 },
});

const checks = [];
function check(name, pass, detail) { checks.push({ name, pass: !!pass, detail }); }

const preview = await post(`/studio-documents/${doc._id}/preview`, tokens, {});
check('backend_preview_html_contains_data_uri', preview.html.includes('data:image/'), { photoUrl, htmlLength: preview.html.length });
check('backend_preview_html_no_longer_has_raw_upload_path', !preview.html.includes(photoUrl), { photoUrl });

// --- Live browser: Просмотр mode actually shows the photo ---
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-inline-cdp-'));
const child = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore', detached: true });
child.unref();

async function waitForJson(endpoint, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const r = await fetch(`http://127.0.0.1:${debugPort}${endpoint}`); if (r.ok) return r.json(); } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Chrome CDP endpoint did not become ready: ${endpoint}`);
}
const pages = await waitForJson('/json/list');
const page = pages.find((e) => e.type === 'page');
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
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
});
function cdp(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression, awaitPromise = true) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
  return result.result?.value;
}
async function wait(ms) { await new Promise((r) => setTimeout(r, ms)); }
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

// Открыть меню «Документ» -> «Просмотр»
await evaluate(`(() => {
  const el = document.querySelector('[data-test="shell-tool-right-document"]');
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
})()`);
await wait(500);
const menuItems = await evaluate(`Array.from(document.querySelectorAll('.shell-rail-menu [role="menuitem"], .shell-rail-menu button')).map(b => b.textContent.trim())`);
// click the item whose text contains "Просмотр"
const previewClick = await evaluate(`(() => {
  const items = Array.from(document.querySelectorAll('.shell-rail-menu button'));
  const btn = items.find((b) => b.textContent.includes('Просмотр'));
  if (!btn) return { ok: false };
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  return { ok: true };
})()`);
check('preview_menu_item_found_and_clicked', previewClick.ok, { menuItems, previewClick });
await wait(1500);

const iframeState = await evaluate(`(() => {
  const frame = document.querySelector('[data-test="studio-preview-frame"]');
  if (!frame) return { hasFrame: false };
  const doc = frame.contentDocument;
  const img = doc?.querySelector('img');
  return {
    hasFrame: true,
    hasImg: !!img,
    imgSrcStartsWithData: img ? img.src.startsWith('data:image/') : false,
    imgNaturalWidth: img ? img.naturalWidth : null,
  };
})()`);
check('preview_iframe_present', iframeState.hasFrame, iframeState);
check('preview_iframe_has_img', iframeState.hasImg, iframeState);
check('preview_iframe_img_src_is_data_uri', iframeState.imgSrcStartsWithData, iframeState);
check('preview_iframe_img_actually_loaded_not_broken', (iframeState.imgNaturalWidth ?? 0) > 0, iframeState);

const shot = await cdp('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-preview-uploads-inline-1.png'), Buffer.from(shot.data, 'base64'));

const pass = checks.every((c) => c.pass);
const report = { task: 'VERIFY-PREVIEW-UPLOADS-INLINE', docId: doc._id, photoUrl, feUrl: `${feUrl}/studio/${doc._id}`, checks, pass };
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-preview-uploads-inline-smoke.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, checks }, null, 2));

try { process.kill(child.pid); } catch { /* ignore */ }
process.exit(pass ? 0 : 1);
