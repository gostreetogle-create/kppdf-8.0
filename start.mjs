#!/usr/bin/env node
/**
 * start.mjs — единый кросс-платформенный запуск kppdf-8.0 локально.
 *
 * Что делает:
 *  1. Pre-flight: проверяет Node 20+, pnpm, Docker, наличие .env
 *  2. Запускает MongoDB replica set через `docker compose up -d mongo`
 *     (бэкенд локально, чтобы обойти Dockerfile pnpm blocker из TZ-18)
 *  3. Ждёт готовности Mongo (rs.status().ok === 1)
 *  4. Ставит deps в backend/ и frontend/ если node_modules отсутствует
 *  5. Запускает backend (pnpm start:dev) на :3000
 *  6. Запускает frontend (pnpm start) на :4200
 *  7. Polls /api/health + GET / до готовности, парсит body для health-check панели
 *  8. Рисует "Ready" экран с латентностями health-check
 *  9. Открывает браузер на http://localhost:4200
 * 10. Корректно гасит оба процесса по Ctrl+C (SIGINT/SIGTERM)
 *
 * Использование:
 *   node start.mjs                # полный запуск
 *   node start.mjs --tail         # TUI-режим (in-place статус 3 сервисов, ring buffer логов)
 *   node start.mjs --check        # только pre-flight проверки
 *   node start.mjs --stop         # остановить запущенные процессы
 *   node start.mjs --reset        # полный сброс: docker down -v + pkill + удалить node_modules
 *   node start.mjs --no-browser   # не открывать браузер
 *   node start.mjs --help         # показать usage
 *
 * TUI-режим (--tail):
 *   - TTY-only, рисует 3 строки статуса (Mongo / Backend / Frontend) с in-place обновлением
 *   - Каждая строка: [icon] [name] [status] [elapsed] [health-latency] [last-log]
 *   - Финальный "Ready" экран с /api/health латентностями
 *   - Отключить TUI (CI / пайп-режим): NO_TUI=1 node start.mjs
 *
 * Кросс-платформенность: Windows 10+ (cmd/PowerShell/Git Bash), macOS, Linux.
 * Требования: Node 20+, pnpm 8+, Docker (для Mongo).
 */
