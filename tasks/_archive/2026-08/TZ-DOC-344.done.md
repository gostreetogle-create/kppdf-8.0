# TZ-DOC-344 — Builder single default background + yellow-filled star

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T15:55:30Z
closed_by: Buffy / agent-3e757640b7

## Result

- Builder canvas displays exactly one effective background: the valid `defaultBackgroundIndex`, otherwise index 0.
- First upload and legacy invalid indexes heal the UI to default index 0 and persist the heal without changing upload limits or backend upload guards.
- The active/default background star is visibly yellow-filled through the Lucide child SVG; inactive stars remain outline-only.
- PO visual accepted the single-background behavior; the star-fill closeout was self-checked in the Builder DOM contract and focused test.

## Verification

- Frontend typecheck: PASS
- Builder inspector + builder page Jest: PASS, 43/43
- `git diff --check`: PASS
- Builder implementation commits: `ac827f5f`, `53c72ed8`
- Scope exclusions preserved: DOC-342 backend, foreign DOC-343 WIP, SALES-*, 322/320, deploy

## Known limitation

Print/HTML build may still stack all backgrounds when a legacy template has `defaultBackgroundIndex=-1`; that is a separate successor and is not part of this archive.
