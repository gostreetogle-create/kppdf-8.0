# TZ-NX-COUNTERPARTY-HUB-TO-FEATURES — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15
- **Dependency:** `4bd786b4` (TZ-NX-COUNTERPARTY-HUB-FACADE)

## Delivered

- Moved `CounterpartyHubFacade` to `libs/features/src/lib/counterparties/`.
- Added `@kppdf/features/counterparties` export and TypeScript path alias.
- Updated the app tray to import the facade from the feature boundary.
- Kept the page, route, tray-local provider, and behavior unchanged.
- Kept `Counterparty` distinct from `Organization`.

## Scope guard

- No `registries/**` files changed.
- No `registry-forms/**` files changed.
- No `pages/studio/**` or order-hub files changed.

## Gates

- App TypeScript: PASS.
- `nx build features`: PASS.
- Focused counterparty specs: PASS (17/17).
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
