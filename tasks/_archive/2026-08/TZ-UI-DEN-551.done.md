ARCHIVE_MARKER
task_id: TZ-UI-DEN-551
outcome: DONE
closed_at: 2026-08-23T15:48:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-551-proposals-list-density.md

verification:
  - typecheck: PASS
  - tests: PASS (proposals.page.spec.ts)

## Density applied

- List table: `text-xs` columns, hairline surface (existing)
- Single gold CTA: «+ Создать КП»
- Counter: 11px «Показано N»

## Out of scope (honored)

- `proposals/workspace/**`
- `proposal-create.page.ts`

## Files changed

- `frontend/src/app/pages/commercial/proposals/proposals.page.ts`
