ARCHIVE_MARKER
task_id: TZ-UI-DEN-531
outcome: DONE
closed_at: 2026-08-23T16:22:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-531-catalog-forms-density.md

verification:
  - typecheck: PASS
  - product/material/module form specs: 87/87 PASS (combined suite 111/111 with party)
  - lint: PASS (0 err)

## Changes

- `material-form-dialog.component.ts`: compact spacing, hairline dims divider, outline cancel
- `product-form-dialog.component.ts`: outline cancel, BOM panel hairline/12px, no shadow dropdown
- `module-form-dialog.component.ts`: single gold CTA footer, outline cancel

## Out of scope (honored)

- BOM tree logic / composition API
- Photo lightbox
- proposals/workspace/**, desk/**
