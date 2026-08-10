# TZ-SALES-343 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-343.md` removed at closeout
> Conflict keys: proposal Create/inspector/recipient, quotation schema/DTO/service, document-template build and registry docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-11`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `unavailable (Unknown task; claim attempted)`

## Preflight

- [x] SALES-345 archive/lock/push verified at `57082c9c`.
- [x] Strict wave order verified: 343 was next; 344 remained queued.
- [x] Counterparty is the buyer; Site owns the delivery address; Person is the contact reference.
- [x] Existing all-counterparty picker, Site API, and build source path read.

## Acceptance

- [x] Russian «Получатель» overlay reuses active Counterparty records and does not resize the frozen A4 center.
- [x] Selected client card shows requisites; the assigned contact person and Site can be selected; quick-create stays in the studio.
- [x] Quotation persists `contactPersonId` and `siteId`; GET/F5 hydrates them.
- [x] Build payload includes buyer/contact/site ids; rendered `counterparty.*` source data exposes address and contact name/position fields.
- [x] Parameters exposes one recipient summary and «Изменить» opens the same overlay.
- [x] Backend tsc + quotation tests pass: `pnpm exec tsc -p tsconfig.json --noEmit`; quotation focused suite 35/35.
- [x] Frontend tsc + proposal-create tests pass: `pnpm exec tsc -p tsconfig.app.json --noEmit`; proposal-create 28/28.
- [x] Prettier/ESLint/diff-check pass for changed files; existing backend ESLint warnings are unrelated `any` warnings in legacy lines 1425/1444.
- [x] Browser-equivalent self-verify: Angular development build PASS; DOM Jest coverage confirms recipient references are sent to build and quotation autosave, while the real authenticated data browser smoke is unavailable without the backend data stack.

## Closeout

- [x] Archive marker created: `tasks/_archive/2026-08/TZ-SALES-343.done.md`.
- [x] Lock created: `.mimocode/locks/TZ-SALES-343-kp-recipient-panel.lock`.
- [x] Active marker removed.
- [x] Commit + push complete.
