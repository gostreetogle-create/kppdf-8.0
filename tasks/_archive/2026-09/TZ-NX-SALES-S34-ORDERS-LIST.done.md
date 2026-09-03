# TZ-NX-SALES-S34-ORDERS-LIST

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`apps/kppdf-web/tsconfig.app.json --noEmit`)
  - tests: PASS (focused route/page/shell; 3 suites / 22 tests)
  - lint: PASS for S34-owned files; unrelated full-app errors pre-existing
  - kppdf-web build: PASS (exit 0; existing Angular warnings)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- Added the authenticated NX `/orders` route.
- Added `OrdersListPage`, a read-only OnPush journal backed by `PiOrdersService.list()`.
- Added explicit loading, retryable error, empty, status, payment, and direct-order (`Без КП`) states.
- Added focused tests for loading/error-retry/empty/rows and updated route/shell expectations for the live Deals entry.
- Synchronized `docs/pages/orders.page.md` and the S34 NX row in `docs/pages/PAGE-TZ-INDEX.md`.
- Kept `/orders/:id`, create/edit actions, HUB expand behavior, and legacy orders files for later TZs.

## Gates

- Focused Jest: PASS, 3 suites / 22 tests.
- App typecheck: PASS.
- S34-owned ESLint scope: PASS, warnings only.
- `nx build kppdf-web`: PASS, final gate.

## Integrity

FIC §A was completed using the existing `Заказы` nav entry and existing `PAGE_KEYS.orders`; no new permission or seed page was needed. SECTION-READINESS and COUPLING-MAP were N/A. Existing unrelated dirty changes, including unrelated hunks already present in `PAGE-TZ-INDEX.md`, were not committed.
