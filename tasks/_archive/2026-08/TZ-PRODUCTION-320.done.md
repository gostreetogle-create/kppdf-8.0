# TZ-PRODUCTION-320.done — Split expand vs card

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: executor-composer
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc)
  - tests: PASS (FE production-cockpit + gantt-bars 32)
  - checklist: UPDATED
  - progress.md: UPDATED
TZ: TZ-PRODUCTION-320
TITLE: Split left column — ▸ = Gantt tree; order name = card only
LOCK: .mimocode/locks/TZ-PRODUCTION-320-split-expand-vs-card.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
DEP: TZ-PRODUCTION-319
```

## What changed

- ▸/▾ chevron **only** expand/collapse work-type tree (never opens/closes bottom card).
- Order number label **only** toggles bottom card (never expand/collapse tree).
- Removed `setOrderExpanded` from `onSelect` / `onOrderLabelClick` label path.
- Visual split: dedicated `.gantt-expand-col` (~30px) + hairline + label zone; distinct `aria-label`/`title`.
- Jest proves no cross-coupling (label open ≠ expand; chevron ≠ card; label close ≠ collapse).

## Gates

- FE tsc PASS
- FE jest `production-cockpit.page.spec|gantt-bars.component.spec` **32 PASS**
