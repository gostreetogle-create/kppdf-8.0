import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const url = process.argv[2] || 'http://127.0.0.1:4643/';
const debugPort = 9222;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error('Chrome executable not found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-cdp-'));
const child = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore', detached: true });
child.unref();

async function waitForJson(endpoint, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}${endpoint}`);
      if (response.ok) return response.json();
    } catch {}
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
const consoleErrors = [];
const runtimeExceptions = [];
const networkFailures = [];
const httpErrors = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(message.params.type)) consoleErrors.push(message.params.args?.map((arg) => arg.value ?? arg.description).join(' '));
  if (message.method === 'Runtime.exceptionThrown') runtimeExceptions.push(message.params.exceptionDetails?.text || 'Runtime exception');
  if (message.method === 'Network.loadingFailed') networkFailures.push({ url: message.params.errorText, type: message.params.type });
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) httpErrors.push({ url: message.params.response.url, status: message.params.response.status });
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
async function wait(ms) { await new Promise((resolve) => setTimeout(resolve, ms)); }

await cdp('Runtime.enable');
await cdp('Network.enable');
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp('Page.navigate', { url });
await wait(1800);
const desktop = await evaluate(`({
  width: window.innerWidth,
  bodyText: document.body.innerText.slice(0, 500),
  normalizedText: document.body.innerText.toLowerCase(),
  sections: ['agents', 'task board', 'chat', 'activity'].every((text) => document.body.innerText.toLowerCase().includes(text)),
  roomOnline: document.body.innerText.toLowerCase().includes('room online'),
  doneColumn: document.body.innerText.toLowerCase().includes('done'),
  composer: Boolean(document.querySelector('#message-input') && document.querySelector('#message-to') && document.querySelector('#message-task')),
  agents: document.querySelectorAll('#agents .agent').length,
  tasks: document.querySelectorAll('#board .task').length
})`);

const message = `CDP smoke ${Date.now()}`;
await evaluate(`(() => { const input = document.querySelector('#message-input'); input.value = ${JSON.stringify(message)}; input.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('#message-form button[type="submit"]').click(); return true; })()`);
await wait(900);
const messageResult = await evaluate(`({
  sentVisible: document.body.innerText.includes(${JSON.stringify(message)}),
  status: document.querySelector('#message-status')?.textContent || ''
})`);

await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await wait(300);
const mobile = await evaluate(`(() => {
  const offenders = [...document.querySelectorAll('*')].map((element) => ({ tag: element.tagName, id: element.id, className: String(element.className || ''), right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })).filter((item) => item.right > document.documentElement.clientWidth + 1).sort((a, b) => b.right - a.right).slice(0, 8);
  return { width: window.innerWidth, bodyScrollWidth: document.body.scrollWidth, viewportWidth: document.documentElement.clientWidth, noHorizontalOverflow: document.body.scrollWidth <= document.documentElement.clientWidth + 1, offenders };
})()`);
const screenshot = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true });
const screenshotPath = path.resolve('reports/team_room_dashboard_cdp.png');
fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));

const evidence = {
  url,
  desktop,
  messageResult,
  mobile,
  consoleErrors,
  runtimeExceptions,
  networkFailures,
  httpErrors,
  screenshotPath,
  result: desktop.sections && desktop.roomOnline && desktop.doneColumn && desktop.composer && messageResult.sentVisible && mobile.noHorizontalOverflow && consoleErrors.length === 0 && runtimeExceptions.length === 0 && networkFailures.length === 0 && httpErrors.length === 0 ? 'PASS' : 'FAIL',
};
console.log(JSON.stringify(evidence, null, 2));
fs.writeFileSync(path.resolve('reports/team_room_cdp_smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
socket.close();
try { process.kill(child.pid); } catch {}
if (evidence.result !== 'PASS') process.exitCode = 1;
