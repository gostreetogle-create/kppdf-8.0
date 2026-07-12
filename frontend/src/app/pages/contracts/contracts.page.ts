import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatDate, formatPrice } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { Contract, ContractsService, ContractStatus } from './contracts.service';
import { ContractFormDialogComponent } from './contract-form-dialog.component';

type SortKey = 'number' | 'expiresAt' | 'totalAmount' | 'status';

/** Client-side pagination page size for /contracts flat-array endpoint. */
const PAGE_SIZE = 20;

/**
 * Contract lifecycle for sort: draft → sent → signed → active →
 * completed → expired → cancelled. Alphabetical ordering on the raw
 * status string would give `active < cancelled < completed < draft`,
 * which is meaningless to a sales manager reading the contract
 * pipeline. Sort by numeric lifecycle index instead.
 */
const CONTRACT_STATUS_CYCLE_INDEX: Record<ContractStatus, number> = {
  draft: 0,
  sent: 1,
  signed: 2,
  active: 3,
  completed: 4,
  expired: 5,
  cancelled: 6,
};

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  signed: 'Подписан',
  active: 'Активен',
  completed: 'Завершён',
  cancelled: 'Отменён',
  expired: 'Истёк',
};

/**
 * Custom sort accessor per key. Different keys have different
 * "natural" sort semantics — `status` is the lifecycle cycle above,
 * `expiresAt` is chronological (null/undefined → bottom regardless
 * of direction), `totalAmount` is numeric, `number` is string-locale.
 */
function accessorFor(key: SortKey): (row: Contract) => unknown {
  switch (key) {
    case 'status':
      return (r) => CONTRACT_STATUS_CYCLE_INDEX[r.status] ?? -1;
    case 'expiresAt':
      return (r) => (r.expiresAt ? Date.parse(r.expiresAt) : null);
    case 'totalAmount':
      return (r) => r.totalAmount;
    case 'number':
      return (r) => r.number;
  }
}

/**
 * Compare two values per the sign direction. Mirrors `compareValues`
 * in `orders.page.ts` — shared mental model between the two B-flat
 * pages (contracts + orders) so behavior stays consistent.
 */
function compareValues(av: unknown, bv: unknown, sign: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * sign;
  }
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

/**
 * Customer (counterparty) ID extractor — accepts either a string ID
 * (unpopulated) or a populated Counterparty sub-document. Mirrors
 * the dual-shape pattern used by Material.supplierId in
 * materials.page.ts and Order.counterpartyId in orders.page.ts.
 */
function customerIdOf(row: Contract): string {
  if (!row.customerId) return '';
  if (typeof row.customerId === 'string') return row.customerId;
  return row.customerId._id ?? '';
}

/**
 * Organization ID extractor — same dual-shape pattern as
 * customerIdOf. Both organizationId AND customerId may be
 * auto-populated by the backend Mongoose `.populate(...)` chain.
 */
function organizationIdOf(row: Contract): string {
  if (!row.organizationId) return '';
  if (typeof row.organizationId === 'string') return row.organizationId;
  return row.organizationId._id ?? '';
}

