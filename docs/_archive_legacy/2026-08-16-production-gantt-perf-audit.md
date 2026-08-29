# Audit: `/production` Gantt slow first paint (2026-08-16)

**Symptom (PO):** Цех / диаграмма Ганта раньше открывалась почти сразу; сейчас долго «пересчитывает» / подгружает.

**Scope:** cold open `/production` (bootstrap → bars). Not drag/resize write-path (333 already optimistic).

**Verdict:** bottleneck is **client-side N+1 hydrate** in `ProductionReadFacade`, not Gantt paint math. Safe FE parallel/prefetch should restore snappy feel without changing estimate rules. BE batch estimate remains optional successor.

---

## Critical path (today)

```
bootstrap()
  ├─ loadOrders()           → GET /orders (1)
  ├─ getWorkerLabelsMap()   → GET workers (1, cached)
  ├─ getOrderThumbMap(list) → GET /products/:id **per order, sequential**  ← blocks UI
  └─ onSelectAll() → applyFilteredActive()
       └─ loadBarsForOrders(filtered)
            ├─ getWorkTypesMap()     (1)
            ├─ getWorkersByWorkType() (cache hit)
            └─ for each order (sequential):
                 for each line: getProduct → for each module: getModule
                 → buildGanttBars (CPU, usually cheap)
```

On leave page: `destroyRef` → `facade.clearCaches()` → next visit pays full N+1 again.

---

## Findings (ranked)

| # | Issue | Evidence | Impact | Safe fix? |
|---|--------|----------|--------|-----------|
| P0 | **Sequential product/module GETs** while building bars | `production-read.facade.ts` `buildOrderEstimate` + `loadBarsForOrders` `for`+`await` | Dominates wall time as catalog/orders grow | Yes: collect unique IDs → `Promise.all` prefetch → build from cache |
| P0 | **Thumbs block first paint** | `bootstrap` awaits `getOrderThumbMap` before bars | Extra N product GETs before Gantt appears | Yes: load bars first; thumbs async after / in parallel without awaiting |
| P1 | **Cache cleared on every leave** | `production-cockpit.page.ts` `onDestroy` → `clearCaches()` | Re-open feels cold every time | Maybe: keep product/module cache for SPA session; still clear on explicit reload / write. Document stale risk |
| P2 | Historical N+1 `GET /production/estimate` | Old notes in park/303.1; FE now builds client-side | Not current path | Optional BE batch later |
| P2 | Large filtered set | default `activeOnly=true` still many orders | More IDs to hydrate | Prefetch still helps; no UX change |

---

## How to measure (executor / PO)

1. Open DevTools → Network, disable cache, hard reload `/production`.
2. Count `products/` + `modules/` requests before first Gantt bars (`data-test` gantt / loading false).
3. Note: waterfall length vs parallel fan-out; Time to bars (ms).
4. Repeat after fix: same bar set / same estimate days; fewer sequential gaps; TTFB to bars ↓.

Do **not** change estimate formulas, filters, statuses, or drag PATCH paths in the perf TZ.

---

## Recommended work split

1. **TZ-PRODUCTION-338** (now) — FE hydrate parallel + non-blocking thumbs. No BE. No UX copy change.
2. **Successor (only if still slow)** — session cache policy; optional BE `batch products|modules` or estimate read-model.

---

## Out of scope

- Gantt CSS/layout redesign, cascade UX, workers grouping, deploy, Mongo indexes (unless profiler proves BE list slow).
