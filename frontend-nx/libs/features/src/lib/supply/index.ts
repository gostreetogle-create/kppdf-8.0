/**
 * `@kppdf/features/supply` public API.
 *
 * TZ-NX-SUPPLY-TO-FEATURES: `SupplyFacade` (used by the `/supply` page) and
 * the self-contained `SupplyRequestReceiveDialogComponent` (opened from
 * `/supply-requests`) moved here. `supply-requests.facade.ts` and
 * `supply-request-form-dialog.component.ts` stay in `apps/kppdf-web` — both
 * transitively need `MaterialFormDialogComponent` (734 LOC, also shared by
 * `material-registry-dialog-host.ts` and `storage-put-on-stock-dialog.component.ts`
 * in unrelated domains), which this lib cannot import without reaching into
 * the app. Same reasoning as `TZ-NX-ORDER-HUB-UI-FEATURES` keeping
 * `order-hub-tray.component.ts` in the app for `CompositionTreeComponent`.
 */
export * from './ui';
export * from './supply.facade';
