# TZ-NX-SALES-S33-PI-ORDERS-CRUD

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`libs/data-access/tsconfig.lib.json --noEmit`)
  - tests: PASS (focused and full data-access; 13 suites / 60 tests)
  - lint: PASS (exit 0; pre-existing `page-acl.ts` warning)
  - kppdf-web build: PASS (exit 0; existing Angular warnings)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- Expanded `Order` and `OrderItem` contracts with references, lifecycle, payment, readiness, and item identity fields.
- Added `CreateOrderPayload` and `UpdateOrderPayload` aligned with the existing backend DTOs.
- Added `PiOrdersService.getById`, `.create`, and `.update` using `silentGet`, `silentPost`, and `silentPatch`.
- Kept `/orders/:id/stub-proposal` out of the data-access service by contract.
- Added HTTPTestingController coverage for list/detail/create/update.

## Gates

- `pnpm exec nx test data-access --testPathPattern=pi-orders.service.spec.ts --runInBand --skip-nx-cache` — PASS.
- `pnpm exec nx test data-access --skip-nx-cache` — PASS, 13 suites / 60 tests.
- `pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` — PASS.
- `pnpm exec nx lint data-access --skip-nx-cache` — PASS, exit 0.
- `pnpm exec nx build kppdf-web` — PASS, final gate.

## Integrity

This was a frontend data-access API client change only. FIC route/permission/module/MCP sections, page docs, section readiness, coupling map, and domain map were N/A. Existing unrelated worktree changes were excluded from the S33 commit.
