import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { Router } from '@angular/router';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { API_BASE_URL } from '../../../core/api.tokens';
import { createSearchState } from '../../../shared/util/search';
import { pluralize, formatDate, formatPrice } from '../../../shared/util/format';
import { createLookupTable } from '../../../shared/util/lookup-table';
import { ColumnDef, SortDirection, TableComponent } from '../../../shared/ui/pi-table.component';
import { Counterparty, CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import {
  Proposal,
  ProposalStatus,
  ProposalsService,
} from '../../../shared/services/pi-proposals.service';
import { ProposalFormDialogComponent } from './proposal-form-dialog.component';

type SortKey = 'number' | 'date' | 'total' | 'status';

/** Client-side pagination page size for /quotations flat-array endpoint. */
const PAGE_SIZE = 20;

const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлено',
  accepted: 'Принято',
  rejected: 'Отклонено',
  converted: 'Преобразовано',
  cancelled: 'Отменено',
};

/** Status cycle for sort: draft → sent → accepted → rejected → converted → cancelled. */
const STATUS_CYCLE_INDEX: Record<ProposalStatus, number> = {
  draft: 0,
  sent: 1,
  accepted: 2,
  rejected: 3,
  converted: 4,
  cancelled: 5,
};

/** Tailwind classes per status for the badge cell. */
const STATUS_BADGE_CLASS: Record<ProposalStatus, string> = {
  draft: 'bg-paper-2 text-muted-foreground',
  sent: 'bg-sunrise-warm/20 text-sunrise-warm',
  accepted: 'bg-pine/15 text-pine',
  rejected: 'bg-destructive/10 text-destructive',
  converted: 'bg-iris/15 text-iris',
  cancelled: 'bg-paper-2 text-muted-foreground',
};

