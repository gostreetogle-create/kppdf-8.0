# TZ-NX-COUNTERPARTY-HUB-FACADE — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15

## Delivered

- Added a Signals-based `CounterpartyHubFacade` for the existing counterparty hub read model.
- Kept `CounterpartyHubFacade` provided on `CounterpartyHubTrayComponent`, not root.
- Reduced the tray class to input/template wiring and facade load orchestration.
- Preserved the four existing blocks, routes, loading/error/empty states, and four-request expand budget.
- Preserved domain semantics: buyer is `Counterparty`; `Organization` is not substituted.

## Scope guard

- No `registries/**` files changed.
- No `registry-forms/**` files changed.
- No `pages/studio/**` or order-hub files changed.

## Gates

- App TypeScript: PASS.
- Focused counterparty specs: PASS (17/17).
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
