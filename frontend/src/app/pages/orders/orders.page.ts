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
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
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
import { Order, OrdersService } from './orders.service';
import { OrderFormDialogComponent } from './order-form-dialog.component';

type SortKey = 'number' | 'date' | 'total' | 'status';

/** Client-side pagination page size for /orders flat-array endpoint. */
const PAGE_SIZE = 20;

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

/**
 * Status cycle for sort: draft → confirmed → in_production → ready →
 * shipped → delivered → cancelled. Alphabetical ordering on the raw
 * status string would give `cancelled < confirmed < delivered < draft`,
 * which is meaningless to a sales-manager reading the order pipeline.
 * Sort by numeric index instead.
 */
const STATUS_CYCLE_INDEX: Record<Order['status'], number> = {
  draft: 0,
  confirmed: 1,
  in_production: 2,
  ready: 3,
  shipped: 4,
  delivered: 5,
  cancelled: 6,
};

const PRIORITY_LABELS: Record<NonNullable<Order['priority']>, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
  urgent: 'Срочный',
};

/**
 * Custom sort accessor per key. Different keys have different "natural"
 * sort semantics — `status` is the lifecycle cycle above, `date` is
 * chronological (null/undefined → bottom regardless of direction),
 * `total` is numeric, `number` is string-locale.
 */
function accessorFor(key: SortKey): (row: Order) => unknown {
  switch (key) {
    case 'status':
      return (r) => STATUS_CYCLE_INDEX[r.status] ?? -1;
    case 'date':
      return (r) => (r.date ? Date.parse(r.date) : null);
    case 'total':
      return (r) => r.total;
    case 'number':
      return (r) => r.number;
  }
}

/**
 * Compare two values per the sign direction. Mirrors the logic in
 * `createSortState.sorted` but applied to the page-owned sort pipeline
 * (page-owned because `pi-table [localSort]=false` here and the page
 * reads the accessor function directly).
 */
function compareValues(
  av: unknown,
  bv: unknown,
  sign: 1 | -1,
): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * sign;
  }
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

/**
 * Counterparty ID extractor — accepts either a string ID (unpopulated)
 * or a populated Counterparty sub-document. Mirrors the dual-shape
 * pattern used by `Material.supplierId` in materials.page.ts.
 */
function counterpartyIdOf(row: Order): string {
  if (!row.counterpartyId) return '';
  if (typeof row.counterpartyId === 'string') return row.counterpartyId;
  return row.counterpartyId._id ?? '';
}

/**
 * Полная документация страницы: docs/pages/orders.page.md
 *
 * TZ-104.3 batch-1 commit 3/3 + TZ-104.4.2 — OrdersPage migrated to
 * `<app-pi-table>`, with TZ-104.4.2 dropping the `any`-escape
 * hatch that v4 needed.
 *
 * Architectural shift vs materials.page.ts (server-side pagination):
 *  - Backend GET /orders returns a FLAT `Order[]` (no
 *    `{items, total, page, limit}` envelope). The OrderService
 *    doesn't paginate/sort/filter yet; the page owns the pipeline.
 *  - CLIENT-SIDE sort + filter + slice pagination. `[total]` is the
 *    CURRENT filtered+sorted length (modulo search), and
 *    `paginatedRows` is the page slice of that.
 *  - Sort is page-owned via custom accessors (different keys have
 *    different natural sorts — `status` cycle index, `date`
 *    chronological, `total` numeric, `number` locale).
 *
 * TZ-104.4.2 page-loaded default sort: `[initialSortKey]="'date'"`
 * + `[initialSortDir]="'desc'"` so users see "newest orders first"
 * on first load (matching pre-migration UX). The page's internal
 * `sortKeySig/sortDirSig` are seeded to `'date'/'desc'` to match
 * pi-table's internal state after ngOnInit — both halves of the
 * lockstep cycle start in sync, so the round-2 mirror-event handler
 * stays correct from the very first click.
 *
 * BUG fixes vs the pre-migration source:
 *  1. `sortedRows` was previously bound via
 *     `sort.sorted(this.filteredRows(), fn)`. That captures
 *     `filteredRows()` ONCE at construction (a static snapshot) —
 *     the internal `computed` re-ran only on `sortKey/sortDir`
 *     changes, NOT on filter changes. The new impl binds as a
 *     reactive `computed` that reads both `filtered()` AND the
 *     sort signals so any change triggers re-compute.
 *  2. The pre-migration source had a page-level `searchQuery`
 *     signal AND `createClientSearchState`'s own internal
 *     `searchQuery`. Replaced with `createSearchState` + a single
 *     reactive filtered computed reading `debouncedSearch`.
 *
 *  Template-ref strategy (post-TZ-104.4.2):
 *   `@ViewChild({ static: true })` decorators with strong typing
 *   `TemplateRef<{ $implicit: Order }>` (NOT `any`). Pre-TZ-104.4.2
 *   we used `any` because pi-table's `[cellTemplates]` was typed
 *   `Record<string, TemplateRef<{ $implicit: unknown }>>` and
 *   TemplateRef invariance broke the binding. TZ-104.4.2 re-typed
 *   pi-table so the strict Order typing now flows through.
 *
 *  Standalone + OnPush + signal-based. No tests for the orders
 *  page yet (no `orders.page.spec.ts`); v1 acceptance is visual
 *  smoke + tsc.
 */
