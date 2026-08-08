# TZ-CATALOG-337 — Material detail A+ shell

**Outcome:** DONE
**Date:** 2026-08-08
**Executor:** Buffy / agent-119d7cbf7

## Delivered

- Replaced material-detail `PiPageHeader`/section-sheet chrome with `PiPageChrome` crumbs `Каталог / Материалы / <имя>`.
- Added the product/module sibling A+ split: sticky left hero + FACT-304 passport + Photo/Price accordion; right full-height where-used and stock workspace.
- Added populated material photo cover/gallery with a clear empty state.
- Preserved dimensions detail, FactStack facts, price caption, smart back, where-used links, and live stock navigation.
- Explicitly kept material as a leaf: no `ProductBomPanel`, composition-tree, BOM, backend/API, or ModuleMaterials revival.
- Updated material page documentation and PAGE-TZ-INDEX.

## Verification

- Frontend typecheck: PASS (exit 0).
- Angular development build: PASS (exit 0).
- Material-detail Jest: PASS (6/6, exit 0).
- Targeted ESLint: PASS (exit 0).
- Targeted Prettier: PASS for material-detail page/spec.
- `git diff --check`: PASS.
- Prohibited-path review: PASS; desktop/orders/supply/products.page untouched.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T15:00:30Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - angular development build: PASS
  - lint/format: PASS
  - checklist: UPDATED
  - page docs: UPDATED
  - page index: UPDATED
  - progress.md: UPDATED
  - scope review: PASS
  - status synchronization: DEFERRED (user-specified scope excludes STATUS.md; OrchestratorKit verify-status retains 72 pre-existing historical forward-link failures)
lock: .mimocode/locks/TZ-CATALOG-337-material-detail-a-plus.lock
known_limitation: dimensions normalization remains a separate thin follow-up; substitute graph is out of scope.
