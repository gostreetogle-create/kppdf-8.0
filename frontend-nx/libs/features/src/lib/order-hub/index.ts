/**
 * `@kppdf/features/order-hub` public API.
 *
 * TZ-NX-ORDER-HUB-UI-FEATURES: only the two tray-local, dependency-free
 * dialogs (kit-reserve confirm, ship confirm) moved here. `order-hub-tray.component.ts`
 * and `order-hub.facade.ts` stay in `apps/kppdf-web` — both need the real
 * `CompositionTreeComponent` (a genuine cross-domain shared component, also
 * used by `composition-panel.component.ts`), which this lib cannot import
 * without either duplicating a 170+ LOC component or reaching into the app.
 * Same reasoning DocStudio Editor Decomp Phase 3 used to keep
 * `studio-data-panel`/`studio-properties-panel`/etc. in the app.
 */
export * from './ui';
