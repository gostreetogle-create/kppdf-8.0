import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AI_RUNNER_DIR_ENV,
  BUNDLED_RUNNER_MISSING,
  envAiRunnerDir,
  nodeArgsForPlan,
  resolveAiLaunchPlan,
  walkUpToPackage,
  type AiPathIo,
} from './aiRunner';

function mockIo(files: string[]): AiPathIo {
  const set = new Set(files);
  return {
    join: async (...parts: string[]) => parts.join('\\').replace(/\\+/g, '\\'),
    exists: async (p: string) => set.has(p),
  };
}

const DEV_DIR = 'C:\\repo\\desktop';
const DEV_ENTRY = 'C:\\repo\\desktop\\src\\ai-runner\\index.ts';
const DEV_TSX = 'C:\\repo\\desktop\\node_modules\\tsx\\dist\\cli.mjs';
const NSIS_RES = 'C:\\Program Files\\KPPDF Desktop';
const NSIS_MJS = 'C:\\Program Files\\KPPDF Desktop\\ai-runner\\ai-runner.mjs';

test('walkUpToPackage находит каталог пакета при обходе вверх', async () => {
  const names: Record<string, string | null> = {
    'C:\\app\\desktop\\src-tauri': null,
    'C:\\app\\desktop': 'kppdf-desktop',
  };
  const parentOf = async (dir: string) => {
    const map: Record<string, string | null> = {
      'C:\\app\\desktop\\src-tauri': 'C:\\app\\desktop',
      'C:\\app\\desktop': 'C:\\app',
      'C:\\app': null,
    };
    return map[dir] ?? null;
  };
  const found = await walkUpToPackage('C:\\app\\desktop\\src-tauri', (dir) => names[dir] ?? null, parentOf);
  assert.equal(found, 'C:\\app\\desktop');
});

test('walkUpToPackage не бросает «path does not have a parent» на корне (release layout)', async () => {
  // parentOf возвращает null на корне диска — как dirname() в установленном NSIS-билде.
  const parentOf = async () => null;
  const found = await walkUpToPackage('C:\\', async () => null, parentOf);
  assert.equal(found, null);
});

test('walkUpToPackage возвращает null, когда пакет не найден до корня', async () => {
  const parentOf = async (dir: string) => {
    if (dir === 'C:\\') return null;
    return dir.length > 3 ? dir.slice(0, dir.lastIndexOf('\\')) || 'C:\\' : null;
  };
  const found = await walkUpToPackage('C:\\Program Files\\KPPDF Desktop', async () => null, parentOf);
  assert.equal(found, null);
});

test('envAiRunnerDir читает KPPDF_AI_RUNNER_DIR из process.env', () => {
  const prev = process.env[AI_RUNNER_DIR_ENV];
  try {
    process.env[AI_RUNNER_DIR_ENV] = 'D:\\kppdf-8.0\\desktop';
    assert.equal(envAiRunnerDir(), 'D:\\kppdf-8.0\\desktop');
    delete process.env[AI_RUNNER_DIR_ENV];
    assert.equal(envAiRunnerDir(), undefined);
  } finally {
    if (prev === undefined) delete process.env[AI_RUNNER_DIR_ENV];
    else process.env[AI_RUNNER_DIR_ENV] = prev;
  }
});

test('resolveAiLaunchPlan: NSIS resource без src → bundled, без tsx и без env monorepo', async () => {
  const io = mockIo([NSIS_MJS]);
  const resolved = await resolveAiLaunchPlan(io, {
    resourceDirPath: NSIS_RES,
    desktopDir: 'C:\\Program Files\\KPPDF Desktop\\_up_',
  });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.plan.kind, 'bundled');
  assert.equal(resolved.plan.entry, NSIS_MJS);
  assert.equal(resolved.plan.cwd, 'C:\\Program Files\\KPPDF Desktop\\ai-runner');
  assert.deepEqual(nodeArgsForPlan(resolved.plan), [NSIS_MJS]);
  assert.deepEqual(nodeArgsForPlan(resolved.plan, ['--specs']), [NSIS_MJS, '--specs']);
});

test('resolveAiLaunchPlan: tauri dev (src+tsx) побеждает leftover bundled mjs', async () => {
  const leftover = 'C:\\repo\\desktop\\src-tauri\\resources\\ai-runner\\ai-runner.mjs';
  const io = mockIo([DEV_ENTRY, DEV_TSX, leftover]);
  const resolved = await resolveAiLaunchPlan(io, {
    resourceDirPath: 'C:\\repo\\desktop\\src-tauri',
    desktopDir: DEV_DIR,
  });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.plan.kind, 'dev');
  if (resolved.plan.kind !== 'dev') return;
  assert.deepEqual(nodeArgsForPlan(resolved.plan), [DEV_TSX, DEV_ENTRY]);
});

test('resolveAiLaunchPlan: env-каталог с ai-runner.mjs — bundled без monorepo', async () => {
  const envDir = 'D:\\tmp\\ai-sidecars';
  const entry = `${envDir}\\ai-runner.mjs`;
  const io = mockIo([entry]);
  const resolved = await resolveAiLaunchPlan(io, {
    envDir,
    resourceDirPath: NSIS_RES,
    desktopDir: DEV_DIR,
  });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.plan.kind, 'bundled');
  assert.equal(resolved.plan.entry, entry);
});

test('resolveAiLaunchPlan: нет src и нет bundle → RU без path does not have a parent', async () => {
  const io = mockIo([]);
  const resolved = await resolveAiLaunchPlan(io, {
    resourceDirPath: NSIS_RES,
    desktopDir: NSIS_RES,
  });
  assert.equal(resolved.ok, false);
  if (resolved.ok) return;
  assert.equal(resolved.error, BUNDLED_RUNNER_MISSING);
  assert.equal(resolved.error.includes('path does not have a parent'), false);
});

