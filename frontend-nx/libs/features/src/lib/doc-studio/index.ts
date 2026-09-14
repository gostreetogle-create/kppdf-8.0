/**
 * `@kppdf/features/doc-studio` public API.
 *
 * TZ-NX-DOCSTUDIO-EDITOR-DECOMP wave: incrementally moving `/studio/:id`'s
 * editor brain out of `apps/kppdf-web`. Phase 2 populates only `util/`
 * (pure helpers, no Angular DI/component code); Phase 3 adds `ui/`
 * (dumb components); Phase 4 moves the facade itself here.
 */
export * from './util';
