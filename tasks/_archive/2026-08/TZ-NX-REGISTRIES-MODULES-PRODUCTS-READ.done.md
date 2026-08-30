# TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ — DONE

## Outcome

**PASS** — read-only registry rows for ProductModule (`modules`) and Product (`products`).

## Changed files

```
frontend-nx/libs/data-access/src/lib/catalog/
  product-module.types.ts
  pi-modules.service.ts
  pi-modules.service.spec.ts
  index.ts

frontend-nx/apps/kppdf-web/src/app/pages/registries/data/
  product-formatters.ts
  modules-http-data-source.ts
  modules.registry.ts
  products-http-data-source.ts
  products.registry.ts
  modules-products-registries.spec.ts
  registries.catalog.ts
  registries.catalog.spec.ts

frontend-nx/apps/kppdf-web/src/app/pages/registries/
  registries.routes.spec.ts
  registry-detail-panel.component.spec.ts

docs/pages/registries.page.md
docs/agent-checklists/TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**`, shell rails, master-table UX, composition mutation.

## Registry matrix

| key | endpoint | pagination | filters | sort |
|-----|----------|------------|---------|------|
| `modules` | `GET /modules` | client slice only (list-all) | none | none |
| `products` | `GET /products` | server | search, status | name, sku, listPrice |

Complex: single «Изделия» table; badge only when `isComplex` present on row; no `isComplex` query param; no Complex registry.

Row actions: «Открыть в Конструкторе» when `/constructor` route exists. No «Открыть состав» (no working composition UI route).

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test data-access`: **PASS** (22 tests)
- `pnpm exec nx test kppdf-web`: **PASS**
- `pnpm exec nx run-many -t lint --all`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (227 files)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
verification:
  - modules registry GET /modules: PASS
  - products registry GET /products: PASS
  - no fake isComplex filter: PASS
  - no fake modules pagination params: PASS
  - existing registries preserved: PASS
