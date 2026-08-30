import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export interface FixtureRegistryConfig<TRow> {
  /** Thunk (not a snapshot) so row-action mutations are visible on the next query. */
  rows: () => readonly TRow[];
  matchFilter?: (row: TRow, filterKey: string, value: string) => boolean;
  sortAccessor?: (row: TRow, key: string) => string | number;
  /** Simulated network latency, ms. Default 350 — enough to see the loading skeleton. */
  latencyMs?: number;
  /**
   * When true, the FIRST `query()` call ever made on this data source
   * instance rejects (simulating a flaky first load); every call after
   * that succeeds normally. Demonstrates the error → retry UX without
   * needing a permanent "break this on purpose" toggle in the UI.
   */
  failFirstAttempt?: boolean;
}

/**
 * In-memory fixture adapter — filters/sorts/paginates a plain array the
 * same way a real HTTP registry endpoint would, so the platform's
 * list/detail pages never need to know data is fixture-only.
 */
export function createFixtureDataSource<TRow>(
  config: FixtureRegistryConfig<TRow>,
): RegistryDataSource<TRow> {
  let hasFailedOnce = false;

  return {
    async query(state: RegistryQueryState) {
      await delay(config.latencyMs ?? 350);

      if (config.failFirstAttempt && !hasFailedOnce) {
        hasFailedOnce = true;
        throw new Error('Не удалось загрузить данные реестра. Попробуйте ещё раз.');
      }

      let rows = config.rows().slice();

      if (config.matchFilter) {
        const matchFilter = config.matchFilter;
        for (const [key, value] of Object.entries(state.filters)) {
          if (!value) continue;
          rows = rows.filter((row) => matchFilter(row, key, value));
        }
      }

      if (state.sort && config.sortAccessor) {
        const { key, direction } = state.sort;
        const sign = direction === 'asc' ? 1 : -1;
        const sortAccessor = config.sortAccessor;
        rows = rows.slice().sort((a, b) => {
          const av = sortAccessor(a, key);
          const bv = sortAccessor(b, key);
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
          return String(av).localeCompare(String(bv), 'ru') * sign;
        });
      }

      const total = rows.length;
      const start = (state.page - 1) * state.pageSize;
      const pageRows = rows.slice(start, start + state.pageSize);
      return { rows: pageRows, total };
    },
  };
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
