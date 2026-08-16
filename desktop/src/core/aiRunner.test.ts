import assert from 'node:assert/strict';
import test from 'node:test';
import { AI_RUNNER_DIR_ENV, envAiRunnerDir, walkUpToPackage } from './aiRunner';

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
