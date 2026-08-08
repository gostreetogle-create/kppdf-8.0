# TZ-UX-309 — page chrome unify

**Outcome:** DONE
**Date:** 2026-08-08
**Source:** `tasks/_backlog/TZ-UX-309-page-chrome-unify.md`

## Delivered

- Supply and shipping now share `PiGroupWorkspace` with sibling chips `Закупки` and `Отгрузка`.
- Design now uses the same workspace chrome with an `Очередь` chip.
- Generated documents now uses the Documents workspace chips for templates, archive, texts, and tables.
- Added `docs/pages/ui-page-chrome.md` as the requested canonical reference.
- Existing business logic, app-layout navigation, and production cockpit were left unchanged.

## Verification

- Frontend typecheck: PASS
- Targeted Jest: PASS (`pi-group-workspace` and `documents.page`, 2 suites / 4 tests)
- Scoped ESLint: PASS
- `git diff --check`: PASS
- Review: PASS after correcting Documents toolbar projection into the workspace tools slot.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:15:00Z
closed_by: agent-acfffc1331
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - diff-check: PASS
  - checklist: UPDATED
  - docs: UPDATED
known_limitations:
  - supply/shipping/design remain intentionally light pages/stubs; this TZ changes chrome only
  - Prettier reports formatting drift in the four scoped files; no auto-format pass was run
  - deploy: NO
