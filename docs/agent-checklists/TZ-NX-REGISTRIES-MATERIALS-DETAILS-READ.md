# TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:22:00+03:00

## Acceptance

- [x] materials + details registry definitions (Material API via PiMaterialsService)
- [x] filters: search, categoryId, materialKind (details only); pagination; error/retry
- [x] `_id` rowId; API badge; no stockQty; no fake Constructor link
- [x] tests + gates PASS

## Integrity slot

- [x] Reuses `@kppdf/data-access` PiMaterialsService — no duplicate HTTP client
- [x] Details = Material filter, not new entity
- [x] FIC N/A (no backend/permissions)

## Gates

- [x] `nx build kppdf-web` — PASS
- [x] `nx test kppdf-web` — PASS (134)
- [x] `nx run-many -t lint --all` — PASS
- [x] `architecture:check:nx` — PASS
- [x] `ui:tokens:nx` — PASS

## Executor report

- `createMaterialsHttpDataSource` — modes `materials` (fixed raw) / `details` (kind filter, default part).
- Column set: name, article, sku, unit, category, grade, assortment, price — no stockQty.
- `buildOpenConstructorRowAction` gated by `collectPageRoutePaths` includes `/constructor`.
- Catalog order: units → materials → details → departments.

**Outcome: PASS.**

## Closeout

- [x] archive done; active claim removed
- closed_at: 2026-08-29T21:21:00+03:00
