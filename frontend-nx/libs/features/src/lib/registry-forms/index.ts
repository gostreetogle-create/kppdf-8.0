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
 *
 * TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES: `createCatalogRegistryDialogHost`/
 * `createMaterialRegistryDialogHost` (lib root) moved here too — they
 * were the actual blocker for `studio-data-panel`/`studio-data-vitrina`
 * (B6). Both factories turned out self-contained once
 * `Material/Module/ProductFormDialogComponent` already lived in this lib
 * (C2): only `RegistryActionContext` (`registry-action-context.ts`) and
 * `MaterialRegistryDialogConfig` (inlined in
 * `material-registry-dialog-host.ts`) needed duplicating — both tiny,
 * pure, framework-agnostic interfaces, same low-drift-risk class as
 * `on-dialog-close-once.ts`. The ~15 other registries files that only
 * need these two factories' *types* (not the functions) stayed in the
 * app and just point their `import type` at this barrel instead.
 */
export * from './ui';
export * from './material-form.facade';
export * from './module-form.facade';
export * from './product-form.facade';
export * from './registry-action-context';
export * from './catalog-registry-dialog-host';
export * from './material-registry-dialog-host';
