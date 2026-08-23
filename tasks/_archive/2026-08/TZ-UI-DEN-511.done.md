ARCHIVE_MARKER
task_id: TZ-UI-DEN-511
outcome: DONE
closed_at: 2026-08-23T15:35:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-511-page-chrome-density.md

verification:
  - typecheck: PASS
  - pi-page-chrome tests: 4/4 PASS

## Changes

- `pi-page-chrome.component.ts`: H1 max text-lg, crumbs text-xs, compact py-2 + hairline-b
- `pi-page-chrome.component.spec.ts`: DEN-511 density assertions

## Out of scope

- workspace/**, proposal-create.page.ts