function accessorFor(key: SortKey): (row: Proposal) => unknown {
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

function compareValues(av: unknown, bv: unknown, sign: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * sign;
  }
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

/** Counterparty ID extractor — dual-shape (string id vs populated sub-doc). */
function counterpartyIdOf(row: Proposal): string {
  if (!row.counterpartyId) return '';
  if (typeof row.counterpartyId === 'string') return row.counterpartyId;
  return row.counterpartyId._id ?? '';
}

/**
 * ProposalsPage — КП (Коммерческие Предложения), thin UI (TZ-SALES-301).
 *
 * Wraps the EXISTING QuotationService backend (single API — no duplicate
 * proposal module). GET /quotations returns a FLAT Quotation[]; the page
 * owns search/sort/slice pagination (same pipeline as OrdersPage).
 *
 * IMMUTABILITY: item rows display the inline productName/productSku snapshot
 * stored at creation — never a $lookup on the live Product.
 *
 * «В заказ» (convert-to-order) lands in TZ-ORDERS-301 and is enabled only
 * for accepted proposals.
 */
@Component({
  selector: 'app-proposals-page',
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
      eyebrow="раздел · сделки"
      title="КП"
      description="Коммерческие предложения покупателям. Цены и состав фиксируются на момент создания — изменения каталога не влияют на выданные КП."
    />

    <app-pi-toolbar>
      <input
        id="proposals-search"
        type="search"
        name="proposals-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по номеру или названию…"
        aria-label="Поиск КП"
        data-test="search-input"
        class="pi-input w-72"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
        <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
      </app-pi-button>
      <span hint>{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Список КП" hint="сортировка · клик по заголовку" eyebrow="I">
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
          [ariaLabel]="'Список КП'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="false"
          [initialSortKey]="'date'"
          [initialSortDir]="'desc'"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
        >
          <ng-template #counterpartyTpl let-row>
            {{ counterpartyNameOf(row) ?? '—' }}
          </ng-template>

          <ng-template #statusTpl let-row>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              [class]="statusBadgeClass(row.status)"
            >
              {{ statusLabel(row.status) }}
            </span>
          </ng-template>

          <!-- TZ-ORDERS-301: convert accepted КП → Заказ. Enabled ONLY for
               accepted proposals (backend enforces the same guard). -->
          <ng-template #convertTpl let-row>
            <button
              type="button"
              class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring
                     disabled:opacity-30 disabled:cursor-not-allowed"
              [disabled]="!canConvertToOrder(row)"
              [attr.aria-label]="canConvertToOrder(row)
                ? 'Преобразовать КП ' + row.number + ' в заказ'
                : 'Только принятые КП можно преобразовать в заказ'"
              [attr.data-test]="'convert-button-' + row._id"
              (click)="onConvertToOrder(row)"
            >
              В заказ
            </button>
          </ng-template>

          <ng-template #rowActionsTpl let-row>
            <app-pi-row-actions
              [row]="row"
              [documentLabel]="'Создать документ для КП ' + row.number"
              [dataTestDocument]="'document-button-' + row._id"
              [editLabel]="'Редактировать КП ' + row.number"
              [deleteLabel]="'Удалить КП ' + row.number"
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
export class ProposalsPage implements OnInit {
  constructor() {
    this.counterpartiesLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());
  }
  private readonly service = inject(ProposalsService);
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

  protected readonly listRes = httpResource<Proposal[]>(() => ({
    url: `${this.baseUrl}/quotations`,
  }));

  protected readonly data = computed<Proposal[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      | import('@angular/common/http').HttpErrorResponse
      | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly filteredRows = computed<Proposal[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter((p) => {
      const hay = [
        p.number,
        p.title,
        p.notes,
        this.counterpartiesLookup.byId()[counterpartyIdOf(p)]?.name,
        this.counterpartiesLookup.byId()[counterpartyIdOf(p)]?.shortName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  protected readonly sortedRows = computed<Proposal[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  protected readonly total = computed<number>(() => this.sortedRows().length);

  protected readonly paginatedRows = computed<Proposal[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  /** Modal toolbar count: visible rows after filtering (not the page slice). */
  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет КП. Нажмите «Создать», чтобы добавить первое.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  protected readonly cols: ColumnDef<Proposal>[] = [
    { key: 'number', label: 'Номер', sortable: true, sticky: 'left' },
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => formatDate(r.date),
    },
    { key: 'counterpartyId', label: 'Контрагент', width: '180px' },
    { key: 'status', label: 'Статус', sortable: true, cellClass: 'empty-cell' },
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
    {
      // TZ-ORDERS-301: «В заказ» button cell. Uses the real convertedOrderId
      // field as the column key (ColumnDef.key is `keyof Proposal`); the cell
      // template renders the action button, not the raw value.
      key: 'convertedOrderId',
      label: '',
      width: '88px',
      cellClass: 'text-right',
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  @ViewChild('counterpartyTpl', { static: true })
  private readonly counterpartyTplRef!: TemplateRef<{ $implicit: Proposal }>;
  @ViewChild('statusTpl', { static: true })
  private readonly statusTplRef!: TemplateRef<{ $implicit: Proposal }>;
  @ViewChild('convertTpl', { static: true })
  private readonly convertTplRef!: TemplateRef<{ $implicit: Proposal }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Proposal }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Proposal }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Proposal }> | null = null;

  ngOnInit(): void {
    this.cellTemplates = {
      counterpartyId: this.counterpartyTplRef,
      status: this.statusTplRef,
      convertedOrderId: this.convertTplRef,
    };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers ─────────────────────────────────────────
  protected counterpartyNameOf(row: Proposal): string | null {
    const id = counterpartyIdOf(row);
    if (!id) return null;
    return (
      this.counterpartiesLookup.byId()[id]?.shortName ??
      this.counterpartiesLookup.byId()[id]?.name ??
      null
    );
  }

  protected statusLabel(status: ProposalStatus): string {
    return PROPOSAL_STATUS_LABELS[status] ?? status;
  }

  protected statusBadgeClass(status: ProposalStatus): string {
    return STATUS_BADGE_CLASS[status] ?? 'bg-paper-2 text-muted-foreground';
  }

  // ─── TZ-ORDERS-301: КП → Заказ ────────────────────────────────────
  /** Only ACCEPTED proposals may be converted (backend enforces the same). */
  protected canConvertToOrder(row: Proposal): boolean {
    return row.status === 'accepted';
  }

  /**
   * Confirm + convert. Backend strip-commerce copies FK + inline snapshot
   * (no price), creates the order as draft and marks the КП converted.
   */
  protected onConvertToOrder(row: Proposal): void {
    if (!this.canConvertToOrder(row)) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Преобразовать в заказ?',
        description:
          `Создать заказ из «${row.number}»? Позиции перейдут без цен ` +
          `(strip-commerce), КП станет «Преобразовано».`,
        confirmLabel: 'В заказ',
        variant: 'default',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.service.convertToOrder(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success(`Заказ ${res.data?.orderId ?? ''} создан из КП`);
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['КП', 'КП', 'КП']);
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
  }

  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    this.sortKeySig.set(event.dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(event.dir === null ? 'asc' : event.dir);
    this.pageSig.set(1);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ProposalFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(proposal: Proposal): void {
    const ref = this.dialog.open(ProposalFormDialogComponent, {
      data: proposal,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Proposal): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить КП?',
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
          this.toast.success('КП удалено');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected onCreateDocument(row: Proposal): void {
    this.router.navigate(['/doc-constructor/builder'], {
      queryParams: { source: 'quotation', sourceId: row._id },
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
