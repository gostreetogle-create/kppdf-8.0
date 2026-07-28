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
  untracked,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
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
import { API_BASE_URL } from '../../core/api.tokens';
import { pluralize, formatPrice, formatDate } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import {
  PiEntityListComponent,
  SortChangeEvent,
  DefaultListParams,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import {
  EntityService,
  PaginatedResponse,
} from '../../shared/dsl/entity/entity-service';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Order, OrdersService } from './orders.service';
import { OrderFormDialogComponent } from './order-form-dialog.component';

const PAGE_SIZE = 20;

type SortKey = 'number' | 'date' | 'total' | 'status';

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
 * Pipeline order for sales-manager-friendly sort (Draft → Cancelled).
 * Alphabetical sort would yield
 * `cancelled < confirmed < delivered < draft` — meaningless to a
 * sales manager reading the pipeline. Numeric indices restore the
 * natural progression; unrecognised statuses fall through to `99`.
 */
const ORDER_STATUS_PIPELINE: Record<Order['status'], number> = {
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
 * View-model row: `Order` enriched with a single
 * `$counterpartyName` field so cell templates don't re-query the
 * lookup map on every CD cycle.
 */
interface OrderView extends Order {
  $counterpartyName: string;
}

/** Counterparty ID extractor — accepts either a string or populated object. */
function counterpartyIdOf(row: Order): string {
  if (!row.counterpartyId) return '';
  if (typeof row.counterpartyId === 'string') return row.counterpartyId;
  return row.counterpartyId._id ?? '';
}

function accessorFor(key: SortKey): (row: OrderView) => string | number | null {
  switch (key) {
    case 'status':
      return (r) => ORDER_STATUS_PIPELINE[r.status] ?? 99;
    case 'date':
      return (r) => (r.date ? Date.parse(r.date) : null);
    case 'total':
      return (r) => r.total ?? null;
    case 'number':
      return (r) => r.number ?? '';
  }
}

function compareValues(
  av: string | number | null,
  bv: string | number | null,
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
 * Pure helpers — kept outside the component so they're easy to
 * unit-test in isolation if / when we extract per-page test suites.
 */
function filterAndMap(
  rows: Order[],
  query: string,
  lookup: Record<string, Counterparty | undefined>,
): OrderView[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((o) => {
        const cp = lookup[counterpartyIdOf(o)];
        const hay = [
          o.number,
          o.deliveryAddress,
          o.notes,
          cp?.name,
          cp?.shortName,
          cp?.inn,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
    : rows;
  return filtered.map<OrderView>((o) => {
    const id = counterpartyIdOf(o);
    const cp = id ? lookup[id] : undefined;
    return {
      ...o,
      $counterpartyName: cp?.shortName ?? cp?.name ?? '',
    };
  });
}

function sortRows(rows: OrderView[], key: SortKey | null, dir: 'asc' | 'desc' | null): OrderView[] {
  if (!key) return rows;
  const sign = dir === 'asc' ? 1 : -1;
  const accessor = accessorFor(key);
  return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
}

/**
 * TZ-232.D sentinel #3 — OrdersPage migrated to `<pi-entity-list>`.
 *
 * Backend `/orders` returns a FLAT ARRAY (no `{items, total, ...}`
 * envelope yet — TZ-104.3 batch-2-B-flat pattern). Page owns
 * client-side filter+sort+paginate via page-local signals and a
 * synthetic `localAdapter` that emits the envelope shape the
 * wrapper expects synchronously.
 *
 * Architecture:
 *  - `httpResource<Order[]>` for the one-shot flat-array fetch.
 *  - `localAdapter.list(params)` is SYNCHRONOUS — wraps pure
 *    `filterAndMap` / `sortRows` helpers + page-slice arithmetic in
 *    an `of({ok, data})` Observable. Triggered by the wrapper's
 *    fetch pipeline on search / page change. NO HTTP traffic.
 *  - `[localSort]="true"` — pi-table renders the visible page slice
 *    after our `sortRows` has applied the custom accessors.
 *  - Search: wrapper debounces input → `params.search` →
 *    `localAdapter.list` reads directly (no page-side mirror).
 *  - Sort signals: `sortKeySig/sortDirSig` mirror pi-table's emits
 *    via `onSortChange`.
 *
 * v6 race-fix: system-wide effect watches `listRes.value()` and
 * re-emits the wrapper envelope whenever the HTTP resource updates
 * (initial fetch, post-CRUD refetch, external reload). This
 * eliminates the race between `listRes.reload()` (HTTP macrotask)
 * and the wrapper's synchronous envelope emission — pre-migration
 * the bug was masked by direct `httpResource→computed` binding.
 *
 * `firstRun` guard prevents the effect from competing with the
 * wrapper's own ngOnInit-driven initial fetch (saves one redundant
 * round-trip). `untracked()` clarifies that `listRef()?.reload()`
 * is an imperative command — not a dependency — so no infinite
 * loop is possible.
 */
@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiRowActionsComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · заказы"
      title="Заказы"
      description="Заказы покупателей с привязкой к контрагенту и контракту. Бизнес-действия (отгрузка, резервирование) — в следующей итерации."
    />

    <app-pi-entity-list
      #list
      [service]="localAdapter"
      [cols]="cols"
      ariaLabel="Список заказов"
      [pageSize]="PAGE_SIZE"
      searchPlaceholder="Поиск по номеру, КА, адресу…"
      [localSort]="true"
      [initialSortKey]="'date'"
      [initialSortDir]="'desc'"
      emptyMessage="Нет заказов. Нажмите «Создать», чтобы добавить первый."
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTplBinding()"
      (create)="openCreate()"
      (rowEdit)="openEdit($event)"
      (rowDelete)="onDelete($event)"
      (sortChange)="onSortChange($event)"
    >
      <!-- ───── Counterparty lookup cell ───── -->
      <ng-template #counterpartyTpl let-row>
        {{ row.$counterpartyName || '—' }}
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

      <!-- ───── Page-level count hint ───── -->
      <span
        hint
        toolbarExtras
        class="text-xs text-muted-foreground"
        data-test="orders-count"
      >
        {{ listTotal() }} {{ totalLabel(listTotal()) }}
      </span>
    </app-pi-entity-list>
  `,
})
export class OrdersPage {
  private readonly service = inject(OrdersService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  // ─── Sort signals (page-owned; mirror pi-table emit) ────────────────
  protected readonly sortKeySig = signal<SortKey | null>('date');
  protected readonly sortDirSig = signal<'asc' | 'desc' | null>('desc');

  /** Wrapper ref — used for count hint + post-dialog reload. */
  private readonly listRef = viewChild<
    PiEntityListComponent<OrderView, DefaultListParams>
  >('list');

  protected readonly listTotal = computed<number>(() => this.listRef()?.total() ?? 0);

  // ─── Template refs (viewChild signal) ───────────────────────────────
  private readonly counterpartyTplRef = viewChild<
    TemplateRef<{ $implicit: OrderView }>
  >('counterpartyTpl');
  private readonly rowActionsTplRef = viewChild<
    TemplateRef<{ $implicit: OrderView }>
  >('rowActionsTpl');

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: OrderView }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: OrderView }>> = {};
    const tpl = this.counterpartyTplRef();
    if (tpl) {
      result['counterpartyId'] = tpl;
    }
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: OrderView }> | null
  >(() => this.rowActionsTplRef() ?? null);

  // ─── HTTP source (flat array) ──────────────────────────────────────
  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  protected readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );

  /**
   * Local EntityService adapter. Synchronously synthesizes the
   * `{items, total, page, limit}` envelope from in-memory flat-
   * array state. Re-runs every time the wrapper fires its
   * fetch pipeline (initial mount, search-debounce, page change).
   * No HTTP traffic — all work happens in pure helpers.
   */
  protected readonly localAdapter: EntityService<OrderView, DefaultListParams> = {
    list: (params: DefaultListParams) => {
      const all = this.listRes.value() ?? [];
      const viewRows = filterAndMap(
        all,
        params.search ?? '',
        this.counterpartiesLookup.byId(),
      );
      const sorted = sortRows(viewRows, this.sortKeySig(), this.sortDirSig());
      const page = params.page ?? 1;
      const limit = params.limit ?? PAGE_SIZE;
      const total = sorted.length;
      const start = (page - 1) * limit;
      const items = sorted.slice(start, start + limit);
      const data: PaginatedResponse<OrderView> = { items, total, page, limit };
      return of({ ok: true, data }) as unknown as ReturnType<
        EntityService<OrderView, DefaultListParams>['list']
      >;
    },
    findById: (id: string) =>
      this.service.findById(id) as unknown as ReturnType<
        EntityService<OrderView, DefaultListParams>['findById']
      >,
    create: (payload: Partial<OrderView>) =>
      this.service.create(payload as unknown as Partial<Order>) as unknown as ReturnType<
        EntityService<OrderView, DefaultListParams>['create']
      >,
    update: (id: string, payload: Partial<OrderView>) =>
      this.service.update(
        id,
        payload as unknown as Partial<Order>,
      ) as unknown as ReturnType<
        EntityService<OrderView, DefaultListParams>['update']
      >,
    remove: (id: string) =>
      this.service.remove(id) as unknown as ReturnType<
        EntityService<OrderView, DefaultListParams>['remove']
      >,
  };

  constructor() {
    this.counterpartiesLookup.load();

    /**
     * System-wide reactivity: synchronize `listRes.value()` updates
     * with the wrapper's display state. Triggers on initial HTTP
     * fetch completion, post-CRUD refetch, external reload — any
     * time the flat-array source changes.
     *
     * `firstRun` guard skips the initial effect run (the wrapper's
     * own ngOnInit already drives the first fetch + emission).
     *
     * `untracked()` around `listRef()?.reload()` clarifies the
     * architectural intent: it's an imperative command issued FROM
     * the effect, not a dependency READ. No infinite loop is
     * possible because signal-tracking only counts reads inside
     * the effect's synchronous execution context — the wrapper's
     * eventual `localAdapter.list()` call reads `listRes.value()`
     * asynchronously (after `reload()` pushes to its RxJS Subject)
     * and is NOT tracked.
     */
    let firstRun = true;
    effect(() => {
      this.listRes.value(); // dependency: HTTP completion
      if (firstRun) {
        firstRun = false;
        return;
      }
      untracked(() => this.listRef()?.reload());
    });
  }

  // ─── Column definitions ────────────────────────────────────────────
  protected readonly cols: ColumnDef<OrderView>[] = [
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
      format: (r) => formatDate(r.date) || '—',
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

  // ─── Helpers ───────────────────────────────────────────────────────
  protected totalLabel(n: number): string {
    return pluralize(n, ['заказ', 'заказа', 'заказов']);
  }

  // ─── Event handlers ────────────────────────────────────────────────
  /** Mirror pi-table's `(sortChange)` into page-owned sort signals. */
  protected onSortChange(event: SortChangeEvent): void {
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : (dir as 'asc' | 'desc'));
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
          // Re-fetch the HTTP source. The system-wide effect in the
          // constructor detects the `listRes.value()` change after
          // HTTP completes and triggers the wrapper to re-emit the
          // envelope — no manual `listRef()?.reload()` here.
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

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      // No CRUD happened here — the user's dialog action (if any)
      // triggered its own `listRes.reload()` already. We only force
      // the counterparty lookup to refresh (in case the dialog
      // edited a KA name) and let the system-wide effect handle
      // the wrapper envelope re-emission when `listRes.value()`
      // changes from the CRUD hook.
      this.counterpartiesLookup.load();
    });
  }
}
