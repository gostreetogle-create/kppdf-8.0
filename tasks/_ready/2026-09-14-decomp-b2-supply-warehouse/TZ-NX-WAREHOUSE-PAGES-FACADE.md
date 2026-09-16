═══════════════════════════════════════════════════════════════
TZ-NX-WAREHOUSE-PAGES-FACADE: warehouses + storage-items + stock-movements facades
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-SUPPLY-TO-FEATURES archived
**SIZE:** L · **PACK:** DECOMP-B2 · LAYER: 3
PAGES: /warehouse/* (warehouses, storage-items, stock-movements)

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.facade.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ИСХОДНОЕ
Three list pages (~358–422 LOC) with filters, expand/nested load, dialogs (warehouse form, put-on-stock, adjust, movement form). Active BE stock integration — **foundation only**, no rule changes.

## ЧТО ДЕЛАТЬ
1. CREATE three facades in-place (one per page), `providers` on each page.
2. Move list/filter/route-sync/expand/API orchestration into facades as-is.
3. Pages thin; dialogs unchanged behavior.
4. Prefer shared tiny helpers only if already duplicated (no new abstraction sport).

## AC
- Specs: `warehouses.page.spec.ts`, `storage-items.page.spec.ts`, `stock-movements.page.spec.ts`, `warehouse-form-dialog.component.spec.ts`, `stock-movement-form-dialog.component.spec.ts`, `storage-dialogs.spec.ts`
- nx build last 0

Successor: TZ-NX-WAREHOUSE-TO-FEATURES
