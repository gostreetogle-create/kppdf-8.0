# TZ-PRODUCTION-338.done — Gantt hydrate parallel + non-blocking thumbs

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:05:00+03:00
closed_by: composer-executor (closeout; code+specs by freebuff claim)
TZ: TZ-PRODUCTION-338
WAVE: production-gantt-perf
DEP: docs/audits/2026-08-16-production-gantt-perf-audit.md
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="production-read.facade|production-cockpit.page"` — 2 suites / 27 tests)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Baseline (Network note)

Cold `/production` before fix: ~10 product + ~19 module GETs (≈33 catalog calls); module waterfall strictly sequential (start offsets ~1074→1352→1398→1674…); last catalog response ≈4.5s. After: unique IDs fan out with concurrency 8; thumbs no longer block first bars.

## Outcome

- `ProductionReadFacade.prefetchCatalog`: unique `productId`s then module ids via `runBounded` + `getProduct`/`getModule` (cache + inflight reused); then existing `buildOrderEstimate` / `buildGanttBars` (same bar ids/days).
- `production-cockpit` bootstrap / reload: `void loadThumbs(list)` — bars via `applyInitialOrderId` / `applyFilteredActive` without awaiting thumb map.
- Specs: facade parallel fan-out + stable bar ids/days; page bootstrap reaches `loadBarsForOrders` while thumbs pending.
- Docs: `production-cockpit.page.md` TZ row + known_limitation; `PAGE-TZ-INDEX` **338 DONE**.

## known_limitation

- `destroy` → `clearCaches()` still cold on re-open (successor).
- No BE batch products/modules API.
- Large active order sets may still need pagination/windowing (successor).

## Critical files

- `frontend/src/app/pages/production/production-read.facade.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-read.facade.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
