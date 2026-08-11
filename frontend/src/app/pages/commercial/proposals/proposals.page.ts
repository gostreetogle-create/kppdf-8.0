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
import { OrganizationsService, Organization } from '../../../shared/services/organizations.service';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../deals-group-chips';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { API_BASE_URL } from '../../../core/api.tokens';
import { createSearchState } from '../../../shared/util/search';
import { pluralize, formatDate, formatPrice } from '../../../shared/util/format';
import { createLookupTable } from '../../../shared/util/lookup-table';
import { ColumnDef, SortDirection, TableComponent } from '../../../shared/ui/pi-table.component';
import {
  Counterparty,
  CounterpartyService,
} from '../../../shared/services/pi-counterparty.service';
import {
  Proposal,
  ProposalFamilyMemberSummary,
  ProposalFamilyResponse,
  ProposalStatus,
  ProposalVersionSummary,
  ProposalsService,
  estimateFamilyTotal,
} from '../../../shared/services/pi-proposals.service';
import { ProposalFamilyAttachDialogComponent } from './proposal-family-attach-dialog.component';
import { ProposalVariantDialogComponent } from './proposal-variant-dialog.component';

type SortKey = 'number' | 'date' | 'total' | 'status';

/** Client-side pagination page size for /quotations flat-array endpoint. */
const PAGE_SIZE = 10;

