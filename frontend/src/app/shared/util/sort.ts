import { computed, signal } from '@angular/core';

export type SortDir = 'asc' | 'desc';

export interface SortState<K extends string> {
  sortKey: ReturnType<typeof signal<K | null>>;
  sortDir: ReturnType<typeof signal<SortDir>>;
  setSort: (key: K) => void;
  sortIcon: (key: K) => string;
  isSortedBy: (key: K) => boolean;
  sorted: <T>(rows: T[], keyFn: (row: T) => unknown) => ReturnType<typeof computed<T[]>>;
}

export function createSortState<K extends string>(
  initialKey: K,
  initialDir: SortDir = 'asc',
): SortState<K> {
  const sortKey = signal<K | null>(initialKey);
  const sortDir = signal<SortDir>(initialDir);

  function setSort(key: K): void {
    if (sortKey() !== key) {
      sortKey.set(key);
      sortDir.set('asc');
    } else if (sortDir() === 'asc') {
      sortDir.set('desc');
    } else {
      sortKey.set(null);
      sortDir.set('asc');
    }
  }

  function sortIcon(key: K): string {
    if (sortKey() !== key) return '↕';
    return sortDir() === 'asc' ? '↑' : '↓';
  }

  function isSortedBy(key: K): boolean {
    return sortKey() === key;
  }

  function sorted<T>(rows: T[], keyFn: (row: T) => unknown) {
    return computed<T[]>(() => {
      const k = sortKey();
      if (!k) return rows.slice();
      const sign = sortDir() === 'asc' ? 1 : -1;
      return rows.slice().sort((a, b) => {
        const av = keyFn(a);
        const bv = keyFn(b);
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * sign;
        if (bv == null) return 1 * sign;
        if (typeof av === 'number' && typeof bv === 'number') {
          return (av - bv) * sign;
        }
        return String(av).localeCompare(String(bv), 'ru') * sign;
      });
    });
  }

  return { sortKey, sortDir, setSort, sortIcon, isSortedBy, sorted };
}
