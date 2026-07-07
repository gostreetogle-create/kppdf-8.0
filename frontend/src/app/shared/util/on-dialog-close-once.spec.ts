import { Injector, Signal, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { onDialogCloseOnce } from './on-dialog-close-once';
import { DialogRef } from '../ui/dialog/pi-dialog.service';

/**
 * TZ-WARMUP-100 — regression tests for `onDialogCloseOnce`.
 *
 * TWO bugs fixed across two rounds:
 *
 *  **Round 1 (predicate `first((v) => v !== undefined)`):** threw
 *   `EmptyError: no elements in sequence` when the dialog was dismissed
 *   via Cancel / ESC / backdrop (which all close with `undefined`).
 *   The `computed` signal `ref.closed` emitted exactly one value (the
 *   undefined), the predicate filtered it out, the observable completed
 *   empty, and `first()` threw.
 *
 *  **Round 2 (bare `first()`):** silent regression — the callback NEVER
 *   fired on real close. `DialogRef.closed` is a `computed` that returns
 *   `undefined` initially (while the dialog is open). The effect backing
 *   `toObservable` reads the computed on the first microtask and emits
 *   that initial `undefined`. A bare `first()` greedily consumed that
 *   emission, completed the subscription, and the callback was never
 *   invoked when the dialog later closed with the actual value.
 *   Optimistic-update callbacks for save/refresh silently broke; the
 *   table only updated because the caller ALSO triggered a background
 *   `reload()`.
 *
 *  **Round 3 (CURRENT — `filter(Boolean) + take(1)`):**
 *   - `filter` skips the initial `undefined` (and all other falsy
 *     values: `null`, `0`, `''`, `false`).
 *   - `take(1)` takes the first TRUTHY emission and completes without
 *     throwing if the source completes empty (e.g. injector destroyed
 *     before close).
 *   - Callback fires exactly ONCE on a real truthy close.
 *
 * Contract under test:
 *  - Dialog closes with `undefined` (no arg) — NO throw, NO callback
 *  - Dialog closes with `null` / `0` / `''` / `false` — NO throw, NO callback
 *  - Dialog closes with truthy value — callback fired EXACTLY ONCE
 *  - Callback does NOT fire on the initial `undefined` emission (the
 *    `toObservable` microtask emission) — verified by closing with a
 *    value AFTER subscription
 *  - No `EmptyError` when injector is destroyed before close
 *  - Callback fires at most ONCE even if `close()` is called multiple times
 */
describe('onDialogCloseOnce', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
  });

  /**
   * Build a fake `DialogRef` that mirrors the production
   * `PiDialogService` behavior: a `closed` computed signal that
   * returns `undefined` until `close(v)` is called, then returns
   * `v` (also undefined) and stays there.
   */
  function makeFakeRef<T>(): {
    ref: DialogRef<T>;
    close: (v?: T) => void;
  } {
    const closedSig = signal<T | undefined>(undefined);
    const isClosed = signal(false);
    const ref: DialogRef<T> = {
      closed: computed(() =>
        isClosed() ? (closedSig() as T | undefined) : undefined,
      ) as Signal<T | undefined>,
      close: (v?: T) => {
        if (isClosed()) return;
        closedSig.set(v);
        isClosed.set(true);
      },
    };
    return { ref, close: ref.close };
  }

  /** Flush toObservable's effect-scheduled emission. */
  function flushMicrotasks(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('does NOT throw EmptyError when dialog is closed without argument (ESC/backdrop path)', async () => {
    const { ref, close } = makeFakeRef<number>();
    const callback = jest.fn();

    expect(() => onDialogCloseOnce(ref, injector, callback)).not.toThrow();
    expect(() => close()).not.toThrow();
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT throw EmptyError when dialog is closed with explicit undefined', async () => {
    const { ref, close } = makeFakeRef<number>();
    const callback = jest.fn();

    expect(() => onDialogCloseOnce(ref, injector, callback)).not.toThrow();
    expect(() => close(undefined)).not.toThrow();
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT fire callback when dialog is closed with null', async () => {
    const { ref, close } = makeFakeRef<number | null>();
    const callback = jest.fn();

    onDialogCloseOnce(ref, injector, callback);
    close(null);
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT fire callback when dialog is closed with falsy values (0, empty string, false)', async () => {
    for (const v of [0, '', false] as const) {
      const { ref, close } = makeFakeRef<typeof v>();
      const callback = jest.fn();
      onDialogCloseOnce(ref, injector, callback);
      close(v);
      await flushMicrotasks();
      expect(callback).not.toHaveBeenCalled();
    }
  });

  it('fires callback with the value when dialog is closed with a truthy value', async () => {
    const { ref, close } = makeFakeRef<number>();
    const callback = jest.fn();

    onDialogCloseOnce(ref, injector, callback);
    close(42);
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(42);
  });

  it('fires callback with an object value when dialog is closed with one', async () => {
    const payload = { id: 'm-1', name: 'Steel' };
    const { ref, close } = makeFakeRef<typeof payload>();
    const callback = jest.fn();

    onDialogCloseOnce(ref, injector, callback);
    close(payload);
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledWith(payload);
  });

  /**
   * Round 2 regression: bare `first()` would have greedily consumed
   * the initial `undefined` emission and the callback would never fire
   * on the real close. With `filter(Boolean) + take(1)`, the initial
   * undefined is filtered out and the callback fires only on the real
   * close value.
   */
  it('does NOT consume the initial undefined — callback fires on real close (not on toObservable microtask emission)', async () => {
    const { ref, close } = makeFakeRef<number>();
    const callback = jest.fn();

    onDialogCloseOnce(ref, injector, callback);
    // Wait for the initial microtask emission of `undefined` from toObservable.
    await flushMicrotasks();
    // Callback MUST NOT have been called yet — the initial undefined was
    // filtered out, not consumed.
    expect(callback).not.toHaveBeenCalled();
    // Now close with a real value.
    close(99);
    await flushMicrotasks();
    // Callback fires with the real value, not undefined.
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(99);
  });

  /**
   * Round 1 regression: when the injector (caller) is destroyed before
   * the dialog closes, the `toObservable` Subject completes without
   * emitting a truthy value. `take(1)` silently completes instead of
   * throwing `EmptyError`.
   */
  it('does NOT throw EmptyError when caller injector is destroyed before close', async () => {
    const { ref } = makeFakeRef<number>();
    const callback = jest.fn();
    // Create a CHILD injector (not the root TestBed injector) so that
    // destroying it doesn't break the TestBed for subsequent tests.
    const childInjector = Injector.create({ providers: [], parent: injector });
    expect(() => onDialogCloseOnce(ref, childInjector, callback)).not.toThrow();
    childInjector.destroy();
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
    // Subsequent close (after injector is destroyed) should also be a no-op
    // because the subscription was torn down with the injector.
    expect(() => ref.close(42)).not.toThrow();
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT throw EmptyError when dialog never closes (only injector is destroyed)', async () => {
    const { ref } = makeFakeRef<number>();
    const callback = jest.fn();
    const childInjector = Injector.create({ providers: [], parent: injector });
    onDialogCloseOnce(ref, childInjector, callback);
    // Destroy injector without ever calling close().
    childInjector.destroy();
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
  });

  it('fires the callback at most ONCE (subsequent close() calls are no-ops)', async () => {
    const { ref, close } = makeFakeRef<number>();
    const callback = jest.fn();

    onDialogCloseOnce(ref, injector, callback);
    close(1);
    close(2); // ignored by fake ref's isClosed guard
    close(3);
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(1);
  });
});
