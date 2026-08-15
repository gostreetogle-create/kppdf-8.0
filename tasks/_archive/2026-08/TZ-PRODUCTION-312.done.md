# TZ-PRODUCTION-312.done — Gantt body-drag → plannedDate

```
ARCHIVE_MARKER
TZ: TZ-PRODUCTION-312
TITLE: Gantt body-drag — shift order plannedDate
OUTCOME: DONE
DATE: 2026-08-15
AGENT: gemini-executor-312
WIPE: none
EVIDENCE: progress.md · docs/agent-checklists/TZ-PRODUCTION-312.md
LOCK: .mimocode/locks/TZ-PRODUCTION-312-gantt-body-drag-planned-date.lock
DEP: TZ-PRODUCTION-313 @ 4cd045c66c88b7a37208a4dfcf8ffd71864d5e73 ; TZ-PRODUCTION-311 @ 85329247650db938cb80039b458c3e05cb363a7a
```

## What changed

- Body pointer on bar (not resize handle) → snap `snapMoveDeltaDays` → preview translate whole order chain
- Commit → `OrdersService.update({ plannedDate })` = oldAnchor + deltaDays; durations untouched
- Escape cancels; readOnly / shipped|delivered|cancelled = no drag
- Resize handle path from 311 unchanged (estimate-days only)
- Jest: body emit, no move on resize path, readOnly/shipped, snap helper

## Gates

- FE tsc PASS
- FE jest production-cockpit|gantt-bar **31 PASS**

## Out of scope (intentional)

- Left-edge resize, per-bar lag, fact production, 304–307
