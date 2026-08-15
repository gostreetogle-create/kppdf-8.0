# TZ-PRODUCTION-318.done — card sheet viewport

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc)
  - tests: PASS (FE production-cockpit 9)
  - checklist: ADDED
  - progress.md: UPDATED
TZ: TZ-PRODUCTION-318
TITLE: Bottom card — full width, on-screen; composition expands up
LOCK: .mimocode/locks/TZ-PRODUCTION-318-card-sheet-viewport.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
DEP: TZ-PRODUCTION-317 @ 67d266dce74cb95fb980b03aba9b77b9297eb084
```

## What changed

- Sheet: `left/right: 0.5rem`, `max-height: min(52vh, calc(100% - 1rem))`, internal scroll; no 60rem/42vh clip.
- Состав: product/module open as fixed upward popovers (`bottom-full` via viewport coords); Escape / click-away closes.
- Meta save / days override paths unchanged.

## Gates

- FE tsc PASS
- FE jest `production-cockpit.page.spec` **9 PASS**
