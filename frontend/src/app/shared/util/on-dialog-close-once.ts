import { Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
import { DialogRef } from '../ui/dialog/pi-dialog.service';

/**
 * Subscribe to a dialog's close event exactly once, firing the callback
 * only if the dialog closes with a truthy value.
 *
 * Used by list pages to refresh their data after the create/edit dialog
 * is saved (close with `true` or a value) — clicking Cancel / ESC /
 * backdrop / close-icon closes with no value and does NOT trigger the
 * callback.
 *
 * NG0203-safe: `DialogRef.closed` is a `Signal` (not an Observable), so
 * `toObservable` is required. The caller passes their `Injector` because
 * the typical call site is a click handler with no ambient injection
 * context. The effect backing the observable is tied to that injector
 * and is destroyed when the caller is.
 *
 * IMPORTANT — `filter(Boolean) + take(1)`, NOT `first()`. The naive
 * `pipe(first())` has TWO failure modes:
 *  1. **`EmptyError` crash on early destroy.** When the caller is
 *     destroyed before the dialog closes (e.g. user navigates away
 *     with the dialog open), the `toObservable` Subject completes
 *     without emitting. Bare `first()` throws `EmptyError: no
 *     elements in sequence`, crashing change detection. `take(1)`
 *     silently completes instead.
 *  2. **Silent regression — callback NEVER fires on real close.**
 *     `DialogRef.closed` is a `computed` that returns `undefined`
 *     initially (while the dialog is open). The effect backing
 *     `toObservable` reads the computed on the first microtask and
 *     emits that initial `undefined`. A bare `first()` greedily
 *     consumes that emission, completes the subscription, and the
 *     callback is never invoked when the dialog later closes with
 *     the actual value. The optimistic-update callback for
 *     save/refresh silently breaks; the table only updates because
 *     the caller ALSO triggers a background `reload()`. `filter(Boolean)`
 *     skips the initial `undefined` and waits for a real close value.
 *
 * @example
 *   protected openCreate(): void {
 *     const ref = this.dialog.open(MaterialFormDialogComponent, { data: null });
 *     onDialogCloseOnce(ref, this.injector, (saved: Material) => {
 *       this.upsertMaterial(saved);
 *       this.reload();
 *     });
 *   }
 */
export function onDialogCloseOnce<T>(
  ref: DialogRef<T>,
  injector: Injector,
  callback: (value: T) => void,
): void {
  toObservable(ref.closed, { injector })
    .pipe(
      filter((v): v is NonNullable<T> => !!v),
      take(1),
    )
    .subscribe((v) => {
      callback(v);
    });
}