/**
 * TZ-104.3 batch-2-B-flat.1 — ContractsPage migrated to
 * `<app-pi-table>`, with TZ-104.4.2 typed TemplateRef propagation.
 *
 * Backend response caveat (see ContractsService): flat array, not
 * paginated envelope. Pagination TODO at backend. Client-side
 * sort + filter + slice pagination. `[total]` is the CURRENT
 * filtered+sorted length (modulo search), and `paginatedRows` is the
 * page slice of that.
 *
 * Two lookup tables (organizationsById + counterpartiesById) since
 * the contract schema requires BOTH `organizationId` AND
 * `customerId`. Both lookups drive the counterparty + organization
 * cell templates.
 *
 * TZ-104.4.2 page-loaded default sort: `[initialSortKey]="'expiresAt'"`
 * + `[initialSortDir]="'desc'"` — "contracts expiring furthest in
 * the future first", giving sales managers the active pipeline at a
 * glance. The page's internal `sortKeySig/sortDirSig` are seeded to
 * match pi-table's post-ngOnInit state so the mirror-event handler
 * stays in lockstep from the very first click.
 *
 * Two cell templates (post-TZ-104.4.2 strongly typed):
 *   - `counterpartyTpl`: cellTemplate for `customerId` column
 *   - `organizationTpl`: cellTemplate for `organizationId` column
 *   - `rowActionsTpl`: row-actions slot (edit/delete/document)
 *
 * BUG fixes vs the pre-migration source:
 *  1. `sortedRows` was previously bound via
 *     `sort.sorted(this.filteredRows(), fn)`. That captured
 *     `filteredRows()` ONCE at construction (a static snapshot) —
 *     internal computed only re-ran on sortKey/sortDir changes, NOT
 *     on filter changes. New impl is a reactive `computed` reading
 *     both `filteredRows()` AND the sort signals.
 *  2. Pre-migration had a page-level `searchQuery` signal AND
 *     `createClientSearchState`'s own internal `searchQuery`.
 *     Replaced with `createSearchState` + single reactive computed
 *     reading `debouncedSearch`.
 *
 * Standalone + OnPush + signal-based. No `contracts.page.spec.ts`
 * exists for v1; visual smoke + ng build are the acceptance pass.
 */
