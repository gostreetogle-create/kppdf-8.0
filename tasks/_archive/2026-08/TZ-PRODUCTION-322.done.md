# TZ-PRODUCTION-322.done — Gantt order-meta + kill bottom card

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: executor-grok-4.6
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (FE jest src/app/pages/production — 58)
  - lint: N/A (TZ AC = tsc + jest)
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
TZ: TZ-PRODUCTION-322
TITLE: Gantt — order-meta under summary + kill bottom card
LOCK: .mimocode/locks/TZ-PRODUCTION-322-gantt-order-meta-kill-card.lock
WAVE: WAVE-PRODUCTION-GANTT-CASCADE
DEP: TZ-PRODUCTION-321
```

## What changed

- Order-number click / rail select / `?orderId=` opens **order-meta strip under summary**: status (RO), priority, plannedDate, «Сохранить заказ», link `/orders?q=`. Write = `PATCH /orders/:id` (same as old inspector-meta).
- Bottom sheet (`production-studio-sheet-card`), chrome «Карточка», `rightTool==='card'`, `inspectorOpen` sheet coupling, `app-order-inspector` host **removed**.
- `gantt-order-active` = open meta (not sheet). ▸ still tree-only. Work-detail (321) intact.
- Esc / empty canvas: close meta + work-detail + collapse trees.
- Inspector file slimmed to `promptCatalogDaysChange` helpers.

## known_limitations

- Product/module deep-links from the old inspector are backlog; sheet is not restored.

## Gates

- FE tsc PASS
- FE jest `src/app/pages/production` **58 PASS**