import { spawn, spawnSync, execSync } from 'node:child_process';
import { existsSync, statSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { platform, exit, argv, env, stdout, stderr } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import http from 'node:http';
import net from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWin = platform === 'win32';
const isMac = platform === 'darwin';
const ROOT = __dirname;

const BACKEND_DIR = join(ROOT, 'backend');
const FRONTEND_DIR = join(ROOT, 'frontend');
const PID_FILE = join(ROOT, '.start.pids.json');

const PORTS = { backend: 3000, frontend: 4200, mongo: 27017 };
const HOSTS = { backend: 'http://localhost:3000', frontend: 'http://localhost:4200' };

// ---------- args ----------
const args = argv.slice(2);
const flags = {
  check: args.includes('--check'),
  stop: args.includes('--stop'),
  reset: args.includes('--reset'),
  noBrowser: args.includes('--no-browser') || args.includes('--noBrowser'),
  tail: args.includes('--tail'),
  help: args.includes('--help') || args.includes('-h'),
};

// TUI активен ТОЛЬКО когда --tail + TTY + не отключён через NO_TUI=1
function useTui() {
  return flags.tail && !!stdout.isTTY && !env.NO_TUI;
}

if (flags.help) {
  console.log(`
start.mjs — единый кросс-платформенный запуск kppdf-8.0

Использование:
  node start.mjs                # полный запуск
  node start.mjs --tail         # TUI-режим: live-логи в одном TTY-окне
  node start.mjs --check        # только pre-flight проверки
  node start.mjs --stop         # остановить запущенные процессы
  node start.mjs --reset        # полный сброс (down -v + pkill + rm node_modules)
  node start.mjs --no-browser   # не открывать браузер
  node start.mjs --help         # показать эту справку

TUI-режим (--tail):
  - TTY-only, рисует 3 строки статуса (Mongo / Backend / Frontend) с in-place обновлением
  - Каждая строка: [icon] [name] [status] [elapsed] [health-latency] [last-log]
  - Финальный "Ready" экран с /api/health латентностями
  - Отключить TUI (CI / пайп-режим): NO_TUI=1 node start.mjs

Endpoints:
  Backend:  http://localhost:3000/api/health
  Frontend: http://localhost:4200
  Login:    admin@kppdf.local / admin (default)
  Showcase: http://localhost:4200/p/showcase (UI Kit — TZ-31..40)
`);
  exit(0);
}

// ---------- ANSI colors (Windows 10+ поддерживает) ----------
const useColor = !env.NO_COLOR && (isWin ? true : stdout.isTTY);
const c = useColor
  ? {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      magenta: '\x1b[35m',
    }
  : new Proxy({}, { get: () => '' });

// ---------- TUI state ----------
const state = {
  services: {
    mongo:    { status: 'pending', log: [], startedAt: null, readyAt: null, health: null },
    backend:  { status: 'pending', log: [], startedAt: null, readyAt: null, health: null },
    frontend: { status: 'pending', log: [], startedAt: null, readyAt: null, health: null },
  },
  tuiActive: false,
};

function pushLog(service, line) {
  if (!state.services[service]) return;
  const clean = String(line).replace(/\x1b\[[0-9;]*m/g, '').replace(/\r/g, '').trim();
  if (!clean) return;
  const log = state.services[service].log;
  if (log.length >= 5) log.shift();
  log.push(clean);
}

function serviceIcon(status) {
  return { pending: '⏳', starting: '⏵', ready: '✔', failed: '✖', degraded: '⚠' }[status] || '·';
}
function serviceColor(status) {
  return {
    ready: c.green, starting: c.yellow, pending: c.yellow,
    failed: c.red, degraded: c.yellow,
  }[status] || c.dim;
}

function formatServiceLine(name) {
  const s = state.services[name];
  const icon = serviceIcon(s.status);
  const color = serviceColor(s.status);
  const elapsed = s.startedAt ? `${Math.round((Date.now() - s.startedAt) / 1000)}s` : '   — ';
  const latency = s.health?.latencyMs != null ? `${s.health.latencyMs}ms` : '     — ';
  const lastLog = s.log.length > 0 ? s.log[s.log.length - 1] : '';
  const maxLogLen = Math.max(20, (stdout.columns || 100) - 55);
  const logShort = lastLog.length > maxLogLen ? lastLog.slice(0, maxLogLen - 1) + '…' : lastLog;
  return `${color}${icon}${c.reset} ${c.cyan}${name.padEnd(8)}${c.reset} ${s.status.padEnd(10)} ${elapsed.padStart(6)} ${latency.padStart(7)}  ${c.dim}${logShort}${c.reset}`;
}

function renderStatus() {
  if (!useTui()) return;
  if (!state.tuiActive) {
    state.tuiActive = true;
    process.stdout.write(`${c.bold}── kppdf-8.0 live status ─${c.reset}\n`);
    for (const name of ['mongo', 'backend', 'frontend']) {
      process.stdout.write(formatServiceLine(name) + '\n');
    }
    return;
  }
  // Subsequent: move up 3 lines, redraw with clear-to-EOL
  process.stdout.write('\x1b[3A');
  for (const name of ['mongo', 'backend', 'frontend']) {
    process.stdout.write('\r' + formatServiceLine(name) + '\x1b[K\n');
  }
}

function tuiPrint(text) {
  if (state.tuiActive && useTui()) {
    // Insert line below TUI, then re-render TUI above it
    process.stdout.write('\n' + text + '\n');
    process.stdout.write('\x1b[1A');
    renderStatus();
  } else {
    console.log(text);
  }
}

// ---------- log (TUI-aware) ----------
const log = {
  info: (m) => tuiPrint(`${c.cyan}ℹ${c.reset}  ${m}`),
  ok: (m) => tuiPrint(`${c.green}✔${c.reset}  ${m}`),
  warn: (m) => tuiPrint(`${c.yellow}⚠${c.reset}  ${m}`),
  err: (m) => tuiPrint(`${c.red}✖${c.reset}  ${m}`),
  step: (n, m) => tuiPrint(`\n${c.bold}${c.blue}── [${n}]${c.reset} ${c.bold}${m}${c.reset}`),
  dim: (m) => tuiPrint(`${c.dim}   ${m}${c.reset}`),
};

// ---------- utils ----------
function runCapture(cmd, args, opts = {}) {
  try {
    return execSync(`${cmd} ${args.join(' ')}`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      ...opts,
    }).trim();
  } catch (e) {
    if (opts.allowFail) return '';
    throw e;
  }
}

function which(cmd) {
  const r = spawnSync(isWin ? 'where' : 'which', [cmd], { encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim().length > 0;
}

function getVersion(cmd, args = ['--version']) {
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', shell: isWin });
    if (r.status !== 0) return null;
    const v = (r.stdout || r.stderr || '').trim();
    const m = v.match(/(\d+)\.(\d+)/);
    return m ? parseFloat(`${m[1]}.${m[2]}`) : null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pingHttp(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * GET health endpoint, parse JSON, return {ok, status, body, latencyMs, error}.
 * For /api/health: ok = HTTP 2xx AND body.status !== 'error' AND info.mongo.status !== 'down'.
 * For other endpoints: ok = HTTP 2xx.
 */
async function checkHealth(url, timeoutMs = 2000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch { /* leave null */ }
        const httpOk = res.statusCode >= 200 && res.statusCode < 300;
        // Для /api/health: nested status check (терминус формат)
        let isHealthy = httpOk;
        if (url.endsWith('/api/health') && parsed) {
          const status = parsed.status;
          const mongoStatus = parsed.info?.mongo?.status;
          if (status === 'error' || mongoStatus === 'down') {
            isHealthy = false;
          }
        }
        resolve({
          ok: isHealthy,
          status: res.statusCode,
          body: parsed,
          latencyMs: Date.now() - start,
          error: null,
        });
      });
    });
    req.on('error', (e) =>
      resolve({ ok: false, status: 0, body: null, latencyMs: Date.now() - start, error: e.message }),
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, body: null, latencyMs: Date.now() - start, error: 'timeout' });
    });
  });
}

