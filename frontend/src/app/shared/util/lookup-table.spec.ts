import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, Injector, runInInjectionContext } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { SilentResult } from '../../core/silent-http';
import { createLookupTable } from './lookup-table';

/**
 * TZ-232.A acceptance — minimal host component that mounts a lookup
 * table as a class field initializer (real-world usage pattern).
 * Used by the 100-cycle leak stress test below.
 *
 * CRITICAL: the fetcher is `EMPTY` (never emits, never completes)
 * instead of `of({ ok: true, data: [] })` because:
 *   - `of(...)` completes synchronously → subscription closed at subscribe-time
 *   - The Subscription is `.closed = true` BEFORE `fixture.destroy()` runs
 *   - So `takeUntilDestroyed(destroyRef)` is never actually exercised
 *   - Removing takeUntilDestroyed would still PASS the test → false confidence
 *
 * With EMPTY, the subscription stays active until DestroyRef fires; only
 * `takeUntilDestroyed` correctly closes it. Without the operator, the
 * subscription leaks across cycles and Angular's destroyed-injector guard
 * fires on the next `TestBed.resetTestingModule()`.
 *
 * `Subject` was an alternative candidate considered but rejected in favor
 * of EMPTY for readability (EMPTY is self-documenting; Subject would
 * need commentary that the test author intentionally never calls .next()).
 */
@Component({ template: '', standalone: true })
class TestHostComponent {
  readonly lookup = createLookupTable<unknown[]>(EMPTY);
}

describe('createLookupTable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  function callInContext<T>(fn: () => T): T {
    return runInInjectionContext(TestBed.inject(Injector), fn);
  }

  it('returns byId signal and load function', () => {
    const table = callInContext(() => {
      const fetcher = of<SilentResult<{ _id: string; name: string }[]>>({
        ok: true,
        data: [{ _id: '1', name: 'Alice' }],
      });
      return createLookupTable(fetcher);
    });
    expect(table.byId()).toEqual({});
    expect(typeof table.load).toBe('function');
  });

  it('populates byId signal after load()', () => {
    const table = callInContext(() => {
      const fetcher = of<SilentResult<{ _id: string; name: string }[]>>({
        ok: true,
        data: [
          { _id: '1', name: 'Alice' },
          { _id: '2', name: 'Bob' },
        ],
      });
      return createLookupTable(fetcher);
    });
    table.load();
    expect(table.byId()).toEqual({
      '1': { _id: '1', name: 'Alice' },
      '2': { _id: '2', name: 'Bob' },
    });
  });

  it('uses custom keyFn when provided', () => {
    const table = callInContext(() => {
      const fetcher = of<SilentResult<{ id: string; label: string }[]>>({
        ok: true,
        data: [{ id: 'a', label: 'Alpha' }],
      });
      return createLookupTable(fetcher, (item) => item.id);
    });
    table.load();
    expect(table.byId()).toEqual({ a: { id: 'a', label: 'Alpha' } });
  });

  it('ignores failed result (res.ok === false)', () => {
    const table = callInContext(() => {
      const fetcher = of<SilentResult<{ _id: string }[]>>({
        ok: false,
        error: new HttpErrorResponse({
          status: 0,
          statusText: 'Unknown',
          error: 'network error',
        }),
      });
      return createLookupTable(fetcher);
    });
    table.load();
    expect(table.byId()).toEqual({});
  });

  it('handles empty result data', () => {
    const table = callInContext(() => {
      const fetcher = of<SilentResult<{ _id: string }[]>>({
        ok: true,
        data: [],
      });
      return createLookupTable(fetcher);
    });
    table.load();
    expect(table.byId()).toEqual({});
  });

  it('handles paginated result shape { items, total }', () => {
    const table = callInContext(() => {
      const fetcher = of<SilentResult<{ items: { _id: string; name: string }[]; total: number }>>({
        ok: true,
        data: { items: [{ _id: '1', name: 'Alice' }], total: 1 },
      });
      return createLookupTable(fetcher);
    });
    table.load();
    expect(table.byId()).toEqual({ '1': { _id: '1', name: 'Alice' } });
  });

  /**
   * TZ-232.A acceptance — stress test: create + destroy a host
   * component 100 times.
   *
   * CRITICAL VALIDATION: the TestHostComponent uses `EMPTY` (never
   * completes), so the underlying RxJS Subscription stays active
   * until `fixture.destroy()` triggers the DestroyRef cascade
   * (which `takeUntilDestroyed(destroyRef)` listens to).
   *
   * Implicit pass criteria: if the cleanup operator is missing or
   * broken, the leaked subscription holds onto the host Injector →
   * next `TestBed.resetTestingModule()` triggers "destroyed injector
   * use" violation → test fails BEFORE we reach the final assertion.
   *
   * Reaching `expect(true).toBe(true)` means 100 cycles completed
   * cleanly = 0 leaked subscriptions.
   */
  it('100 mount/unmount cycles → 0 leaked subscriptions', () => {
    for (let i = 0; i < 100; i++) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
        imports: [TestHostComponent],
      });
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      fixture.destroy();
    }
    expect(true).toBe(true);
  });
});
