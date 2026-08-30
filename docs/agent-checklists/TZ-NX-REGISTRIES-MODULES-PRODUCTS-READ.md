# TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:40:00+03:00

## Acceptance

- [x] PiModulesService list/get
- [x] modules + products registry definitions
- [x] Tests + docs
- [x] Gates PASS

## Integrity slot

- [x] `registries.page.md` — modules/products rows, Complex canon, modules list-all

## Gates

- [x] `pnpm exec nx build kppdf-web` — PASS
- [x] `pnpm exec nx test data-access` — PASS (22)
- [x] `pnpm exec nx test kppdf-web` — PASS
- [x] `pnpm exec nx run-many -t lint --all` — PASS (0 errors)
- [x] `pnpm run architecture:check:nx` — PASS
- [x] `pnpm run ui:tokens:nx` — PASS

## Executor report

- `PiModulesService` — `GET /modules`, `GET /modules/:id`; list-all documented.
- `modules` registry — ProductModule, `_id` rowId, client paging, no filters/sort.
- `products` registry — reuses `PiProductsService`; kind/status columns; complex badge only when API sends `isComplex`; search + status filters; sort on supported fields.
- Catalog order: units → materials → details → modules → products → departments.
- No «Открыть состав» (no NX composition viewer route). Constructor row action preserved.
- No Complex registry, no `isComplex` query param.

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ.done.md`
- [x] remove `tasks/_active/TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ.md`
- closed_at: 2026-08-29T21:42:00+03:00

**Outcome: PASS.**
