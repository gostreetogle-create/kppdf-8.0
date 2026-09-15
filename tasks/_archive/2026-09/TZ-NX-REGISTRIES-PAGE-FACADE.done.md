# TZ-NX-REGISTRIES-PAGE-FACADE — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15

## Delivered

- Extracted `RegistriesPageFacade` with Signals for registry key, unknown state, master rows/grouping, record-count loading, navigation, and scroll restoration.
- Kept the page-scoped provider and page templates in app.
- Preserved `restoreRegistryScrollPosition` export and existing registry behavior.
- Kept all `pages/registries/data/*.registry.ts` in app; no wholesale data move.

## Scope guard

- No `counterparties/**` files changed.
- No studio-list or order-hub files changed.
- No `registry-forms` internals changed.

## Gates

- App TypeScript: PASS.
- Registries page/routes/a11y focused tests: PASS (27 passed, 1 skipped).
- `nx lint kppdf-web`: baseline FAIL from existing lazy-boundary/accessibility violations.
- Final `nx build kppdf-web`: PASS; existing Angular and budget warnings only.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
