# TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ — read-only ProductPassport collection registry

> Distinct from computed passport preview in product dialog; collection view on `/registries/product-passports`.

## Outcome

Read-only `product-passports` registry with **client pagination** on `GET /passports`.

## Changed files

```
new:
  frontend-nx/libs/data-access/src/lib/product-passport/product-passport.types.ts
  frontend-nx/libs/data-access/src/lib/product-passport/pi-product-passports.service.ts
  frontend-nx/libs/data-access/src/lib/product-passport/pi-product-passports.service.spec.ts
  frontend-nx/libs/data-access/src/lib/product-passport/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/product-passports.registry.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/product-passports-http-data-source.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/product-passports-http-data-source.spec.ts
  docs/agent-checklists/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.md

modified:
  frontend-nx/libs/data-access/src/index.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registry-filters-pagination.spec.ts
  (+ shared spec mock updates — see supply archive)
  docs/pages/registries.page.md
```

## Implementation summary

- `PiProductPassportsService`: `list({ productId? })`, `getById`, `getByProductId`
- No pagination params on list API; UI slices client-side
- `productId` filter sent to API; `search` applied client-side on passportNumber/name
- Registry shows passport snapshot fields; live Product link via productId column
- Product dialog preview (`build-product-passport-preview`) unchanged

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
  - PiProductPassportsService: DONE
  - client pagination adapter: DONE
  - read-only registry distinct from preview: DONE
  - docs: DONE
  - gates: PASS
