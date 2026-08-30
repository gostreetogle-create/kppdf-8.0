# TZ-NX-REGISTRY-UNITS-READ-SLICE checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-READ-SLICE.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T19:55:00+03:00
- workspace: D:\kppdf-8.0

## Preflight

- [x] Discovery archived: `tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-DISCOVERY.done.md`
- [x] `_NOW.md` ACTIVE/LIVE empty — no conflicting active TZ
- [x] Legacy contract: `units.service.ts`, `unit.controller.ts`
- [x] NX precedent: `pi-roles.service.ts`, fixture adapter, registry-detail page
- [x] Claim: `tasks/_active/TZ-NX-REGISTRY-UNITS-READ-SLICE.md`

## Acceptance

- [x] `PiUnitsService` list + update (no DELETE)
- [x] HTTP `RegistryDataSource` adapter with search/isActive/page clamp
- [x] Real `units` registry replaces demo; `departments` demo preserved
- [x] Toggle `isActive` row actions via PATCH
- [x] All columns `sortable: false`
- [x] Tests + gates PASS

## Integrity slot

- [x] FIC: frontend-nx only, no backend/permission changes
- [x] Conflict keys respected — only allowed paths touched

## Gates

- [x] `pnpm exec nx build kppdf-web`: PASS
- [x] `pnpm exec nx test kppdf-web`: PASS — 83/83
- [x] `pnpm exec nx run-many -t lint --all`: PASS — 0 errors
- [x] `pnpm run architecture:check:nx`: PASS
- [x] `pnpm run ui:tokens:nx`: PASS

## Executor report

**Реализовано:**
- `PiUnitsService` — `GET /units`, `PATCH /units/:key`, silentHttp, limit clamp 100, no delete.
- `createUnitsHttpDataSource` — first real `RegistryDataSource`; maps search/status/page; ignores sort.
- `createUnitsRegistryDefinition` — real columns/fields, `rowId: row.key`, activate/deactivate PATCH actions.
- Catalog factory `buildRegistriesCatalogDefault(inject(PiUnitsService))` — units real + departments fixture.
- Honest descriptions on list page and per-registry cards.
- 4 new spec files + updated detail smoke tests.

**Outcome: PASS.**

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-READ-SLICE.done.md`
- [x] delete `tasks/_active/TZ-NX-REGISTRY-UNITS-READ-SLICE.md`
- closed_at: 2026-08-29T20:00:00+03:00
