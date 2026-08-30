# TZ-NX-ORGANIZATION-REGISTRY-READ — read-only Organization/Supplier registry

> Supplier coverage via Organization `type` filter; no separate Supplier entity.

## Outcome

Read-only `organizations` registry with **server pagination** on `GET /organizations`.

## Changed files

```
new:
  frontend-nx/libs/data-access/src/lib/organization/organization.types.ts
  frontend-nx/libs/data-access/src/lib/organization/pi-organizations.service.ts
  frontend-nx/libs/data-access/src/lib/organization/pi-organizations.service.spec.ts
  frontend-nx/libs/data-access/src/lib/organization/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/organizations.registry.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/organizations-http-data-source.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/organizations-http-data-source.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/organization-formatters.ts
  docs/agent-checklists/TZ-NX-ORGANIZATION-REGISTRY-READ.md

modified:
  frontend-nx/libs/data-access/src/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registry-filters-pagination.spec.ts
  (+ shared spec mock updates — see supply archive)
  docs/pages/registries.page.md
```

## Implementation summary

- `PiOrganizationsService`: `list({ page, limit, search, type })`, `getById`
- `ORGANIZATIONS_MAX_PAGE_SIZE = 100`
- `createOrganizationsHttpDataSource`: maps RegistryQueryState → server page/limit/search/type
- Registry: name, inn, type badges, contact fields — read-only
- Supplier filter: `type=supplier` option in registry filters

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 265/265
- `pnpm exec nx test data-access`: **PASS** — 41/41
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors
- `pnpm run architecture:check:nx`: **PASS**
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: cursor
verification:
  - PiOrganizationsService: DONE
  - server pagination adapter: DONE
  - read-only registry: DONE
  - docs: DONE
  - gates: PASS
