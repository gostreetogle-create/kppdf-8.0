/**
 * `@kppdf/features/composition` public API.
 *
 * TZ-NX-COMPOSITION-TO-FEATURES: `composition-tree`/`composition-panel`/
 * `composition-picker-dialog` + supporting helpers (`composition-tree.contract`,
 * `composition-line-resolve`, `composition-focus-scroll`, `dirty-dialog.guard`)
 * moved here in full — every relative import was self-contained within the
 * old `pages/composition/` folder except `on-dialog-close-once.ts` (19 LOC,
 * pure, zero Angular/DI beyond `effect`/`Injector`), duplicated into `ui/`
 * (same low-risk-data pattern as every other domain lib this program).
 * Unblocks the B4 F2 registry-form-dialogs move and order-hub's full move.
 */
export * from './ui';