@Component({
  selector: 'app-contracts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · договоры"
      title="Договоры"
      description="Договоры с покупателями. Связь «наша организация ↔ контрагент», позиции, срок действия."
    />

    <app-pi-toolbar>
      <input
        id="contracts-search"
        type="search"
        name="contracts-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по номеру, названию, контрагенту…"
        aria-label="Поиск договоров"
        data-test="search-input"
        class="pi-input w-80"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span hint>{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Реестр"
      hint="сортировка · клик по заголовку"
      eyebrow="I"
    >
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="overflow-x-auto hairline rounded-sm">
        <p class="text-[10px] text-muted-foreground mb-1 sm:hidden">
          ← Таблица широкая — прокручивайте горизонтально →
        </p>
        <app-pi-table
          [data]="paginatedRows()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          [emptyMessage]="emptyMessage()"
          [ariaLabel]="'Список договоров'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="false"
          [initialSortKey]="'expiresAt'"
          [initialSortDir]="'desc'"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
        >
          <!-- ───── Counterparty (customer) lookup cell ───── -->
          <ng-template #counterpartyTpl let-row>
            {{ counterpartyNameOf(row) ?? '—' }}
          </ng-template>

          <!-- ───── Organization lookup cell ───── -->
          <ng-template #organizationTpl let-row>
            {{ organizationNameOf(row) ?? '—' }}
          </ng-template>

          <!-- ───── Row actions cluster ───── -->
          <ng-template #rowActionsTpl let-row>
            <app-pi-row-actions
              [row]="row"
              [documentLabel]="'Создать документ для договора ' + row.number"
              [dataTestDocument]="'document-button-' + row._id"
              [editLabel]="'Редактировать договор ' + row.number"
              [deleteLabel]="'Удалить договор ' + row.number"
              [dataTestEdit]="'edit-button-' + row._id"
              [dataTestDelete]="'delete-button-' + row._id"
              (document)="onCreateDocument($event)"
              (edit)="openEdit($event)"
              (delete)="onDelete($event)"
            />
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class ContractsPage implements OnInit {
  private readonly service = inject(ContractsService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly orgService = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Exposed to template via `[pageSize]="pageSize"`. */
  protected readonly pageSize = PAGE_SIZE;

  /**
   * Page-owned sort signals. Seeded to MATCH pi-table's internal
   * state after ngOnInit applies the `[initialSortKey]="'expiresAt'"`
   * + `[initialSortDir]="'desc'"` bindings (TZ-104.4.2). The `null`
   *   in the SortDir union marks the "no sort active" state (third
   * click past desc clears pi-table's sort key) — same shape as
   * `orders.page.ts` so batch-2 cross-page handling stays uniform.
   */
  private readonly sortKeySig = signal<SortKey | null>('expiresAt');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('desc');

  /** Current page (1-indexed). Bumped via `(pageChange)` from pi-table. */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  /** Two lookup tables for the dual cell templates (counterparty + organization). */
  private readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );
  private readonly organizationsLookup = createLookupTable<Organization>(
    this.orgService.list({ limit: 200 }),
  );

  /** Single debounced search state — owns its own `searchQuery` signal. */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  protected readonly listRes = httpResource<Contract[]>(() => ({
    url: `${this.baseUrl}/contracts`,
  }));

  protected readonly data = computed<Contract[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /**
   * Client-side filter across «number», «title», organization name,
   * counterparty name/shortName, packageTag. Reactive computed
   * reading `data()` and `debouncedSearch()` so both filter-set and
   * search-text changes trigger re-compute.
   */
  protected readonly filteredRows = computed<Contract[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter((c) => {
      const cpId = customerIdOf(c);
      const orgId = organizationIdOf(c);
      const hay = [
        c.number,
        c.title,
        c.packageTag,
        this.counterpartiesLookup.byId()[cpId]?.name,
        this.counterpartiesLookup.byId()[cpId]?.shortName,
        this.counterpartiesLookup.byId()[cpId]?.inn,
        this.organizationsLookup.byId()[orgId]?.name,
        this.organizationsLookup.byId()[orgId]?.shortName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  /**
   * Filtered + sorted rows. Reactive computed reading BOTH
   * `filteredRows()` AND `sortKey/sortDir` — fixes the
   * `sort.sorted(this.filteredRows(), ...)` snapshot bug. Uses
   * custom accessor per key (status cycle index, expiresAt
   * chronological, totalAmount numeric, number locale).
   */
  protected readonly sortedRows = computed<Contract[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) =>
      compareValues(accessor(a), accessor(b), sign),
    );
  });

  /**
   * Total = full filtered+sorted length, NOT page slice. pi-table
   * derives `totalPages = ceil(total / pageSize)` and shows the
   * Prev/Next pager accordingly.
   */
  protected readonly total = computed<number>(() => this.sortedRows().length);

  /**
   * Page slice of the sorted+filtered list.
   *   start = (page-1) * pageSize   (0-indexed start)
   *   end   = start + pageSize       (exclusive end)
   */
  protected readonly paginatedRows = computed<Contract[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  /** Modal toolbar count: visible rows after filtering (not the page slice). */
  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет договоров. Нажмите «Создать», чтобы добавить первый.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * Column-set mirroring the pre-migration source's 8 visible columns
   * + the trailing actions slot (auto-injected by `[rowActions]`).
   * - `number` is sticky-left (acts as an ID column per tablet UX)
   * - `customerId` + `organizationId` are `cellTemplate` (dual lookup)
   * - `status` sorts via custom `CONTRACT_STATUS_CYCLE_INDEX` and
   *   falls through to `CONTRACT_STATUS_LABELS` format string
   * - `expiresAt` is a sortable date (chrono, null → bottom)
   * - `totalAmount` is numeric with `formatPrice`, right-aligned
   */
  protected readonly cols: ColumnDef<Contract>[] = [
    {
      key: 'number',
      label: 'Номер',
      sortable: true,
      sticky: 'left',
    },
    {
      key: 'title',
      label: 'Название',
      cellClass: 'empty-cell',
    },
    {
      key: 'customerId',
      label: 'Контрагент',
      width: '180px',
    },
    {
      key: 'organizationId',
      label: 'Организация',
      width: '180px',
    },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => CONTRACT_STATUS_LABELS[r.status] ?? r.status,
    },
    {
      key: 'expiresAt',
      label: 'Срок',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => formatDate(r.expiresAt),
    },
    {
      key: 'items',
      label: 'Позиций',
      cellClass: 'text-muted-foreground',
      format: (r) => String(r.items?.length ?? 0),
    },
    {
      key: 'totalAmount',
      label: 'Сумма',
      sortable: true,
      numeric: true,
      align: 'right',
      width: '128px',
      format: (r) => (r.totalAmount == null ? '—' : formatPrice(r.totalAmount)),
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  // TZ-104.4.2: strong typing matches pi-table's re-parameterized
  // `[cellTemplates]` input. Pre-TZ-104.4.2 these were `TemplateRef<any>`.
  @ViewChild('counterpartyTpl', { static: true })
  private readonly counterpartyTplRef!: TemplateRef<{ $implicit: Contract }>;
  @ViewChild('organizationTpl', { static: true })
  private readonly organizationTplRef!: TemplateRef<{ $implicit: Contract }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Contract }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Contract }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Contract }> | null = null;

  ngOnInit(): void {
    this.counterpartiesLookup.load();
    this.organizationsLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());

    // Build cell-template map + row-actions binding AFTER static
    // ViewChild fields resolve. Avoids TemplateRef<C> invariance
    // trap and Angular's signal-binding name-collision.
    this.cellTemplates = {
      customerId: this.counterpartyTplRef,
      organizationId: this.organizationTplRef,
    };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers (TZ-104.4.2: strongly typed) ───────────
  protected counterpartyNameOf(row: Contract): string | null {
    const id = customerIdOf(row);
    if (!id) return null;
    return (
      this.counterpartiesLookup.byId()[id]?.shortName ??
      this.counterpartiesLookup.byId()[id]?.name ??
      null
    );
  }

  protected organizationNameOf(row: Contract): string | null {
    const id = organizationIdOf(row);
    if (!id) return null;
    return (
      this.organizationsLookup.byId()[id]?.shortName ??
      this.organizationsLookup.byId()[id]?.name ??
      null
    );
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['договор', 'договора', 'договоров']);
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset to first page when the search filter changes so users
    // don't land on an out-of-range page of a (possibly empty)
    // filter set.
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
  }

  /**
   * Page-owned sort handler. `[localSort]="false"` keeps pi-table
   * from re-sorting the visible page slice, and this handler simply
   * MIRRORS pi-table's sortChange emit into the page's sort
   * signals. The mirror-event pattern (vs re-derive) keeps the
   * cycles in lockstep regardless of starting-state divergence;
   * see `docs/pi-table-migration-recipe.md` §8 R-5.
   *
   * pi-table's emit contract: `{key, dir: SortDirection}` where
   * dir ∈ {'asc' | 'desc' | null}. When `dir === null`, pi-table
   * has cleared its key (third click past desc). Page mirrors by
   * clearing sortKeySig and keeping sortDirSig at 'asc' as a
   * no-visual-effect placeholder.
   */
  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    const dir = event.dir;
    // Single boundary cast: pi-table emits `key: string`, page's
    // SortKey is a union. Cast at the event ingestion point; no
    // further casts needed downstream. Mirrors `orders.page.ts`.
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : dir);
    // Reset to first page on every sort change so users see the
    // first rows of the freshly ordered set.
    this.pageSig.set(1);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ContractFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(contract: Contract): void {
    const ref = this.dialog.open(ContractFormDialogComponent, {
      data: contract,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Contract): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить договор?',
        description: `Удалить «${row.number}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Договор удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected onCreateDocument(row: Contract): void {
    this.router.navigate(['/doc-constructor/builder'], {
      queryParams: { source: 'contract', sourceId: row._id },
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.counterpartiesLookup.load();
      this.organizationsLookup.load();
      this.listRes.reload();
    });
  }
}
