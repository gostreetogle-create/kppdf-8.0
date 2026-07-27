import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { SilentResult } from '../../core/silent-http';
import { createLookupTable } from './lookup-table';

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
});
