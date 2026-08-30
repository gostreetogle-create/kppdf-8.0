import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiTextBlocksService, type TextBlock } from '@kppdf/data-access';
import type { RegistryDataSource, RegistryQueryState } from '../model/registry.types';

export type TextBlockRow = TextBlock;

export function createTextBlocksHttpDataSource(service: PiTextBlocksService): RegistryDataSource<TextBlockRow> {
  return {
    async query(state: RegistryQueryState) {
      const result = await firstValueFrom(service.list({
        categoryId: state.filters['categoryId'] || undefined,
        isActive: state.filters['isActive'] === undefined ? undefined : state.filters['isActive'] === 'true',
      }));
      if (!result.ok) throw new Error(extractErrorMessage(result.error));
      const search = (state.filters['search'] ?? '').trim().toLocaleLowerCase();
      const filtered = search
        ? result.data.filter((row) => [row.name, row.slug, ...row.tags].some((value) => value.toLocaleLowerCase().includes(search)))
        : result.data;
      const start = (state.page - 1) * state.pageSize;
      return { rows: filtered.slice(start, start + state.pageSize), total: filtered.length };
    },
  };
}
