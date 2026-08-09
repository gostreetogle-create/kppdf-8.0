# TZ-SALES-324 — Empty table skeleton

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T12:10:52Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- `TableTemplateService.preview()` now renders a real table whenever columns exist, even when `sampleRows` is empty.
- The result contains the column-label `thead` and exactly one blank `tbody` row with one empty `<td>` per column.
- Tables with no declared columns retain the short «Нет описанных колонок.» state.
- Create КП documentation records the blank skeleton contract; Builder’s separate «Нет данных» copy remains a known limitation.

## Verification

- Backend typecheck: PASS
- Table-template e2e: PASS, 8/8
- Document-template build e2e: PASS, 9/9, including live table-template build skeleton
- `git diff --check`: PASS
- Canonical dirty `document-template.service.ts` WIP preserved and not edited
- Scope exclusions preserved: 325, 322/320, Builder/DOC-344, deploy
