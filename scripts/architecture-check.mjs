#!/usr/bin/env node
/**
 * scripts/architecture-check.mjs
 *
 * Lightweight import-boundary gate for kppdf (Nest + Angular).
 * Inspired by vibe `architecture:check`, adapted to our layout (no DDD folders / no packages/contracts yet).
 *
 * Usage:
 *   node scripts/architecture-check.mjs
 *   node scripts/architecture-check.mjs --write-baseline
 *   node scripts/architecture-check.mjs --no-baseline   # fail on every hit
 *
 * Exit 0 = pass (no NEW violations vs baseline, or zero if --no-baseline and clean)
 * Exit 1 = new violations
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = path.join(repositoryRoot, 'scripts', 'architecture-check.baseline.json');
const sourceRoots = ['backend/src', 'frontend/src/app'];
const sourceExtension = /\.(?:[cm]?[jt]sx?)$/;
const importPattern =
  /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;

const args = new Set(process.argv.slice(2));
const writeBaseline = args.has('--write-baseline');
const noBaseline = args.has('--no-baseline');

function normalizePath(p) {
  return p.split(path.sep).join('/');
}

function packageMatches(specifier, name) {
  return specifier === name || specifier.startsWith(`${name}/`);
}

async function collectSourceFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      out.push(...(await collectSourceFiles(full)));
    } else if (sourceExtension.test(entry.name) && !entry.name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

function staticImports(source) {
  const found = [];
  importPattern.lastIndex = 0;
  let match;
  while ((match = importPattern.exec(source))) {
    const line = source.slice(0, match.index).split('\n').length;
    found.push({ specifier: match[1], line });
  }
  return found;
}

function resolveRepositoryImport(importer, specifier) {
  if (specifier.startsWith('.')) {
    return normalizePath(path.normalize(path.join(path.dirname(importer), specifier)));
  }
  return null;
}

function checkFrontend(filePath, specifier, report) {
  if (!filePath.startsWith('frontend/src/app/')) return;

  const target = resolveRepositoryImport(filePath, specifier);
  if (!target || !target.startsWith('frontend/src/app/')) return;

  const isSharedUi =
    filePath.startsWith('frontend/src/app/shared/ui/') ||
    filePath.startsWith('frontend/src/app/shared/page/') ||
    filePath.startsWith('frontend/src/app/shared/dsl/');
  const targetIsPage = target.includes('/pages/');

  if (isSharedUi && targetIsPage) {
    report(
      'fe-shared-must-not-import-pages',
      `shared UI/page/dsl must not import product pages (${specifier}). Extract a shared panel or inject via input.`,
    );
  }

  const sourcePage = filePath.match(/^frontend\/src\/app\/pages\/([^/]+)\//)?.[1];
  const targetPage = target.match(/^frontend\/src\/app\/pages\/([^/]+)(?:\/(.*))?$/);
  if (sourcePage && targetPage && targetPage[1] !== sourcePage) {
    const rest = targetPage[2] || '';
    // Allow *.service.ts / *.entity.ts / public barrels across pages; flag deep component pulls.
    if (/\.component(?:\.ts)?$/.test(rest) || rest.includes('.component.')) {
      report(
        'fe-page-cross-component',
        `page "${sourcePage}" must not import another page's component (${specifier}); share via shared/ or a service API.`,
      );
    }
  }
}

function checkBackend(filePath, specifier, report) {
  if (!filePath.startsWith('backend/src/modules/')) return;

  const sourceModule = filePath.match(/^backend\/src\/modules\/([^/]+)\//)?.[1];
  const target = resolveRepositoryImport(filePath, specifier);
  if (!sourceModule || !target) return;

  const match = target.match(/^backend\/src\/modules\/([^/]+)(?:\/(.*))?$/);
  if (!match || match[1] === sourceModule) return;

  const rest = match[2] || '';
  if (/\.controller(?:\.ts)?$/.test(rest) || rest.includes('.controller.')) {
    report(
      'be-no-cross-controller-import',
      `module "${sourceModule}" must not import controller from "${match[1]}" (${specifier}); use Nest module exports / services.`,
    );
  }
}

export function checkArchitectureSources(files) {
  const violations = [];

  for (const file of files) {
    const normalizedPath = normalizePath(file.path);
    const imports = staticImports(file.source);

    for (const imported of imports) {
      const report = (rule, message) => {
        violations.push({
          path: normalizedPath,
          line: imported.line,
          rule,
          message,
          key: `${normalizedPath}:${imported.line}:${rule}`,
        });
      };

      checkFrontend(normalizedPath, imported.specifier, report);
      checkBackend(normalizedPath, imported.specifier, report);
    }
  }

  return violations.sort(
    (a, b) =>
      a.path.localeCompare(b.path) || a.line - b.line || a.rule.localeCompare(b.rule),
  );
}

async function loadBaseline() {
  try {
    const raw = await readFile(baselinePath, 'utf8');
    const json = JSON.parse(raw);
    return new Set(Array.isArray(json.keys) ? json.keys : []);
  } catch {
    return new Set();
  }
}

async function main() {
  const files = [];
  for (const sourceRoot of sourceRoots) {
    const absoluteRoot = path.join(repositoryRoot, sourceRoot);
    for (const filePath of await collectSourceFiles(absoluteRoot)) {
      files.push({
        path: path.relative(repositoryRoot, filePath),
        source: await readFile(filePath, 'utf8'),
      });
    }
  }

  const violations = checkArchitectureSources(files);

  if (writeBaseline) {
    const payload = {
      generatedAt: new Date().toISOString(),
      fileCount: files.length,
      keys: violations.map((v) => v.key),
    };
    await writeFile(baselinePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(
      `Wrote baseline (${violations.length} keys) → scripts/architecture-check.baseline.json`,
    );
    return;
  }

  if (noBaseline) {
    if (violations.length === 0) {
      console.log(`Architecture check passed (${files.length} source files, 0 violations).`);
      return;
    }
    for (const v of violations) {
      console.error(`${v.path}:${v.line} [${v.rule}] ${v.message}`);
    }
    console.error(`\n${violations.length} violation(s). Fix or use baseline mode.`);
    process.exitCode = 1;
    return;
  }

  const baseline = await loadBaseline();
  if (baseline.size === 0 && violations.length > 0) {
    console.error(
      'No baseline found, but violations exist. Run:\n  node scripts/architecture-check.mjs --write-baseline\nthen commit scripts/architecture-check.baseline.json',
    );
    for (const v of violations.slice(0, 20)) {
      console.error(`${v.path}:${v.line} [${v.rule}] ${v.message}`);
    }
    if (violations.length > 20) console.error(`… and ${violations.length - 20} more`);
    process.exitCode = 1;
    return;
  }

  const fresh = violations.filter((v) => !baseline.has(v.key));
  const resolved = [...baseline].filter((k) => !violations.some((v) => v.key === k));

  if (fresh.length === 0) {
    console.log(
      `Architecture check passed (${files.length} files; baseline ${baseline.size}; resolved since baseline: ${resolved.length}).`,
    );
    if (resolved.length > 0) {
      console.log(
        'Tip: some baseline keys are gone — refresh with --write-baseline when convenient.',
      );
    }
    return;
  }

  console.error(`New architecture violations (${fresh.length}):`);
  for (const v of fresh) {
    console.error(`${v.path}:${v.line} [${v.rule}] ${v.message}`);
  }
  process.exitCode = 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
