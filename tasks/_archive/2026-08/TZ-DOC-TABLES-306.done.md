# TZ-DOC-TABLES-306 — «Из данных» stays in Documents → Tables

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T14:33:25Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- `GroupChip` supports optional query parameters separately from its route path.
- `PiGroupWorkspace` binds path and query params independently for TOC and section chips.
- `TABLES_SECTION_CHIPS` now uses `/doc-constructor/tables` with `{ view: 'all' }` and `{ view: 'from-data' }`; no query string is embedded in a route.
- The generated «Из данных» link stays on `/doc-constructor/tables?view=from-data` and preserves the from-registry flow instead of falling through to `/materials`.
- `tables.page.md` documents the path/queryParams separation.

## Verification

- Frontend tsc: PASS.
- Focused Jest: PASS, workspace + tables 2 suites / 14 tests.
- Prettier: PASS.
- `git diff --check`: PASS.
- Route contract PASS: generated href contains `/doc-constructor/tables?view=from-data` and excludes `/materials`.
- Scope exclusions preserved: table dialog/preset 307, Catalog routes, KP Create, DOC-343 WIP, and deploy.
