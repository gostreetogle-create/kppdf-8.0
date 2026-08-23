ARCHIVE_MARKER
task_id: TZ-UI-DEN-530
outcome: DONE
closed_at: 2026-08-23T16:20:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-530-party-full-editor-density.md

verification:
  - typecheck: PASS
  - org/counterparty specs: 24/24 PASS
  - lint: PASS (0 err)

## Changes

- `form-section.component.ts`: 16px padding, 8px internal stack, 14px section titles
- `organization-full-editor-dialog.component.ts`: gold selected type chips, outline cancel, hairline section dividers
- `counterparty-full-editor-dialog.component.ts`: gold selected role chips, outline cancel, hairline section dividers

## Out of scope (honored)

- proposals/workspace/**, proposal-create.page.ts, desk/**
