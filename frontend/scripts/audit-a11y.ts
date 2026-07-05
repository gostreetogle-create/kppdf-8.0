#!/usr/bin/env -S npx tsx
/**
 * scripts/audit-a11y.ts — TZ-79 axe-core a11y audit.
 *
 * Runs axe-core against all Paper & Ink lazy routes, forces light-mode
 * (audit canonical state) before each axe pass, and prints per-route
 * summary + full JSON + blocking-violation gate.
 *
 * Usage:
 *   pnpm run audit:a11y
 *   AUDIT_BASE=https://staging.example.com pnpm run audit:a11y
 *
 * Pre-requisite: dev server on http://localhost:4200 (or $AUDIT_BASE).
 *
 * Exit codes:
 *   0  zero serious/critical violations on every route  ← goal met
 *   1  blocking violations OR any route produced an audit-level error
 *   2  script-level error (dev server unreachable, axe inject failed, …)
 *
 * Implementation notes (compressed; full v1–v6 history in git log):
 *   · axe-core is shipped as a JS file (no `source` string export). Use
 *     `addScriptTag({ path: AXE_PATH })` to inline it into each page after
 *     `page.goto()` (which wipes `window.axe`).
 *   · `window.axe.run()` arg-1 is the CONTEXT (CSS selector or NodeList);
 *     arg-2 is the OPTIONS object. Passing rule tags as arg-1 makes axe
 *     interpret them as CSS selectors → silent "no elements found".
 *   · Distinguish per-route audit errors from clean 0-violation runs by
 *     tagging `RouteResult.error?: string`; gate treats both equally as
 *     blockers so a thrown axe.run never silently passes as compliant.
 *   · Force `<html>` to NOT have `.dark` before each axe pass so the
 *     audit canonicalizes on the light palette — dark mode has its own
 *     higher-contrast overrides and is verified separately (TODO TZ-82).
 */
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer';
import axeCore from 'axe-core';

interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  description?: string;
  help: string;
  helpUrl?: string;
  nodes: Array<{ target: string[] }>;
}
interface AxeRunResult {
  violations?: AxeViolation[];
}

const ROUTES = [
  '/overview',
  '/foundations',
  '/basics',
  '/forms',
  '/overlays',
  '/navigation',
  '/playground/code',
] as const;

const BASE = process.env['AUDIT_BASE'] ?? 'http://localhost:4200';
const SEVERITIES_BLOCKING = new Set(['serious', 'critical']);

interface RouteResult {
  route: string;
  violations: AxeViolation[];
  /** Non-null if axe.run or any earlier step threw; gate treats as blocker. */
  error?: string;
}

const require = createRequire(import.meta.url);
const AXE_PATH: string = require.resolve('axe-core');

const RUN_ONLY_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'best-practice',
];

async function forceLightMode(page: puppeteer.Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
}

async function main(): Promise<void> {
  const AXE_VERSION: string =
    typeof axeCore.version === 'string' ? axeCore.version : 'unknown';

  console.log(`\n axe-core ${AXE_VERSION}\n`);
  console.log(` Base URL: ${BASE}`);
  console.log(` Routes: ${ROUTES.length}`);
  console.log(` Rule tags: ${RUN_ONLY_TAGS.join(', ')}`);

  // Fail-fast if dev server is unreachable.
  try {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`\n✗ Dev server unreachable at ${BASE}:`, err);
    console.error(`  Start the dev server first: pnpm start`);
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  // Force light color scheme at the BROWSER level (not just removing
  // `<html class="dark">`). Without this, Angular's ThemeService picks
  // up `prefers-color-scheme: dark` from puppeteer's default emulation
  // and re-applies .dark on subsequent change-detection cycles, undoing
  // forceLightMode(). Belt-and-braces with forceLightMode() per route.
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
  ]);
  // Don't reuse cached CSS bundle between visits — a routes earlier/later
  // in the loop with the same hash could otherwise see a stale payload.
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1280, height: 800 });

  const results: RouteResult[] = [];

  for (const route of ROUTES) {
    const url = BASE + route;
    process.stdout.write(`\n→ ${url}\n`);

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      await page.waitForSelector('app-pi-page-header', { timeout: 10_000 });

      await forceLightMode(page);
      await page.addScriptTag({ path: AXE_PATH });

      const axeResult = (await page.evaluate(
        async (tags) => {
          return await window.axe.run('html', { runOnly: tags });
        },
        RUN_ONLY_TAGS,
      )) as AxeRunResult;

      const violations = axeResult.violations ?? [];
      results.push({ route, violations });

      if (violations.length === 0) {
        process.stdout.write('  ✓ 0 violations\n');
      } else {
        process.stdout.write(`  ✗ ${violations.length} violations:\n`);
        for (const v of violations) {
          const targets = v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 2)
            .join(', ');
          process.stdout.write(
            `    [${v.impact ?? 'n/a'}] ${v.id}: ${v.help}  (${targets})\n`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Error auditing ${route}: ${msg}`);
      results.push({ route, violations: [], error: msg });
    }
  }

  await browser.close();

  // ─── Summary report ──────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' SUMMARY  (per-route violation breakdown by severity)');
  console.log('═══════════════════════════════════════════════════════════════');
  for (const { route, violations, error } of results) {
    if (error) {
      console.log(`  ${route.padEnd(24)}  AUDIT ERROR: ${error.slice(0, 60)}`);
      continue;
    }
    const breakdown = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    for (const v of violations) {
      if (v.impact && v.impact in breakdown) {
        breakdown[v.impact]++;
      }
    }
    const total = violations.length;
    const row =
      `  ${route.padEnd(24)}  total=${String(total).padStart(3)}  ` +
      `critical=${breakdown.critical}  serious=${breakdown.serious}  ` +
      `moderate=${breakdown.moderate}  minor=${breakdown.minor}`;
    console.log(row);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' FULL JSON  (all violations, for follow-up triage)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(JSON.stringify(results, null, 2));

  // ─── Blocking gate ───────────────────────────────────────────────
  const blockingRoutes = results.filter(({ violations, error }) => {
    if (error) return true;
    return violations.some((v) => v.impact && SEVERITIES_BLOCKING.has(v.impact));
  });

  if (blockingRoutes.length > 0) {
    console.error(
      `\n✗ ${blockingRoutes.length} route(s) blocked — goal NOT met`,
    );
    for (const r of blockingRoutes) {
      if (r.error) {
        console.error(`    ${r.route}: ${r.error.slice(0, 80)}`);
      } else {
        const blockingCount = r.violations.filter(
          (v) => v.impact && SEVERITIES_BLOCKING.has(v.impact),
        ).length;
        console.error(`    ${r.route}: ${blockingCount} blocking violations`);
      }
    }
    process.exit(1);
  }

  console.log('\n✓ 0 serious/critical violations on any of 7 routes — goal MET');
}

main().catch((err: unknown) => {
  console.error('Audit script failed:', err);
  process.exit(2);
});
