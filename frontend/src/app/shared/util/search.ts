import { computed, signal } from '@angular/core';

export interface SearchState {
  searchQuery: ReturnType<typeof signal<string>>;
  debouncedSearch: ReturnType<typeof signal<string>>;
  onSearchInput: (event: Event) => void;
  destroy: () => void;
}

export function createSearchState(debounceMs = 300): SearchState {
  const searchQuery = signal<string>('');
  const debouncedSearch = signal<string>('');
  let timer: ReturnType<typeof setTimeout> | null = null;

  function onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    searchQuery.set(target.value);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => debouncedSearch.set(target.value.trim()), debounceMs);
  }

  function destroy(): void {
    if (timer) clearTimeout(timer);
  }

  return { searchQuery, debouncedSearch, onSearchInput, destroy };
}

export interface ClientSearchState<T> extends SearchState {
  filtered: ReturnType<typeof computed<T[]>>;
}

export function createClientSearchState<T>(
  data: () => T[],
  matcher: (row: T, query: string) => boolean,
  debounceMs = 0,
): ClientSearchState<T> {
  const searchQuery = signal<string>('');
  let timer: ReturnType<typeof setTimeout> | null = null;

  const filtered = computed<T[]>(() => {
    const q = searchQuery().trim().toLowerCase();
    if (!q) return data();
    return data().filter((row) => matcher(row, q));
  });

  function onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (debounceMs > 0) {
      searchQuery.set(target.value);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => searchQuery.set(target.value.trim()), debounceMs);
    } else {
      searchQuery.set(target.value);
    }
  }

  function destroy(): void {
    if (timer) clearTimeout(timer);
  }

  return { searchQuery, debouncedSearch: searchQuery, onSearchInput, destroy, filtered };
}
