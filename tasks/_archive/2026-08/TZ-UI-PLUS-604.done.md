ARCHIVE_MARKER
task_id: TZ-UI-PLUS-604
outcome: DONE
closed_at: 2026-08-23T22:04:06+03:00
agent_id: cursor-executor
spec: tasks/TZ-UI-PLUS-604-kp-form-select-plus.md

verification:
  - typecheck: PASS (frontend tsc)
  - lint: PASS (scoped eslint)
  - tests: PASS (proposal-form-dialog 3/3 + proposal-create-inspector 6/6)

## Fix

- proposal-form-dialog: org + counterparty overflow-selects wrapped in `.pi-select-add-row` with green `.pi-select-add-btn` (+)
- openCreateOrganization / openCreateCounterparty → FullEditor create (data: null) → append list + select
- proposal-create-inspector: same + on org select; kept «Открыть организацию»

## Files changed

- frontend/.../proposal-form-dialog.component.ts
- frontend/.../proposal-form-dialog.component.spec.ts (new)
- frontend/.../proposal-create-inspector.component.ts
- frontend/.../proposal-create-inspector.component.spec.ts