/**
 * Wait for HTTP endpoint to be ready, with health body check.
 * Updates state.services[serviceName] when set.
 */
async function waitFor(url, label, timeoutMs = 90000, serviceName = null) {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < timeoutMs) {
    attempt++;
    const ok = await pingHttp(url, 2000);
    if (ok) {
      const health = await checkHealth(url, 2000);
      if (health.ok) {
        if (serviceName && state.services[serviceName]) {
          state.services[serviceName].status = 'ready';
          state.services[serviceName].readyAt = Date.now();
          state.services[serviceName].health = health;
        }
        const elapsed = Math.round((Date.now() - start) / 1000);
        log.ok(`${label} ready after ${elapsed}s (${attempt} tries, health ${health.latencyMs}ms)`);
        if (useTui()) renderStatus();
        return true;
      }
      // HTTP 2xx but body says degraded (mongo down)
      if (health.status >= 200 && health.status < 300 && !health.ok && serviceName && state.services[serviceName]) {
        state.services[serviceName].status = 'degraded';
        state.services[serviceName].health = health;
        if (useTui()) renderStatus();
      }
    }
    if (attempt % 5 === 0) {
      log.dim(`still waiting for ${label}… (${Math.round((Date.now() - start) / 1000)}s)`);
    }
    await sleep(2000);
  }
  log.err(`${label} NOT ready after ${Math.round(timeoutMs / 1000)}s`);
  if (serviceName && state.services[serviceName]) {
    state.services[serviceName].status = 'failed';
    if (useTui()) renderStatus();
  }
  return false;
}

