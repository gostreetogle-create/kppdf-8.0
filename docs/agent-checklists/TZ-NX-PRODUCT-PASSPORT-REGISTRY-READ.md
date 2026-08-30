# TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:00:00+03:00
- workspace: D:\kppdf-8.0

## Preflight

- [x] Matrix + Review-2 — client pagination; distinct from product dialog preview
- [x] Claim: `tasks/_active/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.md`

## Acceptance

- [x] `PiProductPassportsService` list/getById/getByProductId
- [x] `createProductPassportsHttpDataSource` — client pagination; productId API filter + client search
- [x] Read-only `product-passports` registry
- [x] Tests: service, adapter, catalog, filters/pagination
- [x] `docs/pages/registries.page.md` updated

## Integrity slot

- [x] FIC: frontend-nx only; no XLSX import, no photo migration, no backend schema
- [x] No fake server pagination; preview component unchanged

## Gates

- [x] `pnpm exec nx build kppdf-web`: PASS
- [x] `pnpm exec nx test kppdf-web`: PASS — 265/265
- [x] `pnpm exec nx test data-access`: PASS — 41/41
- [x] `pnpm exec nx run-many -t lint --all`: PASS — 0 errors
- [x] `pnpm run architecture:check:nx`: PASS
- [x] `pnpm run ui:tokens:nx`: PASS

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.done.md`
- [x] delete `tasks/_active/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.md`
- closed_at: 2026-08-29T23:56:00+03:00
