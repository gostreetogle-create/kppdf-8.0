# TZ-NX-REGISTRIES-PAGE-TO-FEATURES — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15
- **Dependency:** `3aef071e` (TZ-NX-REGISTRIES-PAGE-FACADE)

## Delivered

- Moved `RegistriesPageFacade` and scroll helper into `libs/features/src/lib/registries-platform/`.
- Exported them from `@kppdf/features/registries-platform`.
- Updated the app page and registries specs to import from the feature boundary.
- Preserved page-local provider, routes, catalog, and all `data/*.registry.ts` files in app.
- Preserved behavior: URL-driven single expansion, count loading, navigation, and scroll restoration.

## Scope guard

- No `counterparties/**` files changed.
- No studio-list or order-hub files changed.
- No registry-forms internals changed.
- No wholesale registry data move.

## Gates

- App TypeScript: PASS.
- `nx build features`: PASS.
- Registries page/routes/a11y focused tests: PASS (27 passed, 1 skipped).
- `nx lint features`: baseline FAIL from existing intra-library boundary violations and warnings.
- Final `nx build kppdf-web`: PASS; existing Angular and bundle/style budget warnings only.

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
