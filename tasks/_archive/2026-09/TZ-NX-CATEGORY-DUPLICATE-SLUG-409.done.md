# TZ-NX-CATEGORY-DUPLICATE-SLUG-409: дубль slug категории → 409, не сырой 500

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3)
  - typecheck: PASS (BE tsc)
  - tests: PASS (BE 135 suites / 1348 tests, was 1344 — +4 new)
  - lint: PASS (0 errors, 2 scoped files)
  - architecture:check: PASS
  - live curl evidence: PASS (both {type,slug} and skuPrefix collisions -> 409, not 500)
  - checklist: `docs/agent-checklists/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-SUCCESSORS.md updated)

## Root cause / finding

`CategoryService.create()`/`.update()` never caught a Mongo E11000
duplicate-key error, so a collision on either of `Category`'s two unique
indexes (compound `{type, slug}`, or standalone `skuPrefix`) surfaced as a
raw 500 "Internal server error" instead of a clean, actionable 409.

## Fix

Both `create()` and `update()` now wrap their persistence call in try/catch,
delegating to a new `rethrowDuplicate()` that inspects `err.keyPattern` to
give a specific RU message for each of the two possible collisions. Any
other error is re-thrown unchanged.

## Files changed

- `backend/src/modules/category/category.service.ts` (+ `.spec.ts`)
- `docs/agent-checklists/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.md` + `evidence/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.txt` (new)
