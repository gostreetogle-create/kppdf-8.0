import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { SilentResult } from '@kppdf/util-http';

@Injectable({ providedIn: 'root' })
export class SubmitGuard {
  private readonly inFlight = new Map<string, string>();
  private readonly completedCache = new Map<
    string,
    { result: SilentResult<unknown>; expiresAt: number }
  >();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this.completedCache) {
        if (v.expiresAt <= now) this.completedCache.delete(k);
      }
    }, 60_000);
  }

  async guard<T>(opts: {
    formKey: string;
    url: string;
    method: 'POST' | 'PATCH' | 'DELETE';
    debounceMs?: number;
    fetcher: () => Observable<SilentResult<T>>;
  }): Promise<SilentResult<T>> {
    const composite = `${opts.method}|${opts.url}|${opts.formKey}`;

    const cached = this.completedCache.get(composite);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result as SilentResult<T>;
    }

    if (this.inFlight.has(composite)) {
      return {
        ok: false,
        error: new HttpErrorResponse({
          status: 429,
          statusText: 'Already in flight',
          error: { message: 'Подождите завершения предыдущей операции' },
        }),
      };
    }

    const key = crypto.randomUUID();

    try {
      await new Promise((r) => setTimeout(r, opts.debounceMs ?? 300));
      this.inFlight.set(composite, key);

      const result = await firstValueFrom(opts.fetcher());

      if (result.ok) {
        this.completedCache.set(composite, {
          result,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
      } else if (result.error.status >= 500) {
        this.completedCache.set(composite, {
          result,
          expiresAt: Date.now() + 60 * 1000,
        });
      }

      return result;
    } finally {
      this.inFlight.delete(composite);
    }
  }

  getActiveKey(url: string, method: string): string | null {
    const prefix = `${method}|${url}|`;
    for (const [composite, key] of this.inFlight) {
      if (composite.startsWith(prefix)) return key;
    }
    return null;
  }
}
