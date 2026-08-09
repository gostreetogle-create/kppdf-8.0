# TZ-SALES-310 DONE — Deals TOC and КП subchips

**Date:** 2026-08-09  
**Wave:** WAVE-KP-VITRINE #1  
**Status:** DONE

## Product result

The Deals surfaces now have a consistent hierarchy:

- dark TOC: **КП | Договоры | Заказы**;
- proposal-only yellow subchips: **Создать КП | Все КП**;
- `/proposals/create` is a guarded lazy route with a stable stub heading;
- contracts and orders keep the shared TOC but no longer advertise a КП CTA;
- `/proposals` remains the existing solo quotation list over `/quotations`.

## Scope boundaries

Reused `PiGroupWorkspaceComponent` and the existing Quotation API. No three-column create studio, family expand, schema rewrite, ModuleMaterials, second write-path, or deploy was introduced. The full create studio continues in TZ-SALES-311/312+.

## Gates

- Frontend TypeScript: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`).
- Focused Jest: PASS — 2 suites / 18 tests (`deals-group-chips.spec.ts`, `proposals.page.spec.ts`).
- Angular development build: PASS.
- Prettier: PASS for changed frontend files.
- `git diff --check`: PASS.
- `verify-status.sh`: not a product gate for this frontend task; repository retains the documented pre-existing legacy kit-era drift.

## Files

- `frontend/src/app/pages/commercial/deals-group-chips.ts`
- `frontend/src/app/pages/commercial/deals-group-chips.spec.ts`
- `frontend/src/app/pages/commercial/proposals/proposals.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/contracts/contracts.page.ts`
- `frontend/src/app/pages/orders/orders.page.ts`
- `frontend/src/app/app.routes.ts`
- related page docs, checklist, queue and checkpoint
