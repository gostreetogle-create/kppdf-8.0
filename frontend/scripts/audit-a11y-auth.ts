#!/usr/bin/env -S npx tsx
/**
 * scripts/audit-a11y-auth.ts — axe-core a11y audit for AUTH-GATED routes.
 *
 * Companion to `audit-a11y.ts` (which covers public /kit/* routes only).
 * This script handles the 4 business routes that live behind authGuard:
 *   /materials, /organizations, /dictionaries, /kit/foundations
 *
 * Flow:
 *   1. POST /api/auth/login with admin creds (env: AUDIT_USER / AUDIT_PASS,
 *      defaults admin/admin123 — the dev seed).
 *   2. Open each route in puppeteer with `localStorage.kppdf.access` /
 *      `localStorage.kppdf.refresh` pre-seeded so the authGuard passes.
 *   3. Force light mode + load axe-core + window.axe.run() per route.
 *   4. Aggregate violations, sort by severity, print summary + full JSON.
 *
 * Exit codes:
 *   0  zero serious/critical violations
 *   1  blocking violations OR audit error
 *   2  script-level error (login failed, dev server unreachable, …)
 *
 * Usage:
 *   pnpm tsx scripts/audit-a11y-auth.ts
 *   AUDIT_USER=admin AUDIT_PASS=admin123 pnpm tsx scripts/audit-a11y-auth.ts
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
  '/materials',
  '/organizations',
  '/dictionaries',
  '/kit/foundations',
] as const;

const FRONTEND_BASE = process.env['AUDIT_FRONTEND'] ?? 'http://localhost:4200';
const BACKEND_BASE = process.env['AUDIT_BACKEND'] ?? 'http://localhost:3000';
const USERNAME = process.env['AUDIT_USER'] ?? 'admin';
const PASSWORD = process.env['AUDIT_PASS'] ?? 'admin123';
const ACCESS_KEY = 'kppdf.access';
const REFRESH_KEY = 'kppdf.refresh';
const SEVERITIES_BLOCKING = new Set(['serious', 'critical']);
const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

interface RouteResult {
  route: string;
  violations: AxeViolation[];
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

async function login(): Promise<{ access: string; refresh: string }> {
  const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: HTTP ${res.status} — ${text.slice(0, 200)}`);
  }
  const body = (await res.json()) as { access: string; refresh: string };
  if (!body.access || !body.refresh) {
    throw new Error('Login response missing access/refresh tokens');
  }
  return body;
}

async function forceLightMode(page: puppeteer.Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
}

async function seedAuthAndNavigate(
  page: puppeteer.Page,
  url: string,
  access: string,
  refresh: string,
): Promise<void> {
  // Open the frontend first so localStorage is bound to the right origin.
  await page.goto(FRONTEND_BASE + '/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await page.evaluate(
    (a, r, ak, rk) => {
      localStorage.setItem(ak, a);
      localStorage.setItem(rk, r);
    },
    access,
    refresh,
    ACCESS_KEY,
    REFRESH_KEY,
  );
  // Now navigate to the real route — authGuard reads localStorage on bootstrap.
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  // Wait for the page-specific sentinel: page-header is universal across
  // the 4 audited routes.
  await page.waitForSelector('app-pi-page-header, app-pi-section', {
    timeout: 10_000,
  });
  // Verify we landed on the intended route, not on /login (the AuthGuard
  // would have bounced us there if seeding failed — silently auditing
  // the login page would produce a false "0 violations" pass).
  const landed = new URL(page.url()).pathname;
  const target = new URL(url).pathname;
  if (landed !== target) {
    throw new Error(
      `Auth bounce: expected ${target}, landed on ${landed} ` +
        `(authGuard rejected the seeded token)`,
    );
  }
}

async function main(): Promise<void> {
  const AXE_VERSION: string =
    typeof axeCore.version === 'string' ? axeCore.version : 'unknown';

  console.log(`\n axe-core ${AXE_VERSION}  (auth-gated routes scan)\n`);
  console.log(` Frontend: ${FRONTEND_BASE}`);
  console.log(` Backend:  ${BACKEND_BASE}`);
  console.log(` User:     ${USERNAME}`);
  console.log(` Routes:   ${ROUTES.length}`);
  console.log(` Rule tags: ${RUN_ONLY_TAGS.join(', ')}`);

  // 1. Login
  let tokens: { access: string; refresh: string };
  try {
    tokens = await login();
    console.log(`\n ✓ Login successful (access token: ${tokens.access.slice(0, 20)}…)`);
  } catch (err) {
    console.error(`\n✗ Login failed:`, err);
    console.error(`  Set AUDIT_USER / AUDIT_PASS env vars.`);
    process.exit(2);
  }

  // 2. Pre-flight: dev server reachable?
  try {
    const res = await fetch(FRONTEND_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`\n✗ Dev server unreachable at ${FRONTEND_BASE}:`, err);
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
  ]);
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1280, height: 800 });

  const results: RouteResult[] = [];

  for (const route of ROUTES) {
    const url = FRONTEND_BASE + route;
    process.stdout.write(`\n→ ${url}\n`);

    try {
      await seedAuthAndNavigate(page, url, tokens.access, tokens.refresh);
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

  // ─── Severity-sorted summary ─────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' SUMMARY  (per-route, sorted by severity)');
  console.log('═══════════════════════════════════════════════════════════════');

  // Collect all violations across all routes
  interface CrossRouteViolation {
    route: string;
    violation: AxeViolation;
  }
  const all: CrossRouteViolation[] = [];
  for (const r of results) {
    for (const v of r.violations) {
      all.push({ route: r.route, violation: v });
    }
  }
  // Sort by severity (critical first), then by id
  all.sort((a, b) => {
    const sa = SEVERITY_ORDER[a.violation.impact ?? 'minor'] ?? 99;
    const sb = SEVERITY_ORDER[b.violation.impact ?? 'minor'] ?? 99;
    if (sa !== sb) return sa - sb;
    return a.violation.id.localeCompare(b.violation.id);
  });

  // Per-route breakdown
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

  // Unique-issues table grouped by severity
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' UNIQUE ISSUES  (one row per rule × severity, sorted)');
  console.log('═══════════════════════════════════════════════════════════════');

  const grouped = new Map<string, { impact: string; help: string; count: number; routes: Set<string> }>();
  for (const { route, violation } of all) {
    const key = `${violation.impact ?? 'minor'}:${violation.id}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
      existing.routes.add(route);
    } else {
      grouped.set(key, {
        impact: violation.impact ?? 'minor',
        help: violation.help,
        count: 1,
        routes: new Set([route]),
      });
    }
  }

  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const sa = SEVERITY_ORDER[a[1].impact] ?? 99;
    const sb = SEVERITY_ORDER[b[1].impact] ?? 99;
    if (sa !== sb) return sa - sb;
    return a[0].localeCompare(b[0]);
  });

  for (const [key, { impact, help, count, routes }] of sortedGroups) {
    const routeList = Array.from(routes).join(', ');
    console.log(`  [${impact.toUpperCase().padEnd(8)}] ${key.split(':')[1].padEnd(40)} × ${count}  (${routeList})`);
    console.log(`             ${help}`);
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

  console.log('\n✓ 0 serious/critical violations on any route — goal MET');
}

main().catch((err: unknown) => {
  console.error('Audit script failed:', err);
  process.exit(2);
});
