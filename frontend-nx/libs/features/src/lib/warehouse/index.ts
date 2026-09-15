/**
 * `@kppdf/features/warehouse` public API.
 *
 * TZ-NX-WAREHOUSE-TO-FEATURES (B2): `WarehousesFacade` +
 * `WarehouseFormDialogComponent` and `StockMovementsFacade` +
 * `StockMovementFormDialogComponent` moved here. `storage-items.facade.ts`
 * stayed in the app because `storage-put-on-stock-dialog.component.ts`
 * transitively needed `MaterialFormDialogComponent` (734 LOC, an app-only
 * component at the time).
 *
 * TZ-NX-DECOMP-DEBT-CLOSEOUT (C2) finishes the move:
 * `MaterialFormDialogComponent` relocated to `@kppdf/features/registry-forms`
 * in this same TZ, so `storage-put-on-stock-dialog.component.ts` now
 * imports it as a normal lib-to-lib dependency. `storage-items.facade.ts`
 * (lib root) + `storage-adjust-dialog.component.ts` +
 * `storage-put-on-stock-dialog.component.ts` (`ui/`) moved here in full;
 * `storage-items.page.ts` stays in the app as the lazy route host (same
 * pattern as `stock-movements.page.ts`/`warehouses.page.ts`).
 */
export * from './ui';
export * from './warehouses.facade';
export * from './stock-movements.facade';
export * from './storage-items.facade';
