# TZ-DOC-TABLES-305 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-DOC-TABLES-305.done.md`
> Closeout: visual PO PASS; archive/lock/checkpoint completed

## Claim slot

- agent_id: `agent-ccee39fec2`
- claimed_at: `2026-08-09T03:41:19Z`
- workspace: `D:\kppdf-8.0`
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
- [x] Base synchronized to canonical `origin/main` before product edits.
- [x] `_active-map` and `_active/` reviewed; no conflicting DOC-344/Sales/DOC-342 scope was mixed.
- [x] Claim slot filled before product code.

## Acceptance

- [x] Category chips → overflow-select «Тип» with enum preserved.
- [x] Source fields use a tall multi overflow overlay with search and no 100px scroll box.
- [x] Settings use one dense row for name/description/type/order/active.
- [x] Column header is slightly taller.
- [x] Focused tests, typecheck, lint, formatting, and diff-check PASS.
- [x] PO visual PASS: «Тип» overflow and multi-fields controls work; layout polish/preview is successor TZ-308, not a blocker.

## Integrity slot

- Тип изменения: module + page UI.
- FIC §A–E: PASS / N/A where not applicable; no new route or permission surface.
- Page docs and UI overflow docs updated in implementation scope.
- Foreign WIP and conflict keys excluded from closeout commit.
- Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- Frontend tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- Focused Jest: PASS — 2 suites / 49 tests (`table-template-dialog` + `overflow-select`).
- Focused ESLint: PASS.
- Focused Prettier check: PASS.
- `git diff --check`: PASS.
- PO visual PASS: «Тип» overflow + multi-поля работают.

## Executor report (auto)

- Compact settings row contains name, description, enum «Тип», order, and active switch.
- Category chips and the legacy 100px field scroll-box were removed.
- `PiOverflowSelect` gained multi-selection, checkbox state, metadata, tall overlay, and existing auto-search behavior.
- Registry fields use the multi-overflow contract and synchronize selected columns.
- Column header vertical padding increased modestly.
- Documentation and focused Jest coverage were updated.
- Scope guard: DOC-343 dirty `document-template.service.ts`, DOC-344, Sales, DOC-342 backend, 307 preset, and deploy were not included.
- Known limitation: dialog/preview alignment polish and preview/skeleton lower area belong to TZ-DOC-TABLES-308.

## Review handoff

- [x] READY FOR REVIEW gates completed.
- [x] PO visual PASS received for the implemented controls.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T14:30:45Z`
