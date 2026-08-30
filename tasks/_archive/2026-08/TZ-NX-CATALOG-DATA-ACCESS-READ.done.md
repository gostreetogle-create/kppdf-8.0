# TZ-NX-CATALOG-DATA-ACCESS-READ — DONE

## Outcome

**PASS** — read-only `PiMaterialsService` + `PiProductsService` in `@kppdf/data-access/catalog`.

## API surface

| Service | Methods | Endpoints |
|---------|---------|-----------|
| `PiMaterialsService` | `list`, `getById` | `GET /materials`, `GET /materials/:id` |
| `PiProductsService` | `list`, `getById` | `GET /products`, `GET /products/:id` |

List filters mirror backend controllers exactly. Limit clamped client-side to 100 (server max).
No `organizationId` query param — org scope from JWT/interceptor.

## Changed files

```
frontend-nx/libs/data-access/src/lib/catalog/
  material.types.ts
  product.types.ts
  pi-materials.service.ts
  pi-materials.service.spec.ts
  pi-products.service.ts
  pi-products.service.spec.ts
  index.ts
frontend-nx/libs/data-access/src/index.ts
frontend-nx/libs/data-access/jest.config.ts
frontend-nx/libs/data-access/src/test-setup.ts
docs/agent-checklists/TZ-NX-CATALOG-DATA-ACCESS-READ.md
```

## Gates

- `nx build data-access` + `nx build kppdf-web`: **PASS**
- `nx test data-access`: **PASS** (16 tests)
- `nx test kppdf-web`: **PASS**
- `nx lint data-access`: **PASS**
- `architecture:check:nx`: **PASS**
- `ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
