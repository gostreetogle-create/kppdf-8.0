# TZ-DOC-TABLES-307 — KP category + canonical column preset

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T14:42:11Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- Added `kp` / «КП» to the TableTemplate category contract without changing existing categories.
- Added canonical six-column KP line-item preset: `index`, `productName`, `quantity`, `unit`, `unitPrice`, `sum`.
- `TableTemplateService.onModuleInit()` idempotently ensures active «КП — позиции» exists; repeated boots do not duplicate the same name/category preset.
- Added «Пресет КП» to the table dialog. Empty dialogs apply directly; existing columns require an explicit replacement confirmation. The action only changes the current dialog form.
- Updated tables page documentation and PAGE-TZ-INDEX.

## Verification

- Backend tsc: PASS.
- Backend table-template e2e: **9/9 PASS**.
- Frontend tsc: PASS.
- Frontend tables/dialog Jest: **52/52 PASS**.
- `git diff --check`: PASS.
- Scope exclusions preserved: DOC-343 dirty WIP, 306 chips, 308 layout, 330/331, discount column, Catalog routes, and deploy.
