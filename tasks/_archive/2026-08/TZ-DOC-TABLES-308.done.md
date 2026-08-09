# TZ-DOC-TABLES-308 — dialog source/fields balance + live preview

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T14:37:14Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- Source and fields controls share a centered baseline and comparable widths on the registry row; narrow layouts may wrap.
- Interactive column headers have a 124px minimum height with increased padding for readable key/label controls.
- Empty client previews render visible skeleton cells under the header plus the existing RU guidance message, avoiding an empty lower gray area.
- `tables.page.md` documents the dialog layout and preview behavior.

## Verification

- Frontend tsc: PASS.
- Focused dialog Jest: **44/44 PASS**.
- `git diff --check`: PASS.
- Scope exclusions preserved: 306 chips, 307 enum/preset, backend registry, DOC-343 WIP, and deploy.
