import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import type { DialogRef } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from './on-dialog-close-once';

/**
 * TZ-NX-NO-NATIVE-CONFIRM — this helper is the shared confirm/cancel gate
 * behind every Pi AlertDialog call site (delete-layer, template-picker
 * delete, studio-editor onFinalize, …), so it gets its own focused spec
 * rather than only being exercised indirectly through one heavy page.
 */
function createMockRef<T>(): DialogRef<T> {
  const closedSig = signal<T | undefined>(undefined);
  const isClosed = signal(false);
  return {
    closed: computed(() => (isClosed() ? closedSig() : undefined)) as DialogRef<T>['closed'],
    close: (v?: T) => {
      if (isClosed()) return;
      closedSig.set(v);
      isClosed.set(true);
    },
  };
}

describe('onDialogCloseOnce', () => {
  it('does not invoke the callback before the dialog closes', () => {
    const ref = createMockRef<boolean>();
    const callback = jest.fn();
    TestBed.runInInjectionContext(() => onDialogCloseOnce(ref, TestBed.inject(Injector), callback));

    TestBed.flushEffects();

    expect(callback).not.toHaveBeenCalled();
  });

  it('invokes the callback exactly once with the confirm value (true), even if closed() is read again', () => {
    const ref = createMockRef<boolean>();
    const callback = jest.fn();
    TestBed.runInInjectionContext(() => onDialogCloseOnce(ref, TestBed.inject(Injector), callback));

    ref.close(true);
    TestBed.flushEffects();
    TestBed.flushEffects();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('never invokes the callback when the dialog is dismissed with no value (cancel) — matches AlertDialog onCancel()', () => {
    // AlertDialogComponent.onCancel() calls ref.close() with no argument.
    // onDialogCloseOnce treats a resolved `undefined` the same as "still
    // open" (`if (value === undefined || called) return;`), so cancel is
    // a true no-op here — every call site's own `if (!confirmed) return;`
    // guard is therefore only reachable for an explicit `false`, never for
    // a real cancel. This spec pins that existing contract; it is not
    // something this TZ changes.
    const ref = createMockRef<boolean>();
    const callback = jest.fn();
    TestBed.runInInjectionContext(() => onDialogCloseOnce(ref, TestBed.inject(Injector), callback));

    ref.close(undefined);
    TestBed.flushEffects();

    expect(callback).not.toHaveBeenCalled();
  });

  it('invokes the callback with an explicit false close value', () => {
    const ref = createMockRef<boolean>();
    const callback = jest.fn();
    TestBed.runInInjectionContext(() => onDialogCloseOnce(ref, TestBed.inject(Injector), callback));

    ref.close(false);
    TestBed.flushEffects();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(false);
  });
});
