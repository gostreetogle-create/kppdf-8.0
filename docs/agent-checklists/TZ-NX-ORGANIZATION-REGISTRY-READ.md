# TZ-NX-ORGANIZATION-REGISTRY-READ checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-ORGANIZATION-REGISTRY-READ.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:00:00+03:00
- workspace: D:\kppdf-8.0

## Preflight

- [x] Matrix + Review-2 archives — supplier = Organization `type` filter
- [x] Claim: `tasks/_active/TZ-NX-ORGANIZATION-REGISTRY-READ.md`

## Acceptance

- [x] `PiOrganizationsService` list + getById (`GET /organizations` server pagination)
- [x] `createOrganizationsHttpDataSource` — search/type filters; limit clamp 100
- [x] Read-only `organizations` registry (no write actions)
- [x] Tests: service, adapter, catalog, filters/pagination
- [x] `docs/pages/registries.page.md` updated

## Integrity slot

- [x] FIC: frontend-nx only; no Supplier entity; no import/write/backend changes
- [x] Honest server pagination mapping

## Gates

- [x] `pnpm exec nx build kppdf-web`: PASS
- [x] `pnpm exec nx test kppdf-web`: PASS — 265/265
- [x] `pnpm exec nx test data-access`: PASS — 41/41
- [x] `pnpm exec nx run-many -t lint --all`: PASS — 0 errors
- [x] `pnpm run architecture:check:nx`: PASS
- [x] `pnpm run ui:tokens:nx`: PASS

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-ORGANIZATION-REGISTRY-READ.done.md`
- [x] delete `tasks/_active/TZ-NX-ORGANIZATION-REGISTRY-READ.md`
- closed_at: 2026-08-29T23:56:00+03:00