function readPids() {
  if (!existsSync(PID_FILE)) return null;
  try {
    return JSON.parse(readFileSync(PID_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writePids(data) {
  writeFileSync(PID_FILE, JSON.stringify(data, null, 2));
}

function clearPids() {
  try {
    rmSync(PID_FILE, { force: true });
  } catch {}
}

function killTree(pid) {
  if (!pid) return;
  try {
    if (isWin) {
      spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        process.kill(pid, 'SIGTERM');
      }
    }
  } catch {
    /* process already dead */
  }
}

// ---------- pre-flight ----------
async function preflight() {
  log.step(1, 'Pre-flight checks');
  let ok = true;

  // Node
  const nodeVer = getVersion('node');
  if (!nodeVer || nodeVer < 20) {
    log.err(`Node 20+ required, found ${nodeVer ?? 'not installed'}`);
    ok = false;
  } else {
    log.ok(`Node ${nodeVer}`);
  }

  // pnpm
  if (!which('pnpm')) {
    log.err('pnpm not found. Install: npm i -g pnpm');
    ok = false;
  } else {
    const pnpmVer = getVersion('pnpm');
    log.ok(`pnpm ${pnpmVer}`);
  }

  // Docker
  if (!which('docker')) {
    log.err('Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop');
    ok = false;
  } else {
    const dockerVer = getVersion('docker', ['--version']);
    log.ok(`Docker ${dockerVer}`);

    const r = spawnSync('docker', ['info'], { stdio: 'pipe', encoding: 'utf8' });
    if (r.status !== 0) {
      log.err('Docker daemon not running. Start Docker Desktop.');
      if (r.stderr) process.stderr.write(r.stderr);
      ok = false;
    } else {
      log.ok('Docker daemon reachable');
    }
  }

  // .env
  if (!existsSync(join(ROOT, '.env'))) {
    log.err('.env not found. Copy .env.example to .env and configure.');
    ok = false;
  } else {
    log.ok('.env present');
  }

  // project structure
  if (!existsSync(join(BACKEND_DIR, 'package.json'))) {
    log.err(`backend/package.json not found at ${BACKEND_DIR}`);
    ok = false;
  }
  if (!existsSync(join(FRONTEND_DIR, 'package.json'))) {
    log.err(`frontend/package.json not found at ${FRONTEND_DIR}`);
    ok = false;
  }
  if (existsSync(join(BACKEND_DIR, 'package.json')) && existsSync(join(FRONTEND_DIR, 'package.json'))) {
    log.ok('project structure OK');
  }

  // ports free? — fail hard if backend/frontend occupied, warn for Mongo (might be expected)
  for (const [name, port] of Object.entries(PORTS)) {
    const inUse = await isPortInUse(port);
    if (!inUse) continue;
    if (name === 'mongo') {
      log.warn(`Port ${port} (${name}) is in use — assuming external Mongo, continuing`);
    } else {
      log.err(`Port ${port} (${name}) is in use — kill the process or run \`node start.mjs --stop\``);
      ok = false;
    }
  }

  return ok;
}

async function isPortInUse(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(true));
    srv.once('listening', () => srv.close(() => resolve(false)));
    srv.listen(port, '0.0.0.0');
  });
}

