/**
 * `@kppdf/features/registries-platform` public API.
 *
 * TZ-NX-REGISTRY-TYPES-TO-FEATURES — `registry.types.ts` (the typed
 * contract every `/registries` registry is authored against via
 * `defineRegistry()`) and `registry-query-state.ts` (pure filters/page/sort
 * ↔ URL parsing built on those types) moved here in full, unblocking
 * `TZ-NX-REGISTRY-DETAIL-TO-FEATURES` (B8's TZ2 investigation: this file
 * was the hard blocker — 235 LOC, ~40 app-side consumers, too large to
 * duplicate). The ~40 `data/*.registry.ts` / `*-http-data-source.ts` /
 * `*-registry-actions.ts` / `*-dialog-host.ts` files, `registries.catalog.ts`,
 * `registries-page.ts` and the registry-detail UI all now import types from
 * here instead of an app-local path — the intended direction (apps
 * importing from features), not the reverse.
 */
export * from './registry.types';
export * from './registry-query-state';
export * from './registries-page.facade';
