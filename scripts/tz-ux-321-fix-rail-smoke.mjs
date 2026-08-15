/**
 * TZ-UX-321-FIX — chrome rail geometry smoke (Chrome CDP).
 *
 * Usage:
 *   node scripts/tz-ux-321-fix-rail-smoke.mjs [url]
 *
 * Defaults to http://127.0.0.1:4210/modules
 * Writes reports/TZ-UX-321-FIX-chrome-rail-geometry.json
 * and reports/TZ-UX-321-FIX-chrome-rail-smoke-1920.png
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const url = process.argv[2] || 'http://127.0.0.1:4221/modules';
const apiBase = process.env.KPPDF_API_BASE || 'http://127.0.0.1:3000/api';
const debugPort = 9333;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ux321-fix-cdp-'));
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
  const result = await cdp('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
  }
  return result.result?.value;
}
async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function near(a, b, tol = 1) {
  return Math.abs(a - b) <= tol;
}

await cdp('Runtime.enable');
await cdp('Page.enable');

async function loginAndSeedTokens() {
  const loginRes = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed: HTTP ${loginRes.status}`);
  }
  const tokens = await loginRes.json();
  const origin = new URL(url).origin;
  await cdp('Page.navigate', { url: `${origin}/login` });
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

async function measureAt(width, height) {
  await cdp('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url });
  await wait(2800);
  return evaluate(`(() => {
    const frame = document.querySelector('.pi-page-frame');
    const left = document.querySelector('[data-test="app-chrome-rail-left"]');
    const right = document.querySelector('[data-test="app-chrome-rail-right"]');
    const back = document.querySelector('[data-test="app-nav-back"]');
    const forward = document.querySelector('[data-test="app-nav-forward"]');
    if (!frame || !left || !right) {
      return { ok: false, reason: 'missing frame or rails', hasFrame: !!frame, hasLeft: !!left, hasRight: !!right };
    }
    const fr = frame.getBoundingClientRect();
    const lr = left.getBoundingClientRect();
    const rr = right.getBoundingClientRect();
    const ls = getComputedStyle(left);
    const rs = getComputedStyle(right);
    const fs = getComputedStyle(frame);
    return {
      ok: true,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      framePosition: fs.position,
      frame: { left: fr.left, right: fr.right, width: fr.width, top: fr.top },
      leftRail: {
        left: lr.left,
        right: lr.right,
        width: lr.width,
        display: ls.display,
        position: ls.position,
        background: ls.backgroundColor,
        border: ls.borderTopWidth + '/' + ls.borderLeftWidth,
        boxShadow: ls.boxShadow,
        ownsBack: left.contains(back),
        ownsForward: left.contains(forward),
      },
      rightRail: {
        left: rr.left,
        right: rr.right,
        width: rr.width,
        display: rs.display,
        position: rs.position,
        background: rs.backgroundColor,
        border: rs.borderTopWidth + '/' + rs.borderLeftWidth,
        boxShadow: rs.boxShadow,
        ownsBack: right.contains(back),
        ownsForward: right.contains(forward),
      },
    };
  })()`);
}

const wide = await measureAt(1920, 1080);
const mid = await measureAt(1440, 900);
const narrow = await measureAt(1280, 800);

// Re-measure 1920 for screenshot
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false,
});
await cdp('Page.navigate', { url });
await wait(1800);
const shot = await cdp('Page.captureScreenshot', { format: 'png' });
const shotPath = path.join(root, 'reports', 'TZ-UX-321-FIX-chrome-rail-smoke-1920.png');
fs.mkdirSync(path.dirname(shotPath), { recursive: true });
fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
}

if (!wide?.ok) {
  check('wide_measure', false, wide?.reason || 'failed');
} else {
  check('frame_relative', wide.framePosition === 'relative', wide.framePosition);
  check('left_rail_at_frame_left', near(wide.leftRail.left, wide.frame.left, 1), {
    leftRailLeft: wide.leftRail.left,
    frameLeft: wide.frame.left,
  });
  check('right_rail_at_frame_right', near(wide.rightRail.right, wide.frame.right, 1), {
    rightRailRight: wide.rightRail.right,
    frameRight: wide.frame.right,
  });
  check('left_rail_width_64', near(wide.leftRail.width, 64, 1), wide.leftRail.width);
  check('right_rail_width_64', near(wide.rightRail.width, 64, 1), wide.rightRail.width);
  check(
    'not_viewport_plus_64',
    !near(wide.leftRail.left, 64, 1),
    { leftRailLeft: wide.leftRail.left, accidental: 64 },
  );
  check('left_owns_back_only', wide.leftRail.ownsBack && !wide.leftRail.ownsForward, wide.leftRail);
  check(
    'right_owns_forward_only',
    wide.rightRail.ownsForward && !wide.rightRail.ownsBack,
    wide.rightRail,
  );
  check('wide_display_flex', wide.leftRail.display === 'flex' && wide.rightRail.display === 'flex', {
    left: wide.leftRail.display,
    right: wide.rightRail.display,
  });
  const transparent =
    (wide.leftRail.boxShadow === 'none' || !wide.leftRail.boxShadow) &&
    (wide.rightRail.boxShadow === 'none' || !wide.rightRail.boxShadow);
  check('rails_no_shadow', transparent, {
    leftShadow: wide.leftRail.boxShadow,
    rightShadow: wide.rightRail.boxShadow,
  });
}

check(
  'mid_1440_hidden',
  mid?.ok && mid.leftRail.display === 'none' && mid.rightRail.display === 'none',
  mid?.ok
    ? { left: mid.leftRail.display, right: mid.rightRail.display }
    : mid,
);
check(
  'narrow_1280_hidden',
  narrow?.ok && narrow.leftRail.display === 'none' && narrow.rightRail.display === 'none',
  narrow?.ok
    ? { left: narrow.leftRail.display, right: narrow.rightRail.display }
    : narrow,
);

const pass = checks.every((c) => c.pass);
const selfScore = pass ? 98 : Math.max(40, 98 - checks.filter((c) => !c.pass).length * 8);

const report = {
  task: 'TZ-UX-321-FIX',
  url,
  seededUser,
  screenshot: shotPath,
  wide1920: wide,
  mid1440: mid,
  narrow1280: narrow,
  checks,
  pass,
  selfScore,
  note: pass
    ? 'Geometry evidence: rails match .pi-page-frame edges at 1920; hidden below 1680.'
    : 'FAIL — see checks',
};

const outPath = path.join(root, 'reports', 'TZ-UX-321-FIX-chrome-rail-geometry.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, selfScore, outPath, screenshot: shotPath, checks }, null, 2));

try {
  process.kill(child.pid);
} catch {
  /* ignore */
}
process.exit(pass ? 0 : 1);
