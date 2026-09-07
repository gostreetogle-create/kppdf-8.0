# TZ-NX-WAREHOUSE-DEFAULT — DONE

- **agent_id:** claude
- **implementation_sha:** pending (filled at closeout)
- **TZ:** tasks/_ready/nx-supply/TZ-NX-WAREHOUSE-DEFAULT.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (2/7)

## Что сделано

- **Schema:** `Warehouse.isDefault: boolean` (default false, indexed).
- **Service:** `setDefault(id)` — atomic (`updateMany` unset others, then set target); `findDefault()` for S4; `create()`/`update()` route through the same `clearOtherDefaults` helper when `isDefault` is requested true. No new backend route — `isDefault` flows through the existing generic `PATCH /warehouses/:id`.
- **NX minimal UI:** `warehouse-form-dialog` checkbox «Склад по умолчанию»; `warehouses.page` list shows `★ по умолчанию` badge + quick «Сделать по умолчанию» action (`PiWarehousesService.setDefault()` → partial PATCH).
- **Tests:** new `warehouse.service.spec.ts` (module had none) — 6 cases; updated `warehouse-form-dialog.component.spec.ts` + `warehouses.page.spec.ts` for the new field/action.
- **Docs:** `docs/pages/warehouses.page.md` — one-line TZ reference row.

## Gates (все зелёные)

```
backend tsc -p tsconfig.build.json --noEmit → 0
backend pnpm test -- warehouse → 6/6 (new spec)
frontend-nx nx test kppdf-web (full) → 95 suites / 618 passed / 7 skipped / 0 FAIL
frontend-nx nx lint kppdf-web (changed files) → 0 new issues
pnpm architecture:check → 1464 files, baseline 17, 2 resolved
frontend-nx nx build kppdf-web → SUCCESS (last gate)
```

## AC чек

1. Один default; findDefault работает ✔ (spec)
2. gates BE (+ nx build) green; archive ✔

## known_limitation

None for this TZ's scope. No per-org uniqueness needed — `Warehouse` has no `organizationId` scope, so the default is global.

## НЕ тронуто

Ячейки/типы складов; supply receive (S4); dropDatabase.
