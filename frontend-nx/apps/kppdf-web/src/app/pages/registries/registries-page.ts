import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { BadgeComponent } from '@kppdf/ui/badge';
import { TableComponent, type ColumnDef } from '@kppdf/ui/table';
import { REGISTRIES_CATALOG, provideRegistriesCatalog } from './data/registries.catalog';
import { RegistryDetailPanelComponent } from './registry-detail-panel.component';
import {
  REGISTRY_DEFAULT_CATEGORY,
  type RegistryDefinition,
  type RegistryMasterRow,
  type RegistryRow,
  type RegistrySort,
} from './model/registry.types';

/** One `/registries` master-table group — TZ-NX-REGISTRIES-CATEGORY-GROUPS. */
interface RegistryCategoryGroup {
  readonly category: string;
  readonly rows: RegistryMasterRow[];
}

/**
 * TZ-NX-REGISTRIES-MASTER-TABLE-UX — `/registries` master table +
 * router-driven inline detail panel. Replaces the former split
 * `RegistriesListPage` (card grid) / `RegistryDetailPage` (routed detail)
 * pair (TZ-NX-REGISTRIES-PLATFORM). Both `/registries` and
 * `/registries/:registryKey` render THIS component (see
 * `registries.routes.ts`) — the route param only decides which master row
 * (if any) is expanded; the query/filter/loading/error/row-action engine
 * itself lives entirely in `RegistryDetailPanelComponent`, mounted inline
 * via `@kppdf/ui/table`'s own `expandedRow` slot so there is exactly one
 * open row by construction (a single `registryKey` drives the single
 * `expandedRowWhen` predicate).
 */
