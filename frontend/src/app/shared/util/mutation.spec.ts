import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, isObservable, of } from 'rxjs';
import { createMutation } from './mutation';
import { SilentResult } from '../../core/silent-http';

/**
 * Regression tests for `createMutation` (TZ-232.A — first building block
 * of the Angular Assembly DSL plan).
 *
 * Contract under test:
 *  - Initial state: `isLoading() === false`, `error() === null`.
 *  - Happy path: `mutate(p)` resolves with `T`, `isLoading` flips true
 *    → false, `onSuccess` callback fires.
 *  - Error path: `mutate(p)` rejects with `Error`, `error()` signal is
 *    populated with `extractErrorMessage`, `onError` callback fires.
 *  - In-flight coalescing: rapid double-click returns SAME pending
 *    Promise (identity check via `toBe`), fetcher invoked exactly ONCE.
 *  - Generation counter: stale pending mutations do NOT clobber state
 *    after `reset()`.
 *  - `reset()` clears signals and starts fresh `mutate()`.
 *  - `successMessage` option is accepted but does not affect runtime.
 *
 * Edge cases:
 *  - Fetcher throws synchronously (defense-in-depth): error signal
 *    populated, mutate rejects.
 *  - Non-Error throw (string) → 'Неизвестная ошибка' fallback.
 *  - Three simultaneous `mutate()` calls → exactly ONE fetcher
 *    invocation.
 */
