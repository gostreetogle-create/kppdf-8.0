# TZ-DOC-TABLES-305 checklist

> Status: **BLOCKED**
> TZ: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-305-table-dialog-compact-fields-multi.md`
> Marker: `tasks/_active/TZ-DOC-TABLES-305.md`

## Claim slot

- agent_id: agent-ccee39fec2
- claimed_at: 2026-08-09T03:41:19Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-DOC-TABLES-305)

## Conflict keys

- `frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts`
- `frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts`
- `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts`
- `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.spec.ts`
- `docs/pages/tables.page.md`
- `docs/pages/ui-overflow-select.md`

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] Base synchronized to `origin/main` b5ff7f3f before product edits
- [x] `_active-map` reviewed: no conflict with DOC-344 builder, SALES-317 proposals, or DOC-342 backend upload
- [x] `_active/` reviewed: only peer DOC-343 marker remains locally; no overlapping keys
- [x] Claim slot filled before product code

## Acceptance

- [x] Category chips → overflow-select «Тип» (enum preserved)
- [x] Source fields: multi overflow overlay (tall, search ≥10), no 100px scroll box
- [x] Settings one dense row (name/desc/type/order/active)
- [x] Column header slightly taller
- [x] Jest dialog (+ overflow-select if extended)
- [x] tables.page.md (+ ui-overflow-select.md if multi)
- [x] tsc + tests PASS

## Plan

1. Inspect existing dialog and overflow-select APIs/tests.
2. Extend the shared overflow select only as needed for multi-selection.
3. Rebuild the dialog settings and source-field controls within the listed keys.
4. Update focused Jest coverage and page documentation.
5. Run the required frontend typecheck/tests/lint and review the scoped diff.

## Gates (факт)

- Frontend tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- Focused Jest: PASS — 2 suites / 49 tests (`table-template-dialog` + `overflow-select`).
- Focused ESLint: PASS.
- Focused Prettier check: PASS.
- `git diff --check`: PASS.
- Browser/PO visual review: BLOCKED — Preview registration is unavailable in this SDK session; no visual PASS claimed.

## Executor report (auto)

- Compact settings row now contains name, description, enum «Тип», order, and active switch.
- Category chips and the legacy 100px field scroll-box were removed.
- `PiOverflowSelect` gained multi-selection, checkbox state, metadata, tall overlay, and existing auto-search behavior.
- Registry fields use the multi-overflow contract and still synchronize selected columns.
- Column header vertical padding increased modestly.
- Documentation and focused Jest coverage updated.
- Forbidden DOC-344, SALES-317, and DOC-342 backend scopes were not touched.
- Cursor PASS: typecheck, focused tests, lint, formatting, and diff review.
- Failure reason: the running Angular server built successfully on port 4300, but `register_preview` rejected the URL/PID source, so the dialog could not be inspected visually here.
- Partial progress: implementation and all automated gates are complete; no archive marker or lock was created.
- Next steps: Cursor/PO visual review of `/doc-constructor/tables`; if PASS, archive with `ARCHIVE_MARKER`, create the lock, update status/checkpoint, then finish closeout commit/push.
