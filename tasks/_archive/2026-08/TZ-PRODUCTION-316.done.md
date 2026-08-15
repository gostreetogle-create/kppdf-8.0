# TZ-PRODUCTION-316.done — per-bar start offsets

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: gemini-executor-gantt-tree
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE+BE)
  - tests: PASS (FE 39 jest; BE order.service 28)
  - checklist: ADDED
  - progress.md: UPDATED
TZ: TZ-PRODUCTION-316
TITLE: Per-bar start offset — parallel move on Gantt
LOCK: .mimocode/locks/TZ-PRODUCTION-316-gantt-bar-start-offset.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
DEP: TZ-PRODUCTION-314 @ e5089da631e01ee78569252c7f7a11b4b0a6264e ; TZ-PRODUCTION-315 @ 1f4ed4440167f6029e87ed0283007c3a4ebd335f
```

## What changed

### Backend
- `Order.estimateStartOffsets[]` schema
- `PATCH /orders/:id/estimate-start` (`production:write`); null clears

### Frontend
- `buildGanttBars` applies offsets (parallel; sequential cursor only for non-offset bars)
- Child body-drag → `startOffsetCommit` → PATCH estimate-start
- Summary body-drag stays plannedDate; summary span = min…max children

## Gates

- FE tsc PASS; FE jest gantt|cockpit **39 PASS**
- BE tsc PASS; BE jest order.service **28 PASS**
