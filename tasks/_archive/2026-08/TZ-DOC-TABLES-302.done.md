# TZ-DOC-TABLES-302 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: buffy-doc-tables-302
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS — table dialog 41 tests
  - lint: PASS — changed frontend files
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS

## Delivered

- Replaced the registry source native `<select>` with the shared `PiOverflowSelect` overlay (`searchable="auto"`).
- Replaced the editable column type native `<select>` with the same shared overflow-select control; registry mode continues to derive types from selected fields.
- Flattened source groups into readable labels while retaining group context in each option.
- Increased registry field rows to readable label sizing and added the explicit `Нет полей у источника` empty state.
- Reused the existing table-template write path; no registry backend, schema, photo type, EAV, or deploy changes.

## Gates

- Frontend tsc: PASS.
- Table dialog Jest: 1 suite / 41 tests PASS.
- Changed-file ESLint: PASS.
- Prettier: PASS.
- `git diff --check`: PASS.

Browser/PO visual review was not available.
