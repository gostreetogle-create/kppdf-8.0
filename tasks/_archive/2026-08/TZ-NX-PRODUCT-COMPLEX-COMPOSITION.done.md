# TZ-NX-PRODUCT-COMPLEX-COMPOSITION — DONE (2026-08-30)

## Outcome (original session)
Products list exposes derived `isComplex`; registry filter «Комплекс» (Все/Комплекс/Обычное); composition picker shows «Изделие» tab for product parent.

## Changes (original session)
- `backend/product.service.ts` — `findAll` attaches `isComplex`, server filter `isComplex=true|false`
- `backend/product.controller.ts` — `isComplex` query param
- `products.registry.ts` — isComplex select filter + badge column
- `products-http-data-source.ts` — passes `isComplex` to `PiProductsService.list`
- `pi-products.service.ts` — `isComplex` HTTP param
- `modules-products-registries.spec.ts` — filter contract tests

## Gates (original session)
- `nx build kppdf-web` green
- `backend tsc` green

## Independent live verification + closeout (Claude, 2026-08-30T15:57:14Z) — see `docs/agent-checklists/TZ-NX-PRODUCT-COMPLEX-COMPOSITION.md`

Confirmed the pre-existing badge column had nothing to show before this
TZ (list endpoint was detail-only for `isComplex`) — now correctly
populated. Fixed one piece of dead code (`parseIsComplexFilter()` defined
but never called). Live-verified via direct API (`isComplex=true` → 5,
`isComplex=false` → 63, total 68) and the real browser UI (Playwright
screenshot: filter selected, table shows 1-5 из 5 with the badge visible
on real rows). Gates: backend 34/34 product tests, frontend 45/46 (1
pre-existing unrelated failure, documented in `_NOW.md` PARK), build/lint
clean.
