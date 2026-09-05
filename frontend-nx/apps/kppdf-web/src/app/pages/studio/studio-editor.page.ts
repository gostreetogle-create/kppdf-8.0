import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  FileStack,
  FileText,
  Layers,
  LayoutTemplate,
  LucideAngularModule,
  Settings2,
} from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import {
  PiCounterpartiesService,
  PiDocTypesService,
  PiOrdersService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioBlocksService,
  PiStudioDocumentsService,
  type Counterparty,
  type DocType,
  type Order,
  type Quotation,
  type QuotationStatus,
  type StudioBlock,
  type StudioBlockLayout,
  type StudioBlockStyle,
  type StudioDocument,
  type TableTemplate,
  type TextBlock,
} from '@kppdf/data-access';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { extractErrorMessage } from '@kppdf/util-http';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { TableTemplateFormDialogComponent } from '../../doc-studio/dialogs/table-template-form-dialog.component';
import { TextBlockFormDialogComponent } from '../../doc-studio/dialogs/text-block-form-dialog.component';
import { StudioBlocksCanvasComponent } from './studio-blocks-canvas.component';
import { StudioDataPanelComponent } from './studio-data-panel.component';
import { StudioPagesPanelComponent } from './studio-pages-panel.component';
import {
  StudioUnsavedChangesDialogComponent,
  type StudioUnsavedChangesChoice,
} from './studio-unsaved-changes-dialog.component';
import type { StudioCatalogSelections, StudioShowcaseKind } from './studio-data-vitrina.component';
import { StudioElementsPanelComponent } from './studio-elements-panel.component';
import { StudioLayersPanelComponent } from './studio-layers-panel.component';
import { StudioPropertiesPanelComponent } from './studio-properties-panel.component';
import {
  StudioRenameDocumentDialogComponent,
  type StudioRenameDocumentResult,
} from './studio-rename-document-dialog.component';
import {
  StudioSaveAsTemplateDialogComponent,
  type StudioSaveAsTemplateResult,
} from './studio-save-as-template-dialog.component';
import { StudioTemplatePanelComponent } from './studio-template-panel.component';
import {
  onStudioSectionClick,
  studioPanelSide,
  studioPanelTitle,
  type StudioWorkspaceSection,
} from './studio-workspace-chrome';
import { StudioWorkspaceShellComponent } from './studio-workspace-shell.component';
import {
  studioBlockIsPassportBackground,
  studioImageSettingsForUpdate,
  studioMergeBlockSettings,
} from './studio-block-helpers';
import {
  coerceStudioBlockLayout,
  normalizeStudioBlockLayout,
  studioCenteredImageLayout,
  studioCenteredTableLayout,
  studioCenteredTextLayout,
  studioImageForegroundLayout,
  studioImageLayoutFromNaturalSize,
  studioReadImageNaturalSize,
  studioStaggerImageLayout,
  zIndexFromLayerOrder,
} from './studio-layout';
import { isKpDocType } from './studio-kp-doc-type';
import { rememberStudioDocument } from './studio-session';
import {
  STUDIO_DEFAULT_TABLE_COLUMNS,
  STUDIO_DEFAULT_TABLE_ROWS,
  buildTableTemplatePayloadFromBlock,
} from './studio-table-defaults';
import { studioTextBlockSlug } from './studio-text-helpers';

const STUDIO_TOOL_OWNER = 'studio-editor';

/** Mirrors backend LIVE_HYDRATABLE_SOURCE_TYPES (studio-document.service.ts). */
const STUDIO_LIVE_HYDRATABLE_SOURCE_TYPES = new Set([
  'quotation-items',
  'order-items',
  'catalog-products',
  'catalog-modules',
  'catalog-parts',
  'catalog-materials',
]);

