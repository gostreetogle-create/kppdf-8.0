# TZ-232 Wave A Checklist

## TZ-232.A — Fix subscribe leak in lookup-table.ts

- [x] `lookup-table.ts` rewritten with `DestroyRef` + `takeUntilDestroyed()`
- [x] Signature remains backward-compatible: `createLookupTable<T>(fetcher, keyFn?)`
- [x] Returns `Record<string, T>` signal
- [x] Repeated calls to `fetcher` properly clean up old subscriptions
- [x] No direct `subscribe()` without cleanup
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Unit tests pass (6/6) — new spec created for auto-cleanup on destroy

## TZ-232.N — SubmitGuard + Idempotency middleware

- [x] `submit-guard.ts` created — `SubmitGuard` service (`providedIn: 'root'`)
- [x] `guard<T>()` implements debounce (300ms default), idempotency key via `crypto.randomUUID()`
- [x] `Map<string, string>` for in-flight keys (composite: `method|url|formKey`)
- [x] `Map<string, { result, expiresAt }>` for completed cache (5min ok, 60s 5xx, no 4xx)
- [x] Background cache cleanup via `setInterval` every 60s
- [x] `getActiveKey(url, method)` returns active key or null
- [x] Key registered ONLY AFTER debounce, immediately before `fetcher` call
- [x] `idempotency.interceptor.ts` created — reads key from `SubmitGuard.getActiveKey()`
- [x] Interceptor adds `Idempotency-Key` header to POST/PATCH/DELETE
- [x] Interceptor skips GET requests and requests that already have `Idempotency-Key`
- [x] Interceptor generates fresh UUID for service calls without active SubmitGuard key
- [x] Interceptor does NOT create entries in the Map itself
- [x] Interceptor connected in `app.config.ts` BEFORE auth interceptor
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Unit tests pass (11/11) — 2 suites covering double-click rejection, cache hits, interceptor behavior

## TZ-232.B — defineEntity factory + demo entity

- [x] `entity-service.ts` created with `defineEntity<T, P>()` function
- [x] `EntitySchema<T>` interface defined
- [x] `EntityService<T, P>` has: list, findById, create, update, remove
- [x] All 5 methods use silent-http helpers and build correct URLs
- [x] `inject()` uses `HttpClient`, `API_BASE_URL`, and silent-http helpers
- [x] Demo `Users` entity created with `defineEntity` (endpoint `/users`, type `User`)
- [x] `Users.inject()` returns object with all 5 methods
- [x] Unit tests pass (8/8) — URL construction, correct return types
- [x] Existing services NOT broken (typecheck + lint + test)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] `pnpm test` passes (494/494 all green)

### Wave A Verification Summary

| Sub-Task | Typecheck | Lint | Tests |
|----------|-----------|------|-------|
| TZ-232.A | ✅ Clean | ✅ Clean | ✅ 6/6 |
| TZ-232.N | ✅ Clean | ✅ Clean | ✅ 11/11 |
| TZ-232.B | ✅ Clean | ✅ Clean | ✅ 8/8 |
| **Full Suite** | — | — | ✅ 494/494 (54 suites) |