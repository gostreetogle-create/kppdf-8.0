import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SubmitGuard } from './submit-guard';

/** Derived from `SubmitGuard['guard']` first-parameter shape. No library API change. */
type Fetcher = Parameters<SubmitGuard['guard']>[0]['fetcher'];

const mockUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

describe('SubmitGuard', () => {
  let guard: SubmitGuard;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: mockUUID },
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [SubmitGuard],
    });
    guard = TestBed.inject(SubmitGuard);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('caches successful result and returns it on second call', async () => {
    const fetcher: Fetcher = () =>
      of<SilentResult<{ id: string }>>({ ok: true as const, data: { id: '2' } });
    const formKey = 'cached-form';
    const url = '/api/items';
    const method = 'POST' as const;

    const result1 = await guard.guard({ formKey, url, method, fetcher });
    expect(result1.ok).toBe(true);

    const result2 = await guard.guard({ formKey, url, method, fetcher, debounceMs: 0 });
    expect(result2.ok).toBe(true);
  });

  it('does not cache 4xx errors — fetcher is called again', async () => {
    const fetcher: Fetcher = () =>
      of<SilentResult<unknown>>({
        ok: false as const,
        error: new HttpErrorResponse({ status: 400, error: { message: 'Bad Request' } }),
      });
    const formKey = '4xx-form';
    const url = '/api/items';
    const method = 'POST' as const;

    await guard.guard({ formKey, url, method, fetcher, debounceMs: 0 });
    await guard.guard({ formKey, url, method, fetcher, debounceMs: 0 });

    expect(guard.getActiveKey(url, method)).toBeNull();
  });

  it('caches 5xx errors and returns them on second call', async () => {
    const fetcher: Fetcher = () =>
      of<SilentResult<unknown>>({
        ok: false as const,
        error: new HttpErrorResponse({ status: 500, error: { message: 'Server Error' } }),
      });
    const formKey = '5xx-form';
    const url = '/api/items';
    const method = 'POST' as const;

    const result1 = await guard.guard({ formKey, url, method, fetcher, debounceMs: 0 });
    expect(result1.ok).toBe(false);

    const result2 = await guard.guard({ formKey, url, method, fetcher, debounceMs: 0 });
    expect(result2.ok).toBe(false);
  });

  it('clears in-flight entry after request completes', async () => {
    const fetcher: Fetcher = () =>
      of<SilentResult<{ id: string }>>({ ok: true as const, data: { id: '3' } });
    const formKey = 'reset-form';
    const url = '/api/items';
    const method = 'POST' as const;

    await guard.guard({ formKey, url, method, fetcher, debounceMs: 0 });
    expect(guard.getActiveKey(url, method)).toBeNull();
  });

  it('getActiveKey returns null when no in-flight request', () => {
    expect(guard.getActiveKey('/api/items', 'POST')).toBeNull();
  });
});
