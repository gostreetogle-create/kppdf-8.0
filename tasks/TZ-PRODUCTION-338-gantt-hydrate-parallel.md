# TZ-PRODUCTION-338: Gantt hydrate — parallel prefetch + non-blocking thumbs

STATUS: READY  
РОЛЬ АГЕНТА: local executor (GEMINI.md + kppdf-executor-loop)  
ЗАВИСИМОСТИ: none  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/production-read.facade.ts ; frontend/src/app/pages/production/production-cockpit.page.ts ; frontend/src/app/pages/production/production-read.facade.spec.ts ; frontend/src/app/pages/production/production-cockpit.page.spec.ts

Проверено: `production-read.facade.ts` loadBarsForOrders/buildOrderEstimate/getOrderThumbMap (sequential await); `production-cockpit.page.ts` bootstrap awaits thumbs before bars; audit `docs/audits/2026-08-16-production-gantt-perf-audit.md`; PAGE-TZ-INDEX `/production`.

## ИСХОДНОЕ СОСТОЯНИЕ

- Cold open `/production` feels slow: facade hydrates each product/module via `findById` **one-by-one** inside nested `for`+`await`.
- `bootstrap()` awaits `getOrderThumbMap(list)` **before** `applyFilteredActive` → bars wait on thumb N+1.
- Caches exist (`productCache` / `moduleCache` / inflight maps) but sequential awaits never fan out.
- Estimate math (`buildGanttBars`, day overrides, filters, statuses) must stay identical.

## ЧТО ДЕЛАТЬ

1. **Measure baseline (short note in progress or TZ closeout):** with Network open, cold `/production` — count product+module GETs and rough time until `facade.state().loading === false` / bars visible. 2–3 sentences enough.
2. **Prefetch unique IDs before bar build** in `ProductionReadFacade`:
   - From the target `orders[]`, collect unique `productId`s and (after products resolve) unique module ids from composition/legacy helper already used.
   - Prefetch with bounded concurrency or `Promise.all` over unique ids (reuse `getProduct`/`getModule` so cache+inflight stay correct).
   - Then run existing `buildOrderEstimate` / `buildGanttBars` path (may stay sequential — should be cache hits).
3. **Non-blocking thumbs:** in `production-cockpit.page.ts` `bootstrap` / reload helpers — do **not** await thumbs before bars. Load bars first; set thumbs when ready (void/promise after). Empty thumbs briefly OK.
4. **Tests:** extend facade/page specs — assert prefetch does not change bar ids/days for a fixture with ≥2 products/modules; assert bootstrap can reach `loadBarsForOrders` without waiting on thumb map (mock delay on product if useful).
5. **Gates:** frontend tsc + focused jest on facade/page specs. No deploy.

## ИЗМЕНЯТЬ

- `frontend/src/app/pages/production/production-read.facade.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts` (bootstrap/reload order only)
- matching `*.spec.ts`
- optional one-line note in `docs/pages/production-cockpit.page.md` under perf/hydrate if doc has such section

## НЕ ИЗМЕНЯТЬ

- Estimate formulas, PATCH estimate-days/start, cascade UI, filters/status semantics
- Backend modules / new batch API (successor only)
- `clearCaches()` policy on destroy (leave as-is this TZ; known_limitation)
- Desktop / unrelated pages
- Deploy / wipe

## КРИТЕРИИ ПРИЁМКИ

1. Same filtered orders → same Gantt bar set (ids, start/end days, worker labels) as before for fixtures.
2. Unique products/modules for a multi-order load are fetched **concurrently** (no pure sequential chain across distinct ids); Network waterfall shows parallel fan-out or fewer round-trip gaps.
3. First bars appear **without** waiting for full thumb map; thumbs may fill in after.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS  
5. `cd frontend && pnpm test -- production-read.facade` and `production-cockpit.page` (or project-equivalent focused jest) PASS  
6. Archive + progress + PAGE-TZ-INDEX touch; no deploy.

known_limitation: destroy still clears caches (re-open pays hydrate again — successor); BE batch estimate/products not in scope; if DB has hundreds of active orders, further pagination/windowing is successor.

## Промпт исполнителю

```text
Прочитай GEMINI.md + tasks/TZ-PRODUCTION-338-gantt-hydrate-parallel.md
+ docs/audits/2026-08-16-production-gantt-perf-audit.md.
CLAIM → parallel product/module prefetch + non-blocking thumbs → gates → archive.
Не менять estimate math / PATCH / filters. Deploy запрещён.
```
