import {
  DestroyRef,
  Injectable,
  Injector,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, of, switchMap, take, tap } from 'rxjs';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  PiStudioDocumentsService,
  STUDIO_DOCUMENT_REVISION_CONFLICT,
  type StudioDocument,
  type UpdateStudioDocumentPayload,
} from '../../../shared/services/pi-studio-documents.service';
import {
  DocumentTemplatesService,
  type DocumentTemplate,
  type DocumentTypeOption,
} from '../../../shared/services/pi-document-templates.service';
import { ProposalsService, type Proposal } from '../../../shared/services/pi-proposals.service';
import { normalizeBlockLayout } from '../../../shared/template-block/template-block-layout';
import { StudioTemplatePickDialogComponent } from './studio-template-pick-dialog.component';
import {
  StudioRevisionConflictDialogComponent,
  type StudioRevisionConflictAction,
} from './studio-revision-conflict-dialog.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import {
  CounterpartyService,
  type Counterparty,
} from '../../../shared/services/pi-counterparty.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { OrdersService, type Order } from '../../../shared/services/orders.service';
import { StudioBlocksStateService } from './studio-blocks-state.service';
import {
  onStudioSectionClick,
  studioPanelSide,
  studioPanelTitle,
  type StudioWorkspaceSection,
} from './studio-workspace-chrome';
import type { WsOrientation } from '../../../shared/document-workspace-shell/proposal-workspace-shell.component';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { readStudioDataSetRows, studioTableDataSetKey } from './studio-table.helpers';

type StudioPageFilter = 'all' | number;

