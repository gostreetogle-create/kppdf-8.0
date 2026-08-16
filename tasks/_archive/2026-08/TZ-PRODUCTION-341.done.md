# TZ-PRODUCTION-341.done — Gantt hydrate throttle 429 workaround

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T17:55:00Z
closed_by: composer-executor (kppdf-executor-loop)
TZ: TZ-PRODUCTION-341
WAVE: production-gantt-perf
DEP: TZ-PRODUCTION-338 DONE; Nest ThrottlerModule short 10/s
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="production-read.facade"` — 1 suite / 6 tests)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Root cause

TZ-338 set `PREFETCH_CONCURRENCY = 8`; Nest short throttle is **10 req/s**. Cold `/production` fan-out on unique products/modules exceeded that → PO saw **429** on `/api/products/:id` and `/api/modules/:id`.

## Outcome

- `PREFETCH_CONCURRENCY` **8 → 3** (exported; documented Nest short-throttle budget).
- `getProduct` / `getModule` via `fetchWithThrottleRetry`: up to 3 retries on **429/503** with backoff **300 / 800 / 1500** ms; **no retry on 404**.
- Unique-id prefetch + cache/inflight preserved; estimate math / PATCH / gantt-bars / BE ThrottlerModule untouched.
- Specs: concurrency ∈ [2,3]; 429 once then 200 → success; 404 single call.

## known_limitation

- Full batch products/modules API — later successor.
- Local workaround `DISABLE_THROTTLE=1` (dev only) remains.
- BE throttle limits not changed in this TZ.

## Critical files

- `frontend/src/app/pages/production/production-read.facade.ts`
- `frontend/src/app/pages/production/production-read.facade.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

---

# Original TZ

STATUS: DONE  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-338 DONE  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/production-read.facade.ts ; frontend/src/app/pages/production/production-read.facade.spec.ts
