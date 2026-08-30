#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['frontend/src/app/shared/ui', 'frontend-nx/libs/ui/paper-and-ink/src'];
const rawArgs = process.argv.slice(2);
const rootsArg = rawArgs.find((arg) => arg.startsWith('--roots='));
const scopedRoots = rootsArg ? rootsArg.slice('--roots='.length).split(',').filter(Boolean) : null;
const baselinePath = path.join(root, 'scripts', 'check-ui-tokens.nx-baseline.json');
const writeBaselinePath = path.join(root, 'scripts', 'check-ui-tokens.nx-baseline.json');
const forbidden = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;

async function filesIn(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
  const result = [];
  for (const entry of entries) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await filesIn(file)));
    else if (/\.(?:css|scss|ts|html)$/.test(entry.name)) result.push(file);
  }
  return result;
}

const violations = [];
const roots = scopedRoots ?? sourceRoots;
for (const relativeRoot of roots) {
  for (const file of await filesIn(path.join(root, relativeRoot))) {
    const source = await readFile(file, 'utf8');
    source.split(/\r?\n/).forEach((line, index) => {
      if (forbidden.test(line)) {
        violations.push(`${path.relative(root, file).replaceAll(path.sep, '/')}:${index + 1}`);
      }
      forbidden.lastIndex = 0;
    });
  }
}

const writeBaseline = rawArgs.includes('--write-baseline');
const nxMode = Boolean(scopedRoots);
if (writeBaseline) {
  if (!nxMode) throw new Error('--write-baseline requires --roots=...');
  const payload = { generatedAt: new Date().toISOString(), keys: violations };
  await import('node:fs/promises').then(({ writeFile }) => writeFile(writeBaselinePath, `${JSON.stringify(payload, null, 2)}\n`));
  console.log(`Wrote UI token baseline (${violations.length} keys).`);
} else if (nxMode) {
  let baseline = new Set();
  try {
    const { readFile } = await import('node:fs/promises');
    baseline = new Set((JSON.parse(await readFile(baselinePath, 'utf8')).keys ?? []));
  } catch {
    console.error(`Missing NX token baseline: ${baselinePath}`);
    process.exitCode = 1;
  }
  const fresh = violations.filter((item) => !baseline.has(item));
  if (fresh.length) {
    console.error(`New NX UI token violations (${fresh.length}):`);
    fresh.forEach((item) => console.error(item));
    process.exitCode = 1;
  } else if (process.exitCode !== 1) {
    console.log(`NX UI token check passed (${violations.length} baseline occurrences).`);
  }
} else if (violations.length) {
  console.error(`UI token check failed (${violations.length} raw color occurrence(s)):`);
  violations.forEach((item) => console.error(item));
  process.exitCode = 1;
} else {
  console.log('UI token check passed (no raw hex/rgb colors).');
}
