import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { extractErrorMessage } from '../../../../core/silent-http';
import { PiToastService } from '../../../../shared/ui/toast';
import { OrdersService, type Order } from '../../../../shared/services/orders.service';
import type { SilentResult } from '../../../../core/silent-http';
import {
  DocumentTemplatesService,
  type BuildPreviewLine,
  type BuildSheetLayout,
  type BuildTableLayoutColumn,
  type DocumentTemplate,
} from '../../../../shared/services/pi-document-templates.service';
import { ProposalsService, type Proposal } from '../../../../shared/services/pi-proposals.service';
import type {
  ProposalCreateStatus,
  ProposalTableChrome,
} from '../proposal-create-inspector.component';
import type { KpTemplatePreviewStatus } from '../proposal-create-template-center.component';
import type { ProposalRecipientState } from '../proposal-create-recipient.component';
import type { ProposalDraftLine } from '../proposal-product-rail.component';
import type { ProposalTerm } from '../proposal-create-terms.component';

export interface ProposalWorkspaceDraftInit {
  id?: string | null;
  new?: boolean;
  source?: string | null;
  sourceId?: string | null;
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
  readonly proposalStatus = signal<ProposalCreateStatus>('draft');
  readonly currentDraftId = signal<string | null>(null);
  readonly autosaveLabel = signal('');

  readonly isReadOnly = computed(
    () =>
      this.proposalStatus() === 'accepted' ||
      this.proposalStatus() === 'converted' ||
      this.proposalStatus() === 'cancelled',
  );
  readonly compositionTotal = computed(() => this.calculateDealTotal());

  private readonly proposalsSvc = inject(ProposalsService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly ordersSvc = inject(OrdersService);
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

  protected onTemplateChange(tpl: DocumentTemplate | null): void {
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
    this.refreshComposition();
  }

  onRecipientState(state: ProposalRecipientState): void {
    if (this.isReadOnly()) return;
    this.counterpartyId.set(state.counterpartyId.trim());
    this.contactPersonId.set(state.contactPersonId.trim());
    this.siteId.set(state.siteId.trim());
    this.refreshComposition();
  }

  onTermsChange(terms: ProposalTerm[]): void {
    if (this.isReadOnly()) return;
    this.terms.set(terms.map((term, sortOrder) => ({ text: term.text, sortOrder })));
    this.refreshComposition();
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
    this.removeStorage('kp.create.lastTemplateId');
  }

  private prefillFromOrder(orderId: string): void {
    this.ordersSvc.findById(orderId).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error) || 'Не удалось загрузить заказ');
        return;
      }
      const order: Order = res.data;
      this.counterpartyId.set(this.refId(order.counterpartyId) ?? '');
      this.siteId.set(this.refId(order.siteId) ?? '');
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
