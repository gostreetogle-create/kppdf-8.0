ARCHIVE_MARKER
task_id: TZ-UI-DEN-521
outcome: DONE
closed_at: 2026-08-23T16:12:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-521-party-lists-density.md

verification:
  - typecheck: PASS
  - party list specs: counterparties/organizations/categories PASS
  - lint: PASS (0 err)

## Changes

- `counterparties.page.ts`: compact table, text-xs errors/notes, bg-paper-raised surface
- `organizations.page.ts`: compact table, text-xs error banner, bg-paper-raised surface
- `categories.page.ts`: compact tree, text-xs name cells (DEN-521 /categories route)

## Out of scope (honored)

- FullEditor dialogs (DEN-530)
- workspace/**, desk/**
