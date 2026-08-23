ARCHIVE_MARKER
task_id: TZ-UI-DEN-561
outcome: DONE
closed_at: 2026-08-23T15:49:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-561-worktypes-people-density.md

verification:
  - typecheck: PASS
  - tests: PASS (work-types.page.spec.ts)

## Density applied

- Standard list sweep (520 pattern): `text-xs` cells, 11px «Показано» counters
- Single gold create CTA per page

## Files changed

- `frontend/src/app/pages/work-types/work-types.page.ts`
- `frontend/src/app/pages/people/people.page.ts`
