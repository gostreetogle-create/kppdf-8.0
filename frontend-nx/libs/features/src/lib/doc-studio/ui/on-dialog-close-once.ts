import { effect, Injector } from '@angular/core';
import type { DialogRef } from '@kppdf/ui/dialog';

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE (Phase 3) — local copy of
 * `apps/kppdf-web/src/app/pages/on-dialog-close-once.ts`. That original is
 * shared by ~30 unrelated app pages (registries, warehouse, supply, …) —
 * moving it would mean touching every one of them, well outside this TZ's
 * conflict keys. This helper is tiny, pure, and framework-only (Angular
 * `effect`/`Injector` + the `DialogRef` type) — duplicated here for the
 * studio dialog(s) that moved into this lib. Keep both copies in sync if
 * the close-once contract ever changes.
 */
export function onDialogCloseOnce<T>(
  ref: DialogRef<T>,
  injector: Injector,
  callback: (value: T | undefined) => void,
): void {
  let called = false;
  effect(
    () => {
      const value = ref.closed();
      if (value === undefined || called) return;
      called = true;
      callback(value);
    },
    { injector },
  );
}
