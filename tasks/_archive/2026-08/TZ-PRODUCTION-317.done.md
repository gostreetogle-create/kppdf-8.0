# TZ-PRODUCTION-317.done — Gantt expand keep orders

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc)
  - tests: PASS (FE cockpit|gantt-bars 28)
  - checklist: ADDED
  - progress.md: UPDATED
TZ: TZ-PRODUCTION-317
TITLE: Gantt expand in-place — keep all orders visible
LOCK: .mimocode/locks/TZ-PRODUCTION-317-gantt-expand-keep-orders.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
```

## What changed

- `onSelect` / deep-link / reload / fit-horizon: never `applyBars([order])`; always `applyFilteredActive()`.
- Select also `setOrderExpanded(id, true)` so composition appears under summary; peers remain and shift down.
- Filters/reset reapply bars even when an order is selected (selection ≠ filter).

## Gates

- FE tsc PASS
- FE jest `production-cockpit.page.spec|gantt-bars.component.spec` **28 PASS**
