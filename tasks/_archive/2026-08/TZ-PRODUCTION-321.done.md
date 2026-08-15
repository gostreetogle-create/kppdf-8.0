# TZ-PRODUCTION-321.done — Gantt work-detail cascade

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: executor-grok-4.6
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (FE gantt-bars + cockpit + gantt-bar.model 52)
  - lint: N/A (TZ AC = tsc + jest)
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
TZ: TZ-PRODUCTION-321
TITLE: Gantt — каскад detail под видом работ
LOCK: .mimocode/locks/TZ-PRODUCTION-321-gantt-work-detail-cascade.lock
WAVE: WAVE-PRODUCTION-GANTT-CASCADE
DEP: TZ-PRODUCTION-320
```

## What changed

- Child work-type label **or** ▸ toggles an inline detail row **under** that bar: люди (`workerLabel`), дни input → `PATCH /orders/:id/estimate-days` (same path as resize), RU override hint, «Изменить в справочнике» when `production:write`.
- One `expandedWorkBarId` at a time; Esc / empty-canvas dismiss / collapse parent order clears it. Not in URL.
- Highlight `gantt-work-detail-open` distinct from `gantt-order-expanded` / `gantt-order-active`.
- Timeline cell of the detail is a muted work-type wash (no second bar). Drag/resize unchanged.
- Shared `ESTIMATE_OVERRIDE_HINT_RU` + `promptCatalogDaysChange` (inspector + Gantt). Bottom sheet **not** removed (322).

## Gates

- FE tsc PASS
- FE jest `gantt-bars.component.spec` + `production-cockpit.page.spec` + `gantt-bar.model.spec` **52 PASS**
