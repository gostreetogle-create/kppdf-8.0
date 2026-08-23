import { DestroyRef, Injector, Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { extractErrorMessage, type SilentResult } from '../../../../core/silent-http';
import { PiDialogService } from '../../../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../../../shared/util/on-dialog-close-once';
import { PiToastService } from '../../../../shared/ui/toast';
import { OrdersService, type Order } from '../../../../shared/services/orders.service';
import { ProductsService, type Product } from '../../../../shared/services/products.service';
import {
  ProductModulesService,
  type ProductModule,
} from '../../../../shared/services/pi-product-modules.service';
import { MaterialsService, type Material } from '../../../../shared/services/materials.service';
import {
  DocumentTemplatesService,
  type BuildPreviewLine,
  type BuildSheetLayout,
  type BuildTableLayoutColumn,
  type DocumentTemplate,
} from '../../../../shared/services/pi-document-templates.service';
import {
  TableTemplatesService,
  type TableTemplate,
} from '../../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../../shared/services/pi-template-blocks.service';
import { ProposalsService, type Proposal } from '../../../../shared/services/pi-proposals.service';
import { GeneratedDocumentsService } from '../../../../shared/services/pi-generated-documents.service';
import { OrganizationsService } from '../../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../../shared/services/pi-counterparty.service';
import type { TemplateBlock } from '../../../../shared/template-block/template-block.types';
import type {
  ProposalCreateInspectorState,
  ProposalCreateStatus,
  ProposalTableChrome,
  ProposalTableLayoutColumn,
  ProposalTableTarget,
} from '../proposal-create-inspector.component';
import type { KpTemplatePreviewStatus } from '../proposal-create-template-center.component';
import type { ProposalRecipientState } from '../proposal-create-recipient.component';
import {
  isPhotoColumnKey,
  normalizeTableLayoutColumnKey,
  normalizeTableLayoutColumns,
  tableLayoutColumnAliases,
} from '../proposal-table-layout.util';
import type { CatalogDirtyField, ProposalDraftLine } from '../proposal-product-rail.component';
import type { ProposalTerm } from '../proposal-create-terms.component';
import type {
  ProposalCompositionLineChange,
  ProposalRowAction,
} from '../proposal-create-table-editor.component';
import { ProductFormDialogComponent } from '../../../products/product-form-dialog.component';
import { ModuleFormDialogComponent } from '../../../modules/module-form-dialog.component';
import { MaterialFormDialogComponent } from '../../../materials/material-form-dialog.component';
import {
  TableTemplateFormDialogComponent,
  type TableTemplateDialogConfig,
} from '../../../doc-constructor/tables/table-template-dialog.component';
import { buildKpPdfFilename } from '../kp-pdf-filename';

export interface ProposalWorkspaceDraftInit {
  id?: string | null;
  new?: boolean;
  source?: string | null;
  sourceId?: string | null;
  /** TZ-KP-WS-408 — ?action=print: print once when the first preview is ready. */
  print?: boolean;
}

/** Same defaults as proposal-create.page.ts (single layout canon). */
const DEFAULT_KP_SHEET_LAYOUT = {
  rowsFirstPage: 0,
  rowsNextPage: 0,
  photoScalePercent: 100,
  photoCropYPercent: 0,
  showPhotoColumn: true,
  tableFontSize: 12,
  tableHeaderFontSize: 12,
};

const DEFAULT_KP_TABLE_LAYOUT = [
  { key: 'index', label: '№', visible: true },
  { key: 'productName', label: 'Наименование', visible: true },
  { key: 'photo', label: 'Фото', visible: true },
  { key: 'quantity', label: 'Кол-во', visible: true },
  { key: 'unit', label: 'Ед.', visible: true },
  { key: 'unitPrice', label: 'Цена', visible: true },
  { key: 'sum', label: 'Сумма', visible: true },
];

const DEFAULT_KP_TABLE_CHROME: ProposalTableChrome = {
  borderWeight: 'normal',
  headerWeight: 'normal',
};

const AUTOSAVE_MS = 1200;

/**
 * TZ-KP-WS-403 — shared draft controller for the workspace (left panels +
 * preview). Mirrors proposal-create.page.ts draft pipeline exactly (same
 * ProposalsService payload contract = single write-path); the create page
 * itself is NOT refactored here (stays frozen until cutover TZ-408).
 */
@Injectable()
export class ProposalWorkspaceDraftService {
  readonly selectedTemplate = signal<DocumentTemplate | null>(null);
  readonly draftLines = signal<ProposalDraftLine[]>([]);
  readonly previewHtml = signal<SafeHtml | null>(null);
  readonly previewPages = signal<SafeHtml[]>([]);
  private readonly previewHtmlSource = signal<string | null>(null);
  readonly previewStatus = signal<KpTemplatePreviewStatus>('idle');

  readonly organizationId = signal('');
  readonly counterpartyId = signal('');
  readonly contactPersonId = signal('');
  readonly siteId = signal('');
  readonly terms = signal<ProposalTerm[]>([]);
  readonly orgMarkupPercent = signal(0);
  readonly dealVatPercent = signal(20);
  readonly proposalNumber = signal('');
  readonly proposalTitle = signal('');
  readonly proposalDate = signal('');
  readonly proposalValidUntil = signal('');
  readonly discountType = signal<'none' | 'percent' | 'amount'>('none');
  readonly discountPercent = signal(0);
  readonly discountAmount = signal(0);
  readonly prepaymentPercent = signal(0);
  readonly productionDays = signal(0);
  readonly deliveryDays = signal(0);
  readonly sheetLayout = signal({ ...DEFAULT_KP_SHEET_LAYOUT });
  readonly kpTableLayout = signal(DEFAULT_KP_TABLE_LAYOUT.map((c) => ({ ...c })));
  readonly kpTableChrome = signal({ ...DEFAULT_KP_TABLE_CHROME });
  readonly tableTemplateId = signal<string | null>(null);
  readonly tableTargets = signal<ProposalTableTarget[]>([]);
  readonly selectedTableTargetId = signal<string | null>(null);
  private readonly tableTargetLayouts = signal<Record<string, ProposalTableLayoutColumn[]>>({});
  readonly proposalStatus = signal<ProposalCreateStatus>('draft');
  readonly currentDraftId = signal<string | null>(null);
  readonly autosaveLabel = signal('');
  /** MECH-504 — do not overwrite vat after manual edit in this session. */
  readonly vatTouchedByUser = signal(false);
  /** MECH-504 — reserved; discount is not inherited from party yet. */
  readonly discountTouchedByUser = signal(false);

  /** TZ-KP-WS-404 — catalog review (same contract as create; modal in page). */
  readonly catalogReviewOpen = signal(false);
  readonly catalogReviewError = signal('');
  readonly catalogReviewSources = signal<Record<string, Product | null>>({});
  readonly catalogReviewRows = computed(() =>
    this.draftLines()
      .map((line, index) => ({ line, index }))
      .filter(
        ({ line }) =>
          (line.lineKind ?? 'catalog') === 'catalog' &&
          (line.catalogDirtyFields?.length ?? 0) > 0 &&
          line.catalogDecision !== 'kp-only',
      )
      .map((entry) => ({
        ...entry,
        source: this.catalogReviewSources()[entry.line.productId] ?? null,
      })),
  );
  private pendingTableExit: (() => void) | null = null;
  private pendingOutput: (() => void) | null = null;
  private printCurrent: (() => void) | null = null;
  private pendingRoutePrint = false;

  readonly isReadOnly = computed(
    () =>
      this.proposalStatus() === 'accepted' ||
      this.proposalStatus() === 'converted' ||
      this.proposalStatus() === 'cancelled',
  );
  readonly compositionTotal = computed(() => this.calculateDealTotal());

  private readonly proposalsSvc = inject(ProposalsService);
  private readonly router = inject(Router);
  private readonly orgsSvc = inject(OrganizationsService);
  private readonly counterpartiesSvc = inject(CounterpartyService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly ordersSvc = inject(OrdersService);
  private readonly productsSvc = inject(ProductsService);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly tableTemplatesSvc = inject(TableTemplatesService);
  private readonly generatedDocumentsSvc = inject(GeneratedDocumentsService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly toast = inject(PiToastService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  private readonly rebuildPreview$ = new Subject<void>();
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private autosaveToastShown = false;

  constructor() {
    this.rebuildPreview$
      .pipe(
        debounceTime(200),
        switchMap(() => this.buildPreview()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    this.destroyRef.onDestroy(() => this.cancelAutosave());
  }

  /** Hydration entry — mirrors create ngOnInit (id / new / source=order / resume). */
  init(query: ProposalWorkspaceDraftInit): void {
    this.pendingRoutePrint = query.print === true;
    if (query.id) {
      this.resumeDraftById(query.id);
    } else if (query.source === 'order' && query.sourceId) {
      this.clearLocalDraftPointers();
      this.prefillFromOrder(query.sourceId);
    } else if (query.new) {
      this.clearLocalDraftPointers();
    } else {
      this.resumeLastDraft();
    }
  }

  onTemplateChange(tpl: DocumentTemplate | null): void {
    this.selectedTemplate.set(tpl);
    this.setPreviewHtml(null);
    if (tpl) this.writeStorage('kp.create.lastTemplateId', tpl._id);
    this.tableTemplateId.set(null);
    this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })));

    const current = this.sheetLayout();
    const rowsFirstPage =
      current.rowsFirstPage === 0 && tpl?.defaultSheetLayout?.rowsFirstPage
        ? tpl.defaultSheetLayout.rowsFirstPage
        : current.rowsFirstPage;
    const rowsNextPage =
      current.rowsNextPage === 0 && tpl?.defaultSheetLayout?.rowsNextPage
        ? tpl.defaultSheetLayout.rowsNextPage
        : current.rowsNextPage;

    this.sheetLayout.set({ ...DEFAULT_KP_SHEET_LAYOUT, rowsFirstPage, rowsNextPage });
    this.kpTableChrome.set({ ...DEFAULT_KP_TABLE_CHROME });
    if (tpl) {
      this.previewStatus.set('loading');
      this.syncTableTargets(tpl._id);
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    } else {
      this.setPreviewHtml(null);
      this.previewStatus.set('idle');
    }
  }

  /** TZ-KP-WS-403 — productAdd parity with create (merge qty for same line). */
  onProductAdd(line: ProposalDraftLine): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => {
      const lineKind = line.lineKind ?? 'catalog';
      const qty = Math.max(0.001, line.quantity);
      if (lineKind === 'custom') {
        return [...rows, { ...line, lineKind, quantity: qty }];
      }
      const matchId =
        lineKind === 'module' || lineKind === 'material'
          ? (line.refId ?? line.productId)
          : line.productId;
      const existing = rows.findIndex((row) => {
        const rowKind = row.lineKind ?? 'catalog';
        if (rowKind !== lineKind) return false;
        if (lineKind === 'catalog') return row.productId === matchId;
        return (row.refId ?? row.productId) === matchId;
      });
      const nextLine: ProposalDraftLine = {
        ...line,
        lineKind,
        ...(lineKind === 'module' || lineKind === 'material'
          ? { refId: matchId, productId: matchId }
          : {}),
        quantity: qty,
      };
      if (existing < 0) return [...rows, nextLine];
      return rows.map((row, index) =>
        index === existing ? { ...row, quantity: row.quantity + qty } : row,
      );
    });
    if (this.tableTemplateId()) this.addCommercialColumns();
    this.refreshComposition();
  }

  onRecipientState(state: ProposalRecipientState): void {
    if (this.isReadOnly()) return;
    const nextCounterparty = state.counterpartyId.trim();
    const cpChanged = nextCounterparty !== this.counterpartyId();
    this.counterpartyId.set(nextCounterparty);
    this.contactPersonId.set(state.contactPersonId.trim());
    this.siteId.set(state.siteId.trim());
    if (cpChanged && nextCounterparty) {
      this.inheritFromCounterparty(nextCounterparty);
    } else {
      this.refreshComposition();
    }
  }

  onTermsChange(terms: ProposalTerm[]): void {
    if (this.isReadOnly()) return;
    this.terms.set(terms.map((term, sortOrder) => ({ text: term.text, sortOrder })));
    this.refreshComposition();
  }

  // ---- Right panels (TZ-KP-WS-404): params / table / terms / output ----

  /** Page attaches the template-center print handler (workspace owns the ref). */
  attachPrinter(fn: () => void): void {
    this.printCurrent = fn;
  }

  /** MECH-505 — duplicate saved KP and open the copy in workspace. */
  duplicateDraft(): void {
    const id = this.currentDraftId();
    if (!id) {
      this.toast.error('Сначала сохраните КП');
      return;
    }
    if (this.isReadOnly()) {
      this.toast.error('Дублирование недоступно для принятого или закрытого КП');
      return;
    }
    this.proposalsSvc.duplicate(id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      this.toast.success(`Создана копия ${res.data.number}`);
      void this.router.navigate(['/proposals/workspace'], {
        queryParams: { id: res.data._id },
      });
    });
  }

  onInspectorState(state: ProposalCreateInspectorState): void {
    if (this.isReadOnly()) return;
    const nextOrganization = (state.organizationId ?? '').trim();
    const nextCounterparty = (state.counterpartyId ?? '').trim();
    const nextMarkup = this.clampMarkup(state.orgMarkupPercent);
    const nextVat = this.clampVat(state.dealVatPercent ?? this.dealVatPercent());
    const nextDiscountType = state.discountType ?? this.discountType();
    const nextDiscountPercent = Math.max(0, state.discountPercent ?? this.discountPercent());
    const nextDiscountAmount = Math.max(0, state.discountAmount ?? this.discountAmount());
    const nextUnchanged =
      nextOrganization === this.organizationId() &&
      nextCounterparty === this.counterpartyId() &&
      nextMarkup === this.orgMarkupPercent() &&
      nextVat === this.dealVatPercent() &&
      nextDiscountType === this.discountType() &&
      nextDiscountPercent === this.discountPercent() &&
      nextDiscountAmount === this.discountAmount() &&
      (state.number ?? this.proposalNumber()) === this.proposalNumber() &&
      (state.title ?? this.proposalTitle()) === this.proposalTitle() &&
      (state.date ?? this.proposalDate()) === this.proposalDate() &&
      (state.validUntil ?? this.proposalValidUntil()) === this.proposalValidUntil() &&
      (state.prepaymentPercent ?? this.prepaymentPercent()) === this.prepaymentPercent() &&
      (state.productionDays ?? this.productionDays()) === this.productionDays() &&
      (state.deliveryDays ?? this.deliveryDays()) === this.deliveryDays() &&
      JSON.stringify(state.sheetLayout ?? this.sheetLayout()) ===
        JSON.stringify(this.sheetLayout());
    const orgChanged = nextOrganization !== this.organizationId();
    const cpChanged = nextCounterparty !== this.counterpartyId();
    const vatChanged = nextVat !== this.dealVatPercent();
    const discountChanged =
      nextDiscountType !== this.discountType() ||
      nextDiscountPercent !== this.discountPercent() ||
      nextDiscountAmount !== this.discountAmount();
    if (vatChanged && !orgChanged && !cpChanged) {
      this.vatTouchedByUser.set(true);
    }
    if (discountChanged && !orgChanged && !cpChanged) {
      this.discountTouchedByUser.set(true);
    }
    if (nextUnchanged) return;
    if (orgChanged && nextOrganization) {
      this.toast.show('Проверьте шаблон бланка — у другой фирмы может быть другой фон');
      this.maybeSuggestOrgTemplates(nextOrganization);
    }
    this.organizationId.set(nextOrganization);
    this.counterpartyId.set(nextCounterparty);
    this.orgMarkupPercent.set(nextMarkup);
    this.dealVatPercent.set(nextVat);
    this.discountType.set(nextDiscountType);
    this.discountPercent.set(nextDiscountPercent);
    this.discountAmount.set(nextDiscountAmount);
    this.proposalNumber.set(state.number ?? this.proposalNumber());
    this.proposalTitle.set(state.title ?? this.proposalTitle());
    this.proposalDate.set(state.date ?? this.proposalDate());
    this.proposalValidUntil.set(state.validUntil ?? this.proposalValidUntil());
    this.prepaymentPercent.set(
      Math.min(100, Math.max(0, state.prepaymentPercent ?? this.prepaymentPercent())),
    );
    this.productionDays.set(Math.max(0, state.productionDays ?? this.productionDays()));
    this.deliveryDays.set(Math.max(0, state.deliveryDays ?? this.deliveryDays()));
    if (state.sheetLayout) this.sheetLayout.set({ ...this.sheetLayout(), ...state.sheetLayout });
    if (cpChanged && nextCounterparty) {
      this.inheritFromCounterparty(nextCounterparty);
    } else if (orgChanged && nextOrganization) {
      this.inheritFromOrganization(nextOrganization);
    } else {
      this.refreshComposition();
    }
  }

  onTableTargetChange(targetId: string): void {
    if (this.isReadOnly() || !this.tableTargets().some((target) => target.id === targetId)) return;
    this.selectedTableTargetId.set(targetId);
    this.applyTableTarget(targetId);
  }

  onTableLayoutChange(layout: ProposalTableLayoutColumn[]): void {
    if (this.isReadOnly()) return;
    this.kpTableLayout.set(this.ensureEssentialColumns(layout));
    this.refreshComposition();
  }

  onTableChromeChange(chrome: ProposalTableChrome): void {
    if (this.isReadOnly()) return;
    this.kpTableChrome.set({ ...chrome });
    this.refreshComposition();
  }

  onTableFontSizeChange(size: number): void {
    if (this.isReadOnly()) return;
    const tableFontSize = Math.min(20, Math.max(8, Math.round(size) || 12));
    this.sheetLayout.update((current) => ({ ...current, tableFontSize }));
    this.refreshComposition();
  }

  onTableHeaderFontSizeChange(size: number): void {
    if (this.isReadOnly()) return;
    const tableHeaderFontSize = Math.min(20, Math.max(8, Math.round(size) || 12));
    this.sheetLayout.update((current) => ({ ...current, tableHeaderFontSize }));
    this.refreshComposition();
  }

  /** TZ-KP-WS-405 — edit the table preset inline (PiDialog), no route change. */
  openTableTemplatePreset(): void {
    if (this.isReadOnly()) return;
    const id = this.tableTemplateId();
    if (!id) {
      this.toast.error('Сначала выберите шаблон таблицы.');
      return;
    }
    this.tableTemplatesSvc.findById(id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error('Не удалось загрузить шаблон таблицы.');
        return;
      }
      const ref = this.dialog.open<TableTemplate | null>(TableTemplateFormDialogComponent, {
        data: { template: res.data } as TableTemplateDialogConfig,
      });
      onDialogCloseOnce(ref, this.injector, (saved: TableTemplate) => {
        this.tableTemplateId.set(saved._id);
        this.kpTableLayout.set(
          this.ensureEssentialColumns(
            (saved.columns ?? []).map((column) => ({
              key: column.key,
              label: column.label,
              visible: true,
            })),
          ),
        );
        this.refreshComposition();
        this.rebuildPreview$.next();
        this.scheduleAutosave();
      });
    });
  }

  addCommercialColumns(): void {
    if (this.isReadOnly()) return;
    const canonical = [
      { key: 'index', label: '№', aliases: ['index', 'number', '№', 'номер'] },
      {
        key: 'productName',
        label: 'Наименование',
        aliases: tableLayoutColumnAliases('productName'),
      },
      {
        key: 'photo',
        label: 'Фото',
        aliases: tableLayoutColumnAliases('photo'),
      },
      {
        key: 'quantity',
        label: 'Кол-во',
        aliases: tableLayoutColumnAliases('quantity'),
      },
      { key: 'unit', label: 'Ед.', aliases: tableLayoutColumnAliases('unit') },
      { key: 'unitPrice', label: 'Цена', aliases: tableLayoutColumnAliases('unitPrice') },
      { key: 'sum', label: 'Сумма', aliases: tableLayoutColumnAliases('sum') },
    ];
    const existing = new Set(
      this.kpTableLayout().flatMap((column) =>
        tableLayoutColumnAliases(normalizeTableLayoutColumnKey(column.key)).map((alias) =>
          alias.trim().toLowerCase(),
        ),
      ),
    );
    const next = [
      ...this.kpTableLayout(),
      ...canonical
        .filter((column) => !column.aliases.some((alias) => existing.has(alias)))
        .map(({ key, label }) => ({ key, label, visible: true })),
    ];
    if (next.length !== this.kpTableLayout().length) this.onTableLayoutChange(next);
  }

  onCompositionLineChange(change: ProposalCompositionLineChange): void {
    if (this.isReadOnly()) return;
    const line = this.draftLines()[change.index];
    if (!line) return;
    const patch =
      line.lineKind === 'custom' && change.patch.productName !== undefined
        ? { ...change.patch, productName: change.patch.productName.trim() || 'Своя строка' }
        : change.patch;
    this.applySnapshotLinePatch(change.index, patch);
    this.refreshComposition();
  }

  addCustomLine(): void {
    if (this.isReadOnly()) return;
    const id = `custom-${Date.now()}-${this.draftLines().length}`;
    this.draftLines.update((rows) => [
      ...rows,
      {
        lineKind: 'custom' as const,
        productId: id,
        productName: '',
        quantity: 1,
        unit: 'шт',
        unitPrice: 0,
        discountPercent: 0,
        isOptional: false,
      },
    ]);
    this.refreshComposition();
  }

  removeCompositionLine(index: number): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
    this.refreshComposition();
  }

  onRowAction(event: { index: number; action: ProposalRowAction }): void {
    if (this.isReadOnly()) return;
    switch (event.action) {
      case 'open-card':
        this.editCompositionLine(event.index);
        break;
      case 'duplicate-kp':
        this.duplicateCompositionLine(event.index);
        break;
      case 'create-product-copy':
        this.duplicateProductForLine(event.index);
        break;
      case 'update-product':
        this.openCatalogReview(event.index);
        break;
    }
  }

  duplicateCompositionLine(index: number): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => {
      const line = rows[index];
      if (!line) return rows;
      const copy = { ...line, quantity: line.quantity };
      return [...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)];
    });
    this.refreshComposition();
  }

  moveCompositionLine(change: { index: number; direction: -1 | 1 }): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => {
      const nextIndex = change.index + change.direction;
      if (change.index < 0 || nextIndex < 0 || nextIndex >= rows.length) return rows;
      const next = [...rows];
      [next[change.index], next[nextIndex]] = [next[nextIndex], next[change.index]];
      return next;
    });
    this.refreshComposition();
  }

  editCompositionLine(index: number): void {
    if (this.isReadOnly()) return;
    const line = this.draftLines()[index];
    if (!line) return;
    const kind = line.lineKind ?? 'catalog';
    if (kind === 'custom') {
      this.toast.warning('Свою строку правьте прямо в составе');
      return;
    }
    const id = kind === 'catalog' ? line.productId : (line.refId ?? line.productId);
    if (!id) {
      this.toast.error('Не удалось открыть карточку: нет id позиции');
      return;
    }
    if (kind === 'catalog') {
      this.productsSvc
        .findById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error));
            return;
          }
          const ref = this.dialog.open(ProductFormDialogComponent, {
            data: res.data,
            width: 'lg',
          });
          onDialogCloseOnce(ref, this.injector, () => {
            this.toast.warning(
              'Карточка закрыта. Правки строки КП остаются снимком до явного решения.',
            );
          });
        });
      return;
    }
    if (kind === 'module') {
      this.modulesSvc
        .findById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error));
            return;
          }
          const ref = this.dialog.open(ModuleFormDialogComponent, {
            data: res.data,
            width: 'lg',
          });
          onDialogCloseOnce(ref, this.injector, (closed) => {
            const mod = closed as ProductModule | null | undefined;
            if (!mod?._id) return;
            this.applyCatalogEditToLine(index, {
              productName: mod.name ?? line.productName,
              productSku: mod.article ?? line.productSku,
            });
          });
        });
      return;
    }
    this.materialsSvc
      .findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
          return;
        }
        const ref = this.dialog.open(MaterialFormDialogComponent, {
          data: res.data,
          width: 'lg',
        });
        onDialogCloseOnce(ref, this.injector, (closed) => {
          const material = closed as Material | null | undefined;
          if (!material?._id) return;
          this.applyCatalogEditToLine(index, {
            productName: material.name ?? line.productName,
            productSku: material.article ?? material.sku ?? line.productSku,
            unit: material.unit ?? line.unit,
            unitPrice:
              typeof material.pricePerUnit === 'number' ? material.pricePerUnit : line.unitPrice,
          });
        });
      });
  }

  /** Exit guard: if dirty catalog rows remain, open the review first (parity with create). */
  requestTableExit(action: () => void): void {
    if (this.catalogReviewRows().length > 0) {
      this.pendingTableExit = action;
      this.openCatalogReview();
      return;
    }
    action();
  }

  cancelCatalogReview(): void {
    this.catalogReviewOpen.set(false);
    this.pendingTableExit = null;
  }

  dismissCatalogReview(): void {
    const pending = this.catalogReviewRows();
    if (pending.length > 0) {
      const pendingIndexes = new Set(pending.map((entry) => entry.index));
      this.draftLines.update((rows) =>
        rows.map((line, rowIndex) =>
          pendingIndexes.has(rowIndex) ? { ...line, catalogDecision: 'kp-only' as const } : line,
        ),
      );
      this.refreshComposition();
    }
    this.finishCatalogReview();
  }

  catalogDiffText(entry: { line: ProposalDraftLine; source: Product | null }): string {
    const labels: Record<CatalogDirtyField, string> = {
      productName: 'Наименование',
      description: 'Описание',
      productSku: 'Артикул',
      unit: 'Ед.',
    };
    return (entry.line.catalogDirtyFields ?? [])
      .map((field) => {
        const sourceValue =
          field === 'productName'
            ? entry.source?.name
            : field === 'description'
              ? entry.source?.description
              : field === 'productSku'
                ? entry.source?.sku
                : entry.source?.unit;
        const snapshotValue =
          field === 'productName'
            ? entry.line.productName
            : field === 'description'
              ? entry.line.description
              : field === 'productSku'
                ? entry.line.productSku
                : entry.line.unit;
        return `${labels[field]}: ${sourceValue || '—'} → ${snapshotValue || '—'}`;
      })
      .join(' · ');
  }

  resolveCatalogRow(index: number, decision: 'kp-only' | 'update' | 'copy'): void {
    const line = this.draftLines()[index];
    if (!line || (line.lineKind ?? 'catalog') !== 'catalog') return;
    if (decision === 'kp-only') {
      this.draftLines.update((rows) =>
        rows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, catalogDecision: 'kp-only' as const } : row,
        ),
      );
      this.refreshComposition();
      this.finishCatalogReviewIfDone();
      return;
    }
    const source = this.catalogReviewSources()[line.productId];
    if (!source) {
      this.catalogReviewError.set('Не удалось прочитать текущую карточку изделия.');
      return;
    }
    const dirty = new Set(line.catalogDirtyFields ?? []);
    const overrides = {
      ...(dirty.has('productName') ? { name: line.productName } : {}),
      ...(dirty.has('description') ? { description: line.description ?? '' } : {}),
      ...(dirty.has('productSku') && line.productSku ? { sku: line.productSku } : {}),
      ...(dirty.has('unit') && line.unit ? { unit: line.unit } : {}),
    };
    const expectedVersion = line.catalogSourceVersion ?? source.__v ?? source.version;
    if (decision === 'copy') {
      this.productsSvc.duplicate(line.productId, overrides).subscribe((res) => {
        if (!res.ok) {
          this.catalogReviewError.set(extractErrorMessage(res.error));
          return;
        }
        this.rebindCopiedProduct(index, res.data);
        this.finishCatalogReviewIfDone();
      });
      return;
    }
    const updatePayload: Partial<Product> & { expectedVersion?: number } = {
      ...overrides,
      ...(expectedVersion !== undefined ? { expectedVersion } : {}),
    };
    this.productsSvc.update(line.productId, updatePayload).subscribe((res) => {
      if (!res.ok) {
        this.catalogReviewError.set(
          res.error.status === 409
            ? 'Карточка изделия изменилась. Перечитайте её, оставьте правку только в КП или создайте копию.'
            : extractErrorMessage(res.error),
        );
        return;
      }
      this.draftLines.update((rows) =>
        rows.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                catalogDirtyFields: undefined,
                catalogDecision: undefined,
                catalogSourceVersion: res.data.__v ?? res.data.version,
              }
            : row,
        ),
      );
      this.refreshComposition();
      this.finishCatalogReviewIfDone();
    });
  }

  onStatusRequest(status: ProposalCreateStatus): void {
    if (this.isReadOnly()) return;
    const current = this.proposalStatus();
    const allowed: Record<ProposalCreateStatus, ProposalCreateStatus[]> = {
      draft: ['sent'],
      sent: ['accepted', 'rejected'],
      accepted: ['draft'],
      rejected: ['sent'],
      converted: [],
      cancelled: [],
    };
    if (!allowed[current].includes(status)) return;
    const draftId = this.readStorage('kp.create.lastDraftId');
    if (!draftId) {
      this.toast.error('Сначала дождитесь статуса «Сохранено».');
      return;
    }
    this.cancelAutosave();
    this.proposalsSvc.update(draftId, { status }).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error) || 'Не удалось изменить статус КП.');
        return;
      }
      this.proposalStatus.set(res.data.status ?? status);
      this.autosaveLabel.set('Сохранено');
      this.toast.success(`Статус КП: ${this.statusLabel(res.data.status ?? status)}`);
    });
  }

  /** Output gates (canon 368): print free; PDF/archive need a saved draft. */
  requestOutput(action: 'pdf' | 'print' | 'archive'): void {
    if (action === 'print') {
      this.printCurrentPreview();
      return;
    }
    if (this.currentDraftId() || this.readStorage('kp.create.lastDraftId')) {
      if (action === 'pdf') this.downloadPdf();
      else this.archiveCurrentQuotation();
      return;
    }
    if (!this.canSaveDraft()) {
      this.toast.error(
        action === 'pdf'
          ? 'Для PDF нужны шаблон, готовое превью и наша фирма.'
          : 'Для архива нужны шаблон, готовое превью и наша фирма.',
      );
      return;
    }
    const run = (): void => {
      if (action === 'pdf') this.downloadPdf();
      else this.archiveCurrentQuotation();
    };
    this.pendingOutput = run;
    this.cancelAutosave();
    this.saveDraft(false);
  }

  // ---- private right-panel helpers ----

  private syncTableTargets(templateId: string): void {
    this.blocksSvc
      .listByTemplate(templateId)
      .pipe(
        switchMap((blocksResult) => {
          if (!blocksResult.ok) return of({ targets: [], layouts: {} });
          const blocks = blocksResult.data ?? [];
          const liveTables = blocks
            .map((block, index) => {
              const tableId = this.tableTemplateIdForBlock(block);
              if (!tableId) return null;
              const settings = block.settings ?? {};
              return {
                block,
                index,
                tableId,
                explicit: settings['kpLineItems'] === true || settings['role'] === 'line-items',
              };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
          const candidates = liveTables;
          if (candidates.length === 0) return of({ targets: [], layouts: {} });
          return forkJoin(
            candidates.map((candidate) =>
              this.tableTemplatesSvc.findById(candidate.tableId).pipe(
                map((result) => ({ candidate, result })),
                catchError(() => of({ candidate, result: null })),
              ),
            ),
          ).pipe(
            map((results) => {
              const targets: ProposalTableTarget[] = results.map(({ candidate }) => ({
                id: candidate.tableId,
                templateId: candidate.tableId,
                label: candidate.block.title?.trim() || `Таблица ${candidate.index + 1}`,
                explicit: candidate.explicit,
              }));
              const layouts: Record<string, ProposalTableLayoutColumn[]> = {};
              for (const { candidate, result } of results) {
                if (!result?.ok) continue;
                const columns = (result.data as TableTemplate).columns ?? [];
                if (columns.length > 0) {
                  layouts[candidate.tableId] = columns.map((column) => ({
                    key: column.key,
                    label: column.label,
                    visible: true,
                  }));
                }
              }
              return { targets, layouts };
            }),
          );
        }),
      )
      .subscribe(({ targets, layouts }) => {
        if (this.selectedTemplate()?._id !== templateId) return;
        this.tableTargets.set(targets);
        this.tableTargetLayouts.set(layouts);
        const defaultTarget = targets.find((target) => target.explicit) ?? targets[0] ?? null;
        this.selectedTableTargetId.set(defaultTarget?.id ?? null);
        this.applyTableTarget(defaultTarget?.id ?? null);
      });
  }

  private applyTableTarget(targetId: string | null): void {
    const target = this.tableTargets().find((entry) => entry.id === targetId);
    this.tableTemplateId.set(target?.templateId ?? null);
    const layout = targetId ? this.tableTargetLayouts()[targetId] : undefined;
    if (layout?.length) this.kpTableLayout.set(this.ensureEssentialColumns(layout));
    else this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })));
    this.refreshComposition();
  }

  private tableTemplateIdForBlock(block: TemplateBlock): string | null {
    if (block.type !== 'table') return null;
    if (block.source?.kind === 'table-template') {
      return block.source.mode === 'snapshot' ? null : block.source.refId;
    }
    const tableId = block.settings?.['tableTemplateId'];
    return typeof tableId === 'string' && tableId.length > 0 ? tableId : null;
  }

  private ensureEssentialColumns(layout: ProposalTableLayoutColumn[]): ProposalTableLayoutColumn[] {
    const normalized = normalizeTableLayoutColumns(layout);
    const next = normalized.map((column) =>
      ['productName', 'quantity', 'unit', 'unitPrice', 'sum'].includes(column.key)
        ? { ...column, visible: true }
        : { ...column },
    );
    if (!next.some((candidate) => isPhotoColumnKey(candidate.key))) {
      next.splice(Math.min(2, next.length), 0, { key: 'photo', label: 'Фото', visible: true });
    }
    return next;
  }

  private applySnapshotLinePatch(index: number, patch: Partial<ProposalDraftLine>): void {
    this.draftLines.update((rows) =>
      rows.map((line, rowIndex) => {
        if (rowIndex !== index) return line;
        const kind = line.lineKind ?? 'catalog';
        if (kind !== 'catalog') return { ...line, ...patch };
        const identityFields: CatalogDirtyField[] = [
          'productName',
          'description',
          'productSku',
          'unit',
        ];
        const changed = identityFields.filter((field) => field in patch);
        const dirty = Array.from(new Set([...(line.catalogDirtyFields ?? []), ...changed]));
        return {
          ...line,
          ...patch,
          ...(dirty.length
            ? { catalogDirtyFields: dirty, catalogDecision: 'pending' as const }
            : {}),
        };
      }),
    );
  }

  private duplicateProductForLine(index: number): void {
    const line = this.draftLines()[index];
    if (!line || (line.lineKind ?? 'catalog') !== 'catalog') return;
    const overrides = {
      name: line.productName,
      description: line.description ?? '',
      ...(line.unit ? { unit: line.unit } : {}),
      ...(line.productSku ? { sku: line.productSku } : {}),
    };
    this.productsSvc.duplicate(line.productId, overrides).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      const copy: ProposalDraftLine = {
        ...line,
        productId: res.data._id,
        productName: res.data.name ?? line.productName,
        productSku: res.data.sku,
        unit: res.data.unit ?? line.unit,
        catalogDirtyFields: undefined,
        catalogDecision: undefined,
        catalogSourceVersion: res.data.__v ?? res.data.version,
      };
      this.draftLines.update((rows) => [
        ...rows.slice(0, index + 1),
        copy,
        ...rows.slice(index + 1),
      ]);
      this.refreshComposition();
      this.toast.success('Копия изделия добавлена строкой ниже');
    });
  }

  private openCatalogReview(index?: number): void {
    const rows = this.catalogReviewRows();
    if (rows.length === 0) return;
    this.catalogReviewError.set('');
    this.catalogReviewOpen.set(true);
    for (const entry of rows) {
      if (index !== undefined && entry.index !== index) continue;
      const id = entry.line.productId;
      if (this.catalogReviewSources()[id] !== undefined) continue;
      this.productsSvc
        .findById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          this.catalogReviewSources.update((sources) => ({
            ...sources,
            [id]: res.ok ? res.data : null,
          }));
        });
    }
  }

  private finishCatalogReviewIfDone(): void {
    if (this.catalogReviewRows().length === 0) this.finishCatalogReview();
  }

  private finishCatalogReview(): void {
    this.catalogReviewOpen.set(false);
    const leave = this.pendingTableExit;
    this.pendingTableExit = null;
    leave?.();
  }

  private rebindCopiedProduct(index: number, product: Product): void {
    this.draftLines.update((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              productId: product._id,
              productName: product.name ?? row.productName,
              productSku: product.sku,
              unit: product.unit ?? row.unit,
              catalogDirtyFields: undefined,
              catalogDecision: undefined,
              catalogSourceVersion: product.__v ?? product.version,
            }
          : row,
      ),
    );
    this.refreshComposition();
  }

  private applyCatalogEditToLine(index: number, patch: Partial<ProposalDraftLine>): void {
    this.draftLines.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
    this.refreshComposition();
  }

  private downloadPdf(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id) {
      this.toast.error('Сначала сохраните черновик КП.');
      return;
    }
    this.proposalsSvc.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = buildKpPdfFilename(this.proposalNumber(), id);
        anchor.click();
        URL.revokeObjectURL(url);
        this.toast.success('PDF подготовлен');
      },
      error: () => this.toast.error('Сервис печати недоступен, используйте Печать в браузере.'),
    });
  }

  private printCurrentPreview(): void {
    if (!this.previewHtmlSource()) {
      this.toast.error('Превью листа ещё не готово.');
      return;
    }
    this.printCurrent?.();
  }

  /** TZ-KP-WS-408 — ?action=print parity: fire print once when the first
   *  preview is ready (mirrors create's pendingRoutePrint). */
  private maybePrintOnReady(): void {
    if (!this.pendingRoutePrint) return;
    this.pendingRoutePrint = false;
    setTimeout(() => this.printCurrentPreview(), 0);
  }

  private archiveCurrentQuotation(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id) {
      this.toast.error('Сначала сохраните черновик КП.');
      return;
    }
    this.generatedDocumentsSvc.archiveQuotation(id).subscribe((res) => {
      if (res.ok) this.toast.success('КП сохранено в архив документов');
      else this.toast.error('Не удалось сохранить КП в архив документов.');
    });
  }

  private statusLabel(status: ProposalCreateStatus): string {
    const labels: Record<ProposalCreateStatus, string> = {
      draft: 'Черновик',
      sent: 'Отправлено',
      accepted: 'Принято',
      rejected: 'Отклонено',
      converted: 'В заказе',
      cancelled: 'Отменено',
    };
    return labels[status] ?? status;
  }

  protected canSaveDraft(): boolean {
    return Boolean(
      !this.isReadOnly() &&
      this.selectedTemplate()?._id &&
      this.organizationId().trim() &&
      this.previewStatus() === 'ready',
    );
  }

  /** Single write-path: ProposalsService.create/update with the create-page payload shape. */
  saveDraft(manual = true): void {
    if (this.isReadOnly()) return;
    if (manual) this.cancelAutosave();
    const autosave = !manual;
    const template = this.selectedTemplate();
    const organizationId = this.organizationId().trim();
    const html = this.previewHtmlSource();
    if (!template?._id || !html) {
      if (!autosave) this.toast.error('Сначала выберите шаблон и дождитесь превью листа.');
      return;
    }
    if (!organizationId) {
      if (!autosave) this.toast.error('Выберите нашу фирму для сохранения черновика.');
      return;
    }
    if (autosave) this.autosaveLabel.set('Автосохранение…');

    const payload: Partial<Proposal> = {
      number: this.proposalNumber().trim() || undefined,
      title: this.proposalTitle().trim() || undefined,
      ...(this.proposalDate() ? { date: this.proposalDate() } : {}),
      ...(this.proposalValidUntil() ? { validUntil: this.proposalValidUntil() } : {}),
      organizationId,
      ...(this.counterpartyId().trim() ? { counterpartyId: this.counterpartyId().trim() } : {}),
      contactPersonId: this.contactPersonId().trim() || null,
      siteId: this.siteId().trim() || null,
      status: this.proposalStatus(),
      orgMarkupPercent: this.clampMarkup(this.orgMarkupPercent()),
      vatPercent: this.clampVat(this.dealVatPercent()),
      discountType: this.discountType(),
      discountPercent: this.discountPercent(),
      discountAmount: this.discountAmount(),
      prepaymentPercent: this.prepaymentPercent(),
      productionDays: this.productionDays(),
      deliveryDays: this.deliveryDays(),
      sheetLayout: this.sheetLayout(),
      terms: this.terms(),
      items: this.draftLines().map((line, index) => ({
        lineKind: line.lineKind ?? (line.productId ? 'catalog' : 'custom'),
        ...(line.lineKind === 'module' || line.lineKind === 'material'
          ? { refId: line.refId ?? line.productId }
          : line.productId && !line.productId.startsWith('custom-')
            ? { productId: line.productId }
            : {}),
        productName: line.productName,
        ...(line.description ? { description: line.description } : {}),
        productSku: line.productSku,
        ...(line.photoUrl ? { photoUrl: line.photoUrl } : {}),
        ...(line.catalogDirtyFields?.length
          ? { catalogDirtyFields: [...line.catalogDirtyFields] }
          : {}),
        ...(line.catalogDecision ? { catalogDecision: line.catalogDecision } : {}),
        ...(line.catalogSourceVersion !== undefined
          ? { catalogSourceVersion: line.catalogSourceVersion }
          : {}),
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        markupPercent: this.clampMarkup(this.orgMarkupPercent()),
        discountPercent: Math.min(100, Math.max(0, line.discountPercent ?? 0)),
        isOptional: line.isOptional === true,
        ...(line.rowPresentation ? { rowPresentation: { ...line.rowPresentation } } : {}),
        sortOrder: index,
      })),
      templateId: template._id,
      templateSnapshot: {
        templateId: template._id,
        html,
        tableLayout: this.kpTableLayout().map(({ key, visible }) => ({ key, visible })),
        sheetLayout: this.sheetLayout(),
        builtAt: new Date().toISOString(),
      },
    };

    const draftId = this.readStorage('kp.create.lastDraftId');
    const persist = (id: string | null) =>
      id ? this.proposalsSvc.update(id, payload) : this.proposalsSvc.create(payload);

    persist(draftId)
      .pipe(
        switchMap((res) => {
          if (!res.ok && draftId && (res.error.status === 404 || res.error.status === 400)) {
            this.removeStorage('kp.create.lastDraftId');
            return this.proposalsSvc.create(payload);
          }
          return of(res);
        }),
      )
      .subscribe((res) => this.finishSave(res, template._id, autosave));
  }

  refreshComposition(): void {
    if (this.selectedTemplate()?._id) this.rebuildPreview$.next();
    this.scheduleAutosave();
  }

  private finishSave(res: SilentResult<Proposal>, templateId: string, autosave: boolean): void {
    if (!res.ok) {
      this.autosaveLabel.set('Ошибка автосохранения');
      if (!autosave || !this.autosaveToastShown) {
        this.toast.error('Не удалось сохранить черновик КП.');
        this.autosaveToastShown = true;
      }
      return;
    }
    this.writeStorage('kp.create.lastDraftId', res.data._id);
    this.currentDraftId.set(res.data._id);
    this.writeStorage('kp.create.lastTemplateId', templateId);
    this.proposalNumber.set(res.data.number ?? this.proposalNumber());
    this.proposalStatus.set(res.data.status ?? this.proposalStatus());
    this.autosaveLabel.set('Сохранено');
    if (!autosave || !this.autosaveToastShown) {
      this.toast.success('Черновик сохранён');
      this.autosaveToastShown = true;
    }
    const output = this.pendingOutput;
    this.pendingOutput = null;
    output?.();
  }

  private buildPreview() {
    const tpl = this.selectedTemplate();
    if (!tpl?._id) {
      this.setPreviewHtml(null);
      this.previewStatus.set('idle');
      return of(null);
    }
    const keepShowing = this.previewStatus() === 'ready' && !!this.previewHtmlSource()?.trim();
    if (!keepShowing) this.previewStatus.set('loading');
    const org = this.organizationId().trim();
    const markup = this.clampMarkup(this.orgMarkupPercent());
    const previewLines: BuildPreviewLine[] = this.draftLines().map((line) => ({
      ...(line.lineKind && line.lineKind !== 'catalog' ? { lineKind: line.lineKind } : {}),
      productName: line.productName || 'Своя строка',
      ...(line.description ? { description: line.description } : {}),
      quantity: line.quantity,
      unitPrice: this.roundMoney(line.unitPrice * (1 + markup / 100)),
      ...(line.productSku ? { productSku: line.productSku } : {}),
      ...(line.photoUrl ? { photoUrl: line.photoUrl } : {}),
      ...(line.unit ? { unit: line.unit } : {}),
      ...(line.discountPercent
        ? { discountPercent: Math.min(100, Math.max(0, line.discountPercent)) }
        : {}),
      ...(line.isOptional ? { isOptional: true } : {}),
      ...(line.rowPresentation ? { rowPresentation: { ...line.rowPresentation } } : {}),
    }));
    const tableLayout: BuildTableLayoutColumn[] = this.kpTableLayout().map(({ key, visible }) => ({
      key,
      visible,
    }));
    const payload = {
      previewLines,
      tableLayout,
      tableChrome: {
        borderWeight: this.kpTableChrome().borderWeight ?? 'normal',
        headerWeight: this.kpTableChrome().headerWeight ?? 'normal',
      },
      sheetLayout: this.sheetLayout() as BuildSheetLayout,
      tableTargetId: this.tableTemplateId() ?? undefined,
      dealTotals: {
        vatPercent: this.clampVat(this.dealVatPercent()),
        discountType: this.discountType(),
        discountPercent: this.discountPercent(),
        discountAmount: this.discountAmount(),
        prepaymentPercent: this.prepaymentPercent(),
        productionDays: this.productionDays(),
        deliveryDays: this.deliveryDays(),
      },
      ...(org ? { organizationId: org } : {}),
      ...(this.counterpartyId().trim() ? { counterpartyId: this.counterpartyId().trim() } : {}),
      ...(this.contactPersonId().trim() ? { contactPersonId: this.contactPersonId().trim() } : {}),
      ...(this.siteId().trim() ? { siteId: this.siteId().trim() } : {}),
      terms: this.terms(),
      proposalNumber: this.proposalNumber().trim() || undefined,
      ...(this.proposalDate() ? { proposalDate: this.proposalDate() } : {}),
      ...(this.proposalValidUntil() ? { validUntil: this.proposalValidUntil() } : {}),
      totalPrice: this.compositionTotal(),
    };
    return this.templatesSvc.build(tpl._id, payload).pipe(
      tap((res) => {
        if (res.ok && typeof res.data === 'string') {
          this.setPreviewHtml(res.data);
          this.previewStatus.set('ready');
          this.scheduleAutosave();
          this.maybePrintOnReady();
        } else if (!keepShowing) {
          this.setPreviewHtml(null);
          this.previewStatus.set('error');
        } else {
          this.toast.warning('Не удалось обновить превью — на листе предыдущая версия');
        }
      }),
      catchError(() => {
        if (!keepShowing) {
          this.setPreviewHtml(null);
          this.previewStatus.set('error');
        } else {
          this.toast.warning('Не удалось обновить превью — на листе предыдущая версия');
        }
        return of(null);
      }),
    );
  }

  private scheduleAutosave(): void {
    if (!this.selectedTemplate()?._id || !this.organizationId().trim()) return;
    this.cancelAutosave();
    this.autosaveTimer = setTimeout(() => {
      this.autosaveTimer = null;
      if (this.canSaveDraft()) this.saveDraft(false);
    }, AUTOSAVE_MS);
  }

  private cancelAutosave(): void {
    if (this.autosaveTimer !== null) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  private resumeDraftById(id: string): void {
    this.proposalsSvc.findById(id).subscribe((res) => {
      if (res.ok && this.isStudioStatus(res.data.status)) {
        this.writeStorage('kp.create.lastDraftId', id);
        this.currentDraftId.set(id);
        this.hydrateDraft(res.data);
        return;
      }
      this.clearLocalDraftPointers();
      this.draftLines.set([]);
      this.terms.set([]);
      this.selectedTemplate.set(null);
      this.setPreviewHtml(null);
      this.previewStatus.set('idle');
      this.toast.error('КП нельзя открыть для редактирования. Открыт новый лист.');
    });
  }

  private resumeLastDraft(): void {
    const draftId = this.readStorage('kp.create.lastDraftId');
    if (draftId) {
      this.proposalsSvc.findById(draftId).subscribe((res) => {
        if (res.ok && this.isStudioStatus(res.data.status)) {
          this.hydrateDraft(res.data);
          return;
        }
        this.clearLocalDraftPointers();
        this.terms.set([]);
      });
      return;
    }
    this.resumeLastTemplate();
  }

  private prefillFromOrder(orderId: string): void {
    this.ordersSvc.findById(orderId).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error) || 'Не удалось загрузить заказ');
        return;
      }
      const order: Order = res.data;
      const cpId = this.refId(order.counterpartyId) ?? '';
      this.counterpartyId.set(cpId);
      this.siteId.set(this.refId(order.siteId) ?? '');
      if (cpId) this.inheritFromCounterparty(cpId);
      this.draftLines.set(
        (order.items ?? []).map((item) => ({
          lineKind: 'catalog' as const,
          productId: item.productId,
          ...(item.productSku ? { productSku: item.productSku } : {}),
          productName: item.productName ?? 'Позиция',
          quantity: item.quantity,
          ...(item.unit ? { unit: item.unit } : {}),
          unitPrice: item.unitPrice ?? 0,
        })),
      );
      this.refreshComposition();
    });
  }

  private clearLocalDraftPointers(): void {
    this.currentDraftId.set(null);
    this.removeStorage('kp.create.lastDraftId');
    this.removeStorage('kp.create.lastTemplateId');
    this.vatTouchedByUser.set(false);
    this.discountTouchedByUser.set(false);
  }

  private applyInheritedVat(vatRate: number | undefined): void {
    if (this.vatTouchedByUser()) return;
    this.dealVatPercent.set(this.clampVat(vatRate ?? 20));
  }

  /** MECH-505 — hint when templates exist for the new org (no silent template swap). */
  private maybeSuggestOrgTemplates(orgId: string): void {
    this.templatesSvc
      .list({ organizationId: orgId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) return;
        const count = res.data.items?.length ?? 0;
        if (count > 0) {
          this.toast.show(
            `Для выбранной фирмы есть ${count} шаблон(ов) — проверьте раздел «Шаблон»`,
          );
        }
      });
  }

  private inheritFromOrganization(orgId: string): void {
    this.orgsSvc
      .findById(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) {
          this.refreshComposition();
          return;
        }
        this.applyInheritedVat(res.data.vatRate);
        this.refreshComposition();
      });
  }

  private inheritFromCounterparty(cpId: string): void {
    this.counterpartiesSvc
      .findById(cpId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) {
          this.refreshComposition();
          return;
        }
        this.applyInheritedVat(res.data.vatRate);
        if (typeof res.data.paymentTermDays === 'number' && res.data.paymentTermDays > 0) {
          this.toast.show(`У клиента срок оплаты ${res.data.paymentTermDays} дн.`);
        }
        this.refreshComposition();
      });
  }

  private resumeLastTemplate(): void {
    const templateId = this.readStorage('kp.create.lastTemplateId');
    if (!templateId) return;
    this.templatesSvc.findById(templateId).subscribe((res) => {
      if (res.ok) this.onTemplateChange(res.data);
    });
  }

  private hydrateDraft(draft: Proposal): void {
    this.currentDraftId.set(this.readStorage('kp.create.lastDraftId'));
    const templateId = this.refId(draft.templateId);
    this.proposalStatus.set(draft.status === 'accepted' ? 'accepted' : 'draft');
    this.organizationId.set(this.refId(draft.organizationId) ?? '');
    this.counterpartyId.set(this.refId(draft.counterpartyId) ?? '');
    this.contactPersonId.set(this.refId(draft.contactPersonId) ?? '');
    this.siteId.set(this.refId(draft.siteId) ?? '');
    this.terms.set(
      (draft.terms ?? []).map((term, index) => ({
        text: term.text ?? '',
        sortOrder: term.sortOrder ?? index,
      })),
    );
    this.orgMarkupPercent.set(this.clampMarkup(draft.orgMarkupPercent ?? 0));
    this.proposalNumber.set(draft.number ?? '');
    this.proposalTitle.set(draft.title ?? '');
    this.proposalDate.set(draft.date ? draft.date.slice(0, 10) : '');
    this.proposalValidUntil.set(draft.validUntil ? draft.validUntil.slice(0, 10) : '');
    this.dealVatPercent.set(this.clampVat(draft.vatPercent ?? 20));
    this.vatTouchedByUser.set(true);
    this.discountTouchedByUser.set(
      (draft.discountType ?? 'none') !== 'none' ||
        (draft.discountPercent ?? 0) > 0 ||
        (draft.discountAmount ?? 0) > 0,
    );
    this.discountType.set(draft.discountType ?? 'none');
    this.discountPercent.set(Math.max(0, draft.discountPercent ?? 0));
    this.discountAmount.set(Math.max(0, draft.discountAmount ?? 0));
    this.prepaymentPercent.set(Math.min(100, Math.max(0, draft.prepaymentPercent ?? 0)));
    this.productionDays.set(Math.max(0, draft.productionDays ?? 0));
    this.deliveryDays.set(Math.max(0, draft.deliveryDays ?? 0));
    this.sheetLayout.set({ ...DEFAULT_KP_SHEET_LAYOUT, ...(draft.sheetLayout ?? {}) });
    this.draftLines.set(
      (draft.items ?? []).map((item) => {
        const lineKind = item.lineKind ?? (this.refId(item.productId) ? 'catalog' : 'custom');
        const refId = this.refId(item.refId);
        const productId =
          lineKind === 'module' || lineKind === 'material'
            ? (refId ?? `typed-${item.sortOrder ?? 0}`)
            : (this.refId(item.productId) ?? `custom-${item.sortOrder ?? 0}`);
        return {
          lineKind,
          productId,
          ...(refId ? { refId } : {}),
          productName: item.productName ?? 'Своя строка',
          ...(item.description ? { description: item.description } : {}),
          productSku: item.productSku,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          ...(item.photoUrl ? { photoUrl: item.photoUrl } : {}),
          ...(item.catalogDirtyFields?.length
            ? { catalogDirtyFields: [...item.catalogDirtyFields] }
            : {}),
          ...(item.catalogDecision ? { catalogDecision: item.catalogDecision } : {}),
          ...(item.catalogSourceVersion !== undefined
            ? { catalogSourceVersion: item.catalogSourceVersion }
            : {}),
          ...(item.discountPercent ? { discountPercent: item.discountPercent } : {}),
          ...(item.isOptional ? { isOptional: true } : {}),
          ...(item.rowPresentation ? { rowPresentation: { ...item.rowPresentation } } : {}),
        };
      }),
    );
    if (templateId) {
      this.templatesSvc.findById(templateId).subscribe((res) => {
        if (!res.ok) return;
        if (
          draft.status === 'accepted' &&
          this.applyLockedTemplateSnapshot(draft.templateSnapshot)
        ) {
          this.selectedTemplate.set(res.data);
          return;
        }
        this.onTemplateChange(res.data);

        const current = this.sheetLayout();
        const draftRowsFirst = draft.sheetLayout?.rowsFirstPage ?? 0;
        const draftRowsNext = draft.sheetLayout?.rowsNextPage ?? 0;
        this.sheetLayout.set({
          ...DEFAULT_KP_SHEET_LAYOUT,
          ...(draft.sheetLayout ?? {}),
          rowsFirstPage: draftRowsFirst === 0 ? current.rowsFirstPage : draftRowsFirst,
          rowsNextPage: draftRowsNext === 0 ? current.rowsNextPage : draftRowsNext,
        });

        this.rebuildPreview$.next();
      });
    } else {
      this.resumeLastTemplate();
    }
  }

  private applyLockedTemplateSnapshot(snapshot: Record<string, unknown> | undefined): boolean {
    const html = snapshot?.['html'];
    if (typeof html !== 'string' || !html.trim()) return false;
    this.setPreviewHtml(html);
    this.previewStatus.set('ready');
    this.autosaveLabel.set('Сохранено');
    this.maybePrintOnReady();
    return true;
  }

  private setPreviewHtml(html: string | null): void {
    this.previewHtmlSource.set(html);
    if (!html) {
      this.previewHtml.set(null);
      this.previewPages.set([]);
      return;
    }
    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(html)));
    if (typeof DOMParser === 'undefined') {
      this.previewPages.set([this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(html))]);
      return;
    }
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const pages = Array.from(parsed.querySelectorAll('.doc-page'));
    if (pages.length === 0) {
      this.previewPages.set([this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(html))]);
      return;
    }
    const head = parsed.head?.innerHTML ?? '';
    this.previewPages.set(
      pages.map((page) =>
        this.sanitizer.bypassSecurityTrustHtml(
          this.withBaseHref(
            `<!DOCTYPE html><html><head>${head}</head><body>${page.outerHTML}</body></html>`,
          ),
        ),
      ),
    );
  }

  private withBaseHref(html: string): string {
    const origin =
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
    if (!origin) return html;

    const rewritten = html.replace(/(["'(])\/uploads\//g, `$1${origin}/uploads/`);
    if (/<base\s/i.test(rewritten)) return rewritten;

    const baseTag = `<base href="${origin}/">`;
    if (/<head[^>]*>/i.test(rewritten)) {
      return rewritten.replace(/<head[^>]*>/i, (open) => `${open}${baseTag}`);
    }
    return `<!DOCTYPE html><html><head>${baseTag}</head><body>${rewritten}</body></html>`;
  }

  private isStudioStatus(status: Proposal['status']): boolean {
    return (
      status === 'draft' || status === 'sent' || status === 'accepted' || status === 'rejected'
    );
  }

  private calculateDealTotal(): number {
    const markup = this.clampMarkup(this.orgMarkupPercent());
    const subtotal = this.draftLines().reduce(
      (sum, line) => sum + this.roundMoney(line.unitPrice * (1 + markup / 100) * line.quantity),
      0,
    );
    const discountAmount =
      this.discountType() === 'percent'
        ? subtotal * (this.clampDiscount(this.discountPercent()) / 100)
        : this.discountType() === 'amount'
          ? Math.min(this.discountAmount(), subtotal)
          : 0;
    const vat = this.clampVat(this.dealVatPercent());
    return this.roundMoney(subtotal - discountAmount + ((subtotal - discountAmount) * vat) / 100);
  }

  private clampDiscount(value: number): number {
    return Math.min(100, Math.max(0, value));
  }

  private clampMarkup(value: number): number {
    return Math.min(1000, Math.max(0, value));
  }

  private clampVat(value: number): number {
    return Math.min(40, Math.max(0, value));
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private refId(value: unknown): string | null {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_id' in value) {
      return String((value as { _id: string })._id);
    }
    return null;
  }

  private readStorage(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }

  private writeStorage(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  }

  private removeStorage(key: string): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  }
}
