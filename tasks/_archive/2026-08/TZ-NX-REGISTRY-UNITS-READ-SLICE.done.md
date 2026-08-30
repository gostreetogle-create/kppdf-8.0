# TZ-NX-REGISTRY-UNITS-READ-SLICE — first real NX registry vertical slice (Units)

> Read + server-side search/filter/pagination + toggle `isActive` for Units.
> Replaces the demo `units` fixture with real `GET /units` + `PATCH /units/:key`.

## Outcome

First non-fixture `RegistryDataSource` in the `/registries` platform. Demo
`departments` registry preserved unchanged.

## Changed files

```
new:
  frontend-nx/libs/data-access/src/lib/units/pi-units.service.ts
  frontend-nx/libs/data-access/src/lib/units/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units-http-data-source.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units-http-data-source.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/pi-units.service.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts
  docs/agent-checklists/TZ-NX-REGISTRY-UNITS-READ-SLICE.md
  tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-READ-SLICE.done.md

modified:
  frontend-nx/libs/data-access/src/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.spec.ts
```

## Implementation summary

### PiUnitsService (`@kppdf/data-access`)

- `list({ page, limit, search, isActive })` → `GET /units` via `silentGet`
- `update(key, payload)` → `PATCH /units/:key` via `silentPatch`
- No `remove`/`delete` (backend DELETE is a confirmed silent no-op per discovery)
- `limit` clamped to 100 server-side in service

### HTTP RegistryDataSource adapter

- `createUnitsHttpDataSource(unitsService)` maps `RegistryQueryState` → service params
- `search` filter → `?search=`; `status` filter → `?isActive=true|false`
- Page size clamped to 100; sort from query state ignored (backend has no sort param)

### Units registry definition

- Real fields: `key`, `label`, `symbol`, `category`, `isActive`, `isSystem`, `sortOrder`
- All columns `sortable: false`; `rowId: (row) => row.key`
- Row actions: copy-key, activate, deactivate (PATCH `{ isActive }`) — no delete
- Catalog factory injects `PiUnitsService` via `buildRegistriesCatalogDefault()`

### Honest fixture vs API status

- List page description: units = real API, departments = fixture
- Per-registry descriptions updated accordingly
- Units omits `recordCount` (total only known after fetch)

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 83/83 (14 suites)
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors
- `pnpm run architecture:check:nx`: **PASS** — 205 files, 0 violations
- `pnpm run ui:tokens:nx`: **PASS**

## Explicit non-goals (deferred)

- create/edit/delete UI
- DELETE endpoint wiring
- server-side sort
- organization scope
- new permissions/pageKey

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: cursor
verification:
  - PiUnitsService list+update: DONE
  - HTTP RegistryDataSource: DONE
  - units registry replaces demo: DONE
  - departments demo preserved: DONE
  - toggle isActive PATCH: DONE
  - tests: DONE (service, adapter, catalog, detail smoke)
  - gates: PASS
