# TZ-PRODUCTION-319.done — Gantt card interaction

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: executor-composer
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc)
  - tests: PASS (FE production-cockpit + gantt-bars 31)
  - checklist: UPDATED
  - progress.md: UPDATED
TZ: TZ-PRODUCTION-319
TITLE: Gantt open/close IA — card only from order label; taller sheet
LOCK: .mimocode/locks/TZ-PRODUCTION-319-gantt-card-interaction.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
DEP: TZ-PRODUCTION-318
```

## What changed

- Left **summary** order label → toggle bottom card (same order open → close; else open+select+expand).
- Child work-type label / chevron / timeline bar click-drag → **no** card open (resize/move kept).
- Chrome «Карточка» toggles when order selected; backdrop / Esc / × / main click close sheet.
- Sheet height ~2×: `max-height: min(72vh, calc(100% - 0.75rem))`; full width from 318 kept.

## Gates

- FE tsc PASS
- FE jest `production-cockpit.page.spec|gantt-bars.component.spec` **31 PASS**
