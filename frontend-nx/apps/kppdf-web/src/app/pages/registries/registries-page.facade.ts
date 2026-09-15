import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { REGISTRY_DEFAULT_CATEGORY, type RegistryDefinition, type RegistryMasterRow, type RegistryRow, type RegistrySort } from '@kppdf/features/registries-platform';
import type { ColumnDef } from '@kppdf/ui/table';

interface RegistryCategoryGroup {
  readonly category: string;
  readonly rows: RegistryMasterRow[];
}

@Injectable()
export class RegistriesPageFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  catalog: readonly RegistryDefinition<RegistryRow>[] = [];

  readonly registryKey = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('registryKey'))),
    { initialValue: this.route.snapshot.paramMap.get('registryKey') },
  );

  readonly isUnknown = computed(() => {
    const key = this.registryKey();
    return key !== null && !this.catalog.some((d) => d.key === key);
  });

  readonly masterRows = signal<RegistryMasterRow[]>([]);
  readonly groupedRows = computed<RegistryCategoryGroup[]>(() => {
    const groups = new Map<string, RegistryMasterRow[]>();
    for (const row of this.masterRows()) {
      const rows = groups.get(row.category);
      if (rows) rows.push(row);
      else groups.set(row.category, [row]);
    }
    return Array.from(groups, ([category, rows]) => ({ category, rows }));
  });

  readonly masterColumns: ColumnDef<RegistryMasterRow>[] = [
    { key: 'title', label: 'Реестр' },
    { key: 'source', label: 'Источник', width: '8rem' },
    {
      key: 'recordCount',
      label: 'Записей',
      width: '10rem',
      align: 'right' as const,
      numeric: true,
      format: (row: RegistryMasterRow) => recordCountLabel(row.recordCount),
    },
  ];

  readonly expandedRowWhenFn = computed(() => {
    const key = this.registryKey();
    return (row: RegistryMasterRow) => key !== null && row.key === key;
  });

  readonly expandedRowLabelFn = computed(
    () => (row: RegistryMasterRow) => `Реестр «${row.title}»`,
  );

  initialize(catalog: readonly RegistryDefinition<RegistryRow>[]): void {
    this.catalog = catalog;
    this.masterRows.set(catalog.map((def) => ({
      id: def.key,
      key: def.key,
      title: def.title,
      description: def.description,
      source: def.source,
      recordCount: def.recordCount ? def.recordCount() : null,
      category: def.category ?? REGISTRY_DEFAULT_CATEGORY,
    })));
  }

  init(): void {
    void this.loadRecordCounts();
  }

  definitionFor(key: string): RegistryDefinition<RegistryRow> | null {
    return this.catalog.find((d) => d.key === key) ?? null;
  }

  onMasterRowClick(row: RegistryMasterRow): void {
    const scrollport = this.registryScrollport();
    const scrollTop = scrollport?.scrollTop;
    const target = this.registryKey() === row.key ? ['/registries'] : ['/registries', row.key];
    void this.router.navigate(target).then(() => {
      if (scrollport && scrollTop !== undefined) restoreRegistryScrollPosition(scrollport, scrollTop);
    });
  }

  private async loadRecordCounts(): Promise<void> {
    const queryState = { filters: {}, page: 1, pageSize: 1, sort: null as RegistrySort | null };
    const counts = await Promise.all(
      this.catalog.map(async (def) => {
        if (def.recordCount) return def.recordCount();
        try {
          const result = await def.dataSource.query({
            ...queryState,
            sort: def.defaultSort ?? null,
            pageSize: def.defaultPageSize ?? 1,
          });
          return result.total;
        } catch {
          return null;
        }
      }),
    );
    this.masterRows.update((rows) => rows.map((row, index) => ({
      ...row,
      recordCount: counts[index] ?? row.recordCount,
    })));
  }

  private registryScrollport(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    return document.querySelector<HTMLElement>('.shell-main');
  }
}

export function restoreRegistryScrollPosition(
  scrollport: { scrollTop: number } | null,
  scrollTop: number,
  schedule?: (callback: () => void) => void,
): void {
  if (!scrollport) return;
  const restore = (): void => {
    scrollport.scrollTop = scrollTop;
  };
  if (schedule) {
    schedule(() => schedule(restore));
    return;
  }
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(restore));
  } else {
    queueMicrotask(restore);
  }
}

function recordCountLabel(count: number | null): string {
  if (count === null) return 'Неизвестно';
  return pluralizeRecords(count);
}

function pluralizeRecords(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} записей`;
  if (mod10 === 1) return `${n} запись`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} записи`;
  return `${n} записей`;
}
