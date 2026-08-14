# TZ-CATALOG-371 DONE — безопасная копия изделия

```
ARCHIVE_MARKER
task: TZ-CATALOG-371
outcome: DONE
closed_at: 2026-08-13
closed_by: Buffy (predeploy executor)
workspace: D:\kppdf-8.0
implementation_sha: bd23a4d10273c8a412c9d665d1f3f59200163ac8
closeout_sha: fc065b7ee345cd0939cf67a698d044a4f997c874
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-CATALOG-371.md)
  - backend tsc: PASS
  - ProductService focused Jest: 16/16 PASS
  - frontend tsc: PASS
  - ProductsService focused Jest: 2/2 PASS
  - backend/frontend changed-file ESLint: PASS
  - architecture:check: PASS
  - git diff --check: PASS
  - security/diff review: PASS
  - checklist: DONE
  - products.page.md: UPDATED
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
```

## Delivered

- Owner-scoped `POST /api/products/:id/duplicate` with a whitelist DTO for
  name/description/unit/sku overrides.
- Collision-safe default name/SKU generation, bounded unique-SKU retry and
  Russian 409 for an explicitly occupied SKU.
- Passport, composition (including independent embedded line arrays), EAV
  values and photo/module/category references copied by contract.
- New Product starts with `stockQty=0`, `status=draft`, `isActive=true`,
  `isSystem=false`, fresh timestamps/version and `copiedFromProductId`.
- Strict organization source filter hides deleted/archived/cross-org products.
- Optional `expectedVersion` Product update filter returns 409 without a stale
  overwrite; old callers without it retain their existing behavior.
- Typed Angular `ProductsService.duplicate()` and version fields for the next
  snapshot-resolution TZ.

## Known limits

EAV copy uses the existing EAV transaction helper after Product creation;
photo binaries are intentionally not duplicated; no UI button is added in this
TZ. The explicit copy/rebind workflow belongs to TZ-SALES-372. Production,
deploy, SSH, nginx, migration and wipe were not executed.
