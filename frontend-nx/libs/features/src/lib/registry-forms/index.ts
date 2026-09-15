/**
 * `@kppdf/features/registry-forms` public API.
 *
 * TZ-NX-DECOMP-DEBT-CLOSEOUT (C2): finishes the B4 F2 move that was
 * blocked at the time — `CompositionPanelComponent` is no longer an app
 * dependency (moved to `@kppdf/features/composition` in C1), and
 * `CategoryFormDialogComponent` is moved here too (it turned out to have
 * no real doc-studio dependency — that was a substring false-positive in
 * the original F2 investigation grep, corrected here). Three facades
 * (lib root) + their dialogs, plus `CategoryFormDialogComponent` (used by
 * all three `openCreateCategory()` methods) and small duplicated
 * utilities (`on-dialog-close-once.ts`, `material-formatters.ts`,
 * `registry-create-button.component.ts` — see `ui/` for the duplication
 * rationale on the last one) live in `ui/`.
 */
export * from './ui';
export * from './material-form.facade';
export * from './module-form.facade';
export * from './product-form.facade';