@Component({
  selector: 'pi-studio-editor-page',
  standalone: true,
  imports: [
    StudioWorkspaceShellComponent,
    StudioBlocksCanvasComponent,
    StudioDataPanelComponent,
    StudioPagesPanelComponent,
    StudioElementsPanelComponent,
    StudioLayersPanelComponent,
    StudioPropertiesPanelComponent,
    StudioTemplatePanelComponent,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (document(); as doc) {
      <!-- Desktop rail is off (showDesktopRail=false below); railItems stays [] on purpose.
           Section titles still come from STUDIO_RAIL_ITEMS via studioPanelTitle(). -->
      <pi-studio-workspace-shell
        class="studio-editor-shell"
        data-test="studio-shell"
        [orientation]="doc.orientation === 'landscape' ? 'landscape' : 'portrait'"
        [panelCollapsed]="panelCollapsed()"
        [activeSection]="activeSection()"
        [panelSide]="panelSide()"
        [panelTitle]="panelTitle()"
        [railItems]="[]"
        [showDesktopRail]="false"
        [badgeText]="doc.name"
        [totalText]="'Страниц: ' + pageCount()"
        [statusText]="statusText()"
        [pageLabel]="currentPage() + ' / ' + pageCount()"
        [sheetHost]="false"
        [panelWide]="activeSection() === 'data'"
        [zoomMode]="zoomMode()"
        (fitZoom)="setZoomMode('fit')"
        (actualZoom)="setZoomMode('100')"
        (sectionChange)="onSection($event)"
        (panelToggle)="togglePanel()"
        (sheetClick)="onSheetClick()"
      >
        <div kpWsRibbonExtra class="studio-ribbon-extra">
          <button
            type="button"
            class="ribbon-label ribbon-label--rename"
            data-test="studio-rename"
            title="Переименовать"
            (click)="openRenameDialog()"
          >
            {{ doc.name }}
          </button>
        </div>

        <div kpWsRibbonActions class="studio-ribbon-actions">
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            data-test="studio-open-list"
            (click)="openDocumentList()"
          >
            К списку
          </button>
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            [class.kp-ws-ribbon-btn--active]="viewMode() === 'editor'"
            (click)="setViewMode('editor')"
          >
            Редактор
          </button>
          <button type="button" class="kp-ws-ribbon-btn" data-test="studio-save" [disabled]="saving()" (click)="saveDocument()">Сохранить</button>
          <button type="button" class="kp-ws-ribbon-btn" data-test="studio-save-as" [disabled]="templateSaving()" (click)="openSaveAsTemplateDialog()">Сохранить как…</button>
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            [class.kp-ws-ribbon-btn--active]="viewMode() === 'preview'"
            data-test="studio-view-preview"
            (click)="setViewMode('preview')"
          >
            Просмотр
          </button>
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            data-test="studio-download-pdf"
            [disabled]="pdfLoading()"
            (click)="onDownloadPdf()"
          >
            {{ pdfLoading() ? 'PDF…' : 'PDF' }}
          </button>
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            data-test="studio-finalize"
            [disabled]="finalizing() || doc.status !== 'draft'"
            [attr.title]="doc.status !== 'draft' ? 'Уже в архиве' : 'Отправить в архив'"
            (click)="onFinalize()"
          >
            {{ finalizing() ? 'В архив…' : 'В архив' }}
          </button>
        </div>

        <div kpWsPanel class="studio-panel-inner text-sm" (click)="$event.stopPropagation()">
          @switch (activeSection()) {
            @case ('elements') {
              <pi-studio-elements-panel
                [activeLayerId]="activeLayerId()"
                [previewMode]="viewMode() === 'preview'"
                (addText)="addTextToActiveLayer()"
                (addTable)="addTableLayer()"
                (imageFile)="addImageToActiveLayer($event)"
              />
            }
            @case ('pages') {
              <pi-studio-pages-panel
                [pageCount]="pageCount()"
                [currentPage]="currentPage()"
                [pageNumbering]="pageNumbering()"
                [backgroundImages]="backgroundImages()"
                [backgroundIndex]="backgroundIndex()"
                [backgroundOpacity]="backgroundOpacity()"
                [orientation]="doc.orientation === 'landscape' ? 'landscape' : 'portrait'"
                (pageChange)="goToPage($event)"
                (addPage)="addPage()"
                (previousPage)="prevPage()"
                (nextPage)="nextPage()"
                (pageNumberingChange)="togglePageNumbering($event)"
                (backgroundChange)="setBackgroundIndex($event)"
                (backgroundOpacityChange)="setBackgroundOpacity($event)"
                (orientationChange)="setOrientation($event)"
              />
            }
            @case ('data') {
              <pi-studio-data-panel
                [issuerOrgName]="issuerOrgName()"
                [counterpartyId]="counterpartyId()"
                [payerId]="payerId()"
                [supplierId]="supplierId()"
                [quotationId]="quotationId()"
                [orderId]="orderId()"
                [counterparties]="counterparties()"
                [quotations]="quotations()"
                [orders]="orders()"
                [selectedAnchors]="selectedAnchorLabels()"
                [catalogChips]="catalogChipLabels()"
                [catalogSelections]="catalogSelections()"
                [catalogWriteBusy]="catalogWriteBusy()"
                [contextSaving]="contextSaving()"
                [contextSaveError]="contextSaveError()"
                [showKpStatus]="isKpDoc()"
                [quotationStatus]="linkedQuotationStatus()"
                (counterpartyChange)="onCounterpartyChange($event)"
                (payerChange)="onAnchorChange('payer', $event)"
                (supplierChange)="onAnchorChange('supplier', $event)"
                (catalogRemove)="removeCatalogChip($event)"
                (catalogChange)="onCatalogSelectionChange($event)"
                (insertTable)="insertCatalogTable($event)"
                (quotationChange)="onQuotationChange($event)"
                (quotationStatusChange)="onQuotationStatusChange($event)"
                (orderChange)="onOrderChange($event)"
              />
            }
            @case ('selected') {
              <pi-studio-data-panel
                mode="selected"
                [selectedAnchors]="selectedAnchorLabels()"
                [catalogChips]="catalogChipLabels()"
                [catalogSelections]="catalogSelections()"
                [catalogWriteBusy]="catalogWriteBusy()"
                (catalogRemove)="removeCatalogChip($event)"
                (insertTable)="insertCatalogTable($event)"
              />
            }
            @case ('template') {
              <pi-studio-template-panel
                [docTypeId]="docTypeId()"
                [docTypes]="docTypes()"
                [docTypeSaving]="docTypeSaving()"
                [saving]="templateSaving()"
                (docTypeChange)="onDocTypeChange($event)"
                (saveAsTemplate)="openSaveAsTemplateDialog()"
              />
            }
            @case ('layers') {
              <pi-studio-layers-panel
                [blocks]="layersForPage()"
                [activeLayerId]="activeLayerId()"
                (addLayer)="addLayer()"
                (activateLayer)="activateLayer($event)"
                (openProperties)="openLayerProperties($event)"
                (layerReorder)="applyLayerZOrder($event)"
                (toggleLock)="toggleLock($event)"
                (toggleVisible)="toggleVisible($event)"
                (deleteLayer)="deleteLayerById($event)"
              />
            }
            @case ('properties') {
              <pi-studio-properties-panel
                [block]="propertiesBlock()"
                [quotationId]="quotationId()"
                [orderId]="orderId()"
                (styleChange)="patchBlockStyle($event)"
                (contentChange)="patchBlockContent($event)"
                (titleChange)="patchBlockTitle($event)"
                (imageAsBackground)="setImageAsBackground()"
                (imageClearBackground)="clearImageBackground()"
                (deleteLayer)="deleteLayerById(propertiesBlock()?._id)"
                (tableSettingsChange)="patchTableSettings($event)"
                (tableSourceChange)="onTableSourceChange($event)"
                (saveTableTemplate)="openSaveTableTemplateDialog()"
                (applyLibraryText)="applyLibraryText($event)"
                (saveTextBlock)="openSaveTextBlockDialog()"
              />
            }
          }
        </div>

        <div kpWsSheet class="studio-canvas-host" #sheetHost>
          @if (viewMode() === 'preview') {
            @if (previewLoading()) {
              <p class="preview-state" data-test="studio-preview-loading">Формирование просмотра…</p>
            } @else if (previewError(); as err) {
              <p class="preview-state preview-state--error" data-test="studio-preview-error">{{ err }}</p>
            } @else if (previewSafeHtml(); as html) {
              <iframe
                class="studio-preview-frame"
                data-test="studio-preview-frame"
                sandbox="allow-same-origin"
                [srcdoc]="html"
              ></iframe>
            }
          } @else {
            <pi-studio-blocks-canvas
              [blocks]="pageBlocks()"
              [selectedId]="selectedId()"
              [activeLayerId]="activeLayerId()"
              [currentPage]="currentPage()"
              [sheetWidth]="sheetSize().width"
              [sheetHeight]="sheetSize().height"
              [readOnly]="false"
              (selected)="onSelect($event)"
              (layoutChanged)="changeLayout($event.id, $event.layout)"
              (layoutCommit)="onLayoutCommit()"
              (contentChanged)="patchBlockContentFromCanvas($event.id, $event.content)"
              (textDoubleClick)="openLayerProperties($event)"
              (tableRowsChange)="patchTableRows($event)"
              (tableDisabledRowsChange)="patchTableDisabledRows($event)"
            />
          }
        </div>
      </pi-studio-workspace-shell>
    } @else {
      <div class="studio-loading">Загрузка документа…</div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: calc(100dvh - var(--header-h));
      height: calc(100dvh - var(--header-h));
    }
    .studio-editor-shell { flex: 1; min-height: 0; }
    .studio-loading { padding: 24px; color: var(--color-muted-foreground); }
    .studio-ribbon-extra,
    .studio-ribbon-actions {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1, 4px);
      flex-shrink: 0;
      height: 100%;
    }
    .studio-ribbon-extra {
      padding-right: var(--space-1, 4px);
    }
    .studio-ribbon-actions {
      border-left: 1px solid var(--color-rule);
      padding-left: var(--space-2, 8px);
      margin-left: var(--space-1, 4px);
    }
    .ribbon-label {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-muted-foreground);
      line-height: 1;
    }
    .ribbon-label--rename {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      font: inherit;
    }
    .ribbon-label--rename:hover {
      color: var(--color-foreground);
      text-decoration: underline;
    }
    .page-nav {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1, 4px);
      height: var(--kp-ribbon-control-h, 26px);
      padding: 0 var(--space-1, 4px);
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm, 2px);
      background: var(--color-paper-raised);
    }
    .page-nav__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-ribbon-control-h, 26px);
      height: var(--kp-ribbon-control-h, 26px);
      padding: 0;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm, 2px);
      background: var(--color-paper-2);
      color: var(--color-ink);
      cursor: pointer;
    }
    .page-nav__btn:disabled { opacity: 0.35; cursor: default; }
    .page-nav__btn:not(:disabled):hover { background: var(--color-paper-3); }
    .page-nav__label {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      font-variant-numeric: tabular-nums;
      color: var(--color-ink);
      min-width: 6.5rem;
      text-align: center;
      line-height: 1;
    }
    .page-geometry-control { display:inline-flex; align-items:center; gap:4px; font-size:11px; color:var(--color-muted-foreground); }
    .page-geometry-control select { max-width:90px; }
    .studio-canvas-host {
      position: relative; width: 100%; height: 100%; min-height: 0;
      background: #fff;
    }
    .studio-preview-frame {
      width: 100%; height: 100%; border: none; background: #fff;
    }
    .preview-state {
      margin: 0; padding: 24px; font-size: 13px; color: var(--color-muted-foreground);
    }
    .preview-state--error { color: var(--color-destructive); }
  `],
})
export class StudioEditorPage implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documents = inject(PiStudioDocumentsService);
  private readonly blocksService = inject(PiStudioBlocksService);
  private readonly counterpartiesApi = inject(PiCounterpartiesService);
  private readonly quotationsApi = inject(PiQuotationsService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly orgsApi = inject(PiOrganizationsService);
  private readonly docTypesApi = inject(PiDocTypesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly shellTools = inject(ShellToolRailService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly sheetHostRef = viewChild<ElementRef<HTMLElement>>('sheetHost');
  private timer?: number;
  private conflictDialogOpen = false;
  private layoutSavePromise: Promise<boolean> | null = null;
  private layoutsDirty = false;
  private readonly pendingBlockPatches = signal(0);
  private resizeObserver?: ResizeObserver;
  private readonly onStudioBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!this.isStudioDirty()) return;
    event.preventDefault();
    event.returnValue = '';
  };
  private readonly onStudioKeydown = (event: KeyboardEvent): void => {
    if (!(event.ctrlKey || event.metaKey) || (event.key !== 'z' && event.key !== 'y')) return;
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[contenteditable="true"]')) return;
    const editor = target.closest('pi-rich-text-editor') as { undo?: () => void; redo?: () => void } | null;
    if (!editor) return;
    event.preventDefault();
    if (event.key === 'z') editor.undo?.(); else editor.redo?.();
  };

  readonly document = signal<StudioDocument | null>(null);
  readonly issuerOrgName = signal('');
  readonly counterparties = signal<Counterparty[]>([]);
  readonly quotations = signal<Quotation[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly contextSaving = signal(false);
  readonly contextSaveError = signal<string | null>(null);
  readonly catalogSelections = signal<{ products: readonly string[]; modules: readonly string[]; parts: readonly string[]; materials: readonly string[] }>({ products: [], modules: [], parts: [], materials: [] });
  /** TZ-NX-DOCSTUDIO-S41 — true while the catalog write queue has a PATCH context / putDataSet in flight. */
  readonly catalogWriteBusy = signal(false);
  /** TZ-NX-DOCSTUDIO-S41 — serializes vitrina writes so putDataSet always uses the revision from the PATCH it followed, never a stale one raced against it. */
  private catalogWriteChain: Promise<void> = Promise.resolve();
  private catalogWritePending = 0;
  readonly blocks = signal<readonly StudioBlock[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly activeLayerId = signal<string | null>(null);
  readonly activeSection = signal<StudioWorkspaceSection | null>('data');
  readonly panelCollapsed = signal(false);
  readonly viewMode = signal<'editor' | 'preview'>('editor');
  readonly previewHtml = signal<string | null>(null);
  readonly previewLoading = signal(false);
  readonly previewError = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly sheetSize = signal({ width: 800, height: 566 });
  readonly zoomMode = signal<'fit' | '100'>('fit');
  readonly templateSaving = signal(false);
  readonly saving = signal(false);
  readonly docTypes = signal<DocType[]>([]);
  readonly docTypeSaving = signal(false);
  readonly pdfLoading = signal(false);
  readonly finalizing = signal(false);

  readonly selectedBlock = computed(() => {
    const id = this.selectedId();
    return id ? this.blocks().find((b) => b._id === id) ?? null : null;
  });

  readonly propertiesBlock = computed(() => this.selectedBlock() ?? this.activeLayerBlock());

  readonly previewSafeHtml = computed<SafeHtml | null>(() => {
    const html = this.previewHtml();
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });

  readonly catalogChipLabels = computed(() => {
    const selections = this.catalogSelections();
    return (['products', 'modules', 'parts', 'materials'] as const)
      .filter((key) => selections[key].length > 0)
      .map((key) => ({ key, label: ({ products: 'изделия', modules: 'модули', parts: 'детали', materials: 'материалы' } as const)[key], count: selections[key].length }));
  });

  readonly selectedAnchorLabels = computed(() => {
    const context = this.document()?.context ?? {};
    const anchors = (context['anchors'] as Record<string, unknown> | undefined) ?? {};
    const labels: Record<string, string> = { client: 'Клиент', payer: 'Плательщик', supplier: 'Поставщик' };
    const result: { key: string; label: string; name: string }[] = [];
    for (const key of Object.keys(labels)) {
      const item = anchors[key] as Record<string, unknown> | undefined;
      const id = typeof item?.['entityId'] === 'string' ? item['entityId'] as string : key === 'client' ? this.counterpartyId() : '';
      if (!id) continue;
      const cp = this.counterparties().find((candidate) => candidate._id === id);
      const name = cp?.shortName || cp?.name || id;
      result.push({ key, label: labels[key], name });
    }
    if (result.length === 0 && this.counterpartyId()) {
      const cp = this.counterparties().find((candidate) => candidate._id === this.counterpartyId());
      result.push({ key: 'client', label: 'Клиент', name: cp?.shortName || cp?.name || this.counterpartyId() });
    }
    return result;
  });

  readonly counterpartyId = computed(() => {
    const raw = this.document()?.context?.['counterpartyId'];
    return typeof raw === 'string' ? raw : '';
  });
  readonly payerId = computed(() => this.anchorId('payer'));
  readonly supplierId = computed(() => this.anchorId('supplier'));

  private anchorId(key: string): string {
    const anchors = this.document()?.context?.['anchors'];
    const value = anchors && typeof anchors === 'object' ? (anchors as Record<string, unknown>)[key] : undefined;
    return value && typeof value === 'object' && typeof (value as Record<string, unknown>)['entityId'] === 'string'
      ? String((value as Record<string, unknown>)['entityId'])
      : '';
  }

  readonly quotationId = computed(() => {
    const raw = this.document()?.context?.['quotationId'];
    return typeof raw === 'string' ? raw : '';
  });
  readonly orderId = computed(() => {
    const raw = this.document()?.context?.['orderId'];
    return typeof raw === 'string' ? raw : '';
  });
  readonly docTypeId = computed(() => {
    const raw = this.document()?.docTypeId;
    return typeof raw === 'string' ? raw : '';
  });
  readonly isKpDoc = computed(() => {
    const id = this.docTypeId();
    if (!id) return false;
    const docType = this.docTypes().find((item) => item._id === id);
    return isKpDocType(docType);
  });
  readonly linkedQuotationStatus = signal<QuotationStatus>('draft');

  readonly selectedBufferCount = computed(() =>
    this.selectedAnchorLabels().length + this.catalogChipLabels().reduce((sum, chip) => sum + chip.count, 0),
  );

  readonly panelSide = computed(() => studioPanelSide(this.activeSection()));

  readonly pageNumbering = computed(() => this.document()?.pageNumbering === true);
  readonly backgroundImages = computed(() => this.document()?.backgroundImage ?? []);
  readonly backgroundIndex = computed(() => this.document()?.backgroundPageIndices?.[this.currentPage() - 1] ?? this.document()?.defaultBackgroundIndex ?? -1);
  readonly backgroundOpacity = computed(() => this.document()?.backgroundOpacity ?? 0.3);

  readonly pageCount = computed(() => {
    const doc = this.document();
    if (!doc) return 1;
    const manual = doc.manualPageCount ?? 1;
    const fromBlocks = this.blocks().reduce((max, b) => Math.max(max, b.layout?.page ?? 1), 1);
    return Math.max(manual, fromBlocks);
  });

  readonly pageBlocks = computed(() =>
    this.blocks().filter((b) => (b.layout?.page ?? 1) === this.currentPage()),
  );

  readonly layersForPage = computed(() => this.pageBlocks());

  readonly panelTitle = computed(() => {
    const section = this.activeSection();
    const page = this.currentPage();
    if (section === 'layers') return `Слои · страница ${page}`;
    if (section === 'properties') {
      const layer = this.propertiesBlock();
      if (!layer) return 'Свойства слоя';
      const name = layer.title?.trim() || 'Без названия';
      return `Свойства: «${name}»`;
    }
    if (section === 'elements') return 'Элементы';
    if (section === 'pages') return 'Страницы';
    if (section === 'data') return 'Данные';
    if (section === 'selected') return 'Выбрано';
    if (section === 'template') return 'Шаблон';
    return studioPanelTitle(section);
  });

  readonly activeLayerBlock = computed(() => {
    const id = this.activeLayerId();
    return id ? this.blocks().find((b) => b._id === id) ?? null : null;
  });

  protected readonly chevronLeft = ChevronLeft;
  protected readonly chevronRight = ChevronRight;
  readonly statusText = computed(() => {
    if (this.viewMode() === 'preview') return 'Режим просмотра';
    const layerId = this.activeLayerId();
    const layer = layerId ? this.blocks().find((b) => b._id === layerId) : null;
    if (layer) return `Активный слой: ${layer.title || layer.content || 'Текст'}`;
    return 'Выберите слой в панели «Слои»';
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void firstValueFrom(this.documents.getById(id)).then((r) => {
        if (r.ok) {
          rememberStudioDocument(r.data._id);
          this.document.set(r.data);
          this.refreshLinkedQuotationStatus(r.data);
          const selections = r.data.context?.['catalogSelections'];
          if (selections && typeof selections === 'object') {
            this.catalogSelections.set({
              products: Array.isArray((selections as Record<string, unknown>)['products']) ? (selections as Record<string, unknown>)['products'] as string[] : [],
              modules: Array.isArray((selections as Record<string, unknown>)['modules']) ? (selections as Record<string, unknown>)['modules'] as string[] : [],
              parts: Array.isArray((selections as Record<string, unknown>)['parts']) ? (selections as Record<string, unknown>)['parts'] as string[] : [],
              materials: Array.isArray((selections as Record<string, unknown>)['materials']) ? (selections as Record<string, unknown>)['materials'] as string[] : [],
            });
          }
          this.loadIssuerOrg(r.data.organizationId);
          void firstValueFrom(this.blocksService.list(id)).then((b) => {
            if (b.ok) {
              const normalized = b.data.map((block) =>
                block.layout
                  ? { ...block, layout: coerceStudioBlockLayout(block.layout) }
                  : block,
              );
              this.blocks.set(normalized);
              this.pickDefaultLayer(
                normalized.filter((b) => (b.layout?.page ?? 1) === this.currentPage()),
              );
              this.activeSection.set('data');
              this.panelCollapsed.set(false);
              this.refreshLiveDataSetsOnLoad(normalized);
            }
          });
          const routeQuotationId = this.route.snapshot.queryParamMap.get('quotationId');
          if (routeQuotationId && !this.quotationId()) {
            this.onQuotationChange(routeQuotationId);
          }
        }
      });
    }

    this.counterpartiesApi
      .list({ limit: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.counterparties.set(res.data.items ?? []);
      });

    this.quotationsApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.quotations.set(res.data ?? []);
      });

    this.ordersApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.orders.set(res.data ?? []);
      });

    this.docTypesApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.docTypes.set(res.data ?? []);
      });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncSheetSize());
    }

    effect(() => {
      const doc = this.document();
      if (!doc || !this.isKpDoc() || this.quotationId()) return;
      this.ensureLinkedQuotation(doc._id);
    });

    effect(() => {
      const section = this.activeSection();
      const collapsed = this.panelCollapsed();
      this.shellTools.setTools(STUDIO_TOOL_OWNER, {
        left: [
          {
            id: 'data', side: 'left', ariaLabel: 'Данные', title: 'Данные', icon: Database,
            active: !collapsed && section === 'data', onClick: () => this.onSection('data'),
          },
          {
            id: 'selected', side: 'left', ariaLabel: 'Выбрано', title: 'Выбрано', icon: ClipboardList,
            badge: this.selectedBufferCount() > 0 ? this.selectedBufferCount() : undefined,
            active: !collapsed && section === 'selected', onClick: () => this.onSection('selected'),
          },
        ],
        right: [
          { id: 'elements', side: 'right', ariaLabel: 'Элементы', title: 'Элементы', icon: FileText, active: !collapsed && section === 'elements', onClick: () => this.onSection('elements') },
          { id: 'layers', side: 'right', ariaLabel: 'Слои', title: 'Слои', icon: Layers, active: !collapsed && section === 'layers', onClick: () => this.onSection('layers') },
          { id: 'pages', side: 'right', ariaLabel: 'Страницы', title: 'Страницы', icon: FileStack, active: !collapsed && section === 'pages', onClick: () => this.onSection('pages') },
          { id: 'properties', side: 'right', ariaLabel: 'Свойства', title: 'Свойства', icon: Settings2, active: !collapsed && section === 'properties', onClick: () => this.onSection('properties') },
          { id: 'template', side: 'right', ariaLabel: 'Шаблон', title: 'Шаблон', icon: LayoutTemplate, active: !collapsed && section === 'template', onClick: () => this.onSection('template') },
        ],
      });
    });
  }

  ngAfterViewInit(): void {
    document.addEventListener('keydown', this.onStudioKeydown);
    window.addEventListener('beforeunload', this.onStudioBeforeUnload);
    const el = this.sheetHostRef()?.nativeElement;
    if (el && this.resizeObserver) {
      this.resizeObserver.observe(el);
      this.syncSheetSize();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onStudioKeydown);
    window.removeEventListener('beforeunload', this.onStudioBeforeUnload);
    this.shellTools.clear(STUDIO_TOOL_OWNER);
    this.resizeObserver?.disconnect();
    if (this.timer) clearTimeout(this.timer);
  }

  onSection(id: string): void {
    onStudioSectionClick(id as StudioWorkspaceSection, this.activeSection, this.panelCollapsed);
  }

  async saveDocument(): Promise<boolean> {
    if (this.saving()) return false;
    this.saving.set(true);
    try {
      const layoutsOk = await this.flushLayouts();
      if (!layoutsOk) return false;
      if (this.isKpDoc() && this.quotationId()) {
        const syncOk = await this.syncKpQuotationItems();
        if (!syncOk) return false;
      }
      this.toast.success('Сохранено');
      return true;
    } finally {
      this.saving.set(false);
    }
  }

  /** Layout debounce pending, save in-flight, or an optimistic block edit not yet confirmed by the server. */
  isStudioDirty(): boolean {
    return this.layoutsDirty || this.saving() || this.pendingBlockPatches() > 0;
  }

  /** Resolves true when it's safe to navigate away (clean, or user chose Leave/Save-and-leave). */
  async confirmLeave(): Promise<boolean> {
    if (!this.isStudioDirty()) return true;
    const choice = await new Promise<StudioUnsavedChangesChoice | undefined>((resolve) => {
      const ref = this.dialog.open<StudioUnsavedChangesChoice>(StudioUnsavedChangesDialogComponent, {
        dismissOnEscape: false,
        dismissOnBackdropClick: false,
        parentDestroyRef: this.destroyRef,
      });
      onDialogCloseOnce(ref, this.injector, resolve);
    });
    if (choice === 'leave') return true;
    if (choice === 'save-and-leave') return this.saveDocument();
    return false;
  }

  canDeactivate(): Promise<boolean> {
    return this.confirmLeave();
  }

  openDocumentList(): void {
    void this.confirmLeave().then((ok) => {
      if (ok) void this.router.navigate(['/studio'], { queryParams: { list: '1' } });
    });
  }

  setOrientation(orientation: 'portrait' | 'landscape'): void {
    const doc = this.document();
    if (!doc || doc.orientation === orientation) return;
    void firstValueFrom(this.documents.update(doc._id, { expectedRevision: doc.revision ?? 1, orientation })).then((result) => {
      if (result.ok) this.document.set(result.data); else this.conflict();
    });
  }

  setBackgroundIndex(index: number): void {
    const doc = this.document();
    if (!doc) return;
    const indices = [...(doc.backgroundPageIndices ?? [])];
    while (indices.length < this.pageCount()) indices.push(doc.defaultBackgroundIndex ?? -1);
    indices[this.currentPage() - 1] = index;
    void firstValueFrom(this.documents.update(doc._id, { expectedRevision: doc.revision ?? 1, backgroundPageIndices: indices })).then((r) => {
      if (r.ok) this.document.set(r.data); else this.conflict();
    });
  }

  setBackgroundOpacity(opacity: number): void {
    const doc = this.document();
    if (!doc || !Number.isFinite(opacity)) return;
    const value = Math.min(1, Math.max(0, opacity));
    void firstValueFrom(this.documents.update(doc._id, { expectedRevision: doc.revision ?? 1, backgroundOpacity: value })).then((r) => {
      if (r.ok) this.document.set(r.data); else this.conflict();
    });
  }

  togglePageNumbering(enabled: boolean): void {
    const doc = this.document();
    if (!doc) return;
    void firstValueFrom(this.documents.update(doc._id, {
      expectedRevision: doc.revision ?? 1,
      pageNumbering: enabled,
    })).then((result) => {
      if (result.ok) this.document.set(result.data);
      else this.conflict();
    });
  }

  togglePanel(): void {
    this.panelCollapsed.update((v) => !v);
  }

  setZoomMode(mode: 'fit' | '100'): void {
    this.zoomMode.set(mode);
    this.syncSheetSize();
  }

  setViewMode(mode: 'editor' | 'preview'): void {
    if (mode === 'preview') {
      void this.enterPreviewMode();
      return;
    }
    this.viewMode.set(mode);
    this.previewHtml.set(null);
    this.previewError.set(null);
  }

  private async enterPreviewMode(): Promise<void> {
    this.viewMode.set('preview');
    this.panelCollapsed.set(true);
    this.selectedId.set(null);
    this.previewLoading.set(true);
    this.previewError.set(null);
    await this.flushLayouts();
    this.fetchPreview();
  }

  onLayoutCommit(): void {
    void this.flushLayouts();
  }

  onSheetClick(): void {
    this.selectedId.set(null);
    /* Сворачиваем только по клику на лист — не трогаем opacity/transform панели */
    this.panelCollapsed.set(true);
  }

  onSelect(id: string): void {
    this.activeLayerId.set(id);
    this.selectedId.set(id);
  }

  activateLayer(id: string): void {
    this.activeLayerId.set(id);
    this.selectedId.set(id);
    this.activeSection.set('layers');
    this.panelCollapsed.set(false);
  }

  openLayerProperties(id: string): void {
    const block = this.blocks().find((item) => item._id === id);
    if (!block || block.locked || this.viewMode() === 'preview') return;
    this.activeLayerId.set(id);
    this.selectedId.set(id);
    this.activeSection.set('properties');
    this.panelCollapsed.set(false);
    if (block.type === 'text') {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-test="studio-block-content"] [contenteditable="true"]')?.focus());
    }
  }

  addLayer(): void {
    void this.createTextLayer();
  }

  addTableLayer(): void {
    void this.createTableBlock().then((block) => {
      if (block) this.activateLayer(block._id);
    });
  }

  /**
   * TZ-NX-DOCSTUDIO-D52 — «Вставить на лист» from the «Выбрано» buffer.
   * Reuses an existing table already wired to this catalog source (focus,
   * no duplicate write) or creates one via the same path as `addTableLayer`
   * and wires its source in one step — mirrors Elements → table → source,
   * not a second write path.
   */
  insertCatalogTable(kind: StudioShowcaseKind): void {
    const source = `catalog-${kind}` as const;
    const existing = this.blocks().find(
      (item) => item.type === 'table' && (item.settings?.['dataSource'] as { type?: string } | undefined)?.type === source,
    );
    if (existing) {
      this.activateLayer(existing._id);
      return;
    }
    void this.createTableBlock().then((block) => {
      if (!block) return;
      this.activateLayer(block._id);
      this.setBlockCatalogSource(block._id, source);
    });
  }

  private createTableBlock(): Promise<StudioBlock | null> {
    const d = this.document();
    if (!d) return Promise.resolve(null);
    const layerNo = this.layersForPage().length + 1;
    const zIndex = this.nextZIndex();
    return firstValueFrom(
      this.blocksService.create(d._id, {
        expectedRevision: d.revision ?? 1,
        type: 'table',
        order: this.blocks().length,
        title: `Таблица ${layerNo}`,
        content: '',
        layout: studioCenteredTableLayout(zIndex, this.currentPage()),
        settings: {
          tableTemplateColumns: STUDIO_DEFAULT_TABLE_COLUMNS,
          tableTemplateSampleRows: STUDIO_DEFAULT_TABLE_ROWS,
        },
      }),
    ).then((r) => {
      if (!r.ok) {
        this.conflict();
        return null;
      }
      const block = r.data.layout
        ? { ...r.data, layout: coerceStudioBlockLayout(r.data.layout) }
        : r.data;
      this.blocks.update((b) => [...b, block]);
      this.document.update((x) => (x ? { ...x, revision: (x.revision ?? 1) + 1 } : x));
      return block;
    });
  }

  /** Shared by `onTableSourceChange` (existing table, Свойства panel) and `insertCatalogTable` (D52, new table). */
  private setBlockCatalogSource(
    blockId: string,
    source: 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials',
  ): void {
    const doc = this.document();
    if (!doc) return;
    const catalogKey = source.slice('catalog-'.length) as 'products' | 'modules' | 'parts' | 'materials';
    const selectedCount = this.catalogSelections()[catalogKey].length;
    const dataSet = { source: { type: source }, rows: [], catalogSelectionCount: selectedCount };
    this.blocks.update((blocks) => blocks.map((item) => item._id === blockId
      ? { ...item, settings: { ...(item.settings ?? {}), dataSource: { type: source } } }
      : item));
    void firstValueFrom(this.documents.putDataSet(doc._id, `table-${blockId}`, {
      expectedRevision: doc.revision ?? 1,
      dataSet,
    })).then((result) => {
      if (!result.ok) {
        this.conflict();
        return;
      }
      this.document.set(result.data);
      const key = `table-${blockId}`;
      this.applyLiveRowsFromDataSet(result.data, blockId, result.data.dataSets?.find((entry) => entry['key'] === key) ?? dataSet);
      this.toast.success('На листе появятся строки из выбранных товаров');
      this.refreshPreviewIfActive();
    });
  }

  private createTextLayer(): void {
    const d = this.document();
    if (!d) return;
    const layerNo = this.blocks().filter((b) => b.layout).length + 1;
    const zIndex = this.nextZIndex();
    void firstValueFrom(
      this.blocksService.create(d._id, {
        expectedRevision: d.revision ?? 1,
        type: 'text',
        order: this.blocks().length,
        title: `Слой ${layerNo}`,
        content: 'Новый текст',
        layout: studioCenteredTextLayout(0.3, 0.12, zIndex, this.currentPage()),
      }),
    ).then((r) => {
      if (!r.ok) {
        this.conflict();
        return;
      }
      const block = r.data.layout
        ? { ...r.data, layout: coerceStudioBlockLayout(r.data.layout) }
        : r.data;
      this.blocks.update((b) => [...b, block]);
      this.document.update((x) => (x ? { ...x, revision: (x.revision ?? 1) + 1 } : x));
      this.activateLayer(block._id);
    });
  }

  addTextToActiveLayer(): void {
    const layerId = this.activeLayerId();
    const block = layerId ? this.blocks().find((b) => b._id === layerId) : null;
    if (block?.type === 'text') {
      if (!block.content?.trim()) {
        this.patchBlockContent('Новый текст');
      }
      this.selectedId.set(block._id);
      this.activeSection.set('properties');
      this.panelCollapsed.set(false);
      return;
    }
    this.createTextLayer();
  }

  addImageToActiveLayer(file: File): void {
    void this.createImageLayer(file);
  }

  setImageAsBackground(): void {
    const block = this.propertiesBlock();
    if (!block?.layout || block.type !== 'image' || block.locked) return;
    if (studioBlockIsPassportBackground(block)) return;
    const page = block.layout.page ?? this.currentPage();
    const previousBackgrounds = this.blocks().filter(
      (b) =>
        b._id !== block._id &&
        b.type === 'image' &&
        (b.layout?.page ?? 1) === page &&
        studioBlockIsPassportBackground(b),
    );
    void (async () => {
      for (const prev of previousBackgrounds) {
        await this.restoreImageFromBackground(prev, false);
      }
      await this.applyImageBackground(block);
      if (previousBackgrounds.length > 0) {
        this.toast.success('Фоновое изображение заменено');
      } else {
        this.toast.success('Фоновое изображение установлено');
      }
    })();
  }

  clearImageBackground(): void {
    const block = this.propertiesBlock();
    if (!block?.layout || block.type !== 'image' || block.locked) return;
    if (!studioBlockIsPassportBackground(block)) return;
    void this.restoreImageFromBackground(block, true).then((ok) => {
      if (ok) {
        this.toast.success('Слой снова на холсте — можно двигать и менять размер');
      }
    });
  }

  private async applyImageBackground(block: StudioBlock): Promise<boolean> {
    if (!block.layout || block.type !== 'image') return false;
    const fullLayout = normalizeStudioBlockLayout({
      ...block.layout,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      zIndex: 0,
    });
    return this.patchImageBlock(block, fullLayout, { overlay: true });
  }

  private async restoreImageFromBackground(block: StudioBlock, showConflict = true): Promise<boolean> {
    if (!block.layout || block.type !== 'image') return false;
    const zIndex = Math.max(1, block.layout.zIndex ?? 1);
    const layout = studioImageForegroundLayout(block, zIndex);
    return this.patchImageBlock(block, layout, { overlay: false }, showConflict);
  }

  private async patchImageBlock(
    block: StudioBlock,
    layout: StudioBlockLayout,
    settingsPatch: Record<string, unknown>,
    showConflict = true,
  ): Promise<boolean> {
    const optimisticSettings = studioMergeBlockSettings(block.settings, undefined, settingsPatch);
    const persistSettings = studioImageSettingsForUpdate(block.settings, settingsPatch);
    this.layoutsDirty = true;
    this.blocks.update((b) =>
      b.map((x) =>
        x._id === block._id ? { ...x, layout, settings: optimisticSettings } : x,
      ),
    );
    const r = await firstValueFrom(
      this.blocksService.update(block._id, {
        layout,
        settings: persistSettings,
      }),
    );
    if (!r.ok) {
      if (showConflict) this.conflict();
      return false;
    }
    this.blocks.update((b) =>
      b.map((x) => {
        if (x._id !== r.data._id) return x;
        return {
          ...r.data,
          layout: coerceStudioBlockLayout(r.data.layout ?? layout),
          settings: studioMergeBlockSettings(block.settings, r.data.settings, settingsPatch),
        };
      }),
    );
    this.layoutsDirty = false;
    this.refreshPreviewIfActive();
    return true;
  }

  prevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.syncActiveLayerForPage();
  }

  nextPage(): void {
    if (this.currentPage() >= this.pageCount()) return;
    this.currentPage.update((p) => p + 1);
    this.syncActiveLayerForPage();
  }

  private async createImageLayer(file: File): Promise<void> {
    const d = this.document();
    if (!d) return;
    const layerNo = this.layersForPage().length + 1;
    const zIndex = this.nextZIndex();
    const localUrl = URL.createObjectURL(file);
    const title = file.name.replace(/\.[^.]+$/, '') || `Фото ${layerNo}`;
    let natural = { width: 800, height: 600 };
    try {
      natural = await studioReadImageNaturalSize(file);
    } catch {
      /* fallback dimensions */
    }
    const layout = studioStaggerImageLayout(
      studioImageLayoutFromNaturalSize(
        natural.width,
        natural.height,
        zIndex,
        this.currentPage(),
      ),
      this.pageBlocks().filter(
        (b) => b.type === 'image' && !studioBlockIsPassportBackground(b),
      ).length,
    );
    const createRes = await firstValueFrom(
      this.blocksService.create(d._id, {
        expectedRevision: d.revision ?? 1,
        type: 'image',
        order: this.blocks().length,
        title,
        content: '',
        layout,
        settings: {
          naturalWidth: natural.width,
          naturalHeight: natural.height,
        },
      }),
    );
    if (!createRes.ok) {
      URL.revokeObjectURL(localUrl);
      this.conflict();
      return;
    }
    const block = createRes.data.layout
      ? {
          ...createRes.data,
          layout: coerceStudioBlockLayout(createRes.data.layout),
          settings: {
            ...(createRes.data.settings ?? {}),
            naturalWidth: natural.width,
            naturalHeight: natural.height,
            imageUrl: localUrl,
          },
        }
      : {
          ...createRes.data,
          settings: {
            naturalWidth: natural.width,
            naturalHeight: natural.height,
            imageUrl: localUrl,
          },
        };
    this.blocks.update((b) => [...b, block]);
    this.document.update((x) => (x ? { ...x, revision: (x.revision ?? 1) + 1 } : x));
    this.openLayerProperties(block._id);
    await this.uploadImageToBlock(block._id, file, localUrl, natural);
  }

  private async uploadImageToBlock(
    blockId: string,
    file: File,
    existingLocalUrl?: string,
    knownNatural?: { width: number; height: number },
  ): Promise<void> {
    const localUrl = existingLocalUrl ?? URL.createObjectURL(file);
    let natural = knownNatural;
    if (!natural) {
      try {
        natural = await studioReadImageNaturalSize(file);
      } catch {
        natural = undefined;
      }
    }
    if (!existingLocalUrl) {
      this.blocks.update((b) =>
        b.map((x) =>
          x._id === blockId
            ? {
                ...x,
                settings: {
                  ...(x.settings ?? {}),
                  imageUrl: localUrl,
                  ...(natural
                    ? { naturalWidth: natural.width, naturalHeight: natural.height }
                    : {}),
                },
              }
            : x,
        ),
      );
    } else if (natural) {
      this.blocks.update((b) =>
        b.map((x) =>
          x._id === blockId
            ? {
                ...x,
                settings: {
                  ...(x.settings ?? {}),
                  naturalWidth: natural!.width,
                  naturalHeight: natural!.height,
                },
              }
            : x,
        ),
      );
    }
    const uploadRes = await firstValueFrom(this.blocksService.uploadImage(blockId, file));
    URL.revokeObjectURL(localUrl);
    if (uploadRes.ok) {
      const block = this.blocks().find((b) => b._id === blockId);
      const settings = {
        ...(block?.settings ?? {}),
        imageUrl: uploadRes.data.url,
        ...(natural ? { naturalWidth: natural.width, naturalHeight: natural.height } : {}),
      };
      if (block?.layout && natural) {
        const defaultLayout = studioCenteredImageLayout(
          block.layout.zIndex ?? 1,
          block.layout.page ?? 1,
        );
        const isDefaultSmallBox =
          Math.abs(block.layout.width - defaultLayout.width) < 0.001 &&
          Math.abs((block.layout.height ?? 0) - (defaultLayout.height ?? 0)) < 0.001;
        if (isDefaultSmallBox) {
          this.changeLayout(
            blockId,
            studioImageLayoutFromNaturalSize(
              natural.width,
              natural.height,
              block.layout.zIndex ?? 1,
              block.layout.page ?? 1,
            ),
          );
        }
      }
      this.blocks.update((b) =>
        b.map((x) => (x._id === blockId ? { ...x, settings } : x)),
      );
      void firstValueFrom(this.blocksService.update(blockId, { settings })).then((r) => {
        if (r.ok) {
          this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
        }
      });
    } else {
      this.toast.error(extractErrorMessage(uploadRes.error));
    }
  }

  goToPage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page > this.pageCount()) return;
    this.currentPage.set(page);
    this.syncActiveLayerForPage();
  }

  private syncActiveLayerForPage(): void {
    this.selectedId.set(null);
    this.pickDefaultLayer(this.layersForPage());
  }

  changeLayout(id: string, layout: StudioBlockLayout): void {
    const normalized = normalizeStudioBlockLayout(layout);
    this.layoutsDirty = true;
    this.blocks.update((b) => b.map((x) => (x._id === id ? { ...x, layout: normalized } : x)));
    this.schedule();
  }

  applyLayerZOrder(blockIdsTopToBottom: readonly string[]): void {
    const zMap = zIndexFromLayerOrder(blockIdsTopToBottom);
    let changed = false;
    this.blocks.update((blocks) =>
      blocks.map((b) => {
        const zIndex = zMap.get(b._id);
        if (zIndex === undefined || !b.layout || b.layout.zIndex === zIndex) return b;
        changed = true;
        return { ...b, layout: normalizeStudioBlockLayout({ ...b.layout, zIndex }) };
      }),
    );
    if (changed) {
      this.layoutsDirty = true;
      this.schedule();
    }
  }

  patchBlockStyle(patch: Partial<StudioBlockStyle>): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'text' || block._id !== this.activeLayerId()) return;
    const nextStyle = { ...block.style, ...patch };
    this.blocks.update((b) =>
      b.map((x) => (x._id === block._id ? { ...x, style: nextStyle } : x)),
    );
    this.pendingBlockPatches.update((n) => n + 1);
    void firstValueFrom(this.blocksService.update(block._id, { style: patch }))
      .then((r) => {
        if (r.ok) {
          this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
          this.refreshPreviewIfActive();
        } else {
          this.conflict();
        }
      })
      .finally(() => this.pendingBlockPatches.update((n) => n - 1));
  }

  patchBlockContent(content: string): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'text' || block._id !== this.activeLayerId()) return;
    this.applyBlockContent(block._id, content);
  }

  patchBlockContentFromCanvas(id: string, content: string): void {
    if (id !== this.activeLayerId()) return;
    this.applyBlockContent(id, content);
  }

  private applyBlockContent(blockId: string, content: string): void {
    this.blocks.update((b) => b.map((x) => (x._id === blockId ? { ...x, content } : x)));
    this.pendingBlockPatches.update((n) => n + 1);
    void firstValueFrom(this.blocksService.update(blockId, { content }))
      .then((r) => {
        if (r.ok) {
          this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
          this.refreshPreviewIfActive();
        } else {
          this.conflict();
        }
      })
      .finally(() => this.pendingBlockPatches.update((n) => n - 1));
  }

  patchTableRows(rows: string[][]): void {
    const block = this.activeTableBlock();
    if (!block) return;
    this.patchTableSettingsForBlock(block._id, { tableTemplateSampleRows: rows });
  }

  onTableSourceChange(source: 'manual' | 'quotation-items' | 'order-items' | 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials'): void {
    const block = this.activeTableBlock();
    const doc = this.document();
    if (!block || !doc) return;
    const catalogKey = source.startsWith('catalog-') ? source.slice('catalog-'.length) : '';
    const selectedCount = catalogKey ? this.catalogSelections()[catalogKey as 'products' | 'modules' | 'parts' | 'materials'].length : 0;
    const dataSet = { source: { type: source }, rows: [], catalogSelectionCount: selectedCount };
    this.blocks.update((blocks) => blocks.map((item) => item._id === block._id
      ? { ...item, settings: { ...(item.settings ?? {}), dataSource: { type: source } } }
      : item));
    void firstValueFrom(this.documents.putDataSet(doc._id, `table-${block._id}`, {
      expectedRevision: doc.revision ?? 1,
      dataSet,
    })).then((result) => {
      if (result.ok) {
        this.document.set(result.data);
        const key = `table-${block._id}`;
        this.applyLiveRowsFromDataSet(result.data, block._id, result.data.dataSets?.find((entry) => entry['key'] === key) ?? dataSet);
        const sourceLabel = source === 'manual' ? 'вручную' : source === 'quotation-items' ? 'КП' : source === 'order-items' ? 'заказ' : 'витрина';
        this.toast.success(`Источник строк: ${sourceLabel}`);
        this.refreshPreviewIfActive();
      } else {
        this.conflict();
      }
    });
  }

  private applyLiveRowsFromDataSet(doc: StudioDocument, blockId: string, dataSet: { rows?: readonly unknown[] }): void {
    const rows = Array.isArray(dataSet.rows) ? dataSet.rows : [];
    this.blocks.update((blocks) => blocks.map((item) => item._id === blockId
      ? { ...item, settings: { ...(item.settings ?? {}), liveRows: rows } }
      : item));
  }

  /**
   * On document open, GET does not hydrate live rows (only putDataSet does per
   * hydrateLiveDataSetRows on the backend) — re-put each ERP/catalog-source table's
   * existing dataSet entry to pull fresh rows into the response and apply them.
   */
  private refreshLiveDataSetsOnLoad(blocks: readonly StudioBlock[]): void {
    const doc = this.document();
    if (!doc) return;
    const tables = blocks.filter((item) => item.type === 'table');
    for (const block of tables) {
      const sourceType = (block.settings?.['dataSource'] as { type?: string } | undefined)?.type;
      if (!sourceType || !STUDIO_LIVE_HYDRATABLE_SOURCE_TYPES.has(sourceType)) continue;
      const key = `table-${block._id}`;
      const existing = doc.dataSets?.find((entry) => entry['key'] === key);
      const catalogKey = sourceType.startsWith('catalog-') ? sourceType.slice('catalog-'.length) : '';
      const catalogSelectionCount = catalogKey
        ? this.catalogSelections()[catalogKey as 'products' | 'modules' | 'parts' | 'materials'].length
        : (existing?.['catalogSelectionCount'] as number | undefined) ?? 0;
      const dataSet = { source: { type: sourceType }, rows: existing?.rows ?? [], catalogSelectionCount };
      void firstValueFrom(this.documents.putDataSet(doc._id, key, {
        expectedRevision: this.document()?.revision ?? doc.revision ?? 1,
        dataSet,
      })).then((result) => {
        if (!result.ok) return;
        this.document.set(result.data);
        this.applyLiveRowsFromDataSet(result.data, block._id, result.data.dataSets?.find((entry) => entry['key'] === key) ?? dataSet);
      });
    }
  }

  patchTableSettings(patch: Record<string, unknown>): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'table' || block._id !== this.activeLayerId()) return;
    this.patchTableSettingsForBlock(block._id, patch);
  }

  patchTableDisabledRows(indices: number[]): void {
    const block = this.activeTableBlock();
    if (!block) return;
    this.patchTableSettingsForBlock(block._id, { tableDisabledRowIndices: indices });
  }

  private activeTableBlock(): StudioBlock | null {
    const id = this.activeLayerId();
    const block = id ? this.blocks().find((b) => b._id === id) : null;
    return block?.type === 'table' ? block : null;
  }

  private patchTableSettingsForBlock(blockId: string, patch: Record<string, unknown>): void {
    const block = this.blocks().find((b) => b._id === blockId);
    if (!block || block.type !== 'table') return;
    const settings = { ...(block.settings ?? {}), ...patch };
    const title =
      typeof patch['tableTemplateName'] === 'string' && patch['tableTemplateName'].trim()
        ? String(patch['tableTemplateName']).trim()
        : block.title;
    this.blocks.update((b) =>
      b.map((x) => (x._id === block._id ? { ...x, settings, ...(title !== block.title ? { title } : {}) } : x)),
    );
    void firstValueFrom(
      this.blocksService.update(block._id, {
        settings,
        ...(title !== block.title ? { title } : {}),
      }),
    ).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
        this.refreshPreviewIfActive();
      } else {
        this.conflict();
      }
    });
  }

  openSaveTableTemplateDialog(): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'table' || block.locked) return;
    const draft = buildTableTemplatePayloadFromBlock(block, block.title?.trim() || 'Таблица');
    const ref = this.dialog.open<TableTemplate | null | undefined>(TableTemplateFormDialogComponent, {
      data: {
        mode: 'create',
        template: {
          _id: '',
          name: draft.name,
          sortOrder: draft.sortOrder,
          columns: draft.columns,
          sampleRows: draft.sampleRows,
          isActive: true,
        },
        initialSampleRows: draft.sampleRows,
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (value) => {
      if (value) {
        this.toast.success(`Вид таблицы «${value.name}» сохранён`);
        this.patchTableSettings({
          tableTemplateId: value._id,
          tableTemplateName: value.name,
          tableTemplateColumns: value.columns,
          tableTemplateSampleRows: draft.sampleRows.map((row) => row.map((c) => String(c ?? ''))),
        });
      }
    });
  }

  applyLibraryText(textBlock: TextBlock): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'text' || block._id !== this.activeLayerId()) return;
    this.applyBlockContent(block._id, textBlock.content ?? '');
    if (textBlock.name?.trim()) {
      this.patchBlockTitle(textBlock.name.trim());
    }
    this.toast.success(`Текст «${textBlock.name}» вставлен`);
  }

  openSaveTextBlockDialog(): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'text' || block.locked) return;
    const defaultName = block.title?.trim() || 'Текст';
    const ref = this.dialog.open<TextBlock | null | undefined>(TextBlockFormDialogComponent, {
      data: {
        mode: 'create',
        textBlock: {
          _id: '',
          name: defaultName,
          slug: studioTextBlockSlug(defaultName),
          content: block.content ?? '',
          sortOrder: 0,
          isActive: true,
        },
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (value) => {
      if (value) {
        this.toast.success(`Текст «${value.name}» сохранён в библиотеку`);
      }
    });
  }

  removeCatalogChip(kind: string): void {
    if (!['products', 'modules', 'parts', 'materials'].includes(kind)) return;
    this.onCatalogSelectionChange({ kind: kind as StudioShowcaseKind, ids: [] });
  }

  onCatalogSelectionChange(change: { kind: StudioShowcaseKind; ids: readonly string[] }): void {
    if (!this.document()) return;
    const next = { ...this.catalogSelections(), [change.kind]: change.ids };
    this.catalogSelections.set(next);

    // TZ-NX-DOCSTUDIO-S41 — one write queue per document: chain onto the
    // previous vitrina write instead of firing PATCH context and putDataSet
    // in parallel against a revision snapshotted at click time. Each step
    // below reads `this.document()` fresh when it actually runs, i.e. after
    // every earlier queued write already landed — so it always carries the
    // revision the *previous* write returned, never a stale one raced
    // against it. This is what removes the cascade-409 on rapid clicks.
    this.catalogWritePending += 1;
    this.catalogWriteBusy.set(true);
    this.catalogWriteChain = this.catalogWriteChain
      .then(() => this.commitCatalogSelectionChange(change.kind, next, change.ids.length))
      .finally(() => {
        this.catalogWritePending -= 1;
        if (this.catalogWritePending === 0) this.catalogWriteBusy.set(false);
      });
  }

  private async commitCatalogSelectionChange(
    kind: StudioShowcaseKind,
    next: StudioCatalogSelections,
    idsCount: number,
  ): Promise<void> {
    const doc = this.document();
    if (!doc) return;
    const patchResult = await firstValueFrom(
      this.documents.update(doc._id, {
        expectedRevision: doc.revision ?? 1,
        context: { ...(doc.context ?? {}), catalogSelections: next },
      }),
    );
    if (!patchResult.ok) {
      this.conflict();
      return;
    }
    this.document.set(patchResult.data);
    this.refreshPreviewIfActive();
    void this.syncKpQuotationItems();

    const matchingSource = `catalog-${kind}` as 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials';
    const tables = this.blocks().filter((item) => item.type === 'table');
    const soleTable = tables.length === 1 ? tables[0] : null;
    for (const block of tables) {
      const configuredSource = (block.settings?.['dataSource'] as { type?: string } | undefined)?.type;
      const source = configuredSource && configuredSource !== 'manual'
        ? configuredSource
        : soleTable?._id === block._id ? matchingSource : configuredSource;
      if (source !== matchingSource) continue;
      if (source === matchingSource && configuredSource !== matchingSource) {
        this.blocks.update((blocks) => blocks.map((item) => item._id === block._id
          ? { ...item, settings: { ...(item.settings ?? {}), dataSource: { type: matchingSource } } }
          : item));
      }
      // Always the revision the PATCH above (or an earlier iteration of this
      // same loop) just returned — never the snapshot from before this queue
      // entry started running.
      const currentRevision = this.document()?.revision ?? doc.revision ?? 1;
      const result = await firstValueFrom(
        this.documents.putDataSet(doc._id, `table-${block._id}`, {
          expectedRevision: currentRevision,
          dataSet: { source: { type: source }, rows: [], catalogSelectionCount: idsCount },
        }),
      );
      if (!result.ok) {
        this.conflict();
        return;
      }
      this.document.set(result.data);
      this.applyLiveRowsFromDataSet(result.data, block._id, result.data.dataSets?.find((entry) => entry['key'] === `table-${block._id}`) ?? { rows: [] });
      this.refreshPreviewIfActive();
    }
  }

  onCounterpartyChange(counterpartyId: string): void {
    const doc = this.document();
    if (!doc) return;
    const nextContext = { ...(doc.context ?? {}) };
    if (counterpartyId) {
      nextContext['counterpartyId'] = counterpartyId;
      const anchors = { ...((nextContext['anchors'] as Record<string, unknown> | undefined) ?? {}) };
      if (!anchors['client']) anchors['client'] = { entityType: 'counterparty', entityId: counterpartyId };
      nextContext['anchors'] = anchors;
    } else {
      delete nextContext['counterpartyId'];
      const anchors = { ...((nextContext['anchors'] as Record<string, unknown> | undefined) ?? {}) };
      delete anchors['client'];
      nextContext['anchors'] = anchors;
    }
    this.patchDocumentContext(nextContext);
  }

  onAnchorChange(anchorKey: 'payer' | 'supplier', entityId: string): void {
    const doc = this.document();
    if (!doc) return;
    const context = { ...(doc.context ?? {}) };
    const anchors = { ...((context['anchors'] as Record<string, unknown> | undefined) ?? {}) };
    if (entityId) anchors[anchorKey] = { entityType: 'counterparty', entityId };
    else delete anchors[anchorKey];
    context['anchors'] = anchors;
    this.patchDocumentContext(context);
  }

  onQuotationChange(quotationId: string): void {
    this.patchContextField('quotationId', quotationId);
    if (!quotationId) return;
    const quotation = this.quotations().find((item) => item._id === quotationId) as (Quotation & { counterpartyId?: string }) | undefined;
    const doc = this.document();
    if (!doc || this.counterpartyId() || !quotation?.counterpartyId) return;
    this.onCounterpartyChange(quotation.counterpartyId);
  }

  onOrderChange(orderId: string): void {
    this.patchContextField('orderId', orderId);
    if (!orderId || this.counterpartyId()) return;
    const order = this.orders().find((item) => item._id === orderId) as (Order & { counterpartyId?: string }) | undefined;
    if (order?.counterpartyId) this.onCounterpartyChange(order.counterpartyId);
  }

  onDocTypeChange(docTypeId: string): void {
    const doc = this.document();
    if (!doc) return;
    this.docTypeSaving.set(true);
    void firstValueFrom(
      this.documents.update(doc._id, {
        expectedRevision: doc.revision ?? 1,
        docTypeId: docTypeId || undefined,
      }),
    ).then((r) => {
      this.docTypeSaving.set(false);
      if (r.ok) {
        this.document.set(r.data);
        const docType = this.docTypes().find((item) => item._id === docTypeId);
        if (isKpDocType(docType)) {
          void this.ensureLinkedQuotation(r.data._id);
        }
      } else {
        this.conflict();
      }
    });
  }

  onQuotationStatusChange(status: QuotationStatus): void {
    const doc = this.document();
    if (!doc || !this.isKpDoc()) return;
    this.contextSaving.set(true);
    this.contextSaveError.set(null);
    void firstValueFrom(this.documents.updateQuotationStatus(doc._id, status)).then((r) => {
      this.contextSaving.set(false);
      if (r.ok) {
        this.document.set(r.data.studioDocument);
        this.linkedQuotationStatus.set(status);
        this.toast.success('Статус КП обновлён');
        this.refreshPreviewIfActive();
        void this.reloadQuotations();
      } else {
        this.contextSaveError.set(extractErrorMessage(r.error));
        this.toast.error(extractErrorMessage(r.error));
      }
    });
  }

  private ensureLinkedQuotation(documentId: string): void {
    void firstValueFrom(this.documents.ensureQuotation(documentId)).then((r) => {
      if (!r.ok) {
        this.toast.error(extractErrorMessage(r.error));
        return;
      }
      this.document.set(r.data.studioDocument);
      const quotation = r.data.quotation as Quotation | null;
      if (quotation?.status) this.linkedQuotationStatus.set(quotation.status);
      void this.reloadQuotations();
    });
  }

  private syncKpQuotationItems(): Promise<boolean> {
    const doc = this.document();
    if (!doc || !this.isKpDoc() || !this.quotationId()) return Promise.resolve(true);
    return firstValueFrom(this.documents.syncQuotation(doc._id)).then((result) => {
      if (result.ok) {
        const quotation = result.data.quotation as Quotation | null;
        if (quotation?.status) this.linkedQuotationStatus.set(quotation.status);
        void this.reloadQuotations();
        return true;
      }
      this.toast.error(extractErrorMessage(result.error));
      return false;
    });
  }

  private refreshLinkedQuotationStatus(doc: StudioDocument): void {
    const linkedId = doc.linkedQuotationId
      ?? (typeof doc.context?.['quotationId'] === 'string' ? doc.context['quotationId'] : '');
    if (!linkedId) {
      this.linkedQuotationStatus.set('draft');
      return;
    }
    void firstValueFrom(this.quotationsApi.getById(linkedId)).then((r) => {
      if (r.ok && r.data.status) this.linkedQuotationStatus.set(r.data.status);
    });
  }

  private reloadQuotations(): void {
    void firstValueFrom(this.quotationsApi.list()).then((res) => {
      if (res.ok) this.quotations.set(res.data ?? []);
    });
  }

  openRenameDialog(): void {
    const doc = this.document();
    if (!doc) return;
    const ref = this.dialog.open<StudioRenameDocumentResult | undefined>(StudioRenameDocumentDialogComponent, {
      data: { currentName: doc.name },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (value) => {
      if (!value || !value.name.trim()) return;
      const current = this.document();
      if (!current) return;
      void firstValueFrom(
        this.documents.update(current._id, {
          expectedRevision: current.revision ?? 1,
          name: value.name.trim(),
        }),
      ).then((r) => {
        if (r.ok) {
          this.document.set(r.data);
          this.toast.success('Документ переименован');
        } else {
          this.conflict();
        }
      });
    });
  }

  openSaveAsTemplateDialog(): void {
    const doc = this.document();
    if (!doc || this.templateSaving()) return;
    if (!this.docTypeId()) {
      this.toast.error('Назначьте тип документа — без него шаблон не сохранить');
      return;
    }
    const ref = this.dialog.open<StudioSaveAsTemplateResult | undefined>(StudioSaveAsTemplateDialogComponent, {
      data: { defaultName: doc.name || 'Шаблон' },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (value) => {
      if (!value) return;
      this.templateSaving.set(true);
      void firstValueFrom(
        this.documents.saveAsTemplate(doc._id, {
          name: value.name,
        }),
      ).then((r) => {
        this.templateSaving.set(false);
        if (r.ok) {
          this.toast.success(`Шаблон «${r.data.name}» сохранён`);
        } else {
          this.toast.error(extractErrorMessage(r.error));
        }
      });
    });
  }

  onDownloadPdf(): void {
    const doc = this.document();
    if (!doc || this.pdfLoading()) return;
    this.pdfLoading.set(true);
    void this.flushLayouts()
      .then(() => firstValueFrom(this.documents.downloadPdf(doc._id)))
      .then((blob) => this.consumePdfBlob(doc, blob))
      .catch((err) => {
        this.pdfLoading.set(false);
        this.toast.error(extractErrorMessage(err as Parameters<typeof extractErrorMessage>[0]));
      });
  }

  onFinalize(): void {
    const doc = this.document();
    if (!doc || this.finalizing() || doc.status !== 'draft') return;
    if (!window.confirm('Отправить документ в архив? Редактирование будет закрыто.')) return;
    this.finalizing.set(true);
    void this.flushLayouts()
      .then(() => firstValueFrom(this.documents.finalize(doc._id)))
      .then((r) => {
        this.finalizing.set(false);
        if (r.ok) {
          this.document.set(r.data.studioDocument);
          this.refreshPreviewIfActive();
          const generatedName = typeof r.data.generatedDocument['name'] === 'string' ? r.data.generatedDocument['name'] : doc.name;
          this.toast.success(`Документ «${generatedName}» отправлен в архив`);
        } else {
          this.toast.error(extractErrorMessage(r.error));
        }
      })
      .catch(() => {
        this.finalizing.set(false);
      });
  }

  private async consumePdfBlob(doc: StudioDocument, blob: Blob): Promise<void> {
    try {
      if (!blob.size) {
        throw new Error('Сервер вернул пустой PDF');
      }
      if (blob.type && !blob.type.includes('pdf')) {
        const text = await blob.text();
        let message = text;
        try {
          const parsed = JSON.parse(text) as { message?: string; error?: string };
          message = parsed.message ?? parsed.error ?? text;
        } catch {
          /* plain text */
        }
        throw new Error(message.trim() || 'Не удалось сформировать PDF');
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name || 'document'}.pdf`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.toast.success('PDF скачан');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : extractErrorMessage(err as Parameters<typeof extractErrorMessage>[0]);
      this.toast.error(msg);
    } finally {
      this.pdfLoading.set(false);
    }
  }

  private patchContextField(field: 'quotationId' | 'orderId', value: string): void {
    const doc = this.document();
    if (!doc) return;
    const nextContext = { ...(doc.context ?? {}) };
    if (value) nextContext[field] = value;
    else delete nextContext[field];
    this.patchDocumentContext(nextContext);
  }

  private patchDocumentContext(context: Record<string, unknown>): void {
    const doc = this.document();
    if (!doc) return;
    this.contextSaving.set(true);
    this.contextSaveError.set(null);
    void firstValueFrom(
      this.documents.update(doc._id, {
        expectedRevision: doc.revision ?? 1,
        context,
      }),
    ).then((r) => {
      this.contextSaving.set(false);
      if (r.ok) {
        this.document.set(r.data);
        this.refreshPreviewIfActive();
        void this.syncKpQuotationItems();
      } else {
        this.contextSaveError.set(extractErrorMessage(r.error));
        this.conflict();
      }
    });
  }

  private loadIssuerOrg(organizationId: string | undefined): void {
    if (!organizationId) {
      this.issuerOrgName.set('');
      return;
    }
    void firstValueFrom(this.orgsApi.getById(organizationId)).then((res) => {
      this.issuerOrgName.set(res.ok ? res.data.name : organizationId);
    });
  }

  private refreshPreviewIfActive(): void {
    if (this.viewMode() === 'preview') this.fetchPreview();
  }

  patchBlockTitle(title: string): void {
    const block = this.propertiesBlock();
    if (!block || block._id !== this.activeLayerId()) return;
    this.blocks.update((b) => b.map((x) => (x._id === block._id ? { ...x, title } : x)));
    this.pendingBlockPatches.update((n) => n + 1);
    void firstValueFrom(this.blocksService.update(block._id, { title }))
      .then((r) => {
        if (r.ok) {
          this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
        } else {
          this.conflict();
        }
      })
      .finally(() => this.pendingBlockPatches.update((n) => n - 1));
  }

  deleteLayerById(id: string | null | undefined): void {
    const doc = this.document();
    if (!id || !doc) return;
    const block = this.blocks().find((b) => b._id === id);
    if (block?.locked) {
      this.toast.error('Слой заблокирован');
      return;
    }
    const name = block?.title?.trim() || block?.content?.trim()?.slice(0, 32) || 'слой';
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: `Удалить «${name}»?`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      void firstValueFrom(this.blocksService.remove(id)).then((r) => {
        if (!r.ok) {
          this.conflict();
          return;
        }
        this.blocks.update((b) => b.filter((x) => x._id !== id));
        this.selectedId.set(null);
        this.syncActiveLayerForPage();
        this.refreshPreviewIfActive();
        this.toast.success('Слой удалён');
      });
    });
  }

  private fetchPreview(): void {
    const doc = this.document();
    if (!doc) return;
    this.previewLoading.set(true);
    this.previewError.set(null);
    void firstValueFrom(this.documents.preview(doc._id)).then((r) => {
      this.previewLoading.set(false);
      if (r.ok) {
        this.previewHtml.set(r.data.html);
        this.document.update((x) => (x ? { ...x, revision: r.data.revision } : x));
      } else {
        this.previewError.set(extractErrorMessage(r.error));
      }
    });
  }

  addPage(): void {
    const doc = this.document();
    if (!doc) return;
    const nextCount = this.pageCount() + 1;
    void firstValueFrom(
      this.documents.update(doc._id, {
        expectedRevision: doc.revision ?? 1,
        manualPageCount: nextCount,
      }),
    ).then((r) => {
      if (!r.ok) {
        this.conflict();
        return;
      }
      this.document.set(r.data);
      this.refreshPreviewIfActive();
      this.currentPage.set(r.data.manualPageCount ?? nextCount);
      this.toast.success(`Страниц: ${r.data.manualPageCount ?? nextCount}`);
    });
  }

  toggleOrientation(): void {
    const doc = this.document();
    if (!doc) return;
    const orientation = doc.orientation === 'landscape' ? 'portrait' : 'landscape';
    void firstValueFrom(
      this.documents.update(doc._id, {
        expectedRevision: doc.revision ?? 1,
        orientation,
      }),
    ).then((r) => {
      if (!r.ok) {
        this.conflict();
        return;
      }
      this.document.set(r.data);
      queueMicrotask(() => this.syncSheetSize());
    });
  }

  toggleLock(block: StudioBlock): void {
    const locked = !block.locked;
    this.blocks.update((b) => b.map((x) => (x._id === block._id ? { ...x, locked } : x)));
    void firstValueFrom(this.blocksService.update(block._id, { locked })).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
      } else {
        this.conflict();
      }
    });
  }

  toggleVisible(block: StudioBlock): void {
    const isActive = block.isActive === false;
    this.blocks.update((b) =>
      b.map((x) => (x._id === block._id ? { ...x, isActive } : x)),
    );
    void firstValueFrom(this.blocksService.update(block._id, { isActive })).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
        this.refreshPreviewIfActive();
      } else {
        this.conflict();
      }
    });
  }

  private pickDefaultLayer(blocks: readonly StudioBlock[]): void {
    const withLayout = blocks.filter((b) => b.layout);
    if (withLayout.length === 0) {
      this.activeLayerId.set(null);
      return;
    }
    const top = [...withLayout].sort(
      (a, b) => (b.layout!.zIndex ?? 0) - (a.layout!.zIndex ?? 0),
    )[0];
    if (top) this.activeLayerId.set(top._id);
  }

  private syncSheetSize(): void {
    const el = this.sheetHostRef()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fitWidth = Math.max(1, Math.round(rect.width));
    const fitHeight = Math.max(1, Math.round(rect.height));
    if (this.zoomMode() === '100') {
      this.sheetSize.set({ width: 794, height: 1123 });
    } else {
      this.sheetSize.set({ width: fitWidth, height: fitHeight });
    }
  }

  private nextZIndex(): number {
    const max = this.blocks().reduce((m, b) => Math.max(m, b.layout?.zIndex ?? 0), 0);
    return max + 1;
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.timer = undefined;
      this.layoutSavePromise = this.saveLayouts();
      void this.layoutSavePromise.finally(() => {
        if (this.layoutSavePromise) this.layoutSavePromise = null;
      });
    }, 400);
  }

  /** Persist pending layout debounce before preview/server output. Resolves false on save failure (conflict dialog already shown). */
  private flushLayouts(): Promise<boolean> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (this.layoutSavePromise) {
      return this.layoutSavePromise;
    }
    if (!this.layoutsDirty) {
      return Promise.resolve(true);
    }
    this.layoutSavePromise = this.saveLayouts();
    const pending = this.layoutSavePromise;
    return pending.finally(() => {
      if (this.layoutSavePromise === pending) this.layoutSavePromise = null;
    });
  }

  private saveLayouts(): Promise<boolean> {
    const d = this.document();
    if (!d) return Promise.resolve(true);
    const updates = this.blocks()
      .filter((b): b is StudioBlock & { layout: StudioBlockLayout } => Boolean(b.layout))
      .map((b) => ({
        blockId: b._id,
        layout: normalizeStudioBlockLayout(b.layout),
      }));
    if (updates.length === 0) return Promise.resolve(true);
    return firstValueFrom(
      this.blocksService.updateLayouts(d._id, { expectedRevision: d.revision ?? 1, updates }),
    ).then((r) => {
      if (r.ok) {
        this.layoutsDirty = false;
        const normalized = r.data.map((block) =>
          block.layout ? { ...block, layout: coerceStudioBlockLayout(block.layout) } : block,
        );
        this.blocks.set(normalized);
        this.document.update((x) => (x ? { ...x, revision: (x.revision ?? 1) + 1 } : x));
        return true;
      }
      this.conflict();
      return false;
    });
  }

  private conflict(): void {
    if (this.conflictDialogOpen) return;
    this.conflictDialogOpen = true;
    const id = this.document()?._id;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Документ изменён в другом месте',
        description: 'Локальные изменения не были записаны: документ или его слои уже изменились в другой вкладке. Перезагрузка заменит текущий экран актуальной серверной версией.',
        confirmLabel: 'Перезагрузить',
        cancelLabel: 'Отмена',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (reload) => {
      this.conflictDialogOpen = false;
      if (reload) this.reloadFromServer();
    });
  }

  private reloadFromServer(): void {
    const id = this.document()?._id;
    if (id) {
      void firstValueFrom(this.documents.getById(id)).then((r) => {
        if (r.ok) {
          this.document.set(r.data);
          void firstValueFrom(this.blocksService.list(id)).then((b) => {
            if (b.ok) {
              const normalized = b.data.map((block) =>
                block.layout ? { ...block, layout: coerceStudioBlockLayout(block.layout) } : block,
              );
              this.blocks.set(normalized);
            }
          });
        }
      });
    }
  }
}
