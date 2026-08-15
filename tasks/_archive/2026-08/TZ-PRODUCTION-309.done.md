# TZ-PRODUCTION-309.done — Safe estimate order days + production:write

```
ARCHIVE_MARKER
TZ: TZ-PRODUCTION-309
TITLE: Safe estimate — production:write + order-level days
OUTCOME: DONE
DATE: 2026-08-15
AGENT: agent-3e757640b7
WIPE: none
EVIDENCE: progress.md · docs/agent-checklists/TZ-PRODUCTION-309.md
LOCK: .mimocode/locks/TZ-PRODUCTION-309-safe-estimate-order-days.lock
```

## What changed

- `Order.estimateDayOverrides` + `PATCH /orders/:id/estimate-days` (`@Permissions('production:write')`)
- WorkType POST/PATCH/DELETE → `production:write` (not Roles ∧ Permissions)
- Manager seed: `production:write` alongside `production:read`
- FE: `OrdersService.patchEstimateDays`; `buildGanttBars` applies overrides; inspector default = order override; catalog link keeps confirm «для всех»
- Docs: production-cockpit / work-types / PAGE-TZ-INDEX / progress

## Gates

- BE tsc PASS
- BE jest order 25 PASS (incl. patchEstimateDays upsert/update/clear/404)
- FE tsc PASS
- FE jest gantt-bar|production-read 17 PASS

## Out of scope (intentional)

- Drag/resize UI → TZ-PRODUCTION-311
- Existing DB manager roles may need re-seed / manual `production:write` grant
