import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { SilentResult } from '../../core/silent-http';

export interface LookupTable<T> {
  byId: ReturnType<typeof signal<Record<string, T>>>;
  load: () => void;
}

/**
 * Create a reactive lookup table from a paginated list endpoint.
 *
 * `keyFn` extracts the ID field from each item (defaults to `_id`).
 * The returned `byId` signal is a Record<id, T> for O(1) lookups.
 *
 * Usage:
 *   const orgs = createLookupTable(
 *     this.orgs.list({ limit: 200 }),
 *     (o) => o._id,
 *   );
 *   // In template: orgs.byId()[row.supplierId]?.name
 */
export function createLookupTable<T>(
  fetcher: Observable<SilentResult<{ items?: T[] } | T[]>>,
  keyFn: (item: T) => string = (item: T) => (item as Record<string, unknown>)['_id'] as string,
): LookupTable<T> {
  const byId = signal<Record<string, T>>({});
  const destroyRef = inject(DestroyRef);
  let subscription: Subscription | undefined;

  function load(): void {
    subscription?.unsubscribe();
    subscription = fetcher.pipe(takeUntilDestroyed(destroyRef)).subscribe((res) => {
      if (!res.ok) return;
      const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
      const map: Record<string, T> = {};
      for (const item of items) map[keyFn(item)] = item;
      byId.set(map);
    });
  }

  return { byId, load };
}
