import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiTableTemplatesService, type TableTemplate } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type TableTemplateRow = TableTemplate;

export function createTableTemplatesHttpDataSource(service: PiTableTemplatesService): RegistryDataSource<TableTemplateRow> {
  return {
    async query(state: RegistryQueryState) {
      const result = await firstValueFrom(service.list());
      if (!result.ok) throw new Error(extractErrorMessage(result.error));
      const search = (state.filters['search'] ?? '').trim().toLocaleLowerCase();
      const category = state.filters['category'] ?? '';
      const filtered = result.data.filter((row) =>
        (!search || [row.name, row.description ?? ''].some((value) => value.toLocaleLowerCase().includes(search))) &&
        (!category || row.category === category),
      );
      const start = (state.page - 1) * state.pageSize;
      return { rows: filtered.slice(start, start + state.pageSize), total: filtered.length };
    },
  };
}
