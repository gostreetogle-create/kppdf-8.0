# TZ-NX-SUPPLY-REQUEST-REGISTRY-READ checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:00:00+03:00
- workspace: D:\kppdf-8.0

## Preflight

- [x] Matrix: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX.done.md`
- [x] Review-2: `tasks/_archive/2026-08/TZ-NX-REGISTRY-READINESS-REVIEW-2.done.md` — client pagination required
- [x] Claim: `tasks/_active/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.md`

## Acceptance

- [x] `PiSupplyRequestsService` list + getById (`GET /supply-requests`, cap 500)
- [x] `createSupplyRequestsHttpDataSource` — client pagination; filters status/priority/search/orderId
- [x] Read-only `supply-requests` registry in catalog (no create/rowActions)
- [x] Tests: service, adapter, catalog, filters/pagination
- [x] `docs/pages/registries.page.md` updated

## Integrity slot

- [x] FIC: frontend-nx only; no backend/legacy/import/write actions
- [x] No fake server pagination; no invoice/status mapping inventions
- [x] Conflict keys respected — catalog factory signature extended consistently

## Gates

- [x] `pnpm exec nx build kppdf-web`: PASS
- [x] `pnpm exec nx test kppdf-web`: PASS — 265/265
- [x] `pnpm exec nx test data-access`: PASS — 41/41
- [x] `pnpm exec nx run-many -t lint --all`: PASS — 0 errors
- [x] `pnpm run architecture:check:nx`: PASS
- [x] `pnpm run ui:tokens:nx`: PASS

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.done.md`
- [x] delete `tasks/_active/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.md`
- closed_at: 2026-08-29T23:56:00+03:00
