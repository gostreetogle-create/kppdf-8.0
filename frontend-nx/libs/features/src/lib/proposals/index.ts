/**
 * `@kppdf/features/proposals` public API.
 *
 * TZ-NX-PROPOSALS-TO-FEATURES: `ProposalsListFacade` (lib root) and
 * `ProposalAttachOrgsDialogComponent` (`ui/`) moved here — both fully
 * self-contained (their only shared dependency, `on-dialog-close-once.ts`,
 * is duplicated in, same pattern as doc-studio/production/order-hub/supply/
 * warehouse). `proposals-list.page.ts` stays in the app as a thin host.
 */
export * from './ui';
export * from './proposals-list.facade';
