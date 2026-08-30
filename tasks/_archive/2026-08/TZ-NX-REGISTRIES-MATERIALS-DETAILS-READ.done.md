# TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ — DONE

## Outcome

**PASS** — «Материалы» (materialKind=raw) and «Детали» (part/fastener/purchased/other)
registries on `/registries` master table via `PiMaterialsService`.

## Registry matrix

| key | title | API filter | rowId |
|-----|-------|------------|-------|
| `materials` | Материалы | `materialKind=raw` (fixed) | `_id` |
| `details` | Детали | `materialKind` select (default part) | `_id` |

Shared: search, categoryId, pagination, silent error→retry, source badge `api`.
No stockQty column. No sort param. No organizationId. Constructor row action only when `/constructor` route exists.

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/
  material-formatters.ts
  materials-http-data-source.ts
  materials.registry.ts
  details.registry.ts
  registry-constructor-action.ts
  registries.catalog.ts
  materials-registries.spec.ts
  registries.catalog.spec.ts
  registries.routes.spec.ts (updated)
  registry-detail-panel.component.spec.ts (updated)
```

## Gates

- `nx build kppdf-web`: PASS
- `nx test kppdf-web`: PASS (134 tests)
- `nx run-many -t lint --all`: PASS (0 errors)
- `architecture:check:nx`: PASS
- `ui:tokens:nx`: PASS

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
