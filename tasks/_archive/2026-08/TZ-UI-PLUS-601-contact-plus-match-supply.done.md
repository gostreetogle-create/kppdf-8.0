ARCHIVE_MARKER
task_id: TZ-UI-PLUS-601
outcome: DONE
closed_at: 2026-08-23T21:45:00+03:00
agent_id: cursor-executor
spec: tasks/TZ-UI-PLUS-601-contact-plus-match-supply.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped)
  - tests: PASS (counterparty-full-editor-dialog, proposal-create-recipient, person-quick-create — 22/22)

## Fix

- `.pi-select-add-row`: flex-wrap → CSS grid `minmax(0,1fr) auto` (supply subgroup-fields canon)
- `.pi-select-add-btn`: moved out of `@layer components` + `appearance:none` reset (cascade matched supply component styles)
- `app-pi-overflow-select`: `:host { display:block; min-width:0 }` for grid cell shrink

## Files changed

- `frontend/src/app/styles.css`
- `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts`
- `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.spec.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.spec.ts`

## Out of scope (honored)

- FullEditor fields/roles/bank
- Supply quick-order layout
- New button design
