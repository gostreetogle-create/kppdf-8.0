# TZ-SALES-325 — draftLines → assigned line-items table

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T13:10:04Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- Create КП sends in-memory `draftLines` as request-only `previewLines` during build preview.
- Explicit `settings.kpLineItems === true` / `role: line-items` targets the assigned table; with no explicit target, exactly one live table is eligible.
- Column mapping uses canonical case-insensitive `column.key` aliases for name, quantity, unit price, total, SKU, and unit. Unknown keys stay blank.
- Snapshot tables and non-target live tables are not filled; empty lines preserve the TZ-SALES-324 skeleton.
- Preview payload is not persisted to Mongo or Quotation.

## Verification

- Implementation commit: `e1e84cb8`
- Backend tsc: PASS
- `document-templates-build` e2e: **10/10 PASS**
- Frontend tsc: PASS
- `proposal-create` focused Jest: **11/11 PASS**
- Cursor/PO visual PASS: products appear in the assigned table, empty state is a skeleton, and A4 has no H/V scroll.
- Scope exclusions preserved: 322, 320, DOC-344/BuilderCanvas, Quotation Save, snapshot refresh, deploy, and foreign DOC-343 WIP.
