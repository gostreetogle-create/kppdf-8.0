import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiWorkTypesService, type WorkType } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type WorkTypeRow = WorkType;

function valueFor(row: WorkType, key: string): unknown {
  return row[key as keyof WorkType];
}

/** Bridges the flat `GET /work-types` response to the registry engine. */
export function createWorkTypesHttpDataSource(
  workTypesService: PiWorkTypesService,
): RegistryDataSource<WorkTypeRow> {
  return {
    async query(state: RegistryQueryState) {
      const res = await firstValueFrom(workTypesService.list({ activeOnly: false }));
      if (!res.ok) throw new Error(extractErrorMessage(res.error));

      const search = state.filters['search']?.trim().toLocaleLowerCase('ru-RU') ?? '';
      let rows = res.data.items.filter((row) => {
        if (!search) return true;
        return [row.name, row.section, row.department, row.description]
          .filter(Boolean)
          .some((value) => String(value).toLocaleLowerCase('ru-RU').includes(search));
      });

      const sort = state.sort;
      if (sort) {
        const direction = sort.direction === 'asc' ? 1 : -1;
        rows = [...rows].sort((a, b) => {
          const left = valueFor(a, sort.key);
          const right = valueFor(b, sort.key);
          if (left == null && right == null) return 0;
          if (left == null) return -1 * direction;
          if (right == null) return direction;
          if (typeof left === 'number' && typeof right === 'number') {
            return (left - right) * direction;
          }
          return String(left).localeCompare(String(right), 'ru') * direction;
        });
      }

      const start = Math.max(0, (state.page - 1) * state.pageSize);
      return { rows: rows.slice(start, start + state.pageSize), total: rows.length };
    },
  };
}
