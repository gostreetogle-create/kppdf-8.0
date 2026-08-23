# TZ-PARTY-306 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-PARTY-306.done.md`

## Claim slot

- agent_id: cursor-executor
- claimed_at: 2026-08-23T18:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] Shared PersonQuickCreateDialogComponent (PiDialog, PersonsService.create)
- [x] Counterparty editor: + next to contact overflow-select
- [x] KP recipient: overflow-select + all persons + +
- [x] Shared `.pi-select-add-row` / `.pi-select-add-btn` styles
- [x] Specs for dialog, counterparty, recipient
- [x] tsc + focused jest PASS

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `jest person-quick-create person.util counterparty-full-editor-dialog proposal-create-recipient` → 22/22 PASS
- eslint changed TS → PASS

## Executor report

- Added `frontend/src/app/shared/person/` with dialog + util
- Wired + buttons in counterparty editor and KP recipient panel
- KP now lists all persons, not only counterparty.contactPersonId

## Closeout

- closed_at: 2026-08-23T18:25:00+03:00
