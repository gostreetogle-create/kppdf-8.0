# TZ-PRODUCTION-323.done — Gantt cascade: one meta + full-width panels

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: executor-grok-4.6
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (FE jest gantt-bars + production-cockpit — 41)
  - lint: N/A (TZ AC = tsc + jest)
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
TZ: TZ-PRODUCTION-323
TITLE: Gantt cascade polish — one meta + full-width panels
LOCK: .mimocode/locks/TZ-PRODUCTION-323-gantt-cascade-fullwidth.lock
WAVE: WAVE-PRODUCTION-GANTT-CASCADE
DEP: TZ-PRODUCTION-322
```

## What changed

- **Bug:** `orderMeta` / timeline spacer gated with `row.isSummary` — meta once under the summary row, never under child work rows (fix «портянка»).
- **Full-width:** order-meta and work-detail use `gantt-cascade-panel` in the sticky label column: `width: 100cqw` + `min-width: timelineMinWidth()` so one continuous strip spans label + calendar. Timeline keeps a transparent `gantt-cascade-spacer` of matching height (scroll sync / sticky labels intact).
- Dense horizontal field layout (one row). Heights `GANTT_META_ROW_PX` / `GANTT_DETAIL_ROW_PX` = 56.
- 321/322 click lock unchanged (▸ tree; number = meta; child = detail).

## known_limitations

- Extra fields in the wide panel — place only; not invented in this TZ.

## Gates

- FE tsc PASS
- FE jest `gantt-bars.component.spec.ts` + `production-cockpit.page.spec.ts` **41 PASS**
