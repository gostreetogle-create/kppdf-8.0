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
import { createServer } from 'node:http';
import { existsSync, statSync, rmSync, readFileSync, writeFileSync, createReadStream, readdirSync } from 'node:fs';
import { platform, exit, argv, env, stdout, stderr } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize, sep } from 'node:path';
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
  prod: args.includes('--prod'),
  noBuild: args.includes('--no-build'),
  help: args.includes('--help') || args.includes('-h'),
};

// Validation: --prod несовместим с --reset
if (flags.prod && flags.reset) {
  console.error('✖ --prod и --reset несовместимы: --reset удалит dist/, а --prod требует build artifacts.');
  exit(1);
}

// TUI активен ТОЛЬКО когда --tail + TTY + не отключён через NO_TUI=1
function useTui() {
  return flags.tail && !!stdout.isTTY && !env.NO_TUI;
}

if (flags.help) {
  console.log(`
start.mjs — единый кросс-платформенный запуск kppdf-8.0

Использование:
  node start.mjs                # полный запуск (dev mode)
  node start.mjs --tail         # TUI-режим: live-логи в одном TTY-окне
  node start.mjs --check        # только pre-flight проверки
  node start.mjs --stop         # остановить запущенные процессы
  node start.mjs --reset        # полный сброс (down -v + pkill + rm node_modules)
  node start.mjs --no-browser   # не открывать браузер
  node start.mjs --prod         # PRODUCTION mode: pnpm build + node dist/main.js + static server
  node start.mjs --prod --no-build  # skip rebuild (use existing dist/)
  node start.mjs --help         # показать эту справку

TUI-режим (--tail):
  - TTY-only, рисует 3 строки статуса (Mongo / Backend / Frontend) с in-place обновлением
  - Каждая строка: [icon] [name] [status] [elapsed] [health-latency] [last-log]
  - Финальный "Ready" экран с /api/health латентностями
  - Отключить TUI (CI / пайп-режим): NO_TUI=1 node start.mjs

Production mode (--prod):
  - Backend:  pnpm build → node backend/dist/main.js  (NODE_ENV=production)
  - Frontend: pnpm build → inline static server from frontend/dist/frontend/browser/
  - Bundle sizes shown in Ready panel
  - Caveat: local prod-like testing only; for real prod use nginx/PM2/Docker (TZ-43+)

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

// Кеш resolved binary paths. getVersion() вызывается 3+ раз в preflight — без кеша
// каждый раз spawnSync('where pnpm'). Кеш in-memory, reset при рестарте скрипта.
const binCache = new Map();

/**
 * Резолвит путь к binary через `where` (Win) / `which` (Unix).
 * Возвращает полный путь или null (если не найден).
 * Без shell:true — DEP0190 fix (TZ-44).
 */
function resolveBin(name) {
  if (binCache.has(name)) return binCache.get(name);
  const r = spawnSync(isWin ? 'where' : 'which', [name], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const found = r.stdout.split(/\r?\n/)[0].trim();
  if (!found) return null;
  binCache.set(name, found);
  return found;
}

function getVersion(cmd, args = ['--version']) {
  try {
    const bin = resolveBin(cmd);
    if (!bin) return null;
    const r = spawnSync(bin, args, { encoding: 'utf8' });
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
        log.ok(`${label} готов за ${elapsed}s (${attempt} попыток, health ${health.latencyMs}ms)`);
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
      log.dim(`всё ещё ждём ${label}… (${Math.round((Date.now() - start) / 1000)}s)`);
    }
    await sleep(2000);
  }
  log.err(`${label} НЕ готов после ${Math.round(timeoutMs / 1000)}s`);
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
  log.step(1, 'Проверка окружения');
  let ok = true;
  const detected = [];

  // Node
  const nodeVer = getVersion('node');
  if (!nodeVer || nodeVer < 20) {
    log.err(`Node 20+ не найден (есть: ${nodeVer ?? 'не установлен'})`);
    ok = false;
  } else {
    detected.push(`Node ${nodeVer}`);
  }

  // pnpm
  let pnpmVer = null;
  if (!which('pnpm')) {
    log.err('pnpm не найден. Установите: npm i -g pnpm');
    ok = false;
  } else {
    pnpmVer = getVersion('pnpm');
    detected.push(`pnpm ${pnpmVer}`);
  }

  // Docker
  let dockerVer = null;
  if (!which('docker')) {
    log.err('Docker не найден. Установите Docker Desktop: https://www.docker.com/products/docker-desktop');
    ok = false;
  } else {
    dockerVer = getVersion('docker', ['--version']);
    detected.push(`Docker ${dockerVer}`);

    const r = spawnSync('docker', ['info'], { stdio: 'pipe', encoding: 'utf8' });
    if (r.status !== 0) {
      log.err('Docker daemon не запущен. Запустите Docker Desktop.');
      if (r.stderr) process.stderr.write(r.stderr);
      ok = false;
    } else {
      detected.push('daemon ✓');
    }
  }

  // .env
  if (!existsSync(join(ROOT, '.env'))) {
    log.err('.env не найден. Скопируйте .env.example → .env и настройте.');
    ok = false;
  } else {
    detected.push('.env ✓');
  }

  // project structure
  const haveBackend = existsSync(join(BACKEND_DIR, 'package.json'));
  const haveFrontend = existsSync(join(FRONTEND_DIR, 'package.json'));
  if (!haveBackend) { log.err(`backend/package.json не найден в ${BACKEND_DIR}`); ok = false; }
  if (!haveFrontend) { log.err(`frontend/package.json не найден в ${FRONTEND_DIR}`); ok = false; }

  if (ok) {
    // Одна сводная строка вместо 5 отдельных (TZ-46: краткость)
    log.ok(`${detected.join(' · ')}`);
  }

  // ports free? — fail hard if backend/frontend occupied, warn for Mongo (might be expected)
  for (const [name, port] of Object.entries(PORTS)) {
    const inUse = await isPortInUse(port);
    if (!inUse) continue;
    if (name === 'mongo') {
      log.warn(`Порт ${port} (${name}) занят — считаем внешним Mongo, продолжаем`);
    } else {
      log.err(`Порт ${port} (${name}) занят — остановите процесс или запустите \`node start.mjs --stop\``);
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
  log.step(2, 'Запуск MongoDB (replica set rs0)');
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
  log.ok('Mongo контейнеры запущены');
}

