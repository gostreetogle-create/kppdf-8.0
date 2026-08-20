#!/usr/bin/env node
/**
 * SUPPLY-GATE — пре-коммит гейт раздела «Снабжение» (TZ-SUPPLY-312/313).
 *
 * Логика:
 *  1. Если закоммиченные/изменённые файлы не касаются контура снабжения/склада
 *     (supply, shipment, storage-item, warehouse, material, order, counterparty,
 *     site, photos, auth, app.module, scripts/smoke) — выходим молча (0).
 *  2. Иначе — жёсткий focused Jest по supply/shipment/storage-item/material
 *     (быстро, без инфраструктуры).
 *  3. Если локальный стенд поднят (backend /api/health 200) — дополнительно
 *     гоняем полный scripts/smoke/supply-smoke.mjs (auth, Mongo, склад,
 *     upload-хранилище, быстрый заказ → реестр → отгрузка) как жёсткий гейт.
 *     Если стенда нет — жёлтое предупреждение, не блокируем: полный smoke
 *     гарантированно выполняется в CI (.github/workflows/supply-smoke.yml).
 *
 * Usage:
 *   node scripts/smoke/supply-gate.mjs            # pre-commit hook
 *   node scripts/smoke/supply-gate.mjs --force    # прогнать независимо от diff
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

const RELEVANT = /(^|\/)(supply|shipment|storage-item|warehouse|material|order|counterparty|site|photos|auth)\/|backend\/src\/app\.module\.ts|scripts\/smoke\//;

const JEST_SUITES = [
  'src/modules/supply',
  'src/modules/shipment',
  'src/modules/storage-item',
  'src/modules/material',
];

const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

function changedFiles() {
  const run = (args) => {
    const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
    return r.status === 0 ? r.stdout.split('\n').map((s) => s.trim()).filter(Boolean) : [];
  };
  const staged = run(['diff', '--cached', '--name-only']);
  const unstaged = run(['diff', '--name-only']);
  const untracked = run(['ls-files', '--others', '--exclude-standard']);
  return new Set([...staged, ...unstaged, ...untracked]);
}

async function standUp() {
  // fetch вместо curl: на Windows curl с `-o /dev/null` выходит с кодом 23
  // (CURLE_WRITE_ERROR) и `status === 0` ложно падает, хотя в stdout — 200.
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch('http://127.0.0.1:3000/api/health', { signal: ctrl.signal });
      return res.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  return spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: true, ...opts });
}

async function main() {
  const files = changedFiles();
  const relevant = [...files].filter((f) => RELEVANT.test(f.replace(/\\/g, '/')));
  const touched = relevant.length > 0 || FORCE;

  if (!touched) {
    console.log(green('SUPPLY-GATE: контур снабжения не затронут — пропуск.'));
    process.exit(0);
  }

  console.log(yellow(`SUPPLY-GATE: затронуто ${relevant.length || '—'} файлов контура снабжения/склада${FORCE ? ' (--force)' : ''}`));

  // 1. Быстрый focused Jest (без инфраструктуры).
  const jest = run('pnpm', ['--dir', 'backend', 'exec', 'jest', '--silent', ...JEST_SUITES]);
  if (jest.status !== 0) {
    console.error(red('SUPPLY-GATE: focused Jest упал — блокирую коммит.'));
    process.exit(1);
  }
  console.log(green('SUPPLY-GATE: focused Jest PASS.'));

  // 2. Полный стендовый smoke, если стенд поднят.
  if (await standUp()) {
    console.log(yellow('SUPPLY-GATE: локальный стенд на :3000 доступен — гоняю полный smoke.'));
    const smoke = run('node', ['scripts/smoke/supply-smoke.mjs', 'http://127.0.0.1:3000']);
    if (smoke.status !== 0) {
      console.error(red('SUPPLY-GATE: стендовый smoke упал — блокирую коммит.'));
      process.exit(1);
    }
    console.log(green('SUPPLY-GATE: стендовый smoke PASS.'));
  } else {
    console.log(yellow('SUPPLY-GATE: стенд на :3000 не поднят — полный smoke пропущен (не блокер).'));
    console.log(yellow('  Полный smoke гарантированно выполнится в CI (.github/workflows/supply-smoke.yml).'));
    console.log(yellow('  Локально: node scripts/smoke/supply-smoke.mjs'));
  }

  console.log(green('SUPPLY-GATE: PASS.'));
  process.exit(0);
}

main().catch((e) => {
  console.error(red(`SUPPLY-GATE: crash — ${e.message}`));
  process.exit(2);
});