describe('createMutation', () => {
  // ── helpers ──────────────────────────────────────────────────────────

  /** Build a successful `SilentResult`. */
  function ok<T>(data: T): SilentResult<T> {
    return { ok: true, data };
  }

  /** Build a failed `SilentResult` with optional nested-message shape. */
  function fail(
    body:
      | string
      | { message: string; status?: number; statusText?: string } = 'Server error',
  ): SilentResult<never> {
    const isString = typeof body === 'string';
    const seedStatus = isString ? 400 : (body.status ?? 400);
    const seedStatusText = isString ? body : body.statusText ?? 'Bad Request';
    const error = new HttpErrorResponse({
      status: seedStatus,
      statusText: seedStatusText,
      error: isString ? { message: body } : body,
    });
    return { ok: false, error };
  }

  /**
   * Build a `pendingFetcher()` helper backed by a Subject. `resolve()`
   * auto-completes the subject so there's no open-handle leak.
   *
   * Used for in-flight coalescing tests that need to manually control
   * when the request actually settles.
   */
  interface PendingFetcherHandle<T> {
    fetcher: () => Observable<SilentResult<T>>;
    invocations: () => number;
    resolve: (value: SilentResult<T>) => void;
  }
  function pendingFetcher<T>(): PendingFetcherHandle<T> {
    const subject = new Subject<SilentResult<T>>();
    let invocations = 0;
    const fetcher = () => {
      invocations++;
      return subject.asObservable();
    };
    const resolve = (value: SilentResult<T>) => {
      subject.next(value);
      subject.complete();
    };
    return { fetcher, invocations: () => invocations, resolve };
  }

  /**
   * Build a synchronous-of fetcher that RETURNS the same SilentResult
   * every time. Tracks invocations via a closure-side counter so
   * coalescing assertions can verify "fetcher called exactly once".
   */
  let calls = 0;
  beforeEach(() => {
    calls = 0;
  });
  function tickFetcher<T>(value: SilentResult<T>) {
    return () => {
      calls++;
      return of(value);
    };
  }

  // ── initial state ────────────────────────────────────────────────────

  describe('initial state', () => {
    it('isLoading() === false', () => {
      const m = createMutation<void, unknown>(tickFetcher(ok(undefined)));
      expect(m.isLoading()).toBe(false);
    });

    it('error() === null', () => {
      const m = createMutation<void, unknown>(tickFetcher(ok(undefined)));
      expect(m.error()).toBe(null);
    });
  });

  // ── happy path ───────────────────────────────────────────────────────

  describe('happy path (resolves on ok:true)', () => {
    it('mutate(p) resolves with the response data', async () => {
      const m = createMutation(tickFetcher(ok({ id: 'm-1', name: 'Steel' })));
      const result = await m.mutate({ name: 'Steel' });
      expect(result).toEqual({ id: 'm-1', name: 'Steel' });
    });

    it('isLoading flips true → false across the mutation lifecycle', async () => {
      const m = createMutation(tickFetcher(ok({ id: 1 })));
      expect(m.isLoading()).toBe(false);

      const promise = m.mutate({});
      expect(m.isLoading()).toBe(true);

      await promise;
      expect(m.isLoading()).toBe(false);
    });

    it('error signal stays null on success', async () => {
      const m = createMutation(tickFetcher(ok({ id: 1 })));
      await m.mutate({});
      expect(m.error()).toBe(null);
    });

    it('onSuccess callback fires with response data', async () => {
      const onSuccess = jest.fn();
      const m = createMutation(tickFetcher(ok({ id: 99 })), { onSuccess });
      await m.mutate({});
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith({ id: 99 });
    });

    it('onSuccess fires EXACTLY BEFORE the awaiting Promise resolves', async () => {
      const order: string[] = [];
      const m = createMutation(tickFetcher(ok({ id: 1 })), {
        onSuccess: () => order.push('onSuccess'),
      });
      await m.mutate({}).then(() => order.push('then'));
      // onSuccess runs SYNCHRONOUSLY inside the async IIFE before work
      // resolves; .then() runs AFTER the awaiter resumes. Strict order
      // is guaranteed by Promise.resolve semantics.
      expect(order).toEqual(['onSuccess', 'then']);
    });

    it('mutate() can be called sequentially multiple times — each starts fresh state', async () => {
      const m = createMutation(tickFetcher(ok({ id: 'next' })));
      await m.mutate({ k: 'a' });
      await m.mutate({ k: 'b' });
      expect(calls).toBe(2);
      expect(m.isLoading()).toBe(false);
      expect(m.error()).toBe(null);
    });
  });

  // ── error path ────────────────────────────────────────────────────────

  describe('error path (rejects on ok:false)', () => {
    it('mutate(p) rejects with Error', async () => {
      const m = createMutation(tickFetcher(fail('Material with this SKU exists')));
      await expect(m.mutate({})).rejects.toThrow('Material with this SKU exists');
    });

    it('error() signal is populated with extractErrorMessage result', async () => {
      const m = createMutation(tickFetcher(fail('INN обязателен')));
      await m.mutate({}).catch(() => {
        /* expected rejection */
      });
      expect(m.error()).toBe('INN обязателен');
    });

    it('isLoading flips back to false after error', async () => {
      const m = createMutation(tickFetcher(fail('Bad request')));
      await m.mutate({}).catch(() => {});
      expect(m.isLoading()).toBe(false);
    });

    it('onError callback fires with extracted message', async () => {
      const onError = jest.fn();
      const m = createMutation(tickFetcher(fail('Field is required')), { onError });
      await m.mutate({}).catch(() => {});
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith('Field is required');
    });

    it('extractErrorMessage fallback to err.message when err.error.message is absent', async () => {
      // HttpErrorResponse where the parsed body has no `message` field.
      const err = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        // error omitted entirely → err.error === null → no first lookup
      });
      const m = createMutation(
        () => of({ ok: false, error: err } as SilentResult<unknown>),
      );
      await m.mutate({}).catch(() => {});
      // Angular's HttpErrorResponse.message is non-empty in this case
      // ('Http failure response ...: 500 Internal Server Error');
      // assert it propagates through extractErrorMessage.
      expect(m.error()).toContain('500');
    });

    it('extractErrorMessage Russian fallback when both inner message AND .message are empty', async () => {
      const err = new HttpErrorResponse({ status: 0, statusText: 'Unknown' });
      // HttpErrorResponse.message defaults to a non-empty string in its
      // constructor; force it empty via defineProperty to test the
      // Russian fallback in extractErrorMessage().
      Object.defineProperty(err, 'message', {
        value: '',
        configurable: true,
        writable: true,
      });
      const m = createMutation(
        () => of({ ok: false, error: err } as SilentResult<unknown>),
      );
      await m.mutate({}).catch(() => {});
      expect(m.error()).toBe('Неизвестная ошибка');
    });

    it('error signal is cleared on the next successful mutate after a failure', async () => {
      let which: 'fail' | 'ok' = 'fail';
      const m = createMutation(() => {
        calls++;
        return of(which === 'fail' ? fail('First call fails') : ok({ id: 'recovered' }));
      });
      await m.mutate({}).catch(() => {});
      expect(m.error()).toBe('First call fails');

      which = 'ok';
      const result = await m.mutate({});
      expect(result).toEqual({ id: 'recovered' });
      expect(m.error()).toBe(null);
    });
  });

  // ── defense-in-depth: fetcher throws ─────────────────────────────────

  describe('fetcher throws unexpectedly (bypassing silent-http)', () => {
    it('mutate rejects; error signal populated with thrown message', async () => {
      const throwingFetcher = () => {
        calls++;
        throw new TypeError('Network adapter broken');
      };
      const m = createMutation(throwingFetcher);
      await expect(m.mutate({})).rejects.toThrow('Network adapter broken');
      expect(m.error()).toBe('Network adapter broken');
    });

    it('onError fires for unexpected throw', async () => {
      const onError = jest.fn();
      const m = createMutation(() => {
        throw new Error('Oops');
      }, { onError });
      await m.mutate({}).catch(() => {});
      expect(onError).toHaveBeenCalledWith('Oops');
    });

    it('non-Error throw becomes "Неизвестная ошибка"', async () => {
      const m = createMutation(() => {
        // Throws a string (not an Error instance).
        throw 'raw string thrown';
      });
      await m.mutate({}).catch(() => {});
      expect(m.error()).toBe('Неизвестная ошибка');
    });
  });

  // ── in-flight coalescing (CRITICAL for double-submit protection) ────

  describe('in-flight coalescing (double-submit protection)', () => {
    it('rapid double-mutate returns the SAME pending Promise (identity check via toBe)', () => {
      const handle = pendingFetcher<unknown>();
      const m = createMutation(handle.fetcher);

      const p1 = m.mutate({ id: 1 });
      const p2 = m.mutate({ id: 2 });
      const p3 = m.mutate({ id: 3 });

      // Identity is the contract — all three calls share the same
      // Promise instance because mutate returns inFlight (= `shared`)
      // on coalesced paths.
      expect(p1).toBe(p2);
      expect(p2).toBe(p3);

      // Fetcher invoked exactly once across the three coalesced calls.
      expect(handle.invocations()).toBe(1);

      // Cleanup so the pending Subject does not leak into the next test.
      handle.resolve(ok(undefined));
      void Promise.all([p1, p2, p3]).catch(() => {});
    });

    it('3 simultaneous mutate() calls invoke the fetcher exactly ONCE', async () => {
      const fetcher = jest.fn(() => of(ok({ id: 'x' })));
      const m = createMutation(fetcher);

      const p1 = m.mutate({ a: 1 });
      const p2 = m.mutate({ a: 2 });
      const p3 = m.mutate({ a: 3 });

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(p1).toBe(p2);
      expect(p2).toBe(p3);

      const all = await Promise.all([p1, p2, p3]);
      expect(all).toEqual([{ id: 'x' }, { id: 'x' }, { id: 'x' }]);
      // Still exactly one invocation after settle.
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('isLoading stays true throughout coalescing window, flips false once', async () => {
      const handle = pendingFetcher<{ id: number }>();
      const m = createMutation(handle.fetcher);

      const p1 = m.mutate({});
      const p2 = m.mutate({});
      expect(m.isLoading()).toBe(true);

      handle.resolve(ok({ id: 1 }));
      await Promise.all([p1, p2]);
      expect(m.isLoading()).toBe(false);
    });

    it('onSuccess fires once for coalesced double-call (data is identical)', async () => {
      const handle = pendingFetcher<{ id: string }>();
      const onSuccess = jest.fn();
      const m = createMutation(handle.fetcher, { onSuccess });

      const p1 = m.mutate({});
      const p2 = m.mutate({});
      handle.resolve(ok({ id: 'first' }));
      await Promise.all([p1, p2]);

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith({ id: 'first' });
    });

    it('onError fires once for coalesced double-call', async () => {
      const handle = pendingFetcher<unknown>();
      const onError = jest.fn();
      const m = createMutation(handle.fetcher, { onError });

      const p1 = m.mutate({}).catch(() => undefined);
      const p2 = m.mutate({}).catch(() => undefined);
      handle.resolve(fail('Conflict'));
      await Promise.all([p1, p2]);

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith('Conflict');
    });
  });

  // ── reset() and generation counter ───────────────────────────────────

  describe('reset()', () => {
    it('clears error to null', async () => {
      const m = createMutation(tickFetcher(fail('Bad')));
      await m.mutate({}).catch(() => {});
      expect(m.error()).toBe('Bad');
      m.reset();
      expect(m.error()).toBe(null);
    });

    it('clears isLoading to false', () => {
      const m = createMutation(tickFetcher(ok({})));
      m.reset();
      expect(m.isLoading()).toBe(false);
    });

    it('allows a new mutate after settled reset (coalescing lock is cleared by previous .finally)', async () => {
      const m = createMutation(tickFetcher(ok({ id: 'x' })));
      await m.mutate({}); // first call settles, .finally clears inFlight
      m.reset();
      const secondResult = await m.mutate({}); // fresh request, allowed
      expect(secondResult).toEqual({ id: 'x' });
      expect(calls).toBe(2);
    });

    /**
     * Generation counter: reset() invalidates any pending mutate so
     * its side-effects (signal updates, onSuccess, onError) become
     * no-ops. The HTTP request may still complete on the wire, but
     * its result is silently discarded.
     *
     * This is the key UX guarantee: after `reset()` the user sees a
     * clean state, and a stale error from the previous request does
     * not pop up later to confuse the user.
     */
    it('reset() during pending invalidates side-effects (stale result does NOT clobber state)', async () => {
      const handle = pendingFetcher<string>();
      const onError = jest.fn();
      const m = createMutation(handle.fetcher, { onError });

      const pending = m.mutate({}); // pending — generation #1
      expect(m.isLoading()).toBe(true);

      // Reset invalidates generation #1; clears signals synchronously.
      m.reset();
      expect(m.isLoading()).toBe(false);
      expect(m.error()).toBe(null);

      // Resolve the stale pending request with an error that WOULD have
      // clobbered state, but is suppressed by the generation check.
      handle.resolve(fail('STALE error after reset'));
      await pending.catch(() => undefined);

      // State stays cleared — stale result did not leak through.
      expect(m.error()).toBe(null);
      expect(m.isLoading()).toBe(false);
      expect(onError).not.toHaveBeenCalled();
    });

    it('reset() allows immediate fresh mutate() that completes successfully via distinct fetcher invocation', async () => {
      // Two distinct pending fetcher subjects so the fresh mutate is
      // NOT coalesced with the stale one — ensures a brand-new HTTP
      // request is launched, proving reset() correctly cleared `inFlight`
      // and incremented `generation`.
      const staleHandle = pendingFetcher<{ id: string }>();
      const freshHandle = pendingFetcher<{ id: string }>();
      let useStale = true;
      // swapFetcher returns the chosen underlying fetcher FUNCTION —
      // does NOT invoke it. `createMutation` will call `fetcher(params)`
      // itself to obtain the Observable.
      const swapFetcher = (): typeof staleHandle.fetcher =>
        useStale ? staleHandle.fetcher() : freshHandle.fetcher();
      const m = createMutation(swapFetcher);

      const stale = m.mutate({}); // generation #1, routes to staleHandle

      // Snapshot invocation counts BEFORE reset to assert exactly one
      // call per mutate (not coalesced into the next).
      expect(staleHandle.invocations()).toBe(1);
      expect(freshHandle.invocations()).toBe(0);

      m.reset(); // bumps generation, clears inFlight, clears signals

      // Flip the routed fetcher for the next mutate to use the
      // fresh subject (so the fresh call doesn't observe the
      // already-completed stale subject).
      useStale = false;
      const fresh = m.mutate({}); // generation #2, routes to freshHandle

      // Two distinct fetcher invocations across two distinct generations
      // — proves reset cleared the coalescing lock correctly.
      expect(stale).not.toBe(fresh);
      expect(staleHandle.invocations()).toBe(1);
      expect(freshHandle.invocations()).toBe(1);

      // Resolve stale first — its result is discarded by generation check.
      staleHandle.resolve(ok({ id: 'stale' }));
      await stale.catch(() => undefined);
      expect(m.error()).toBe(null); // stale onSuccess/onError suppressed
      // NOTE: m.isLoading() is still TRUE at this point because the
      // fresh IIFE is awaiting on freshHandle.subject (not yet emitted).
      // The cleanup cb (which would clear isLoading) only runs when the
      // pending shared.finally settles — and shared2 hasn't settled
      // because fresh hasn't resolved. The isLoading=false assertion is
      // verified below after fresh resolves.

      // Resolve fresh — completes successfully.
      freshHandle.resolve(ok({ id: 'fresh' }));
      const result = await fresh;
      expect(result).toEqual({ id: 'fresh' });
      expect(m.error()).toBe(null);
      expect(m.isLoading()).toBe(false); // cleanup ran after fresh settled
    });
  });

  // ── successMessage option (documentation only) ───────────────────────

  describe('successMessage option (documentation only)', () => {
    it('is accepted without runtime effect on signals or result', async () => {
      const m = createMutation(tickFetcher(ok({ id: 1 })), {
        successMessage: 'Material created',
      });
      const result = await m.mutate({});
      expect(result).toEqual({ id: 1 });
      expect(m.isLoading()).toBe(false);
      expect(m.error()).toBe(null);
      // successMessage has NO runtime effect — no toast side-effect,
      // no signal, no callback. Caller is responsible for firing toast
      // from onSuccess (per documented contract).
    });
  });

  // ── factory contract ─────────────────────────────────────────────────

  describe('factory contract', () => {
    it('returns a Mutation<T,P> object with the documented shape', () => {
      const m = createMutation(tickFetcher(ok({})));
      expect(typeof m.mutate).toBe('function');
      expect(typeof m.reset).toBe('function');
      expect(typeof m.isLoading).toBe('function'); // Signal is callable
      expect(typeof m.error).toBe('function');
    });

    it('consumer fetcher produces an Observable (compile-time + runtime check)', () => {
      const fetcher = (p: { x: number }) => of(ok(p));
      expect(isObservable(fetcher({ x: 1 }))).toBe(true);
    });
  });
});
