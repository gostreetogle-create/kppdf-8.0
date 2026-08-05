# TZ-CATALOG-314 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-CATALOG-314.done.md`
> Commit/push: closeout with product code allowlist

## Claim slot

- agent_id: Buffy / openai/gpt-5.6-luna (implement) → Cursor (closeout)
- claimed_at: 2026-08-05T21:20:55Z
- closed_at: 2026-08-06T22:05:00Z (approx local)
- workspace: `D:\kppdf-8.0`

## Acceptance

- [x] ProductModule DELETE archives (`deletedAt`); default reads exclude archived
- [x] Structured refs block archive with HTTP 409
- [x] Org scope on Product/Material/Category (+ Product composition/tree); Module/WorkType shared
- [x] ProductModulePhoto / 313 dual-write preserved; Passport/InventorFile untouched
- [x] Focused tests cover archive + guards

## Gates (closeout re-run)

- [x] `pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] focused Jest 5 suites / 46 tests — PASS
- [x] scoped ESLint — PASS
- [x] scoped `git diff --check` — PASS

## Closeout

- [x] archive + ARCHIVE_MARKER + lock
- [x] Status = DONE
- [x] remove `tasks/_active/TZ-CATALOG-314.md`
