# TZ-NX-SALES-S32-SITES-ENSURE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`libs/data-access/tsconfig.lib.json --noEmit`)
  - tests: PASS (focused and full data-access; 12 suites / 56 tests)
  - lint: PASS (exit 0; pre-existing `page-acl.ts` warning)
  - kppdf-web build: PASS (exit 0; existing Angular warnings)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- Added `Site` type with `_id`, `counterpartyId`, `name`, and `address`.
- Added `PiSitesService.list(counterpartyId)` using `GET /api/sites?counterpartyId=`.
- Added `PiSitesService.ensureDefault(counterpartyId)` using `POST /api/sites/ensure-default`.
- Exported the type and service from the sales data-access index.
- Added HTTPTestingController coverage for query/body/method contracts.

## Gates

- `pnpm exec nx test data-access --testPathPattern=pi-sites.service.spec.ts --runInBand --skip-nx-cache` — PASS.
- `pnpm exec nx test data-access --skip-nx-cache` — PASS, 12 suites / 56 tests.
- `pnpm exec nx lint data-access --skip-nx-cache` — PASS, exit 0.
- `pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` — PASS.
- `pnpm exec nx build kppdf-web` — PASS, final gate.

## Integrity

This was a frontend data-access API client change only. FIC route/permission/module/MCP sections, page docs, section readiness, coupling map, and domain map were N/A. Existing unrelated worktree changes were excluded from the S32 commit.
