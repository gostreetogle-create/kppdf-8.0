/**
 * `@kppdf/features/doc-studio` public API.
 *
 * TZ-NX-DOCSTUDIO-EDITOR-DECOMP wave: incrementally moving `/studio/:id`'s
 * editor brain out of `apps/kppdf-web`. Phase 2 populated `util/` (pure
 * helpers, no Angular DI/component code); Phase 3 adds `ui/` (dumb
 * components — except `studio-data-panel`/`studio-data-vitrina`/
 * `studio-properties-panel`/`studio-text-properties`, which stay in the app:
 * they compose real registries-feature or `@kppdf/ui/rich-text` (TipTap)
 * dependencies this lib's `@nx/js:tsc` build cannot cross-compile from raw
 * source — see the Phase 3 checklist); Phase 4 moves the facade itself here.
 */
export * from './util';
export * from './ui';
