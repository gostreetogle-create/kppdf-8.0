import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatDate, formatPrice } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import {
  PiEntityListComponent,
  DefaultListParams,
  SortChangeEvent,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import { EntityService } from '../../shared/dsl/entity/entity-service';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { Contract, ContractStatus, ContractsService } from './contracts.service';
import { ContractFormDialogComponent } from './contract-form-dialog.component';

/** Client-side pagination page size for /contracts flat-array endpoint. */
const PAGE_SIZE = 20;

type SortKey = 'number' | 'expiresAt' | 'totalAmount' | 'status';

/**
 * Contract lifecycle for sort: draft → sent → signed → active →
 * completed → expired → cancelled. Alphabetical ordering on the
 * raw status string would give `active < cancelled < completed <
 * draft`, which is meaningless to a sales manager reading the
 * contract pipeline. Sort by numeric lifecycle index instead.
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
 *   null/undefined → bottom regardless of direction (R-3-style).
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

function customerIdOf(row: Contract): string {
  if (!row.customerId) return '';
  if (typeof row.customerId === 'string') return row.customerId;
  return row.customerId._id ?? '';
}

function organizationIdOf(row: Contract): string {
  if (!row.organizationId) return '';
  if (typeof row.organizationId === 'string') return row.organizationId;
  return row.organizationId._id ?? '';
}

/**
 * TZ-232.D sentinel #2 v3 — contracts migrated on <pi-entity-list>
 * via Approach D hybrid.
 *
 * v3 changes vs v2:
 *  - Removed `constructor2()` placeholder (left in v2 by mistake).
 *  - Added real `effect()` block on `sortedRows()` → calls
 *    `listRef?.reload()` when the slice changes (filter or sort
 *    cycle click). `firstRun` guard skips the initial mount since
 *    the wrapper's ngOnInit already fires the initial fetch.
 *  - Removed redundant `data = computed(() => dataSig())` — the
 *    page reactively reads `dataSig()` directly in `filteredRows`.
 *  - Removed unused `HttpClient` + `silentGet` imports (kept
 *    `extractErrorMessage` for the error-surface path).
 */
@Component({
  selector: 'app-contracts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiRowActionsComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · договоры"
      title="Договоры"
      description="Договоры с покупателями. Связь «наша организация ↔ контрагент», позиции, срок действия."
    />

    <app-pi-entity-list
      #list
      [service]="localAdapter"
      [cols]="cols"
      ariaLabel="Список договоров"
      [pageSize]="PAGE_SIZE"
      [showSearch]="false"
      [localSort]="false"
      [initialSortKey]="'expiresAt'"
      [initialSortDir]="'desc'"
      emptyMessage="Нет договоров. Нажмите «Создать», чтобы добавить первый."
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTplBinding()"
      (create)="openCreate()"
      (rowEdit)="openEdit($event)"
      (rowDelete)="onDelete($event)"
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

      <!-- Page-level search input + count hint (in toolbarExtras) -->
      <div toolbarExtras class="flex items-center gap-2 flex-wrap">
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
        <span class="text-xs text-muted-foreground" data-test="contracts-count">
          {{ listTotal() }} {{ totalLabel(listTotal()) }}
        </span>
      </div>
    </app-pi-entity-list>

    <p class="text-[10px] text-muted-foreground mt-2 sm:hidden">
      ← Таблица широкая — прокручивайте горизонтально →
    </p>
  `,
})
export class ContractsPage {
  private readonly service = inject(ContractsService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly orgService = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  protected readonly sortKeySig = signal<SortKey | null>('expiresAt');
  protected readonly sortDirSig = signal<'asc' | 'desc' | null>('desc');

  private readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );
  private readonly organizationsLookup = createLookupTable<Organization>(
    this.orgService.list({ limit: 200 }),
  );

  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  /**
   * Direct `service.list()` fetch (no httpResource — page is
   * purely client-side filter+sort+pag). Stored in `dataSig`;
   * reactive computed chain downstream.
   */
  protected readonly dataSig = signal<Contract[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.counterpartiesLookup.load();
    this.organizationsLookup.load();
    this.reload();

    /**
     * Effect-driven reload: when `sortedRows()` produces a new
     * value (filter or sort cycle change), call `listRef?.reload()`
     * so the wrapper re-pulls its `{items, total}` from the
     * synthetic localAdapter. `firstRun` guard skips the initial
     * mount (wrapper's ngOnInit fires the first fetch through
     * localAdapter.list).
     */
    let firstEffectRun = true;
    effect(() => {
      this.sortedRows();
      if (firstEffectRun) {
        firstEffectRun = false;
        return;
      }
      this.listRef()?.reload();
    });
  }

  /**
   * Fetch the full contracts flat array and store in `dataSig`.
   * `silentGet` semantics: never throws — failures surface via the
   * `res.ok === false` discriminated union.
   */
  private reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe((res) => {
      if (res.ok) {
        this.dataSig.set(res.data);
        this.error.set(null);
      } else {
        this.error.set(extractErrorMessage(res.error));
        this.dataSig.set([]);
      }
      this.loading.set(false);
    });
  }

  protected readonly filteredRows = computed<Contract[]>(() => {
    const rows = this.dataSig();
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

  protected readonly sortedRows = computed<Contract[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  // ─── Wrapper ref + synthetic EntityService adapter ────────────────
  private readonly listRef = viewChild<PiEntityListComponent<Contract>>('list');

  protected readonly listTotal = computed<number>(() => this.listRef()?.total() ?? 0);

  private readonly counterpartyTplRef = viewChild<TemplateRef<{ $implicit: Contract }>>(
    'counterpartyTpl',
  );
  private readonly organizationTplRef = viewChild<TemplateRef<{ $implicit: Contract }>>(
    'organizationTpl',
  );
  private readonly rowActionsTplRef = viewChild<TemplateRef<{ $implicit: Contract }>>(
    'rowActionsTpl',
  );

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: Contract }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: Contract }>> = {};
    const cp = this.counterpartyTplRef();
    const org = this.organizationTplRef();
    if (cp) result['customerId'] = cp;
    if (org) result['organizationId'] = org;
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: Contract }> | null
  >(() => this.rowActionsTplRef() ?? null);

  /**
   * Synthetic `EntityService<Contract, DefaultListParams>` adapter.
   * Slices the locally filtered+sorted `sortedRows()` into the
   * `{items, total}` shape the wrapper expects.
   */
  protected readonly localAdapter: EntityService<Contract, DefaultListParams> = {
    list: (params: DefaultListParams) => {
      const limit = Math.max(params.limit ?? PAGE_SIZE, 1);
      const start = ((params.page ?? 1) - 1) * limit;
      const all = this.sortedRows();
      return of({
        ok: true as const,
        data: {
          items: all.slice(start, start + limit),
          total: all.length,
          page: params.page ?? 1,
          limit,
        },
      });
    },
    findById: (id: string) => this.service.findById(id),
    create: (payload) => this.service.create(payload),
    update: (id, payload) => this.service.update(id, payload),
    remove: (id) => this.service.remove(id),
  };

  // ─── Column definitions ─────────────────────────────────────────────
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

  // ─── Event handlers ────────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.sortKeySig.set('expiresAt');
    this.sortDirSig.set('desc');
  }

  protected onSortChange(event: SortChangeEvent): void {
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : (dir as 'asc' | 'desc'));
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
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Договор удалён');
          this.reload();
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

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.counterpartiesLookup.load();
      this.organizationsLookup.load();
      this.reload();
    });
  }
}