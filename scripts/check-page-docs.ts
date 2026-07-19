#!/usr/bin/env -S npx tsx
/**
 * scripts/check-page-docs.ts — TZ-141 Шаг 5.
 *
 * Проверяет, что для каждой *.page.ts в frontend/src/app/pages/
 * есть соответствующий docs/pages/<name>.page.md.
 *
 * Usage:
 *   npx tsx scripts/check-page-docs.ts
 *
 * Exit codes:
 *   0 — все страницы документированы ✅
 *   1 — есть недокументированные страницы ❌
 */

import { readdirSync, existsSync } from 'node:fs';
import { join, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Project root — resolved from script location: scripts/check-page-docs.ts → project root */
const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPTS_DIR, '..');
const PAGES_ROOT = join(ROOT, 'frontend/src/app/pages');
const DOCS_ROOT = join(ROOT, 'docs/pages');

/**
 * Recursively find all files matching a pattern in a directory.
 */
function findFiles(dir: string, suffix: string): string[] {
  const result: string[] = [];
  if (!existsSync(dir)) return result;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...findFiles(full, suffix));
    } else if (entry.name.endsWith(suffix)) {
      result.push(full);
    }
  }
  return result;
}

/**
 * Extract the stem name from a page file path.
 * E.g. "frontend/src/app/pages/products/products.page.ts" → "products"
 *       "frontend/src/app/pages/inventory/storage-items.page.ts" → "storage-items"
 */
function stemFromPage(filePath: string): string {
  const base = filePath.replace(/\.page\.ts$/, '');
  // Get just the filename without the directory
  return base.split(sep).pop() ?? base;
}

/**
 * Extract the stem name from a doc file path.
 * E.g. "docs/pages/products.page.md" → "products"
 */
function stemFromDoc(filePath: string): string {
  return filePath.replace(/\.page\.md$/, '').split(sep).pop() ?? filePath;
}

function main(): void {
  const pageFiles = findFiles(PAGES_ROOT, '.page.ts');
  const docFiles = findFiles(DOCS_ROOT, '.page.md');

  const pageStems = new Set(pageFiles.map(stemFromPage));
  const docStems = new Set(docFiles.map(stemFromDoc));

  // Find pages without docs
  const missing: string[] = [];
  for (const stem of pageStems) {
    if (!docStems.has(stem)) {
      missing.push(stem);
    }
  }

  // Secondary check: find docs without a corresponding page (orphans)
  const orphans: string[] = [];
  for (const stem of docStems) {
    if (!pageStems.has(stem)) {
      orphans.push(stem);
    }
  }

  const totalPages = pageStems.size;
  const totalDocs = docStems.size;
  const covered = totalPages - missing.length;

  console.log(`\n📋 Проверка документации страниц (TZ-141)`);
  console.log(`   ${'─'.repeat(48)}`);
  console.log(`   Всего страниц:         ${totalPages}`);
  console.log(`   Документировано:        ${covered}`);
  console.log(`   Без документации:      ${missing.length}`);
  console.log(`   Лишних .page.md:       ${orphans.length}\n`);

  if (missing.length > 0) {
    console.error(`❌ Страницы без документации:`);
    for (const name of missing.sort()) {
      console.error(`   - ${name}.page.ts → docs/pages/${name}.page.md`);
    }
    console.log();
    console.error(`   Создайте недостающие файлы из шаблона docs/pages/_template.md`);
    process.exit(1);
  }

  if (orphans.length > 0) {
    console.warn(`⚠️  Сиротские .page.md (нет соответствующей страницы):`);
    for (const name of orphans.sort()) {
      console.warn(`   - docs/pages/${name}.page.md`);
    }
    console.warn(`   Возможно, страница была удалена — удалите .md файл.\n`);
    // Don't exit with error for orphans — they're informative only.
  }

  console.log(`✅ Все ${totalPages} страниц документированы.`);
  console.log(`   docs/pages/README.md — актуальный индекс.\n`);
}

main();
