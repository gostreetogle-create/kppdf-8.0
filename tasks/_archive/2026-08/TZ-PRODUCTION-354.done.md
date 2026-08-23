# TZ-PRODUCTION-354 — DONE

ARCHIVE_MARKER
task_id: TZ-PRODUCTION-354
outcome: DONE
closed_at: 2026-08-23T17:50:00+03:00
agent_id: freebuff-2
spec: tasks/TZ-PRODUCTION-354-gantt-truncated-label-peek.md

## Verification

- tsc: PASS
- jest gantt-bars: PASS (62/62 incl. truncated-label-peek cases)
- lint: PASS (0 errors)

## Changes

- `gantt-bars.component.ts` — truncated-label-peek overlay (hover + cascade expand, close on mouseleave/click-outside/Escape/scroll)
- `gantt-bars.component.spec.ts` — peek hover + cascade expand tests

## Canon

- `docs/ui-rules.md` § truncated-label-peek
- `docs/AI-UI-CONTRACT.md` overlay row

## Conflict keys

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (+ spec)