// ---------- mongo ----------
async function startMongo() {
  log.step(2, 'Start MongoDB (replica set rs0)');
  state.services.mongo.status = 'starting';
  state.services.mongo.startedAt = Date.now();
  if (useTui()) renderStatus();
  // В TUI режиме — перехватываем docker output (иначе он сломает in-place обновление)
  const stdio = useTui() ? 'pipe' : 'inherit';
  const r = spawnSync(
    'docker',
    ['compose', 'up', '-d', 'mongo', 'mongo-init'],
    { cwd: ROOT, stdio, encoding: 'utf8' },
  );
  if (useTui() && r.stdout) {
    for (const line of r.stdout.split('\n')) {
      if (line.trim()) pushLog('mongo', line);
    }
    renderStatus();
  }
  if (r.status !== 0) {
    state.services.mongo.status = 'failed';
    if (useTui()) renderStatus();
    throw new Error('docker compose up failed');
  }
  log.ok('docker compose up -d mongo done');
}

async function waitMongo() {
  log.step(3, 'Wait for Mongo replica set');
  const start = Date.now();
  const timeoutMs = 120000;
  while (Date.now() - start < timeoutMs) {
    const r = spawnSync(
      'docker',
      ['exec', 'kppdf-mongo', 'mongosh', '--quiet', '--eval', 'rs.status().ok'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    if (r.status === 0 && r.stdout && r.stdout.trim() === '1') {
      state.services.mongo.status = 'ready';
      state.services.mongo.readyAt = Date.now();
      state.services.mongo.health = {
        ok: true, status: 200, body: null, latencyMs: Date.now() - start, error: null,
      };
      if (useTui()) renderStatus();
      log.ok(`Mongo RS ready after ${Math.round((Date.now() - start) / 1000)}s`);
      return true;
    }
    await sleep(3000);
  }
  state.services.mongo.status = 'failed';
  if (useTui()) renderStatus();
  log.err(`Mongo RS not ready after ${timeoutMs / 1000}s`);
  return false;
}

// ---------- deps ----------
function installDeps(dir, name) {
  if (existsSync(join(dir, 'node_modules'))) {
    log.ok(`${name} deps already installed (node_modules present)`);
    return;
  }
  log.info(`Installing ${name} deps (~30-60s)…`);
  // В TUI режиме — перехватываем pnpm output (иначе сломает in-place обновление)
  const stdio = useTui() ? 'pipe' : 'inherit';
  const r = spawnSync('pnpm', ['install', '--prefer-offline'], {
    cwd: dir,
    stdio,
    encoding: 'utf8',
    shell: isWin,
  });
  if (r.status !== 0) throw new Error(`pnpm install failed in ${name}`);
  log.ok(`${name} deps installed`);
}

// ---------- spawn dev servers ----------
function spawnDetached(cmd, args, cwd, name, envExtra = {}) {
  // detached + new process group on Unix so we can kill tree; on Windows taskkill /T
  const child = spawn(cmd, args, {
    cwd,
    env: { ...env, ...envExtra, FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: !isWin,
    windowsHide: true,
    shell: isWin,
  });
  // Трекаем в state
  if (name && state.services[name]) {
    state.services[name].startedAt = Date.now();
    state.services[name].status = 'starting';
    if (useTui()) renderStatus();
  }
  const dirName = cwd.split(/[\\/]/).pop();
  const onChunk = (b) => {
    const chunk = b.toString();
    if (name) {
      for (const line of chunk.split('\n')) {
        if (line.trim()) pushLog(name, line);
      }
    }
    if (useTui()) {
      // TUI: ничего не пишем в stdout, просто redraw
      renderStatus();
    } else {
      // Non-TUI: passthrough с префиксом [name]
      const prefix = name ? `[${name}] ` : `[${dirName}] `;
      process.stdout.write(prefix + chunk);
    }
  };
  child.stdout.on('data', onChunk);
  child.stderr.on('data', onChunk);
  return child;
}

// ---------- final ready panel ----------
function printReadyPanel() {
  const s = state.services;
  const elapsed = (svc) => (svc.startedAt && svc.readyAt
    ? Math.round((svc.readyAt - svc.startedAt) / 1000) + 's'
    : '—');
  const icon = (status) => {
    if (status === 'ready') return `${c.green}✔${c.reset}`;
    if (status === 'degraded') return `${c.yellow}⚠${c.reset}`;
    if (status === 'failed') return `${c.red}✖${c.reset}`;
    return `${c.dim}·${c.reset}`;
  };

  console.log('');
  console.log(`${c.bold}${c.green}━━━ kppdf-8.0 Ready ━━━${c.reset}`);
  console.log('');

  // Mongo
  console.log(`  ${icon(s.mongo.status)} ${c.cyan}Mongo   ${c.reset} ${c.bold}${s.mongo.status}${c.reset}  (${elapsed(s.mongo)})`);

  // Backend
  const bHealth = s.backend.health;
  const bLat = bHealth?.latencyMs != null ? `${bHealth.latencyMs}ms` : '—';
  const bCode = bHealth?.status ?? '—';
  console.log(`  ${icon(s.backend.status)} ${c.cyan}Backend ${c.reset} ${c.bold}${s.backend.status}${c.reset}  (${elapsed(s.backend)})  /api/health  ${bCode}  (${bLat})`);

  // Frontend
  const fHealth = s.frontend.health;
  const fLat = fHealth?.latencyMs != null ? `${fHealth.latencyMs}ms` : '—';
  const fCode = fHealth?.status ?? '—';
  console.log(`  ${icon(s.frontend.status)} ${c.cyan}Frontend${c.reset} ${c.bold}${s.frontend.status}${c.reset}  (${elapsed(s.frontend)})  /  ${fCode}  (${fLat})`);

  console.log('');
  console.log(`  ${c.dim}Frontend →${c.reset}  ${HOSTS.frontend}`);
  console.log(`  ${c.dim}Backend  →${c.reset}  ${HOSTS.backend}/api/health`);
  console.log(`  ${c.dim}Login    →${c.reset}  admin@kppdf.local / admin`);
  console.log(`  ${c.dim}Showcase →${c.reset}  ${HOSTS.frontend}/p/showcase  ${c.dim}(UI Kit — TZ-31..40)${c.reset}`);
  console.log('');
  // NO_TUI подсказка: полезна в обоих режимах — в TUI (юзер только что видел TUI и хочет
  // знать как его отключить) и в non-TUI (юзер удивлён почему нет TUI).
  console.log(`  ${c.dim}Tip:${c.reset}  ${c.dim}NO_TUI=1 отключает TUI-режим (для CI / пайп-режима)${c.reset}`);
  console.log('');
}

// ---------- main ----------
async function main() {
  console.log(`${c.bold}${c.magenta}━━━ kppdf-8.0 local starter ━━━${c.reset}`);
  console.log(`${c.dim}  Mongo + Backend (NestJS) + Frontend (Angular 20) in one go${c.reset}`);

  // ---- STOP mode ----
  if (flags.stop) {
    const pids = readPids();
    if (!pids) {
      log.warn('No PID file found. Nothing to stop.');
      return;
    }
    log.info('Stopping background processes…');
    for (const k of Object.keys(pids)) {
      killTree(pids[k]);
      log.ok(`stopped ${k} (pid ${pids[k]})`);
    }
    clearPids();
    // also stop mongo via docker
    spawnSync('docker', ['compose', 'down'], { cwd: ROOT, stdio: 'inherit' });
    log.ok('done');
    return;
  }

  // ---- RESET mode ----
  if (flags.reset) {
    log.warn('RESET mode: removing containers, volumes, node_modules…');
    spawnSync('docker', ['compose', 'down', '-v'], { cwd: ROOT, stdio: 'inherit' });
    for (const d of [BACKEND_DIR, FRONTEND_DIR]) {
      const nm = join(d, 'node_modules');
      if (existsSync(nm)) {
        rmSync(nm, { recursive: true, force: true });
        log.ok(`removed ${nm}`);
      }
    }
    clearPids();
    log.ok('reset done. Re-run: node start.mjs');
    return;
  }

  // ---- CHECK mode ----
  if (flags.check) {
    const ok = await preflight();
    exit(ok ? 0 : 1);
  }

  // ---- FULL START ----
  const ok = await preflight();
  if (!ok) {
    log.err('Pre-flight failed. Fix the above and re-run.');
    exit(1);
  }

  // Mongo
  await startMongo();
  const mongoOk = await waitMongo();
  if (!mongoOk) {
    log.err('Mongo not ready. Try: docker compose logs mongo');
    exit(1);
  }

  // Deps
  log.step(4, 'Install dependencies (skipped if node_modules exists)');
  installDeps(BACKEND_DIR, 'backend');
  installDeps(FRONTEND_DIR, 'frontend');

  // Spawn
  log.step(5, 'Start backend + frontend (detached, logs piped)');

  // Clean up any prior pid file
  const prior = readPids();
  if (prior) {
    log.info('cleaning up prior background processes…');
    for (const k of Object.keys(prior)) killTree(prior[k]);
    clearPids();
  }

  const backend = spawnDetached('pnpm', ['start:dev'], BACKEND_DIR, 'backend');
  const frontend = spawnDetached('pnpm', ['start'], FRONTEND_DIR, 'frontend');

  writePids({ backend: backend.pid, frontend: frontend.pid, startedAt: new Date().toISOString() });
  log.ok(`backend pid=${backend.pid}, frontend pid=${frontend.pid}`);
  log.dim(`pid file: ${PID_FILE}`);
  // Note: on Windows with `shell: isWin`, child.pid is the cmd.exe wrapper, not pnpm itself.
  // taskkill /T /F in cleanup() kills the whole tree, so this is fine — just don't read these
  // PIDs as "the pnpm process" in scripts/grep.

  // Wait for endpoints
  log.step(6, 'Wait for endpoints');
  const backendOk = await waitFor(`${HOSTS.backend}/api/health`, 'backend /api/health', 120000, 'backend');
  const frontendOk = await waitFor(HOSTS.frontend, 'frontend', 180000, 'frontend');

  if (!backendOk || !frontendOk) {
    log.err('One or more services failed to start within timeout.');
    log.dim('Check logs above. To stop: node start.mjs --stop');
    // do not exit — let user inspect live logs
  } else {
    log.step(7, 'Ready');
    // В TUI режиме — освобождаем TUI зону (1 пустая строка), затем печатаем панель
    if (state.tuiActive) {
      process.stdout.write('\n');
      state.tuiActive = false;
    }
    printReadyPanel();

    if (!flags.noBrowser) {
      try {
        openBrowser(HOSTS.frontend);
        log.ok(`opened ${HOSTS.frontend} in default browser`);
      } catch (e) {
        log.warn(`could not open browser: ${e.message}`);
      }
    }
  }

  // Cleanup handler
  const cleanup = (sig) => {
    log.warn(`received ${sig}, shutting down…`);
    try {
      killTree(backend.pid);
      killTree(frontend.pid);
    } catch {}
    clearPids();
    // leave mongo running — user can docker compose down manually
    log.ok('bye');
    exit(0);
  };
  process.on('SIGINT', () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));

  log.dim('press Ctrl+C to stop backend + frontend (Mongo keeps running)');
  // keep process alive
  await new Promise(() => {});
}

function openBrowser(url) {
  const cmd = isMac ? 'open' : isWin ? 'cmd' : 'xdg-open';
  const args = isWin ? ['/c', 'start', '""', url] : [url];
  // shell: isWin so `start` (a cmd built-in, not start.exe) resolves correctly
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true, shell: isWin });
  child.unref();
}

// ---------- entry ----------
main().catch((e) => {
  log.err(e.stack || e.message || String(e));
  exit(1);
});
