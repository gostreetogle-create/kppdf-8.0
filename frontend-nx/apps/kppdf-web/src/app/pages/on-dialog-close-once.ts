import { effect, Injector } from '@angular/core';
import type { DialogRef } from '@kppdf/ui/dialog';

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
