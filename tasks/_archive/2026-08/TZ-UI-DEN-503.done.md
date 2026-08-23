ARCHIVE_MARKER
task_id: TZ-UI-DEN-503
outcome: DONE
closed_at: 2026-08-23T15:25:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-503-shared-ui-shadow-radius.md

verification:
  - typecheck: PASS
  - eslint (8 files): PASS
  - rg rounded-(md|lg|xl) shared/ui *.ts: 0

## Files

- card.component.ts, pi-showcase-card.component.ts
- composition-tree.component.ts, pi-dialog.component.ts
- pi-filter-panel.component.ts, forbidden.page.ts
- pi-notification-bell.component.ts, pi-overflow-select.component.ts

## Note

PiDialog backdrop shadow token preserved per canon.
