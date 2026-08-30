# TZ-NX-CATALOG-DATA-ACCESS-READ checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-NX-CATALOG-DATA-ACCESS-READ.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:15:00+03:00

## Acceptance

- [x] PiMaterialsService list/get
- [x] PiProductsService list/get
- [x] Real DTO types, silent HTTP, query params, limit clamp 100
- [x] No org scope in params; unit tests; public exports via `@kppdf/data-access`
- [x] Gates PASS

## Gates

- [x] `nx build data-access` + `nx build kppdf-web`
- [x] `nx test data-access` — 16/16
- [x] `nx test kppdf-web` — PASS
- [x] `nx lint data-access`
- [x] `architecture:check:nx`
- [x] `ui:tokens:nx`

## Executor report

- Types mirrored from legacy `materials.service.ts` / `products.service.ts` + backend schemas.
- `ProductDetail.isComplex` on getById only (backend enrichment).
- Jest preset upgraded to `jest-preset-angular` for HTTP service specs in lib.
- Exported: `PiMaterialsService`, `PiProductsService`, types, `MATERIAL_KINDS`, max page constants.

**Outcome: PASS.**

## Closeout

- [x] archive done
- [x] active claim removed
- closed_at: 2026-08-29T21:20:00+03:00