const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлено',
  accepted: 'Принято',
  rejected: 'Отклонено',
  converted: 'В заказе',
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
  sent: 'bg-sunrise-warm/20 text-gold-deep',
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
    PiGroupWorkspaceComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace
      [toc]="dealsToc"
      tocActiveId="proposals"
      [chips]="kpSectionChips"
      activeId="all"
    >
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
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
        <span class="flex-1"></span>
        <span class="text-xs text-muted-foreground"
          >{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span
        >
      </div>

      <div class="pi-table-surface hairline rounded-sm overflow-hidden">
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
            [emptyTemplate]="emptyTemplate"
            [ariaLabel]="'Список КП'"
            [cellTemplates]="cellTemplates"
            [rowActions]="rowActionsTplBinding"
            [localSort]="false"
            [initialSortKey]="'date'"
            [initialSortDir]="'desc'"
            (pageChange)="onPageChange($event)"
            (sortChange)="onSortChange($event)"
          >
            <ng-template #emptyTpl>
              <div
                class="max-w-sm mx-auto p-6 pi-dashed-panel flex flex-col items-center gap-3"
                data-test="proposals-empty"
              >
                @if (searchQuery()) {
                  <span class="text-sm">По вашему запросу КП не найдено.</span>
                } @else {
                  <span class="text-sm">В журнале пока нет КП.</span>
                  <span class="text-xs text-muted-foreground"
                    >Создайте первое коммерческое предложение.</span
                  >
                  <app-pi-button
                    variant="default"
                    data-test="empty-create-button"
                    (click)="openCreate()"
                  >
                    Создать КП
                  </app-pi-button>
                }
              </div>
            </ng-template>

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
                [attr.aria-label]="
                  canConvertToOrder(row)
                    ? 'Преобразовать КП ' + row.number + ' в заказ'
                    : 'Только принятые КП можно преобразовать в заказ'
                "
                [attr.data-test]="'convert-button-' + row._id"
                (click)="onConvertToOrder(row)"
              >
                В заказ
              </button>
            </ng-template>

            <ng-template #versionsTpl let-row>
              <div class="flex flex-col items-end gap-1">
                <button
                  type="button"
                  class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                  [attr.data-test]="'freeze-button-' + row._id"
                  [attr.aria-label]="'Зафиксировать версию КП ' + row.number"
                  (click)="onFreeze(row)"
                >
                  {{ (row.currentVersion ?? 0) > 0 ? 'Ещё версия' : 'Зафиксировать' }}
                </button>
                @if ((row.currentVersion ?? 0) > 0) {
                  <button
                    type="button"
                    class="text-[10px] underline underline-offset-2 text-muted-foreground pi-focus-ring"
                    [attr.data-test]="'versions-button-' + row._id"
                    (click)="toggleVersions(row)"
                  >
                    {{
                      expandedVersionsId() === row._id
                        ? 'Скрыть версии'
                        : 'История (' + row.currentVersion + ')'
                    }}
                  </button>
                }
                @if (expandedVersionsId() === row._id) {
                  <div class="text-right space-y-0.5" data-test="version-list">
                    @for (version of versionsFor(row._id); track version.version) {
                      <span class="block text-[10px] font-mono text-muted-foreground">
                        v{{ version.version }} · {{ formatVersionDate(version.frozenAt) }}
                      </span>
                    }
                  </div>
                }
              </div>
            </ng-template>

            <ng-template #familyTpl let-row>
              <div
                class="flex flex-col items-end gap-1"
                [attr.data-test]="'family-cell-' + row._id"
              >
                <button
                  type="button"
                  class="text-[10px] underline underline-offset-2 text-muted-foreground pi-focus-ring"
                  [attr.data-test]="'family-button-' + row._id"
                  (click)="toggleFamily(row)"
                >
                  {{ expandedFamilyId() === row._id ? 'Скрыть семью' : familyToggleLabel(row) }}
                </button>
                @if (expandedFamilyId() === row._id) {
                  <div class="text-right space-y-1 max-w-[14rem]" data-test="family-list">
                    @for (member of familyVariantsFor(row._id); track member.id) {
                      <button
                        type="button"
                        class="block w-full text-left text-[10px] pi-focus-ring underline underline-offset-2"
                        [attr.data-test]="'family-variant-' + member.id"
                        (click)="openVariantView(member)"
                      >
                        {{ orgNameOf(member.organizationId) }}
                        ·
                        {{ member.orgMarkupPercent ?? 0 }}% · оценка
                        {{ formatEstimate(row.total ?? 0, member.orgMarkupPercent) }}
                      </button>
                    }
                    @if (familyVariantsFor(row._id).length === 0) {
                      <span class="block text-[10px] text-muted-foreground"
                        >Нет вариантов фирм</span
                      >
                    }
                    <div class="flex flex-wrap justify-end gap-1 pt-0.5">
                      <button
                        type="button"
                        class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                        [attr.data-test]="'family-attach-' + row._id"
                        (click)="openFamilyAttach(row)"
                      >
                        Несколько фирм
                      </button>
                      @if ((row.familyRole ?? 'solo') === 'master') {
                        <button
                          type="button"
                          class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                          [attr.data-test]="'family-sync-' + row._id"
                          (click)="onFamilySync(row)"
                        >
                          Синхронизировать
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
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
              <button
                type="button"
                class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                [attr.data-test]="'pdf-button-' + row._id"
                [attr.aria-label]="'Скачать PDF КП ' + row.number"
                (click)="onDownloadPdf(row)"
              >
                PDF
              </button>
              <button
                type="button"
                class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                [attr.data-test]="'print-button-' + row._id"
                [attr.aria-label]="'Печать КП ' + row.number"
                (click)="onPrint(row)"
              >
                Печать
              </button>
              <button
                type="button"
                class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                [attr.data-test]="'copy-button-' + row._id"
                [attr.aria-label]="'Копировать КП ' + row.number"
                (click)="onCopy(row)"
              >
                Копировать
              </button>
            </ng-template>
          </app-pi-table>
        </div>
      </div>
    </app-pi-group-workspace>
  `,
})
export class ProposalsPage implements OnInit {
  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly kpSectionChips = KP_SECTION_CHIPS;

  constructor() {
    this.counterpartiesLookup.load();
    this.organizationsLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());
  }
  private readonly service = inject(ProposalsService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly organizationsService = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly expandedVersionsId = signal<string | null>(null);
  protected readonly expandedFamilyId = signal<string | null>(null);
  private readonly versionsByProposal = signal<Record<string, ProposalVersionSummary[]>>({});
  private readonly familyByProposal = signal<Record<string, ProposalFamilyResponse>>({});

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
  private readonly organizationsLookup = createLookupTable<Organization>(
    this.organizationsService.list({ limit: 200 }),
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
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly filteredRows = computed<Proposal[]>(() => {
    const rows = this.data().filter((p) => (p.familyRole ?? 'solo') !== 'variant');
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
    this.searchQuery() ? 'Ничего не найдено.' : 'Нет КП. Нажмите «Создать», чтобы добавить первое.',
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
    {
      key: 'currentVersion',
      label: 'Версии',
      width: '150px',
      cellClass: 'text-right',
    },
    {
      key: 'familyRole',
      label: 'Семья',
      width: '168px',
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
  @ViewChild('versionsTpl', { static: true })
  private readonly versionsTplRef!: TemplateRef<{ $implicit: Proposal }>;
  @ViewChild('familyTpl', { static: true })
  private readonly familyTplRef!: TemplateRef<{ $implicit: Proposal }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Proposal }>;
  @ViewChild('emptyTpl', { static: true })
  private readonly emptyTplRef!: TemplateRef<unknown>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Proposal }>> = {};
  /** Custom RU empty state with an explicit path to the Create studio. */
  protected emptyTemplate!: TemplateRef<unknown>;
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Proposal }> | null = null;

  ngOnInit(): void {
    this.emptyTemplate = this.emptyTplRef;
    this.cellTemplates = {
      counterpartyId: this.counterpartyTplRef,
      status: this.statusTplRef,
      convertedOrderId: this.convertTplRef,
      familyRole: this.familyTplRef,
      currentVersion: this.versionsTplRef,
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
    return PROPOSAL_STATUS_LABELS[status] ?? 'Неизвестный статус';
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

  protected onFreeze(row: Proposal): void {
    this.service.freeze(row._id).subscribe((res) => {
      if (res.ok) {
        this.toast.success(`Версия КП ${row.number} зафиксирована`);
        this.loadVersions(row._id);
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected toggleVersions(row: Proposal): void {
    if (this.expandedVersionsId() === row._id) {
      this.expandedVersionsId.set(null);
      return;
    }
    this.expandedVersionsId.set(row._id);
    this.loadVersions(row._id);
  }

  protected versionsFor(id: string): ProposalVersionSummary[] {
    return this.versionsByProposal()[id] ?? [];
  }

  protected formatVersionDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU');
  }

  private loadVersions(id: string): void {
    this.service.listVersions(id).subscribe((res) => {
      if (res.ok) {
        this.versionsByProposal.update((all) => ({ ...all, [id]: res.data }));
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected familyToggleLabel(row: Proposal): string {
    const role = row.familyRole ?? 'solo';
    if (role === 'master') return 'Семья';
    return 'Семья';
  }

  protected toggleFamily(row: Proposal): void {
    if (this.expandedFamilyId() === row._id) {
      this.expandedFamilyId.set(null);
      return;
    }
    this.expandedFamilyId.set(row._id);
    this.loadFamily(row._id);
  }

  protected familyVariantsFor(id: string) {
    return this.familyByProposal()[id]?.variants ?? [];
  }

  protected orgNameOf(organizationId: string): string {
    return this.organizationsLookup.byId()[organizationId]?.name ?? organizationId;
  }

  protected formatEstimate(baseTotal: number, markup?: number): string {
    return formatPrice(estimateFamilyTotal(baseTotal, markup));
  }

  protected openFamilyAttach(row: Proposal): void {
    const ref = this.dialog.open(ProposalFamilyAttachDialogComponent, {
      data: { master: row },
      width: 'md',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (result: unknown) => {
      if (!result) return;
      this.loadFamily(row._id);
      this.listRes.reload();
    });
  }

  protected onFamilySync(row: Proposal): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Синхронизировать семью?',
        description: `Перезаписать строки и familyVersion всех вариантов из master «${row.number}»?`,
        confirmLabel: 'Синхронизировать',
        variant: 'default',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.service.syncFromMaster(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Семья синхронизирована с master');
          this.familyByProposal.update((all) => ({ ...all, [row._id]: res.data }));
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected openVariantView(member: ProposalFamilyMemberSummary): void {
    this.dialog.open(ProposalVariantDialogComponent, {
      data: {
        member,
        organizationName: this.orgNameOf(member.organizationId),
      },
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
  }

  private loadFamily(id: string): void {
    this.service.getFamily(id).subscribe((res) => {
      if (res.ok) {
        this.familyByProposal.update((all) => ({ ...all, [id]: res.data }));
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
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
    void this.router.navigate(['/proposals/create'], { queryParams: { new: '1' } });
  }

  protected openEdit(proposal: Proposal): void {
    void this.router.navigate(['/proposals/create'], {
      queryParams: { id: proposal._id },
    });
  }

  protected onDownloadPdf(row: Proposal): void {
    this.service.downloadPdf(row._id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `КП-${row.number}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.toast.success('PDF подготовлен');
      },
      error: () => this.toast.error('Сервис печати недоступен, используйте Печать в браузере.'),
    });
  }

  protected onPrint(row: Proposal): void {
    void this.router.navigate(['/proposals/create'], {
      queryParams: { id: row._id, action: 'print' },
    });
  }

  protected onCopy(row: Proposal): void {
    this.service.duplicate(row._id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      this.toast.success(`Создана копия ${res.data.number}`);
      void this.router.navigate(['/proposals/create'], {
        queryParams: { id: res.data._id },
      });
    });
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
          if (typeof localStorage !== 'undefined') {
            if (localStorage.getItem('kp.create.lastDraftId') === row._id) {
              localStorage.removeItem('kp.create.lastDraftId');
              localStorage.removeItem('kp.create.lastTemplateId');
            }
          }
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected onCreateDocument(row: Proposal): void {
    this.router.navigate(['/doc-constructor/templates'], {
      queryParams: { source: 'quotation', sourceId: row._id },
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }
}
