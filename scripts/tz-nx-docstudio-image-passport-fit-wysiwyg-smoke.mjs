/**
 * TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG — live smoke (Chrome CDP).
 *
 * Creates a real studio document + two image blocks (one passport
 * background: settings.overlay=true, one regular photo) via the API,
 * opens it in a real browser, and verifies actual computed style — jsdom
 * cannot resolve this component's CSS cascade (confirmed while writing the
 * unit specs), so this is the only reliable proof of the fix:
 *  1. Passport image: object-fit: contain (was cover due to the equal-
 *     specificity bug — cover always won regardless of intent).
 *  2. Regular (non-overlay) photo: object-fit: cover (unaffected).
 *  3. Regular photo block: padding 0 (parity with the PDF image box).
 *
 * Usage: node scripts/tz-nx-docstudio-image-passport-fit-wysiwyg-smoke.mjs [feUrl]
 * Writes reports/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG-smoke.json + .png
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
const debugPort = 9335;
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
    body: JSON.stringify({ name: 'Smoke IMAGE-PASSPORT-FIT-WYSIWYG' }),
  });
  if (!res.ok) throw new Error(`Create doc failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

// A tiny valid 2x4 red/blue PNG, uploaded as a data: URL is not accepted by
// the block's imageUrl (only /uploads/* or http(s) are rendered) — instead
// point at an existing seeded upload if one exists, else fall back to a
// same-origin placeholder path; either way the fit/padding CSS under test
// does not depend on the image actually decoding.
const PLACEHOLDER_IMAGE_URL = '/uploads/does-not-need-to-exist-for-css-fit-check.png';

async function addImageBlock(tokens, docId, expectedRevision, overlay) {
  const res = await fetch(`${apiBase}/studio-documents/${docId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(tokens.access) },
    body: JSON.stringify({
      expectedRevision,
      type: 'image',
      order: overlay ? 0 : 1,
      content: '',
      layout: overlay
        ? { page: 1, x: 0, y: 0, width: 1, height: 1, zIndex: 0, rotation: 0 }
        : { page: 1, x: 0.1, y: 0.15, width: 0.35, height: 0.25, zIndex: 1, rotation: 0 },
      settings: overlay
        ? { overlay: true, imageUrl: PLACEHOLDER_IMAGE_URL }
        : { imageUrl: PLACEHOLDER_IMAGE_URL },
    }),
  });
  if (!res.ok) throw new Error(`Add block failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const tokens = await login();
const doc = await createDoc(tokens);
await addImageBlock(tokens, doc._id, 1, true);
await addImageBlock(tokens, doc._id, 2, false);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'passport-fit-cdp-'));
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

const shot = await cdp('Page.captureScreenshot', { format: 'png' });
const shotPath = path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG-canvas.png');
fs.mkdirSync(path.dirname(shotPath), { recursive: true });
fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));

const state = await evaluate(`(() => {
  const passportArticle = document.querySelector('article.studio-block--passport-bg');
  const passportImg = passportArticle ? passportArticle.querySelector('img') : null;
  const regularArticle = document.querySelector('article.studio-block--image:not(.studio-block--passport-bg)');
  const regularImg = regularArticle ? regularArticle.querySelector('img') : null;
  return {
    hasPassport: !!passportArticle,
    hasRegular: !!regularArticle,
    passportImgObjectFit: passportImg ? getComputedStyle(passportImg).objectFit : null,
    regularImgObjectFit: regularImg ? getComputedStyle(regularImg).objectFit : null,
    regularArticlePadding: regularArticle ? getComputedStyle(regularArticle).padding : null,
    passportArticlePadding: passportArticle ? getComputedStyle(passportArticle).padding : null,
  };
})()`);

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

check('passport_block_rendered', state.hasPassport, state);
check('regular_photo_block_rendered', state.hasRegular, state);
check('passport_object_fit_is_contain', state.passportImgObjectFit === 'contain', state.passportImgObjectFit);
check('regular_photo_object_fit_is_cover', state.regularImgObjectFit === 'cover', state.regularImgObjectFit);
check('regular_photo_block_padding_is_zero', state.regularArticlePadding === '0px', state.regularArticlePadding);
check('passport_block_padding_is_zero', state.passportArticlePadding === '0px', state.passportArticlePadding);

const pass = checks.every((c) => c.pass);
const report = {
  task: 'TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG',
  docId: doc._id,
  feUrl: `${feUrl}/studio/${doc._id}`,
  screenshot: shotPath,
  state,
  checks,
  pass,
};
const outPath = path.join(root, 'reports', 'TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG-smoke.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, outPath, shotPath, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
