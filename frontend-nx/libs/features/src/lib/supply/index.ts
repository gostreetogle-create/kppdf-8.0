/**
 * `@kppdf/features/supply` public API.
 *
 * TZ-NX-SUPPLY-TO-FEATURES (B2): `SupplyFacade` and the self-contained
 * `SupplyRequestReceiveDialogComponent` moved here. `supply-requests.facade.ts`
 * and `supply-request-form-dialog.component.ts` stayed in the app because
 * both transitively needed `MaterialFormDialogComponent` (734 LOC, an
 * app-only component at the time).
 *
 * TZ-NX-DECOMP-DEBT-CLOSEOUT (C2) finishes the move:
 * `MaterialFormDialogComponent` relocated to `@kppdf/features/registry-forms`
 * in this same TZ, so `supply-request-form-dialog.component.ts` now imports
 * it as a normal lib-to-lib dependency. `supply-requests.facade.ts`
 * (lib root) + `supply-request-form-dialog.component.ts` (`ui/`) moved
 * here in full; `supply-requests.page.ts` stays in the app as the lazy
 * route host (same pattern as `/supply`).
 */
export * from './ui';
export * from './supply.facade';
export * from './supply-requests.facade';