async function waitMongo() {
  log.step(3, 'Ожидание готовности Mongo replica set');
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
      log.ok(`Mongo готов за ${Math.round((Date.now() - start) / 1000)}s`);
      return true;
    }
    await sleep(3000);
  }
  state.services.mongo.status = 'failed';
  if (useTui()) renderStatus();
  log.err(`Mongo не готов после ${timeoutMs / 1000}s`);
  return false;
}

// ---------- deps ----------
function installDeps(dir, name) {
  if (existsSync(join(dir, 'node_modules'))) {
    log.dim(`${name}: зависимости уже установлены`);
    return;
  }
  log.info(`Установка зависимостей ${name} (~30-60s)…`);
  // В TUI режиме — перехватываем pnpm output (иначе сломает in-place обновление)
  const stdio = useTui() ? 'pipe' : 'inherit';
  const pnpmBin = resolveBin('pnpm');
  if (!pnpmBin) throw new Error('pnpm not found in PATH');
  const r = spawnSync(pnpmBin, ['install', '--prefer-offline'], {
    cwd: dir,
    stdio,
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`pnpm install failed in ${name}`);
  log.ok(`${name}: зависимости установлены`);
}

// ---------- spawn dev servers ----------
function spawnDetached(cmd, args, cwd, name, envExtra = {}) {
  // detached + new process group on Unix so we can kill tree; on Windows taskkill /T
  const bin = resolveBin(cmd);
  if (!bin) {
    log.err(`${cmd} not found in PATH`);
    throw new Error(`${cmd} binary not found`);
  }
  // DEP0190 fix (TZ-44): без shell, child.pid — pnpm.cmd напрямую (не cmd.exe wrapper).
  const child = spawn(bin, args, {
    cwd,
    env: { ...env, ...envExtra, FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: !isWin,
    windowsHide: true,
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

// ---------- prod build helpers ----------
function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getDirectorySize(dir) {
  let total = 0;
  if (!existsSync(dir)) return 0;
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else total += statSync(p).size;
    }
  };
  walk(dir);
  return total;
}

function buildBackend() {
  log.step(3.5, 'Сборка backend (production)');
  if (flags.noBuild && existsSync(join(BACKEND_DIR, 'dist', 'main.js'))) {
    log.info('--no-build: используем существующий dist/main.js');
  } else {
    const pnpmBin = resolveBin('pnpm');
    if (!pnpmBin) throw new Error('pnpm not found in PATH');
    const r = spawnSync(pnpmBin, ['build'], {
      cwd: BACKEND_DIR,
      stdio: useTui() ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
    if (r.status !== 0) throw new Error('backend pnpm build failed');
  }
  const out = join(BACKEND_DIR, 'dist', 'main.js');
  if (!existsSync(out)) throw new Error('backend build did not produce dist/main.js');
  const size = statSync(out).size;
  log.ok(`backend/dist/main.js готов (${humanSize(size)})`);
  return { entry: out, size };
}

function buildFrontend() {
  log.step(3.6, 'Сборка frontend (production)');
  const feDir = join(FRONTEND_DIR, 'dist', 'frontend', 'browser');
  if (flags.noBuild && existsSync(join(feDir, 'index.html'))) {
    log.info('--no-build: используем существующий dist/frontend/browser/');
  } else {
    const pnpmBin = resolveBin('pnpm');
    if (!pnpmBin) throw new Error('pnpm not found in PATH');
    const r = spawnSync(pnpmBin, ['build'], {
      cwd: FRONTEND_DIR,
      stdio: useTui() ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
    if (r.status !== 0) throw new Error('frontend pnpm build failed');
  }
  if (!existsSync(join(feDir, 'index.html'))) {
    throw new Error('frontend build did not produce dist/frontend/browser/index.html');
  }
  const size = getDirectorySize(feDir);
  log.ok(`frontend/dist/frontend/browser/ готов (${humanSize(size)} всего)`);
  return { dir: feDir, size };
}

// ---------- inline static file server (prod mode) ----------
const STATIC_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
};

function serveStatic(rootDir, port) {
  const normalizedRoot = normalize(rootDir);
  const server = createServer((req, res) => {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    // Path traversal protection
    let filePath = normalize(join(normalizedRoot, u.pathname));
    if (!filePath.startsWith(normalizedRoot + sep) && filePath !== normalizedRoot) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        // fallback to index.html for directory access
        throw new Error('is dir');
      }
      const mime = STATIC_MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
      const isHashed = u.pathname.startsWith('/assets/');
      const headers = {
        'Content-Type': mime,
        'Content-Length': stat.size,
      };
      if (isHashed) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      } else if (extname(filePath).toLowerCase() === '.html') {
        headers['Cache-Control'] = 'no-cache';
      }
      res.writeHead(200, headers);
      createReadStream(filePath).pipe(res);
    } catch {
      // SPA fallback — отдаём index.html для любого не-файла
      try {
        const idx = readFileSync(join(normalizedRoot, 'index.html'));
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        });
        res.end(idx);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    }
  });
  server.on('error', (e) => log.err(`static server error: ${e.message}`));
  server.listen(port, '0.0.0.0', () => {
    log.ok(`static server listening on http://localhost:${port} (root: ${rootDir})`);
  });
  return server;
}

// ---------- final ready panel ----------
// Компактная 2D панель: ASCII-рамка + summary + 2 колонки endpoints. Заменяет
// длинный «простынный» вывод из TZ-41 на короткий читаемый результат.
function printReadyPanel() {
  const s = state.services;
  const totalReady = [s.mongo, s.backend, s.frontend].filter((x) => x.status === 'ready').length;
  const earliest = Math.min(
    ...[s.mongo, s.backend, s.frontend]
      .filter((x) => x.startedAt && x.readyAt)
      .map((x) => x.readyAt - x.startedAt),
  );
  const totalSec = isFinite(earliest) ? Math.round(earliest / 1000) + 's' : '—';

  const border = `${c.bold}${c.green}╔════════════════════════════════════════════════════════╗${c.reset}`;
  const footer = `${c.bold}${c.green}╚════════════════════════════════════════════════════════╝${c.reset}`;
  const mode = flags.prod ? `${c.yellow} (PRODUCTION)${c.reset}` : '';

  console.log('');
  console.log(border);
  console.log(`${c.bold}${c.green}║${c.reset}   ${c.bold}✦ kppdf-8.0 готов к работе${mode.padEnd(36)}${c.reset}${c.bold}${c.green}║${c.reset}`);
  console.log(footer);
  console.log('');

  if (totalReady === 3) {
    console.log(`  ${c.cyan}⏱${c.reset}  Все сервисы готовы за ${c.bold}${totalSec}${c.reset}`);
  } else {
    console.log(`  ${c.yellow}⚠${c.reset}  Готово ${totalReady}/3 сервисов за ${c.bold}${totalSec}${c.reset}`);
  }

  // Prod-specific: bundle sizes
  if (flags.prod && prodBackend && prodFrontend) {
    console.log(`  ${c.cyan}📦${c.reset} Backend ${c.dim}${humanSize(prodBackend.size)}${c.reset} · Frontend ${c.dim}${humanSize(prodFrontend.size)}${c.reset}`);
  }

  console.log('');
  // 2-col endpoints (frontend | login)
  const left = [
    [`${c.cyan}🖥${c.reset}  Frontend`, `${HOSTS.frontend}`],
    [`${c.cyan}📦${c.reset}  Backend`,  `${HOSTS.backend}/api/health`],
  ];
  const right = [
    [`${c.cyan}👤${c.reset}  Логин`,    `admin@kppdf.local / admin`],
    [`${c.cyan}📋${c.reset}  Showcase`, `${HOSTS.frontend}/p/showcase`],
  ];
  // Динамическая ширина: используем ширину терминала, но не менее 80 и не более 120
  const termW = Math.max(80, Math.min(120, stdout.columns || 100));
  const W = Math.floor(termW / 2); // левая колонка занимает половину терминала
  for (let i = 0; i < 2; i++) {
    const lLabel = left[i][0].padEnd(15, ' ');
    const lValue = left[i][1];
    const rLabel = right[i][0];
    const rValue = right[i][1];
    // 2-col: [ 2sp ] [icon+label padded] [value padded to W] [icon+label] [value]
    const leftPart = `  ${lLabel}${lValue}`;
    const pad = Math.max(2, W - leftPart.length);
    console.log(`${leftPart}${' '.repeat(pad)}${rLabel}  ${rValue}`);
  }

  console.log('');
  console.log(`  ${c.dim}ℹ${c.reset}  ${c.dim}NO_TUI=1 отключает TUI (для CI / пайп-режима)${c.reset}`);
  console.log('');
}

// ---------- main ----------
async function main() {
  const banner = flags.prod
    ? `${c.bold}${c.yellow}━━ kppdf-8.0 PRODUCTION ━━${c.reset}\n${c.dim}  Backend: dist/main.js (NODE_ENV=production) · Frontend: static server${c.reset}`
    : `${c.bold}${c.magenta}━━ kppdf-8.0 local starter ━━${c.reset}\n${c.dim}  Mongo + Backend (NestJS) + Frontend (Angular 20)${c.reset}`;
  console.log(banner);

  // ---- STOP mode ----
  if (flags.stop) {
    const pids = readPids();
    if (!pids) {
      log.warn('PID-файл не найден. Нечего останавливать.');
      return;
    }
    log.info('Остановка фоновых процессов…');
    for (const k of Object.keys(pids)) {
      killTree(pids[k]);
      log.ok(`остановлен ${k} (pid ${pids[k]})`);
    }
    clearPids();
    // also stop mongo via docker
    spawnSync('docker', ['compose', 'down'], { cwd: ROOT, stdio: 'inherit' });
    log.ok('готово');
    return;
  }

  // ---- RESET mode ----
  if (flags.reset) {
    log.warn('RESET: удаление контейнеров, томов, node_modules…');
    spawnSync('docker', ['compose', 'down', '-v'], { cwd: ROOT, stdio: 'inherit' });
    for (const d of [BACKEND_DIR, FRONTEND_DIR]) {
      const nm = join(d, 'node_modules');
      if (existsSync(nm)) {
        rmSync(nm, { recursive: true, force: true });
        log.ok(`удалён ${nm}`);
      }
    }
    clearPids();
    log.ok('сброс выполнен. Запустите: node start.mjs');
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
    log.err('Проверка окружения не пройдена. Исправьте ошибки и перезапустите.');
    exit(1);
  }

  // Mongo
  await startMongo();
  const mongoOk = await waitMongo();
  if (!mongoOk) {
    log.err('Mongo не готов. Проверьте: docker compose logs mongo');
    exit(1);
  }

  // Deps
  log.step(4, 'Установка зависимостей (пропускается если node_modules уже есть)');
  installDeps(BACKEND_DIR, 'backend');
  installDeps(FRONTEND_DIR, 'frontend');

  // Prod build (if --prod)
  let prodBackend = null;
  let prodFrontend = null;
  if (flags.prod) {
    prodBackend = buildBackend();
    prodFrontend = buildFrontend();
  }

  // Spawn
  log.step(5, 'Запуск backend + frontend (detached, логи в pipe)');

  // Clean up any prior pid file
  const prior = readPids();
  if (prior) {
    log.info('очистка предыдущих фоновых процессов…');
    for (const k of Object.keys(prior)) killTree(prior[k]);
    clearPids();
  }

  // Backend
  let backend;
  if (flags.prod) {
    const nodeBin = resolveBin('node');
    if (!nodeBin) throw new Error('node not found in PATH');
    backend = spawnDetached(nodeBin, [prodBackend.entry], BACKEND_DIR, 'backend', { NODE_ENV: 'production' });
  } else {
    backend = spawnDetached('pnpm', ['start:dev'], BACKEND_DIR, 'backend');
  }

  // Frontend
  let frontend = null;          // dev mode: child process pnpm start
  let frontendStaticServer = null; // prod mode: inline static server
  if (flags.prod) {
    // Inline static server (blocking server, not child process)
    state.services.frontend.startedAt = Date.now();
    state.services.frontend.status = 'starting';
    if (useTui()) renderStatus();
    frontendStaticServer = serveStatic(prodFrontend.dir, PORTS.frontend);
    // Mark as ready immediately (no polling needed; if listen() errors, we'll see it)
    state.services.frontend.status = 'ready';
    state.services.frontend.readyAt = Date.now();
  } else {
    frontend = spawnDetached('pnpm', ['start'], FRONTEND_DIR, 'frontend');
  }

  writePids({ backend: backend.pid, frontend: frontendStaticServer ? null : frontend.pid, startedAt: new Date().toISOString() });
  log.ok(`backend pid=${backend.pid}${frontendStaticServer ? '' : `, frontend pid=${frontend.pid}`}`);
  // На Windows child.pid теперь pnpm.cmd напрямую (DEP0190 fix, TZ-44). Раньше был
  // cmd.exe wrapper — теперь PIDs в .start.pids.json точные и можно kill через taskkill /T /F.

  // Wait for endpoints
  log.step(6, 'Ожидание готовности endpoints');
  const backendOk = await waitFor(`${HOSTS.backend}/api/health`, 'backend /api/health', 120000, 'backend');
  const frontendOk = await waitFor(HOSTS.frontend, 'frontend', 180000, 'frontend');

  if (!backendOk || !frontendOk) {
    log.err('Один или несколько сервисов не стартовали вовремя.');
    log.dim('Смотрите логи выше. Для остановки: node start.mjs --stop');
    // do not exit — let user inspect live logs
  } else {
    log.step(7, 'Готово');
    // В TUI режиме — освобождаем TUI зону (1 пустая строка), затем печатаем панель
    if (state.tuiActive) {
      process.stdout.write('\n');
      state.tuiActive = false;
    }
    printReadyPanel();

    if (!flags.noBrowser) {
      try {
        openBrowser(HOSTS.frontend);
        log.ok(`открыт ${HOSTS.frontend} в браузере по умолчанию`);
      } catch (e) {
        log.warn(`не удалось открыть браузер: ${e.message}`);
      }
    }
  }

  // Cleanup handler
  const cleanup = (sig) => {
    log.warn(`получен ${sig}, останавливаем…`);
    try {
      if (frontendStaticServer) frontendStaticServer.close();
      killTree(backend.pid);
      if (frontend) killTree(frontend.pid);
    } catch {}
    clearPids();
    // leave mongo running — user can docker compose down manually
    log.ok('пока');
    exit(0);
  };
  process.on('SIGINT', () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));

  log.dim('Ctrl+C — остановить backend + frontend (Mongo продолжает работать)');
  // keep process alive
  await new Promise(() => {});
}

function openBrowser(url) {
  let cmd, args;
  if (isMac) {
    cmd = 'open'; args = [url];
  } else if (isWin) {
    // `start` is a cmd built-in. Чтобы избежать shell:true, используем cmd.exe напрямую
    // через resolveBin (на Windows cmd есть в System32, не требует shell).
    cmd = resolveBin('cmd') || 'cmd.exe';
    args = ['/c', 'start', '""', url];
  } else {
    cmd = 'xdg-open'; args = [url];
  }
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
  child.unref();
}

// ---------- entry ----------
main().catch((e) => {
  log.err(e.stack || e.message || String(e));
  exit(1);
});
