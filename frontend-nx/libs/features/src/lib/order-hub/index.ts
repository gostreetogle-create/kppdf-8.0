/**
 * `@kppdf/features/order-hub` public API.
 *
 * TZ-NX-ORDER-HUB-UI-FEATURES (B1) moved only the two tray-local,
 * dependency-free dialogs (kit-reserve confirm, ship confirm) here —
 * `order-hub-tray.component.ts`/`order-hub.facade.ts` stayed in the app
 * because both needed the real `CompositionTreeComponent`, then still an
 * app-only file.
 *
 * TZ-NX-DECOMP-DEBT-CLOSEOUT (C2) finishes the move: `CompositionTreeComponent`
 * relocated to `@kppdf/features/composition` in C1 (TZ-NX-COMPOSITION-TO-FEATURES),
 * so `order-hub-tray.component.ts` now imports it as a normal lib-to-lib
 * dependency instead of an app-only relative one. `order-hub.facade.ts`
 * (lib root) + `order-hub-tray.component.ts` (`ui/`) moved here in full.
 */
export * from './ui';
export * from './order-hub.facade';
