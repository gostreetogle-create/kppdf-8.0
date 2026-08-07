# TZ-CATALOG-332 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-CATALOG-332.md`
> Commit/push: **YES** per PO queue instruction

## Claim slot

- agent_id: `agent-3e757640b7`
- claimed_at: `2026-08-07T22:45:54Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: yes

## Preflight

- [x] canonical workspace `D:\kppdf-8.0`, branch `main`
- [x] TZ-332 and catalog entity colors audit read
- [x] TZ-331 commit `d70461d` is on main; palette helper is available
- [x] active map checked; no competing TZ-332 claim
- [x] unrelated dirty WIP (desktop, broad page chrome, backend/main) excluded from staging

## Conflict keys

- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/modules/modules.page.ts`
- `frontend/src/app/pages/materials/materials.page.ts`
- `frontend/src/app/pages/products/product-composition-picker-dialog.component.ts`
- `frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts`
- `docs/pages/products.page.md`
- `docs/pages/modules.page.md`
- `docs/pages/materials.page.md`

## Acceptance

- [x] Products, Modules, Materials show kind with a restrained left strip/dot.
- [x] Composition picker tabs use the same kind-marker palette; existing overflow picker is preserved.
- [x] Light/dark remain readable; dense table chrome is preserved by using a narrow solid strip only.
- [x] No RAL, Gantt, or BOM tree internals changed; `materialKind` is passed only for material rows.
- [x] Related specs and FE tsc pass.

## Gates

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/products/product-composition-picker-dialog.component.spec.ts src/app/pages/products/products.page.spec.ts src/app/pages/modules/modules.page.spec.ts src/app/pages/materials/materials.page-316.spec.ts src/app/shared/ui/catalog/catalog-kind-oklch.spec.ts` — PASS (5 suites / 33 tests)
- [x] Scoped ESLint without `--fix` — PASS
- [x] `git diff --check` on TZ-332 paths — PASS

## Executor report

- Cursor PASS received from PO; closeout commit pending SHA.

## Review handoff

- [x] Cursor PASS received; ready to archive and commit.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-08
