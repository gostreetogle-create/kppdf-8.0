# TZ-CATALOG-332 — Kind-цвета списков каталога + picker

**Outcome:** DONE
**Date:** 2026-08-08

## Delivered

- Added a shared restrained kind marker (narrow OKLCH strip) to Products, Modules and Materials list name cells.
- Added the same kind marker to composition picker tabs while preserving the existing `PiOverflowSelect` interaction and option contract.
- Materials pass `materialKind` only on material rows, preserving the raw-material hue distinction from TZ-330/331.
- Updated Products, Modules and Materials page documentation.
- No changes to `catalog-kind-oklch.ts`, RAL/color references, Gantt/WorkType colors, BOM tree internals, desktop, COST or TZ-333 work.

## Verification

- FE tsc PASS.
- Related Jest PASS: 5 suites / 33 tests.
- Scoped ESLint without `--fix` PASS.
- `git diff --check` PASS on TZ-332 files.
- Cursor PASS received before closeout.

## Closeout

- Archive + checklist + progress + active-map synchronized.
- Implementation commit: `23c47b0c564bfba55cff9619818fb54b63d32239`.
- Closeout commit: `06d74f7e9423d6c879d5bafc2ea4bc8ea62e2565`.
- Commit SHA is recorded in the checklist, progress and lock after commit.
- Deploy not performed.

ARCHIVE_MARKER
outcome: DONE
date: 2026-08-08
summary: restrained catalog kind markers on lists and composition picker
