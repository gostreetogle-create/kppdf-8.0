# TZ-NX-SUPPLY-REQUEST-REGISTRY-READ — read-only SupplyRequest registry

> First supply vertical in `/registries`: list + detail from existing `GET /supply-requests`.

## Outcome

Read-only `supply-requests` registry with **client pagination** (API returns full list, max 500).

## Changed files

```
new:
  frontend-nx/libs/data-access/src/lib/supply/supply-request.types.ts
  frontend-nx/libs/data-access/src/lib/supply/pi-supply-requests.service.ts
  frontend-nx/libs/data-access/src/lib/supply/pi-supply-requests.service.spec.ts
  frontend-nx/libs/data-access/src/lib/supply/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/supply-requests.registry.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/supply-requests-http-data-source.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/supply-requests-http-data-source.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/supply-request-formatters.ts
  docs/agent-checklists/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.md

modified:
  frontend-nx/libs/data-access/src/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registry-filters-pagination.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registry-action-matrix.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/material-row-dialogs.spec.ts
  docs/pages/registries.page.md
```

## Implementation summary

- `PiSupplyRequestsService`: `list(filters)` → `GET /supply-requests` (status, priority, search, orderId); `getById`
- `SUPPLY_REQUESTS_LIST_CAP = 500`; no page/limit query params
- `createSupplyRequestsHttpDataSource`: fetches list once, slices pages in UI (`paginationMode: client`)
- Registry columns: number, status, priority, orderId, requestedAt, items summary
- No `createAction`, no `rowActions`

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
  - PiSupplyRequestsService: DONE
  - client pagination adapter: DONE
  - read-only registry: DONE
  - docs: DONE
  - gates: PASS
