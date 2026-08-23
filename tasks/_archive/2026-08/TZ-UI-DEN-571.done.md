ARCHIVE_MARKER
task_id: TZ-UI-DEN-571
outcome: DONE
closed_at: 2026-08-23T15:20:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-571-admin-density.md

verification:
  - typecheck: PASS
  - admin specs: users/roles/devices PASS (33 tests)
  - lint: PASS (0 err)

## Changes

- `users-admin.page.ts`: compact table, hairline surface, text-xs cells, hairline error banner
- `roles-admin.page.ts`: compact table, hairline surface, text-xs cells, hairline error banner
- `devices-admin.page.ts`: compact table, hairline surface, text-xs cells, hairline error banner

## CTA / destructive contract

- Single gold CTA per toolbar (create / create-invite); owner invite stays outline
- Row delete via `PiRowActions` danger icon; revoke uses text-destructive (not gold)

## Out of scope (honored)

- workspace/**, proposal-create, desk/**
