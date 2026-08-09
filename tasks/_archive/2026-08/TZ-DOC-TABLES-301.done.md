# TZ-DOC-TABLES-301 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: buffy-doc-tables-301
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS — baseline 28 tests; final 29 tests
  - lint: PASS — changed frontend files
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PENDING closeout commit

## Delivered

- Added a dark Documents TOC (`Шаблоны`, `Архив`, `Тексты`, `Таблицы`) shared by all four document-constructor sibling pages.
- Added the Tables-only yellow subchips `Все таблицы` and `Из данных`.
- Added `view=all|from-data` routing: `from-data` opens the existing registry dialog write path; `+ Новая таблица` remains on `view=all` only.
- Removed the duplicate «Из существующих данных» tools CTA from the tables page.
- Added focused coverage for the TOC/subchip contract and updated `docs/pages/tables.page.md`.

## Gates

- Baseline focused Jest: 4 suites / 28 tests PASS.
- Final focused Jest: 4 suites / 29 tests PASS.
- Frontend tsc: PASS.
- Changed-file ESLint: PASS.
- Prettier: PASS.
- `git diff --check`: PASS.

Browser/PO visual review was not available. Backend, registry schema, EAV, ModuleMaterials, and deploy were not touched.
