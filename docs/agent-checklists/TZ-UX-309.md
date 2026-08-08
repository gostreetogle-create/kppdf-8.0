# TZ-UX-309 — page chrome unify

**Status:** DONE
**Agent:** Buffy / agent-acfffc1331
**Claimed at:** 2026-08-08T11:00Z
**Closed at:** 2026-08-08T11:15Z
**Workspace:** Freebuff isolated worktree

## Delivered

- Supply and shipping now share a `PiGroupWorkspace` with `Закупки` / `Отгрузка` chips.
- Design now uses the same workspace chrome with its `Очередь` chip.
- Generated documents now uses the Documents workspace chips: `Шаблоны`, `Архив`, `Тексты`, `Таблицы`.
- Added the requested `docs/pages/ui-page-chrome.md` reference.
- Business logic, app-layout navigation, and production cockpit were not changed.

## Verification

- Frontend typecheck: PASS
- Targeted Jest (`pi-group-workspace`, `documents.page`): PASS (2 suites / 4 tests)
- Scoped ESLint: PASS
- `git diff --check`: PASS
- Review: PASS after fixing Documents toolbar projection (`tools` slot)
- Prettier check: existing formatting command reports these four legacy page files need formatting; no formatter write was applied to avoid unrelated churn.

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
