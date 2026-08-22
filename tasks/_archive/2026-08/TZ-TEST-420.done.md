# TZ-TEST-420: Починить 8 pre-existing FE Jest (login + production-read)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22T23:15:00+03:00
closed_by: freebuff-2

## Root cause

**login.page.spec.ts** (4 failures):
1. Missing `ActivatedRoute` provider — `RouterLink` directive needs it
2. Missing `Router` methods — `createUrlTree`, `serializeUrl`, `isActive`, `events` needed by `RouterLink`
3. Stale `data-test="personal-project-notice"` selector — template uses `data-test="internal-is-notice"`

**production-read.facade.spec.ts** (4 failures):
- Facade's `prefetchCatalog()` now uses `findByIds()` (batch API) instead of individual `findById()` calls
- All 4 test mocks only provided `findById` — facade's `prefetchCatalog` called `findByIds()` which was undefined → TypeError → caught → bars = []

## Fixes

1. **login.page.spec.ts**: Added `ActivatedRoute` mock, `Router` mock with `createUrlTree`/`serializeUrl`/`isActive`/`events`, `Subject` for router events, fixed `data-test` selector from `personal-project-notice` → `internal-is-notice`
2. **production-read.facade.spec.ts**: Added `findByIds` mocks to all 4 tests (products + modules), updated assertions to verify batch calls, simplified deferred-gate test 338 to use synchronous mocks

## Verification

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit   → PASS
cd frontend && pnpm exec jest --config jest.config.js        → 177/177 suites, 1841/1841 tests PASS
cd frontend && pnpm lint                                     → 0 errors, 18 warnings (pre-existing)
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
```

## Changed files

- `frontend/src/app/pages/login/login.page.spec.ts`
- `frontend/src/app/pages/production/production-read.facade.spec.ts`
