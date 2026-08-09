# TZ-DOC-TABLES-305 — table dialog compact + fields multi-select

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T14:30:45Z
closed_by: Buffy / agent-ccee39fec2

## Result

- Table-template dialog settings are compact: name, description, enum «Тип», order, and active switch share one dense row.
- Category chips and the legacy 100px source-field scroll-box were replaced by the existing overflow-select contract.
- Multi-field selection uses a tall overlay with checkbox state, metadata, and auto-search behavior while keeping selected columns synchronized.
- Column headers received a modest vertical-height improvement.
- Layout/preview polish and the lower preview/skeleton area remain explicitly scoped to successor TZ-DOC-TABLES-308.

## Verification

- Frontend tsc: PASS.
- Focused Jest: PASS, 2 suites / 49 tests (`table-template-dialog` + `overflow-select`).
- Focused ESLint: PASS.
- Focused Prettier: PASS.
- `git diff --check`: PASS.
- PO visual PASS: «Тип» overflow and multi-fields controls work.
- Foreign DOC-343 dirty WIP, DOC-344, Sales, 307 preset, and deploy excluded.
