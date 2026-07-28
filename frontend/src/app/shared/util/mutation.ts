import { Signal, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { SilentResult, extractErrorMessage } from '../../core/silent-http';

/**
 * Signal-based wrapper for HTTP mutations (POST / PATCH / DELETE).
 *
 * Replaces the `.subscribe((res) => { if (res.ok) {...} else {...} })`
 * boilerplate that currently lives in every form-dialog `onSubmit()` and
 * every page action handler with a promise-based async/await pattern
 * plus reactive signals for UI feedback.
 *
 * ## Built-in safety
 *
 * 1. **In-flight coalescing (double-submit protection).** Calling
 *    `mutate(...)` while a previous request is still pending returns
 *    the SAME pending Promise — even though the caller's params may
 *    differ. An accidental double-click on a «Save» button does NOT
 *    create a duplicate record on the backend. Verify with:
 *
 *    ```ts
 *    const fetcher = jest.fn(() => of(ok({ id: 1 })));
 *    const m = createMutation(fetcher);
 *    const p1 = m.mutate({ a: 1 });
 *    const p2 = m.mutate({ a: 2 });
 *    expect(p1).toBe(p2);       // ← identity
 *    expect(fetcher).toHaveBeenCalledTimes(1);
 *    ```
 *
 * 2. **Generation-counter isolation for `reset()`.** If `reset()` is
 *    called while a request is pending, the pending side-effects
 *    (signal updates, `onSuccess`, `onError`) become no-ops. The HTTP
 *    request may still complete on the wire, but its result is
 *    discarded instead of clobbering fresh state. A subsequent
 *    `mutate()` then starts cleanly.
 *
 * 3. **Error normalization.** `SilentResult<T>` errors are surfaced as
 *    the user-readable `extractErrorMessage(res.error)` string
 *    (matches `silent-http.ts` convention), not raw `HttpErrorResponse`
 *    objects. The signal `error()` is always `string | null` — ready
 *    to display verbatim.
 *
 * 4. **Per-instance state isolation.** Each call to `createMutation`
 *    owns its own private signals. Multiple mutations in the same page
 *    do not share `isLoading` / `error` state.
 *
 * ## Trade-offs and non-goals
 *
 * - **No cross-component coordination.** If two components need to
 *   guard against simultaneous calls to the same endpoint, they should
 *   wrap the fetcher in `exhaustMap` themselves or coordinate via a
 *   shared service.
 *
 * - **`successMessage` is a documentation-only option.** The util has
 *   no DI context to fire a toast itself. Consumers MUST fire the
 *   toast from `onSuccess` (or directly on the awaited `mutate(...)`).
 *   `successMessage` exists in the signature so callers can express
 *   intent at the type-system level; it has no runtime behavior.
 *
 * @example
 *   // In a form-dialog component:
 *   private readonly save = createMutation<Material, Partial<Material>>(
 *     (payload) => this.data
 *       ? this.service.update(this.data._id, payload)
 *       : this.service.create(payload),
 *     {
 *       onSuccess: (saved) => {
 *         this.toast.success(`«${saved.name}» сохранён`);
 *         this.ref.close(saved);
 *       },
 *       onError: (message) => this.errorMessage.set(message),
 *     },
 *   );
 *
 *   protected async onSubmit(): Promise<void> {
 *     if (!this.form.valid) return this.form.markAllAsTouched();
 *     await this.save.mutate(this.form.getRawValue());
 *   }
 *
 *   // In a list-page action handler:
 *   private readonly remove = createMutation<void, string>(
 *     (id) => this.service.remove(id),
 *     {
 *       onSuccess: () => {
 *         this.toast.success('Удалено');
 *         this.listRes.reload();
 *       },
 *     },
 *   );
 *
 *   protected async onDelete(row: Material): Promise<void> {
 *     await this.remove.mutate(row._id);
 *   }
 *
 *   // Template binding:
 *   //   [disabled]="remove.isLoading()"
 *   //   @if (remove.error(); as err) { <p role="alert">{{ err }}</p> }
 */
export interface MutationOptions<T> {
  /**
   * Fires on `SilentResult.ok === true` BEFORE the awaiting Promise
   * resolves, so `await mutate(...)` returns AFTER the callback runs.
   * Use it for side-effects (toast, navigation, list refresh).
   */
  onSuccess?: (data: T) => void;

  /**
   * Fires on `SilentResult.ok === false` AFTER `error()` signal is
   * populated with `extractErrorMessage(res.error)`. Use it for inline
   * form-error display.
   *
   * Note: the callback is suppressed if `reset()` has invalidated the
   * pending generation (see `reset()` JSDoc).
   */
  onError?: (message: string) => void;

  /**
   * **Documentation-only hint** (no DI is performed; no runtime
   * effect). Suggested success message for callers that want to fire a
   * toast from `onSuccess`. Kept in the signature to make caller
   * intent explicit at the type-system level. **Consumer MUST fire
   * the toast themselves** — this util has no toast service.
   */
  successMessage?: string;
}

/**
 * Reactive mutation handle. Returned by `createMutation`.
 *
 * Signals:
 * - `isLoading` — `true` between `mutate()` invocation and Promise
 *   settlement (success or error). Bind to button `[disabled]`.
 * - `error` — last error message (or `null` after success / `reset()`).
 *   Bind to template `@if (mut.error()) { … }` block or input prop.
 *
 * Methods:
 * - `mutate(params)` — invoke the mutation. Returns a Promise that
 *   resolves with the response data on success, or rejects with an
 *   `Error` whose `.message` is the user-readable error string.
 *   **In-flight coalescing**: subsequent calls during pending return
 *   the SAME Promise (no extra fetcher invocation).
 * - `reset()` — clear `isLoading` and `error` to initial state AND
 *   invalidate any pending mutation (its result will NOT clobber
 *   state). Does NOT cancel the underlying HTTP request — the request
 *   completes on the wire and is silently discarded.
 */
export interface Mutation<T, P> {
  isLoading: Signal<boolean>;
  error: Signal<string | null>;
  mutate: (params: P) => Promise<T>;
  reset: () => void;
}

/**
 * Create a signal-backed mutation handle.
 *
 * @param fetcher Factory returning the HTTP observable. Called once per
 *   coalescing window (NOT per `mutate()` invocation). Receives the
 *   params from `mutate()`.
 * @param options Optional side-effect callbacks (`onSuccess` / `onError`)
 *   and documentation hint (`successMessage`).
 * @returns A `Mutation<T, P>` with reactive signals and a promise-based
 *   trigger.
 */
export function createMutation<T, P>(
  fetcher: (params: P) => Observable<SilentResult<T>>,
  options: MutationOptions<T> = {},
): Mutation<T, P> {
  const isLoadingSig = signal<boolean>(false);
  const errorSig = signal<string | null>(null);

  // Re-entry guard: a single pending Promise shared across rapid
  // double-click calls. The next `mutate()` invocation will return the
  // same Promise reference (no second fetcher call).
  let inFlight: Promise<T> | null = null;

  // Generation counter: incremented on every `mutate()` invocation AND
  // on every `reset()` call. Side-effects (signal updates, onSuccess /
  // onError callbacks) are gated on `generation === currentGen` so a
  // stale pending request cannot clobber fresh state.
  let generation = 0;

  function mutate(params: P): Promise<T> {
    // Coalesce in-flight requests — return the SAME Promise reference
    // (inFlight === shared) for identity-stable coalescing across
    // rapid-fire calls. Identity is BY-REFERENCE sharing: inFlight is
    // set to `shared` once (the work.finally chain) and returned
    // directly to subsequent callers with no wrapping. This is
    // guaranteed regardless of any V8 internal Promise.resolve(x) === x
    // optimization, and is the contract that downstream code relies
    // on (Promise identity check `expect(p1).toBe(p2)`).
    //
    // DO NOT change this to `return await shared` — that would create
    // an async-function-wrapper distinct from `shared` and break the
    // coalescing contract.
    if (inFlight !== null) {
      return inFlight;
    }

    isLoadingSig.set(true);
    errorSig.set(null);

    const currentGen = ++generation;

    // `work` is the async IIFE that calls the fetcher and extracts
    // the SilentResult. It resolves to T or rejects with Error.
    const work: Promise<T> = (async (): Promise<T> => {
      let result: SilentResult<T>;
      try {
        result = await firstValueFrom(fetcher(params));
      } catch (err) {
        // Defense-in-depth: silent-http helpers guarantee no throw,
        // but custom fetchers may bypass it. Apply the same message
        // extraction as the SilentResult.ok === false branch.
        const message =
          err instanceof Error ? err.message : 'Неизвестная ошибка';
        if (generation === currentGen && errorSig() === null) {
          errorSig.set(message);
          options.onError?.(message);
        }
        throw err;
      }

      if (result.ok) {
        if (generation === currentGen) {
          options.onSuccess?.(result.data);
        }
        return result.data;
      }

      // SilentResult.ok === false: populate user-readable error signal.
      const message = extractErrorMessage(result.error);
      if (generation === currentGen) {
        errorSig.set(message);
        options.onError?.(message);
      }
      throw new Error(message);
    })();

    // `shared` is the chain returned to callers. It is the SAME
    // reference for the first `mutate()` call AND for every coalesced
    // subsequent call (because inFlight = shared and coalesced calls
    // return inFlight directly). Cleanup runs after `shared` settles.
    const shared: Promise<T> = work.finally(() => {
      if (generation === currentGen) {
        isLoadingSig.set(false);
        inFlight = null;
      }
    });

    inFlight = shared;
    return shared;
  }

  function reset(): void {
    // Increment generation so any pending side-effects become no-ops.
    // The pending fetcher's HTTP request will still complete on the
    // wire, but its result is silently discarded.
    generation++;

    // Clear inFlight synchronously so the next `mutate()` can start a
    // fresh fetch immediately (without waiting for the pending one to
    // settle + fire its .finally).
    inFlight = null;

    isLoadingSig.set(false);
    errorSig.set(null);
  }

  return {
    isLoading: isLoadingSig.asReadonly(),
    error: errorSig.asReadonly(),
    mutate,
    reset,
  };
}