@Component({
  selector: 'pi-registries-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideRegistriesCatalog()],
  imports: [RouterLink, PiPageChromeComponent, BadgeComponent, TableComponent, RegistryDetailPanelComponent],
  template: `
    <div class="px-panel-inset" data-test="registries-page-content">
      <app-pi-page-chrome [crumbs]="[{ label: 'Реестры' }]" />

      @if (isUnknown()) {
      <div
        class="mb-4 hairline rounded-sm px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap"
        role="alert"
        data-test="registry-unknown"
      >
        <span>Реестр «{{ registryKey() }}» не найден.</span>
        <a
          routerLink="/registries"
          class="pi-focus-ring underline decoration-dotted"
          data-test="registry-unknown-back"
        >
          ← К реестрам
        </a>
      </div>
    }

    <ng-template #titleTpl let-row>
      <div class="font-medium text-ink">{{ row.title }}</div>
      @if (row.description) {
        <div class="text-xs text-muted-foreground mt-0.5">{{ row.description }}</div>
      }
    </ng-template>
    <ng-template #sourceTpl let-row>
      @if (row.source === 'api') {
        <app-pi-badge variant="secondary">API</app-pi-badge>
      } @else {
        <app-pi-badge variant="outline">Демо</app-pi-badge>
      }
    </ng-template>
    <ng-template #panelTpl let-row>
      @if (definitionFor(row.key); as def) {
        <pi-registry-detail-panel [definition]="def" />
      }
    </ng-template>

    @if (groupedRows().length > 0) {
      <div class="flex flex-col gap-8">
        @for (group of groupedRows(); track group.category) {
          <div data-test="registries-category-group">
            <h2 class="eyebrow mb-2 px-1" data-test="registries-category-label">{{ group.category }}</h2>
            <app-pi-table
              [data]="group.rows"
              [columns]="masterColumns"
              [cellTemplates]="masterCellTemplates"
              [localSort]="false"
              [expandedRow]="panelTplBinding"
              [expandedRowWhen]="expandedRowWhenFn()"
              [expandedRowLabel]="expandedRowLabelFn()"
              (rowClick)="onMasterRowClick($event)"
              [ariaLabel]="'Реестры: ' + group.category"
              data-test="registries-master-table"
            />
          </div>
        }
      </div>
    } @else {
      <div
        class="max-w-sm p-6 pi-dashed-panel flex flex-col items-center gap-1 text-center"
        data-test="registries-empty"
      >
        <span class="eyebrow text-sunrise-warm">00</span>
        <span class="text-sm">Реестры не найдены.</span>
      </div>
    }
    </div>
  `,
})
export class RegistriesPage implements OnInit {
  private readonly catalog = inject(REGISTRIES_CATALOG);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly registryKey = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('registryKey'))),
    { initialValue: this.route.snapshot.paramMap.get('registryKey') },
  );

  protected readonly isUnknown = computed(() => {
    const key = this.registryKey();
    return key !== null && !this.catalog.some((d) => d.key === key);
  });

  protected readonly masterRows = signal<RegistryMasterRow[]>(
    this.catalog.map((def) => ({
      id: def.key,
      key: def.key,
      title: def.title,
      description: def.description,
      source: def.source,
      recordCount: def.recordCount ? def.recordCount() : null,
      category: def.category ?? REGISTRY_DEFAULT_CATEGORY,
    })),
  );

  /**
   * TZ-NX-REGISTRIES-CATEGORY-GROUPS — rows grouped by `category`, group
   * order following each category's first appearance in the catalog.
   */
  protected readonly groupedRows = computed<RegistryCategoryGroup[]>(() => {
    const groups = new Map<string, RegistryMasterRow[]>();
    for (const row of this.masterRows()) {
      const rows = groups.get(row.category);
      if (rows) rows.push(row);
      else groups.set(row.category, [row]);
    }
    return Array.from(groups, ([category, rows]) => ({ category, rows }));
  });

  protected readonly masterColumns: ColumnDef<RegistryMasterRow>[] = [
    { key: 'title', label: 'Реестр' },
    { key: 'source', label: 'Источник', width: '8rem' },
    {
      key: 'recordCount',
      label: 'Записей',
      width: '10rem',
      align: 'right',
      numeric: true,
      format: (r) => recordCountLabel(r.recordCount),
    },
  ];

  protected readonly expandedRowWhenFn = computed(() => {
    const key = this.registryKey();
    return (row: RegistryMasterRow) => key !== null && row.key === key;
  });

  protected readonly expandedRowLabelFn = computed(
    () => (row: RegistryMasterRow) => `Реестр «${row.title}»`,
  );

  @ViewChild('titleTpl', { static: true })
  private readonly titleTplRef!: TemplateRef<{ $implicit: RegistryMasterRow }>;
  @ViewChild('sourceTpl', { static: true })
  private readonly sourceTplRef!: TemplateRef<{ $implicit: RegistryMasterRow }>;
  @ViewChild('panelTpl', { static: true })
  private readonly panelTplRef!: TemplateRef<{ $implicit: RegistryMasterRow }>;

  protected masterCellTemplates: Record<string, TemplateRef<{ $implicit: RegistryMasterRow }>> = {};
  protected panelTplBinding: TemplateRef<{ $implicit: RegistryMasterRow }> | null = null;

  ngOnInit(): void {
    this.masterCellTemplates = { title: this.titleTplRef, source: this.sourceTplRef };
    this.panelTplBinding = this.panelTplRef;
    void this.loadRecordCounts();
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
    this.masterRows.update((rows) =>
      rows.map((row, index) => ({
        ...row,
        recordCount: counts[index] ?? row.recordCount,
      })),
    );
  }

  protected definitionFor(key: string): RegistryDefinition<RegistryRow> | null {
    return this.catalog.find((d) => d.key === key) ?? null;
  }

  protected onMasterRowClick(row: RegistryMasterRow): void {
    if (this.registryKey() === row.key) {
      void this.router.navigate(['/registries']);
    } else {
      void this.router.navigate(['/registries', row.key]);
    }
  }
}

function recordCountLabel(count: number | null): string {
  if (count === null) return 'Неизвестно';
  return pluralizeRecords(count);
}

/** RU pluralization for «запись/записи/записей» (1 / 2–4 / 0,5+ and the 11–14 exception). */
function pluralizeRecords(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} записей`;
  if (mod10 === 1) return `${n} запись`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} записи`;
  return `${n} записей`;
}
