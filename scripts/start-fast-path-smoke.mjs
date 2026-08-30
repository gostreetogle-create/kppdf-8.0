#!/usr/bin/env node
/**
 * Smoke harness for TZ-OPS-NX-start-fast-path.
 * Usage: node scripts/start-fast-path-smoke.mjs
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(ROOT, '.start-fast-path-smoke.log');
const READY_RE = /готов к работе/;
const REUSE_RE = /пересоздание контейнера не требуется/;
const TIMING_RE = /Все сервисы готовы за \d+s/;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runStop() {
  const r = spawnSync('node', ['start.mjs', '--stop'], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  return r.status === 0;
}

async function waitHealthyMongo(timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const inspect = spawnSync(
      'docker',
      ['inspect', '-f', '{{.State.Health.Status}}', 'kppdf-mongo'],
      { encoding: 'utf8', stdio: 'pipe' },
    );
    if (inspect.stdout?.trim() === 'healthy') return true;
    await sleep(2000);
  }
  return false;
}

async function runStartCycle(label) {
  if (existsSync(LOG)) unlinkSync(LOG);
  const child = spawn('node', ['start.mjs', '--nx', '--no-browser'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NO_TUI: '1' },
  });
  let out = '';
  child.stdout.on('data', (d) => {
    const s = d.toString();
    out += s;
    writeFileSync(LOG, out, 'utf8');
  });
  child.stderr.on('data', (d) => {
    const s = d.toString();
    out += s;
    writeFileSync(LOG, out, 'utf8');
  });

  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    if (READY_RE.test(out)) break;
    await sleep(2000);
  }
  if (!READY_RE.test(out)) {
    child.kill('SIGTERM');
    throw new Error(`${label}: timed out waiting for Ready panel`);
  }
  const timingOk = TIMING_RE.test(out);
  child.kill('SIGTERM');
  await sleep(2000);
  runStop();
  return { out, timingOk };
}

async function main() {
  console.log('smoke: cycle 1 (cold mongo)');
  runStop();
  const cold = await runStartCycle('cold');
  if (!cold.timingOk) throw new Error('cold: missing wall-clock timing line');

  console.log('smoke: prepare healthy mongo for reuse');
  spawnSync('docker', ['compose', 'up', '-d', 'mongo', 'mongo-init'], { cwd: ROOT, stdio: 'inherit' });
  if (!waitHealthyMongo()) throw new Error('mongo did not become healthy');

  console.log('smoke: cycle 2 (reuse mongo)');
  const warm = await runStartCycle('reuse');
  if (!REUSE_RE.test(warm.out)) {
    throw new Error('reuse: expected skip-recreate log line');
  }
  if (!warm.timingOk) throw new Error('reuse: missing wall-clock timing line');

  console.log('smoke: PASS (cold + reuse + timing + stop/restart)');
}

main().catch((e) => {
  console.error('smoke: FAIL', e.message);
  if (existsSync(LOG)) {
    console.error('--- log tail ---');
    const tail = readFileSync(LOG, 'utf8').split('\n').slice(-40).join('\n');
    console.error(tail);
  }
  process.exit(1);
});