@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · заказы"
      title="Заказы"
      description="Заказы покупателей с привязкой к контрагенту и контракту. Бизнес-действия (отгрузка, резервирование) — в следующей итерации."
    />

    <app-pi-toolbar>
      <input
        id="orders-search"
        type="search"
        name="orders-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по номеру заказа…"
        aria-label="Поиск заказов"
        data-test="search-input"
        class="pi-input w-72"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
        <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
      </app-pi-button>
      <span hint>{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Заказы"
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
          [ariaLabel]="'Список заказов'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="false"
          [initialSortKey]="'date'"
          [initialSortDir]="'desc'"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
        >
          <!-- ───── Counterparty lookup cell ───── -->
          <ng-template #counterpartyTpl let-row>
            {{ counterpartyNameOf(row) ?? '—' }}
          </ng-template>

          <!-- ───── Row actions cluster ───── -->
          <ng-template #rowActionsTpl let-row>
            <app-pi-row-actions
              [row]="row"
              [documentLabel]="'Создать документ для заказа ' + row.number"
              [dataTestDocument]="'document-button-' + row._id"
              [editLabel]="'Редактировать заказ ' + row.number"
              [deleteLabel]="'Удалить заказ ' + row.number"
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
export class OrdersPage implements OnInit {
  private readonly service = inject(OrdersService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly RefreshIcon = RefreshCw;

  /** Exposed to template via `[pageSize]="pageSize"`. */
  protected readonly pageSize = PAGE_SIZE;

  /**
   * Page-owned sort signals. Seeded to `'date'`/`'desc'` to MATCH
   * pi-table's internal state after ngOnInit applies the
   * `[initialSortKey]="'date'"` + `[initialSortDir]="'desc'"`
   * bindings (TZ-104.4.2). Both halves of the lockstep cycle start
   * in sync — the round-2 mirror-event handler stays correct on
   * the very first click instead of needing a recovery cycle.
   *
   * Pre-TZ-104.4.2 init: `(null, 'asc')` to align with pi-table's
   * pre-extension internal defaults. After TZ-104.4.2, both sides
   * default to the page's chosen default.
   */
  private readonly sortKeySig = signal<SortKey | null>('date');
  private readonly sortDirSig = signal<'asc' | 'desc'>('desc');

  protected readonly sortKey = this.sortKeySig.asReadonly();
  protected readonly sortDir = this.sortDirSig.asReadonly();

  /** Current page (1-indexed). Bumped via `(pageChange)` from pi-table. */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  private readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );

  /** Single debounced search state — owns its own `searchQuery` signal. */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  protected readonly data = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /**
   * Client-side filter: reactive computed reading `data()` (the
   * signal) and `debouncedSearch()` (signal). Fixes the duplicate
   * `searchQuery` bug in the previous source.
   */
  protected readonly filteredRows = computed<Order[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter((o) => {
      const hay = [
        o.number,
        o.deliveryAddress,
        o.notes,
        this.counterpartiesLookup.byId()[counterpartyIdOf(o)]?.name,
        this.counterpartiesLookup.byId()[counterpartyIdOf(o)]?.shortName,
        this.counterpartiesLookup.byId()[counterpartyIdOf(o)]?.inn,
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
   * custom accessor per key (status cycle index, date
   * chronological, total numeric, number locale).
   */
  protected readonly sortedRows = computed<Order[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    // TZ-104.4.2: removed `as SortKey` cast — sortKeySig is now
    // typed `SortKey | null` so the cast is no longer needed.
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  /**
   * Total = full filtered+sorted length, NOT page slice. pi-table
   * derives `totalPages = ceil(total / pageSize)` from this and
   * shows the Prev/Next pager accordingly. When `total <= pageSize`,
   * the pager is hidden (`showPager = total > 0 && totalPages > 1`).
   */
  protected readonly total = computed<number>(() => this.sortedRows().length);

  /**
   * Page slice of the sorted+filtered list. Reads `page()` and
   * `sortedRows()` so any change re-computes the slice.
   *
   *   start = (page-1) * pageSize   (0-indexed start)
   *   end   = start + pageSize       (exclusive end)
   */
  protected readonly paginatedRows = computed<Order[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  /** Modal toolbar count: visible rows after filtering (not the page slice). */
  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет заказов. Нажмите «Создать», чтобы добавить первый.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * Column-set mirroring the pre-migration source's 7 visible columns
   * + the trailing actions slot (auto-injected by `[rowActions]`).
   * - `number` is sticky-left (acts as an ID column per tablet UX)
   * - `date` shows `formatDate(...)` and is `empty-cell` muted
   * - `counterpartyId` is a `cellTemplate` (lookup helper)
   * - `status` sorts via custom `STATUS_CYCLE_INDEX` accessor and
   *   falls through to `ORDER_STATUS_LABELS` format string
   * - `total` is numeric with `formatPrice` and right-aligned
   */
  protected readonly cols: ColumnDef<Order>[] = [
    {
      key: 'number',
      label: 'Номер',
      sortable: true,
      sticky: 'left',
    },
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => formatDate(r.date),
    },
    {
      key: 'counterpartyId',
      label: 'Контрагент',
      width: '180px',
    },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => ORDER_STATUS_LABELS[r.status] ?? r.status,
    },
    {
      key: 'priority',
      label: 'Приоритет',
      cellClass: 'empty-cell',
      format: (r) => (r.priority ? (PRIORITY_LABELS[r.priority] ?? r.priority) : '—'),
    },
    {
      key: 'items',
      label: 'Позиций',
      cellClass: 'text-muted-foreground',
      format: (r) => String(r.items?.length ?? 0),
    },
    {
      key: 'total',
      label: 'Сумма',
      sortable: true,
      numeric: true,
      align: 'right',
      width: '128px',
      format: (r) => (r.total == null ? '—' : formatPrice(r.total)),
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  // TZ-104.4.2: strong typing matches pi-table's re-parameterized
  // `[cellTemplates]` input. Pre-TZ-104.4.2 these were `TemplateRef<any>`.
  @ViewChild('counterpartyTpl', { static: true })
  private readonly counterpartyTplRef!: TemplateRef<{ $implicit: Order }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Order }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Order }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Order }> | null = null;

  ngOnInit(): void {
    this.counterpartiesLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());

    // Build cell-template map + row-actions binding AFTER static
    // ViewChild fields resolve. Avoids TemplateRef<C> invariance
    // trap and Angular's signal-binding name-collision.
    this.cellTemplates = { counterpartyId: this.counterpartyTplRef };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers ─────────────────────────────────────────
  /**
   * TZ-104.4.2: `row: Order` (was `unknown` + `as Order` cast).
   */
  protected counterpartyNameOf(row: Order): string | null {
    const id = counterpartyIdOf(row);
    if (!id) return null;
    return (
      this.counterpartiesLookup.byId()[id]?.shortName ??
      this.counterpartiesLookup.byId()[id]?.name ??
      null
    );
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['заказ', 'заказа', 'заказов']);
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset to first page when the filter set changes so users don't
    // land on an out-of-range page of a (possibly empty) filter set.
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
  }

  /**
   * Page-owned sort handler. `[localSort]="false"` keeps pi-table
   * from re-sorting the visible page slice, and this handler simply
   * MIRRORS pi-table's sortChange emit into the page's sort signals.
   *
   * Why mirror rather than re-derive? pi-table's internal sort
   * signals are private (no public API to set them externally).
   * The handler MUST advance the page's state to exactly match
   * pi-table's, otherwise the cycles phase-shift: pi-table starts
   * at `(null, null-dir)` while the page starts at `(null, 'asc')`,
   * which means an over-engineered "re-derive" handler would diverge
   * from pi-table on the very second click of a column. Mirroring
   * the event keeps them in lockstep regardless of starting state.
   *
   * pi-table's emit contract: `{key, dir: SortDirection}` where dir
   * ∈ {'asc' | 'desc' | null}. When `dir === null`, pi-table has
   * cleared its key (third click past desc). Page mirrors by
   * clearing its own sort key (sortKeySig → null) and falling back
   * sortDirSig to 'asc' as a no-visual-effect placeholder.
   */
  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    // pi-table's `sortChange` output type is `{ key: string, ... }`
    // — pi-table doesn't statically know about this page's `SortKey`
    // union, so a single boundary cast is required at the event
    // ingestion point. Once stored in `sortKeySig` (typed
    // `SortKey | null`), no further casts are needed downstream.
    this.sortKeySig.set(event.dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(event.dir === null ? 'asc' : event.dir);
    // Reset to first page on every sort change so users see the
    // first rows of the freshly ordered set.
    this.pageSig.set(1);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(OrderFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(order: Order): void {
    const ref = this.dialog.open(OrderFormDialogComponent, {
      data: order,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Order): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить заказ?',
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
          this.toast.success('Заказ удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected onCreateDocument(row: Order): void {
    this.router.navigate(['/doc-constructor/builder'], {
      queryParams: { source: 'order', sourceId: row._id },
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.counterpartiesLookup.load();
      this.listRes.reload();
    });
  }
}
