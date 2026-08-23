ARCHIVE_MARKER
task_id: TZ-UI-PLUS-603
outcome: DONE
closed_at: 2026-08-23T22:10:00+03:00
agent_id: cursor-executor
spec: tasks/TZ-UI-PLUS-603-order-form-select-plus.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped)
  - tests: PASS (order-form-panel 16/16)

## Fix

- Counterparty and site overflow-selects wrapped in `.pi-select-add-row` with green `.pi-select-add-btn` (+)
- `openCreateCounterparty()` → `PartyQuickCreateDialogComponent` (quickCreateParty)
- `openCreateSite()` → `SiteQuickCreateDialogComponent` (SiteService.create, disabled without counterparty)
- Removed inline «Быстрый заказчик» section (replaced by + in select row)

## Files changed

- `frontend/src/app/shared/orders/order-form-panel.component.ts`
- `frontend/src/app/shared/orders/order-form-panel.component.spec.ts`
- `frontend/src/app/shared/counterparty/party-quick-create-dialog.component.ts`
- `frontend/src/app/shared/site/site-quick-create-dialog.component.ts`
