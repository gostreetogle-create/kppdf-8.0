# TZ-PRODUCTION-314.done — Gantt order summary + expand

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: gemini-executor-gantt-tree
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (36 jest: gantt-bar.model + gantt-bars + cockpit)
  - lint: SKIPPED (focused tsc+jest)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
TZ: TZ-PRODUCTION-314
TITLE: Gantt — order summary row + expand composition
LOCK: .mimocode/locks/TZ-PRODUCTION-314-gantt-order-expand.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
```

## What changed

- `buildOrderSummaryBar` / `buildGanttTreeBars` / `groupBarsByOrder` — summary span = min…max children
- Default collapsed: one summary bar per order; ▸ expand shows work-type children
- `ProductionCockpitContext.expandedOrderIds` session set
- Summary body-drag → plannedDate; child resize → estimate-days; child body plannedDate **off** (316 restores)
- RU: column «Заказ» / «Заказ · работа»; hint «Разверните заказ…»

## Gates

- FE tsc PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- FE jest gantt-bar.model|gantt-bars|production-cockpit **36 PASS**

## Out of scope

- start-offset schema (316)
- bottom card sheet (315)
- fact production
