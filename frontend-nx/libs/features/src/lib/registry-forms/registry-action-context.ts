/**
 * TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES — local copy of
 * `apps/kppdf-web/src/app/pages/registries/model/registry.types.ts`'s
 * `RegistryActionContext`. That file is the shared type foundation for
 * the whole `/registries` domain (row actions, query state, …) — moving
 * it would mean relocating far more than these two dialog-host factories
 * need. This one interface is tiny, pure, and framework-agnostic (two
 * function properties, no runtime code) — duplicated here, same
 * low-drift-risk pattern as `on-dialog-close-once.ts`. Keep both copies
 * in sync if the action-context contract ever changes.
 */
export interface RegistryActionContext {
  /** Re-runs the current query (same filters/page/sort) against the data source. */
  readonly reload: () => void;
  /**
   * Reports action outcome to the user. Kept on the context (rather than
   * requiring Angular DI inside registry/fixture modules) so a registry's
   * `run` handler stays a plain, framework-agnostic function.
   */
  readonly notify: (message: string, tone?: 'success' | 'error') => void;
}
