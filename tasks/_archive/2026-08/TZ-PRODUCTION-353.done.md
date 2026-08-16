# TZ-PRODUCTION-353.done — Gantt unassigned People gate

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17T00:15:00+03:00
closed_by: composer-executor (kppdf-executor-loop)
TZ: TZ-PRODUCTION-353
DEP: TZ-PRODUCTION-352 DONE

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec|production-cockpit.page.spec" --no-coverage` — 131/131)
  - checklist: DONE
  - deploy: NOT RUN

## Outcome

- `summarizeUnassignedGanttWork` + `isUnassignedWorkerSummaryBar` in model.
- Amber banner under Gantt toolbar when unassigned work bars exist; `/people` link; WT names listed.
- «Не назначен» worker row: amber wash/barFill/dashed chip; `data-unassigned-worker="true"`; bars stay on Gantt.
- Cockpit exposes `unassignedGanttWork` computed.

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `docs/pages/production-cockpit.page.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-353-gantt-unassigned-people-gate.lock`

---

# Original TZ

See git history / `tasks/_active/TZ-PRODUCTION-353.md` snapshot.
