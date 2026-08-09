# TZ-DOC-TABLES-302 checklist

> Status: **DONE** · Wave: DOC-TABLES #2
> Source: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-302-table-dialog-overflow-select.md`

## Claim slot
- agent_id: `buffy-doc-tables-302`
- claimed_at: `2026-08-09T03:06:05Z`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: unavailable (unknown task; task registry sync unavailable)

## Conflict keys
- `frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts`
- `frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts`
- `docs/pages/tables.page.md`
- this checklist

## Acceptance
- [x] No native select remains for source/type in the table dialog.
- [x] Source/type selectors use PiOverflowSelect with overlay behavior.
- [x] Registry fields are readable and have an explicit empty state.
- [x] FE tsc and dialog Jest pass.
- [x] Archive, lock, status/checkpoint, commit and push complete.

## Gates (fact)
- Frontend tsc: PASS.
- Table dialog Jest: PASS — 1 suite / 41 tests.
- Changed-file ESLint: PASS.
- Prettier and diff-check: PASS.
- Browser/PO visual review: unavailable.
