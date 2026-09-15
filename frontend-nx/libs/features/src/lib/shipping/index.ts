/**
 * `@kppdf/features/shipping` public API.
 *
 * TZ-NX-SHIPPING-TO-FEATURES: `ShippingFacade` (lib root) and its 3
 * dialogs (`ui/` — create/edit/doc) moved here in full. Every relative
 * import inside the 3 dialogs was already self-contained (zero relative
 * imports); the facade's only external dependency,
 * `on-dialog-close-once.ts` (19 LOC pure), is duplicated into `ui/` —
 * same pattern as every other domain lib this program. `shipping.page.ts`
 * stays in the app as the lazy route host (`loadComponent`, no eager
 * provider).
 */
export * from './ui';
export * from './shipping.facade';