@Injectable()
export class DocumentStudioEditorFacade {
  private readonly api = inject(PiStudioDocumentsService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly proposalsApi = inject(ProposalsService);
  private readonly ordersApi = inject(OrdersService);
  private readonly counterpartiesApi = inject(CounterpartyService);
  private readonly orgsApi = inject(OrganizationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  readonly blocksState = inject(StudioBlocksStateService);

  private deepLinksHandled = false;
  private pendingDocumentPatch: Omit<UpdateStudioDocumentPayload, 'expectedRevision'> | null = null;
  private pendingDataSetPatch: { key: string; rows: string[][] } | null = null;

  readonly doc = signal<StudioDocument | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly panelCollapsed = signal(false);
  readonly activeSection = signal<string | null>('elements');
  readonly pageFilter = signal<StudioPageFilter>('all');
  readonly viewMode = signal<'editor' | 'preview'>('editor');
  readonly previewHtml = signal<string | null>(null);
  readonly previewLoading = signal(false);
  readonly previewError = signal<string | null>(null);
  readonly issuerOrgName = signal('');
  readonly counterparties = signal<Counterparty[]>([]);
  readonly proposals = signal<Proposal[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly contextSaving = signal(false);
  readonly contextSaveError = signal<string | null>(null);
  readonly draftTableRows = signal<string[][]>([]);
  readonly dataSetSaving = signal(false);
  readonly dataSetSaveError = signal<string | null>(null);
  readonly pdfLoading = signal(false);
  readonly finalizing = signal(false);
  readonly templateSaveName = signal('');
  readonly templateKeepBindings = signal(false);
  readonly templateSaving = signal(false);
  readonly templateSaveError = signal<string | null>(null);
  readonly docTypes = signal<DocumentTypeOption[]>([]);

  readonly panelSide = computed(() => studioPanelSide(this.activeSection()));
  readonly panelWide = computed(() => this.activeSection() === 'table');
  readonly panelTitle = computed(() => studioPanelTitle(this.activeSection()));
  readonly orientation = computed<WsOrientation>(() => this.doc()?.orientation ?? 'portrait');
  readonly pageSize = computed(() => this.doc()?.pageSize ?? 'A4');

  readonly counterpartyId = computed(() => {
    const raw = this.doc()?.context?.['counterpartyId'];
    return typeof raw === 'string' ? raw : '';
  });

  readonly quotationId = computed(() => {
    const raw = this.doc()?.context?.['quotationId'];
    return typeof raw === 'string' ? raw : '';
  });

  readonly orderId = computed(() => {
    const raw = this.doc()?.context?.['orderId'];
    return typeof raw === 'string' ? raw : '';
  });

  readonly docTypeId = computed(() => {
    const raw = this.doc()?.docTypeId;
    return typeof raw === 'string' ? raw : '';
  });

  readonly backgroundImages = computed<string[]>(() => {
    const d = this.doc();
    if (!d) return [];
    const all = d.backgroundImage ?? [];
    if (all.length === 0) return [];
    const filter = this.pageFilter();
    const pageNum = filter === 'all' ? 1 : filter;
    const pageIdx = pageNum - 1;
    if (pageIdx >= 0 && pageIdx < all.length) return [all[pageIdx]];
    const defIdx = d.defaultBackgroundIndex ?? -1;
    const safe = defIdx >= 0 && defIdx < all.length ? defIdx : 0;
    return [all[safe]];
  });

  readonly pageCount = computed(() => Math.max(1, this.doc()?.manualPageCount ?? 1));
  readonly selectedBlock = computed(() => this.blocksState.selectedBlock());
  readonly selectedTableBlock = computed(() => {
    const block = this.selectedBlock();
    return block?.type === 'table' ? block : null;
  });

  readonly pageOptions = computed(() => {
    const count = this.pageCount();
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  readonly pageFilterValue = computed(() => {
    const filter = this.pageFilter();
    return filter === 'all' ? 'all' : String(filter);
  });

  readonly layersSorted = computed(() =>
    [...this.blocksState.blocks()]
      .filter((b) => !!b.layout)
      .sort((a, b) => (b.layout!.zIndex ?? 0) - (a.layout!.zIndex ?? 0)),
  );

  readonly canvasBlocks = computed(() => {
    const filter = this.pageFilter();
    if (filter === 'all') return this.blocksState.blocks();
    return this.blocksState.blocks().filter((b) => (b.layout?.page ?? 1) === filter);
  });

  readonly statusText = computed(() => {
    const d = this.doc();
    const save = this.blocksState.saveStatus();
    const mode = this.viewMode() === 'preview' ? 'просмотр' : 'редактор';
    const base = d ? `${d.name} · rev ${d.revision} · ${mode}` : 'Загрузка…';
    if (save === 'saving') return `${base} · сохранение…`;
    if (save === 'saved') return `${base} · сохранено`;
    if (save === 'error') return `${base} · ошибка сохранения`;
    return base;
  });

  readonly canArchive = computed(() => this.doc()?.status === 'draft');

  readonly archiveButtonTitle = computed(() => {
    const d = this.doc();
    if (!d?.sourceTemplateId) return 'Привязать шаблон и отправить в архив';
    return 'В архив';
  });

  private destroyRef: DestroyRef | null = null;

  init(docId: Signal<string>, destroyRef: DestroyRef): void {
    this.destroyRef = destroyRef;
    toObservable(docId)
      .pipe(
        switchMap((id) =>
          this.api.get(id).pipe(
            catchError((err) => {
              this.loadError.set(extractErrorMessage(err));
              this.doc.set(null);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((row) => {
        if (row) {
          this.loadError.set(null);
          this.doc.set(row);
          this.templateSaveName.set(row.name);
          this.blocksState.init(row._id, row.manualPageCount ?? 1, row.revision);
          this.syncPageContext();
          this.loadIssuerOrg(row.organizationId);
          this.handleDeepLinks(row);
        }
      });

    this.templatesSvc.listDocTypes().subscribe((res) => {
      if (res.ok) this.docTypes.set(res.data ?? []);
    });

    this.blocksState.setRevisionConflictHandler(() => this.offerRevisionConflict());
    this.blocksState.setRevisionUpdatedHandler((revision) => {
      const d = this.doc();
      if (d) this.doc.set({ ...d, revision });
    });

    this.counterpartiesApi
      .list({ limit: 200 })
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((res) => {
        if (res.ok) this.counterparties.set(res.data.items ?? []);
      });

    this.proposalsApi
      .list()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((res) => {
        if (res.ok) this.proposals.set(res.data ?? []);
      });

    this.ordersApi
      .list()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((res) => {
        if (res.ok) this.orders.set(res.data ?? []);
      });

    effect(() => {
      const block = this.selectedTableBlock();
      const d = this.doc();
      if (!block || !d) {
        this.draftTableRows.set([]);
        return;
      }
      this.draftTableRows.set(readStudioDataSetRows(d, studioTableDataSetKey(block)));
    });

    toObservable(this.viewMode)
      .pipe(
        debounceTime(300),
        tap((mode) => {
          if (mode === 'preview') this.fetchPreview(docId());
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe();
  }

  setViewMode(mode: 'editor' | 'preview', docId: string): void {
    this.viewMode.set(mode);
    if (mode === 'preview') {
      this.blocksState.clearSelection();
      this.panelCollapsed.set(true);
      this.fetchPreview(docId);
    }
  }

  onImageFile(file: File): void {
    if (this.viewMode() === 'preview') return;
    this.blocksState.addImageBlock(file);
    this.activeSection.set('elements');
    this.panelCollapsed.set(false);
  }

  addTextBlock(): void {
    this.blocksState.addTextBlock();
    this.activeSection.set('elements');
    this.panelCollapsed.set(false);
  }

  addTableBlock(): void {
    this.blocksState.addTableBlock();
    this.activeSection.set('elements');
    this.panelCollapsed.set(false);
  }

  onSelect(block: TemplateBlock): void {
    this.blocksState.selectBlock(block);
    this.activeSection.set('properties');
    this.panelCollapsed.set(false);
  }

  onLayerSelect(block: TemplateBlock): void {
    this.blocksState.selectBlock(block);
    this.panelCollapsed.set(false);
  }

  onCanvasClick(): void {
    this.blocksState.clearSelection();
    this.panelCollapsed.set(true);
  }

  onSheetClick(): void {
    this.blocksState.clearSelection();
    this.panelCollapsed.set(true);
  }

  onContentChange(block: TemplateBlock, content: string): void {
    if (!block._id) return;
    this.blocksState.patchBlock(block._id, { content });
  }

  onTitleChange(block: TemplateBlock, title: string): void {
    if (!block._id) return;
    this.blocksState.patchBlock(block._id, { title });
  }

  onLockChange(block: TemplateBlock, locked: boolean): void {
    if (!block._id) return;
    this.blocksState.toggleLock(block._id, locked);
  }

  toggleLayerLock(block: TemplateBlock): void {
    if (!block._id) return;
    this.blocksState.toggleLock(block._id, !block.locked);
  }

  onPageFilterChange(value: string): void {
    this.pageFilter.set(value === 'all' ? 'all' : Number(value));
    this.syncPageContext();
  }

  addPage(): void {
    const count = this.pageCount();
    this.patchDocument({ manualPageCount: count + 1 }, (updated) => {
      this.blocksState.setPageContext(this.activeEditPage(), updated.manualPageCount ?? count + 1);
    });
  }

  removePage(): void {
    const count = this.pageCount();
    if (count <= 1) return;
    this.patchDocument({ manualPageCount: count - 1 }, (updated) => {
      const next = updated.manualPageCount ?? count - 1;
      const filter = this.pageFilter();
      if (filter !== 'all' && filter > next) {
        this.pageFilter.set(next);
      }
      this.blocksState.setPageContext(this.activeEditPage(), next);
    });
  }

  onPageNumberingChange(enabled: boolean): void {
    this.patchDocument({ pageNumbering: enabled });
  }

  applyLayerZOrder(ids: string[]): void {
    this.blocksState.applyLayerZOrder(ids);
  }

  deleteSelected(): void {
    const block = this.selectedBlock();
    if (block?._id) this.blocksState.deleteBlock(block._id);
  }

  togglePanel(): void {
    this.panelCollapsed.update((v) => !v);
  }

  onSection(sectionId: string): void {
    onStudioSectionClick(
      sectionId as StudioWorkspaceSection,
      this.activeSection,
      this.panelCollapsed,
    );
  }

  onCounterpartyChange(counterpartyId: string): void {
    const d = this.doc();
    if (!d) return;
    this.contextSaving.set(true);
    this.contextSaveError.set(null);
    const nextContext = { ...(d.context ?? {}) };
    if (counterpartyId) {
      nextContext['counterpartyId'] = counterpartyId;
    } else {
      delete nextContext['counterpartyId'];
    }
    this.patchDocument(
      { context: nextContext },
      () => {
        this.contextSaving.set(false);
        this.refreshPreviewIfNeeded();
      },
      (err) => {
        this.contextSaving.set(false);
        this.contextSaveError.set(extractErrorMessage(err));
      },
    );
  }

  onQuotationChange(quotationId: string): void {
    this.patchContextField('quotationId', quotationId);
  }

  onOrderChange(orderId: string): void {
    this.patchContextField('orderId', orderId);
  }

  linkTableToQuotation(block: TemplateBlock): void {
    this.upsertErpDataSet(block, 'quotation-items');
  }

  linkTableToOrder(block: TemplateBlock): void {
    this.upsertErpDataSet(block, 'order-items');
  }

  onTableCellChange(rowIdx: number, colIdx: number, value: string): void {
    this.draftTableRows.update((rows) => {
      const next = rows.map((row) => [...row]);
      while (next.length <= rowIdx) next.push([]);
      const row = next[rowIdx] ?? [];
      row[colIdx] = value;
      next[rowIdx] = row;
      return next;
    });
  }

  addTableRow(): void {
    const block = this.selectedTableBlock();
    if (!block) return;
    const colCount =
      (block.settings as { tableTemplateColumns?: unknown[] } | undefined)?.tableTemplateColumns
        ?.length ?? 1;
    const empty = Array.from({ length: Math.max(colCount, 1) }, () => '');
    this.draftTableRows.update((rows) => [...rows, empty]);
  }

  removeTableRow(rowIdx: number): void {
    this.draftTableRows.update((rows) => rows.filter((_, i) => i !== rowIdx));
  }

  saveTableDataSet(): void {
    const block = this.selectedTableBlock();
    const d = this.doc();
    if (!block || !d) return;
    const key = studioTableDataSetKey(block);
    const rows = this.draftTableRows().map((row) => [...row]);
    this.dataSetSaving.set(true);
    this.dataSetSaveError.set(null);
    this.api
      .putDataSet(d._id, key, {
        expectedRevision: d.revision,
        dataSet: { source: { type: 'manual' }, rows },
      })
      .subscribe({
        next: (updated) => {
          this.dataSetSaving.set(false);
          this.doc.set(updated);
        },
        error: (err: HttpErrorResponse) => {
          this.dataSetSaving.set(false);
          if (this.isRevisionConflict(err)) {
            this.pendingDataSetPatch = { key, rows: this.draftTableRows().map((row) => [...row]) };
            this.offerRevisionConflict();
            return;
          }
          this.dataSetSaveError.set(extractErrorMessage(err));
        },
      });
  }

  onDownloadPdf(): void {
    const d = this.doc();
    if (!d) return;
    this.pdfLoading.set(true);
    this.api.downloadPdf(d._id).subscribe({
      next: (blob) => {
        this.pdfLoading.set(false);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = buildStudioPdfFilename(d.name, d._id);
        anchor.click();
        URL.revokeObjectURL(url);
        this.toast.success('PDF подготовлен');
      },
      error: () => {
        this.pdfLoading.set(false);
        this.toast.error('Сервис печати недоступен, используйте Печать в браузере.');
      },
    });
  }

  onFinalize(): void {
    const d = this.doc();
    if (!d || d.status !== 'draft') return;
    if (!d.sourceTemplateId) {
      this.openTemplateLinkForArchive();
      return;
    }
    this.doFinalize();
  }

  onDocTypeChange(docTypeId: string): void {
    this.patchDocument({ docTypeId: docTypeId || undefined });
  }

  applyImageFullPage(block: TemplateBlock): void {
    if (!block._id || !block.layout || block.locked) return;
    const settings = {
      ...(block.settings as Record<string, unknown> | undefined),
      overlay: true,
    };
    const layout = normalizeBlockLayout({
      ...block.layout,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      zIndex: 0,
    });
    this.blocksState.patchBlock(block._id, { settings });
    this.blocksState.onLayoutChanges([{ block: { ...block, settings }, layout }]);
  }

  sendImageToBack(block: TemplateBlock): void {
    if (!block._id || block.locked) return;
    this.blocksState.sendToBack(block._id);
  }

  onSaveAsTemplate(): void {
    const d = this.doc();
    const name = this.templateSaveName().trim();
    if (!d || !name) return;
    if (!d.docTypeId) {
      this.templateSaveError.set('Выберите тип документа');
      return;
    }
    this.templateSaving.set(true);
    this.templateSaveError.set(null);
    this.api
      .saveAsTemplate(d._id, { name, keepDataBindings: this.templateKeepBindings() })
      .subscribe({
        next: (template) => {
          this.templateSaving.set(false);
          this.toast.success('Шаблон сохранён', {
            description: `Открыть список: /doc-constructor/templates (${template.name})`,
          });
        },
        error: (err: HttpErrorResponse) => {
          this.templateSaving.set(false);
          this.templateSaveError.set(extractErrorMessage(err));
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  patchDocument(
    patch: Omit<UpdateStudioDocumentPayload, 'expectedRevision'>,
    onSuccess?: (doc: StudioDocument) => void,
    onError?: (err: HttpErrorResponse) => void,
  ): void {
    const d = this.doc();
    if (!d) return;
    this.api.patch(d._id, { ...patch, expectedRevision: d.revision }).subscribe({
      next: (updated) => {
        this.doc.set(updated);
        this.blocksState.setRevision(updated.revision);
        onSuccess?.(updated);
      },
      error: (err: HttpErrorResponse) => {
        if (this.isRevisionConflict(err)) {
          this.pendingDocumentPatch = patch;
          this.offerRevisionConflict();
          onError?.(err);
          return;
        }
        if (onError) {
          onError(err);
        } else {
          this.toast.error(extractErrorMessage(err));
        }
      },
    });
  }

  private fetchPreview(docId: string): void {
    if (!docId) return;
    this.previewLoading.set(true);
    this.previewError.set(null);
    this.api.preview(docId).subscribe({
      next: (res) => {
        this.previewLoading.set(false);
        this.previewHtml.set(res.html);
      },
      error: (err) => {
        this.previewLoading.set(false);
        this.previewError.set(extractErrorMessage(err));
      },
    });
  }

  private activeEditPage(): number {
    const filter = this.pageFilter();
    return filter === 'all' ? 1 : filter;
  }

  private syncPageContext(): void {
    this.blocksState.setPageContext(this.activeEditPage(), this.pageCount());
  }

  private loadIssuerOrg(organizationId: string): void {
    this.orgsApi.findById(organizationId).subscribe((res) => {
      this.issuerOrgName.set(res.ok ? res.data.name : organizationId);
    });
  }

  private patchContextField(field: 'quotationId' | 'orderId', value: string): void {
    const d = this.doc();
    if (!d) return;
    this.contextSaving.set(true);
    this.contextSaveError.set(null);
    const nextContext = { ...(d.context ?? {}) };
    if (value) {
      nextContext[field] = value;
    } else {
      delete nextContext[field];
    }
    this.patchDocument(
      { context: nextContext },
      () => {
        this.contextSaving.set(false);
        this.refreshPreviewIfNeeded();
      },
      (err) => {
        this.contextSaving.set(false);
        this.contextSaveError.set(extractErrorMessage(err));
      },
    );
  }

  private upsertErpDataSet(
    block: TemplateBlock,
    sourceType: 'quotation-items' | 'order-items',
  ): void {
    const d = this.doc();
    if (!d) return;
    const key = studioTableDataSetKey(block);
    this.dataSetSaving.set(true);
    this.dataSetSaveError.set(null);
    this.api
      .putDataSet(d._id, key, {
        expectedRevision: d.revision,
        dataSet: { source: { type: sourceType }, rows: [] },
      })
      .subscribe({
        next: (updated) => {
          this.dataSetSaving.set(false);
          this.doc.set(updated);
          this.refreshPreviewIfNeeded();
        },
        error: (err: HttpErrorResponse) => {
          this.dataSetSaving.set(false);
          if (this.isRevisionConflict(err)) {
            this.offerRevisionConflict();
            return;
          }
          this.dataSetSaveError.set(extractErrorMessage(err));
        },
      });
  }

  private refreshPreviewIfNeeded(): void {
    if (this.viewMode() === 'preview') {
      const d = this.doc();
      if (d) this.fetchPreview(d._id);
    }
  }

  private doFinalize(): void {
    const d = this.doc();
    if (!d?.sourceTemplateId) return;
    this.finalizing.set(true);
    this.api.finalize(d._id).subscribe({
      next: (res) => {
        this.finalizing.set(false);
        this.doc.set(res.studioDocument);
        this.toast.success('Документ отправлен в архив', {
          description: 'Смотрите в разделе «Документы»: /doc-constructor/documents',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.finalizing.set(false);
        if (this.isRevisionConflict(err)) {
          this.offerRevisionConflict();
          return;
        }
        this.toast.error(extractErrorMessage(err));
      },
    });
  }

  private openTemplateLinkForArchive(): void {
    const ref = this.dialog.open<DocumentTemplate>(StudioTemplatePickDialogComponent, {
      width: 'md',
      parentDestroyRef: this.destroyRef ?? undefined,
    });
    onDialogCloseOnce(ref, this.injector, (template) => {
      this.patchDocument(
        { sourceTemplateId: template._id },
        () => this.doFinalize(),
        (err) => this.toast.error(extractErrorMessage(err)),
      );
    });
  }

  private handleDeepLinks(doc: StudioDocument): void {
    if (this.deepLinksHandled) return;
    this.deepLinksHandled = true;
    const fromTemplate = this.route.snapshot.queryParamMap.get('fromTemplate');
    const quotationId = this.route.snapshot.queryParamMap.get('quotationId');
    if (!fromTemplate && !quotationId) return;
    if (fromTemplate && !doc.sourceTemplateId) {
      this.patchDocument({ sourceTemplateId: fromTemplate });
    }
    if (quotationId) {
      this.prefillFromQuotation(quotationId);
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...(fromTemplate ? { fromTemplate: null } : {}),
        ...(quotationId ? { quotationId: null } : {}),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private prefillFromQuotation(quotationId: string): void {
    this.proposalsApi.findById(quotationId).subscribe((res) => {
      if (!res.ok) return;
      const cp = res.data.counterpartyId;
      const cpId = typeof cp === 'string' ? cp : cp?._id;
      if (!cpId) return;
      const d = this.doc();
      if (!d || d.context?.['counterpartyId']) return;
      this.onCounterpartyChange(cpId);
      this.activeSection.set('data');
      this.panelCollapsed.set(false);
    });
  }

  private offerRevisionConflict(): void {
    const ref = this.dialog.open<StudioRevisionConflictAction>(
      StudioRevisionConflictDialogComponent,
      {
        data: {
          title: 'Документ изменён',
          description:
            'Документ был изменён в другой вкладке. Обновить с сервера или сохранить ваши правки в копии?',
        },
        width: 'sm',
        parentDestroyRef: this.destroyRef ?? undefined,
      },
    );
    toObservable(ref.closed, { injector: this.injector })
      .pipe(
        filter((v): v is StudioRevisionConflictAction => !!v),
        take(1),
        takeUntilDestroyed(this.destroyRef!),
      )
      .subscribe((action) => {
        const docPatch = this.pendingDocumentPatch;
        const dataSetPatch = this.pendingDataSetPatch;
        this.pendingDocumentPatch = null;
        this.pendingDataSetPatch = null;
        if (action === 'reload') {
          this.reloadDocument();
        } else if (action === 'save-copy') {
          this.saveCopyWithPendingPatch(docPatch, dataSetPatch);
        }
      });
  }

  private reloadDocument(): void {
    const d = this.doc();
    if (!d) return;
    this.api.get(d._id).subscribe({
      next: (row) => {
        this.doc.set(row);
        this.blocksState.setRevision(row.revision);
        this.blocksState.load();
        this.blocksState.setPageContext(this.activeEditPage(), row.manualPageCount ?? 1);
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
    });
  }

  private saveCopyWithPendingPatch(
    docPatch: Omit<UpdateStudioDocumentPayload, 'expectedRevision'> | null,
    dataSetPatch: { key: string; rows: string[][] } | null,
  ): void {
    const d = this.doc();
    if (!d) return;
    this.api.duplicate(d._id).subscribe({
      next: (copy) => {
        if (docPatch) {
          this.api.patch(copy._id, { ...docPatch, expectedRevision: copy.revision }).subscribe({
            next: (updated) => this.finishSaveCopy(updated, dataSetPatch),
            error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
          });
          return;
        }
        this.finishSaveCopy(copy, dataSetPatch);
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
    });
  }

  private finishSaveCopy(
    copy: StudioDocument,
    dataSetPatch: { key: string; rows: string[][] } | null,
  ): void {
    if (dataSetPatch) {
      this.api
        .putDataSet(copy._id, dataSetPatch.key, {
          expectedRevision: copy.revision,
          dataSet: { source: { type: 'manual' }, rows: dataSetPatch.rows },
        })
        .subscribe({
          next: () => {
            this.toast.success('Копия создана с вашими изменениями');
            void this.router.navigate(['/doc-constructor/studio', copy._id]);
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
        });
      return;
    }
    this.toast.success('Копия создана');
    void this.router.navigate(['/doc-constructor/studio', copy._id]);
  }

  private isRevisionConflict(err: HttpErrorResponse): boolean {
    if (err.status !== 409) return false;
    const body = err.error as { code?: string } | null;
    return body?.code === STUDIO_DOCUMENT_REVISION_CONFLICT;
  }
}

function buildStudioPdfFilename(name: string, id: string): string {
  const trimmed = name.trim();
  const base =
    trimmed.length > 0
      ? // eslint-disable-next-line no-control-regex -- strip illegal filename chars incl. control codes
        trimmed.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120)
      : `studio-${id.slice(0, 8)}`;
  return `${base}.pdf`;
}
