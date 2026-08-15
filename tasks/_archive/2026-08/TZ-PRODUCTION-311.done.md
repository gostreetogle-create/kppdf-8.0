# TZ-PRODUCTION-311.done — Gantt estimate right-edge resize

```
ARCHIVE_MARKER
TZ: TZ-PRODUCTION-311
TITLE: Gantt estimate — right-edge resize (order days)
OUTCOME: DONE
DATE: 2026-08-15
AGENT: cursor-executor-311
WIPE: none
EVIDENCE: progress.md · docs/agent-checklists/TZ-PRODUCTION-311.md
LOCK: .mimocode/locks/TZ-PRODUCTION-311-gantt-estimate-resize.lock
DEP: TZ-PRODUCTION-309 @ 9b24c0f1498c12daa996500ccfd760cfca1a0bd6
```

## What changed

- Right-edge resize handles on editable Gantt bars (`canEdit` + not `noTerm` + not readOnly/shipped)
- Snap via `snapEstimateDaysFromDelta` + `GANTT_PX_PER_DAY`; live width + «Nд»; pointer capture; Escape cancels
- Commit → `OrdersService.patchEstimateDays` (order override ONLY); cockpit reloads bars → sequential pack cascade
- Jest: handle presence / noTerm / readOnly / snap math / commit emit; FE tsc PASS
- Docs: production-cockpit.page.md · PAGE-TZ-INDEX · progress

## Gates

- FE tsc PASS (`tsconfig.app.json --noEmit`)
- FE jest gantt-bars + production-cockpit 17 PASS

## Out of scope (intentional)

- Left-edge resize, body drag, plannedDate from bar
- WorkType catalog PATCH from handles
- ProductionSchedule / 304–307
