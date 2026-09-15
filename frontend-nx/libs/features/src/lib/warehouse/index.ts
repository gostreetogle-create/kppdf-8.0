/**
 * `@kppdf/features/warehouse` public API.
 *
 * TZ-NX-WAREHOUSE-TO-FEATURES: `WarehousesFacade` + `WarehouseFormDialogComponent`
 * (used by `/warehouse` list) and `StockMovementsFacade` +
 * `StockMovementFormDialogComponent` (used by `/stock-movements`) moved
 * here. `storage-items.facade.ts`, `storage-put-on-stock-dialog.component.ts`
 * and `storage-adjust-dialog.component.ts` stay in `apps/kppdf-web` —
 * `storage-put-on-stock-dialog.component.ts` transitively needs
 * `MaterialFormDialogComponent` (734 LOC, also shared by
 * `material-registry-dialog-host.ts` and
 * `supply-request-form-dialog.component.ts` in unrelated domains), which
 * this lib cannot import without reaching into the app; `storage-adjust-dialog`
 * stayed alongside it to keep their shared `storage-dialogs.spec.ts` in one
 * place. Same reasoning as `TZ-NX-ORDER-HUB-UI-FEATURES` and
 * `TZ-NX-SUPPLY-TO-FEATURES`.
 */
export * from './ui';
export * from './warehouses.facade';
export * from './stock-movements.facade';
