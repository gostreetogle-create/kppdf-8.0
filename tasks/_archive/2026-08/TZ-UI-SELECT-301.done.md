# TZ-UI-SELECT-301 — catalog overflow search migration

**Outcome:** DONE
**Date:** 2026-08-08
**Executor:** Buffy (openai/gpt-5.6-luna)
**Source:** `tasks/TZ-UI-SELECT-301-catalog-overflow-search-migrate.md`

## Delivered

- Migrated growing category, supplier, counterparty, site, organization and product picks to `app-pi-overflow-select`.
- Preserved native selects for fixed enums such as status, kind, priority, discount type and dimension units.
- Kept existing form control values, change handlers, dirty tracking and submit payloads.
- Added `searchable="auto"` inventory coverage and the 10-item threshold behavior to the shared selector.
- Updated `docs/pages/ui-overflow-select.md` with the consumer inventory.

## Verification

- Acceptance criteria: PASS
- Targeted Jest: PASS (35 tests: overflow-select, product-module-picker, product-form-dialog)
- Targeted ESLint: PASS (0 errors; one existing architecture warning in order form)
- Prettier: PASS
- `git diff --check`: PASS
- Full frontend tsc: baseline blocked by unrelated pre-existing `materials.page.ts` WIP importing untracked `shared/util/material-dimensions.ts`; no selector migration compiler error.

## Scope guard

FACT-304 / FORM-307, orders peer, supply/** and desktop/** excluded from the commit.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T15:20:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - targeted tests: PASS
  - targeted lint: PASS
  - format: PASS
  - diff check: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
known_limitation: full frontend tsc baseline is blocked by unrelated materials.page WIP; deploy not performed
