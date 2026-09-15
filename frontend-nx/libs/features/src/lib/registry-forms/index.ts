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
 *
 * TZ-NX-REGISTRY-DETAIL-TO-FEATURES (B9, retry after
 * `TZ-NX-REGISTRY-TYPES-TO-FEATURES` unblocked it): `RegistryDetailPanelFacade`
 * (lib root) + `RegistryDetailPanelComponent`/`RegistryToolbarPaginationComponent`/
 * `RegistryRowActionButtonComponent` (`ui/`, the last two were panel-exclusive)
 * + `registry-action-icons.ts` (`ui/`, pure, row-action-button-exclusive)
 * moved here in full. Reuses the `RegistryCreateButtonComponent` already in
 * `ui/` (no new duplicate) — the app's own now-orphaned copy was deleted.
 * `registry-detail-panel.component.spec.ts` deliberately **stayed in the
 * app** (`apps/.../pages/registries/`, only its `RegistryDetailPanelComponent`
 * import updated to this barrel) — its `setup()` helper (used by ~18 of its
 * ~20 tests) builds fixtures via the real `buildRegistriesCatalogDefault()`
 * (`apps/.../registries/data/registries.catalog.ts`, the ~40-registry
 * catalog assembly, itself dependent on live service tokens), not the
 * synthetic per-test `defineRegistry()` builder its own widget-only tests
 * use — an app-local integration dependency too large/foundational to
 * duplicate or drag into this lib, same class of blocker as
 * `registry.types.ts` before B9's TZ1. The component+facade themselves
 * carry zero app-local imports; only the spec's own fixture-building
 * needed the app's real catalog.
 */
export * from './ui';
export * from './registry-detail-panel.facade';
export * from './material-form.facade';
export * from './module-form.facade';
export * from './product-form.facade';
export * from './registry-action-context';
export * from './catalog-registry-dialog-host';
export * from './material-registry-dialog-host';
