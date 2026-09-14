import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  Eye,
  File as DocumentIcon,
  FileDown,
  FileStack,
  FileText,
  Layers,
  LayoutTemplate,
  LucideAngularModule,
  PenLine,
  Save,
  Settings2,
} from 'lucide-angular';
import type {
  StudioBlock,
  StudioBlockLayout,
  StudioBlockStyle,
  QuotationStatus,
  TextBlock,
} from '@kppdf/data-access';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { StudioEditorFacade } from './studio-editor.facade';
import { StudioDataPanelComponent } from './studio-data-panel.component';
import type { StudioShowcaseKind } from './studio-data-vitrina.component';
import { StudioPropertiesPanelComponent } from './studio-properties-panel.component';
import {
  StudioBlocksCanvasComponent,
  StudioPagesPanelComponent,
  StudioElementsPanelComponent,
  StudioLayersPanelComponent,
  StudioTemplatePanelComponent,
  StudioWorkspaceShellComponent,
} from '@kppdf/features/doc-studio';
import type { StudioTableRowSource } from '@kppdf/features/doc-studio';

const STUDIO_TOOL_OWNER = 'studio-editor';

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
  providers: [StudioEditorFacade],
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
        [badgeText]="''"
        [totalText]="''"
        [statusText]="statusText()"
        [pageLabel]="currentPage() + ' / ' + pageCount()"
        [sheetHost]="false"
        [panelWide]="activeSection() === 'data'"
        [panelTable]="panelIsTable()"
        [zoomMode]="zoomMode()"
        (fitZoom)="setZoomMode('fit')"
        (actualZoom)="setZoomMode('100')"
        (sectionChange)="onSection($event)"
        (panelToggle)="togglePanel()"
        (sheetClick)="onSheetClick()"
      >
        <!-- TZ-NX-DOCSTUDIO-C3: ribbon = breadcrumbs only (Документы / Студия / {name}).
             Lifecycle actions live on the right chrome-rail (shellTools); «Сохранить как…»
             stays in the Шаблон panel. Crumb «Документы» routes through openDocumentList()
             so the S38 dirty dialog still guards the leave. -->
        <div kpWsRibbonExtra class="studio-ribbon-crumbs" data-test="studio-ribbon-crumbs">
          <button
            type="button"
            class="studio-crumb studio-crumb--link"
            data-test="studio-crumb-documents"
            title="К списку документов"
            (click)="openDocumentList()"
          >
            Документы
          </button>
          <span class="studio-crumb-sep" aria-hidden="true">/</span>
          <span class="studio-crumb">Студия</span>
          <span class="studio-crumb-sep" aria-hidden="true">/</span>
          <button
            type="button"
            class="studio-crumb studio-crumb--current"
            data-test="studio-rename"
            title="Переименовать"
            (click)="openRenameDialog()"
          >
            {{ doc.name }}
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
                [issuerOrgId]="issuerOrgId()"
                [issuerOrgs]="issuerOrgs()"
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
                [activateCategory]="pendingDataJump()"
                (counterpartyChange)="onCounterpartyChange($event)"
                (payerChange)="onAnchorChange('payer', $event)"
                (supplierChange)="onAnchorChange('supplier', $event)"
                (issuerOrgChange)="onIssuerOrgChange($event)"
                (catalogRemove)="removeCatalogChip($event)"
                (catalogChange)="onCatalogSelectionChange($event)"
                (catalogEntitySaved)="onCatalogEntitySaved($event)"
                (insertTable)="insertCatalogTable($event)"
                (insertPartyText)="insertPartyText($event)"
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
                (insertPartyText)="insertPartyText($event)"
                (editSelection)="onEditSelection($event)"
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
                [tokenDisplayMode]="tokenDisplayMode()"
                (tokenDisplayModeChange)="onTokenDisplayModeChange($event)"
                (styleChange)="patchBlockStyle($event)"
                (contentChange)="patchBlockContent($event)"
                (titleChange)="patchBlockTitle($event)"
                (imageAsBackground)="setImageAsBackground()"
                (imageClearBackground)="clearImageBackground()"
                (deleteLayer)="deleteLayerById(propertiesBlock()?._id)"
                (tableSettingsChange)="patchTableSettings($event)"
                (tableSourceChange)="onTableSourceChange($event)"
                (saveTableTemplate)="openSaveTableTemplateDialog()"
                (tableRowsChange)="patchTableRows($event)"
                (tableDisabledRowsChange)="patchTableDisabledRows($event)"
                (tableLiveQtyChange)="onLiveTableQtyChange($event)"
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
                [style.width.px]="previewNativeSheetSize().width"
                [style.height.px]="previewNativeSheetSize().height"
                [style.transform]="'scale(' + previewZoomScale() + ')'"
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
              [tokenDisplayMode]="tokenDisplayMode()"
              [substitutionBag]="editorSubstitutionBag()"
              (selected)="onSelect($event)"
              (layoutChanged)="changeLayout($event.id, $event.layout)"
              (layoutCommit)="onLayoutCommit()"
              (contentChanged)="patchBlockContentFromCanvas($event.id, $event.content)"
              (textDoubleClick)="openLayerProperties($event)"
              (tableEditRequest)="openLayerProperties($event)"
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
    .studio-ribbon-crumbs {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1, 4px);
      flex-shrink: 0;
      height: 100%;
    }
    .studio-ribbon-crumbs {
      min-width: 0;
      padding-right: var(--space-1, 4px);
    }
    .studio-crumb {
      font-size: 12px;
      line-height: 1;
      color: var(--color-muted-foreground);
      white-space: nowrap;
    }
    .studio-crumb-sep {
      color: var(--color-muted-foreground);
      user-select: none;
    }
    .studio-crumb--link {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      font: inherit;
      text-decoration: underline dotted;
      text-underline-offset: 3px;
    }
    .studio-crumb--link:hover {
      color: var(--color-foreground);
    }
    .studio-crumb--current {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-foreground);
      max-width: 40ch;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .studio-crumb--current:hover {
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
      overflow: hidden;
      background: #fff;
    }
    .studio-preview-frame {
      /* TZ-NX-PO-SWEEP-06 — width/height/transform:scale set inline
         ([style.*] bindings) to the real A4 px size + zoomMode-matching
         scale factor; this is layout-only (position/origin). */
      display: block; border: none; background: #fff;
      position: absolute; top: 0; left: 0;
      transform-origin: top left;
    }
    .preview-state {
      margin: 0; padding: 24px; font-size: 13px; color: var(--color-muted-foreground);
    }
    .preview-state--error { color: var(--color-destructive); }
  `],
})
export class StudioEditorPage implements AfterViewInit, OnDestroy {
  readonly facade = inject(StudioEditorFacade);
  private readonly shellTools = inject(ShellToolRailService);
  private readonly sheetHostRef = viewChild<ElementRef<HTMLElement>>('sheetHost');
  private resizeObserver?: ResizeObserver;
  private readonly onStudioBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!this.facade.isStudioDirty()) return;
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

  // ─── Signal/computed passthroughs — same object refs as the facade, so
  // template bindings and spec `componentInstance` access are unchanged
  // (TZ-NX-DOCSTUDIO-EDITOR-FACADE ШАГ 2: "Re-export тех же signal object
  // refs на page"). ───
  readonly document = this.facade.document;
  readonly issuerOrgId = this.facade.issuerOrgId;
  readonly issuerOrgs = this.facade.issuerOrgs;
  readonly counterparties = this.facade.counterparties;
  readonly quotations = this.facade.quotations;
  readonly orders = this.facade.orders;
  readonly tokenDisplayMode = this.facade.tokenDisplayMode;
  readonly contextSaving = this.facade.contextSaving;
  readonly contextSaveError = this.facade.contextSaveError;
  readonly catalogSelections = this.facade.catalogSelections;
  readonly catalogWriteBusy = this.facade.catalogWriteBusy;
  readonly blocks = this.facade.blocks;
  readonly selectedId = this.facade.selectedId;
  readonly activeLayerId = this.facade.activeLayerId;
  readonly activeSection = this.facade.activeSection;
  readonly panelCollapsed = this.facade.panelCollapsed;
  readonly viewMode = this.facade.viewMode;
  readonly previewHtml = this.facade.previewHtml;
  readonly previewLoading = this.facade.previewLoading;
  readonly previewError = this.facade.previewError;
  readonly currentPage = this.facade.currentPage;
  readonly templateSaving = this.facade.templateSaving;
  readonly saving = this.facade.saving;
  readonly docTypes = this.facade.docTypes;
  readonly docTypeSaving = this.facade.docTypeSaving;
  readonly pdfLoading = this.facade.pdfLoading;
  readonly finalizing = this.facade.finalizing;
  readonly selectedBlock = this.facade.selectedBlock;
  readonly propertiesBlock = this.facade.propertiesBlock;
  readonly panelIsTable = this.facade.panelIsTable;
  readonly previewSafeHtml = this.facade.previewSafeHtml;
  readonly previewNativeSheetSize = this.facade.previewNativeSheetSize;
  readonly catalogChipLabels = this.facade.catalogChipLabels;
  readonly selectedAnchorLabels = this.facade.selectedAnchorLabels;
  readonly counterpartyId = this.facade.counterpartyId;
  readonly payerId = this.facade.payerId;
  readonly supplierId = this.facade.supplierId;
  readonly quotationId = this.facade.quotationId;
  readonly orderId = this.facade.orderId;
  readonly editorSubstitutionBag = this.facade.editorSubstitutionBag;
  readonly docTypeId = this.facade.docTypeId;
  readonly isKpDoc = this.facade.isKpDoc;
  readonly linkedQuotationStatus = this.facade.linkedQuotationStatus;
  readonly selectedBufferCount = this.facade.selectedBufferCount;
  readonly panelSide = this.facade.panelSide;
  readonly pageNumbering = this.facade.pageNumbering;
  readonly backgroundImages = this.facade.backgroundImages;
  readonly backgroundIndex = this.facade.backgroundIndex;
  readonly backgroundOpacity = this.facade.backgroundOpacity;
  readonly pageCount = this.facade.pageCount;
  readonly pageBlocks = this.facade.pageBlocks;
  readonly layersForPage = this.facade.layersForPage;
  readonly panelTitle = this.facade.panelTitle;
  readonly activeLayerBlock = this.facade.activeLayerBlock;
  readonly statusText = this.facade.statusText;
  readonly pendingDataJump = this.facade.pendingDataJump;

  protected readonly chevronLeft = ChevronLeft;
  protected readonly chevronRight = ChevronRight;

  // ─── DOM-only state: canvas fit-to-viewport. Stays on the page — needs
  // `sheetHostRef` (viewChild), which a plain Injectable facade cannot have. ───
  readonly sheetSize = signal({ width: 800, height: 566 });
  readonly zoomMode = signal<'fit' | '100'>('fit');
  readonly previewZoomScale = computed(() => {
    const native = this.facade.previewNativeSheetSize();
    const target = this.sheetSize();
    if (!native.width || !target.width) return 1;
    return target.width / native.width;
  });

  setZoomMode(mode: 'fit' | '100'): void {
    this.zoomMode.set(mode);
    this.syncSheetSize();
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

  constructor() {
    this.facade.setSyncSheetSizeHook(() => this.syncSheetSize());

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncSheetSize());
    }

    effect(() => {
      const section = this.activeSection();
      const collapsed = this.panelCollapsed();
      const viewMode = this.viewMode();
      const doc = this.document();
      const selectedId = this.selectedId();
      const selectedBlock = selectedId ? this.blocks().find((b) => b._id === selectedId) : null;
      // TZ-NX-PO-SWEEP-02: table selected but Свойства not open yet — hint the
      // rail button (same active/жёлтый style) instead of auto-opening the panel.
      const propertiesHint =
        section !== 'properties' && selectedBlock?.type === 'table' && !selectedBlock.locked;
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
          // TZ-NX-PO-SWEEP-07 — one «Документ» category instead of 5 flat
          // lifecycle icons (mode-editor/mode-preview/save/pdf/archive):
          // rail slots are categories that open a menu, not one-icon=one-action.
          {
            id: 'document', side: 'right', ariaLabel: 'Документ', title: 'Документ', icon: DocumentIcon,
            items: [
              {
                id: 'mode-editor', label: 'Редактор', icon: PenLine,
                active: viewMode === 'editor', onClick: () => this.setViewMode('editor'),
              },
              {
                id: 'mode-preview', label: 'Просмотр', icon: Eye,
                active: viewMode === 'preview', onClick: () => this.setViewMode('preview'),
              },
              {
                id: 'save', label: 'Сохранить', icon: Save,
                disabled: this.saving(), onClick: () => void this.saveDocument(),
              },
              {
                id: 'pdf', label: 'Скачать PDF', icon: FileDown,
                disabled: this.pdfLoading(), onClick: () => this.onDownloadPdf(),
              },
              {
                id: 'archive',
                label: doc?.status === 'draft' ? 'В архив' : 'Уже в архиве',
                icon: Archive,
                disabled: this.finalizing() || doc?.status !== 'draft',
                onClick: () => this.onFinalize(),
              },
            ],
          },
          { id: 'elements', side: 'right', ariaLabel: 'Элементы', title: 'Элементы', icon: FileText, active: !collapsed && section === 'elements', onClick: () => this.onSection('elements') },
          { id: 'layers', side: 'right', ariaLabel: 'Слои', title: 'Слои', icon: Layers, active: !collapsed && section === 'layers', onClick: () => this.onSection('layers') },
          { id: 'pages', side: 'right', ariaLabel: 'Страницы', title: 'Страницы', icon: FileStack, active: !collapsed && section === 'pages', onClick: () => this.onSection('pages') },
          { id: 'properties', side: 'right', ariaLabel: 'Свойства', title: 'Свойства', icon: Settings2, active: !collapsed && (section === 'properties' || propertiesHint), onClick: () => this.onSection('properties') },
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
  }

  /**
   * TZ-NX-PO-SWEEP-03: dismiss the open tools panel on a click anywhere
   * outside it — not just the A4 sheet (`onSheetClick`). Clicks inside the
   * panel body and on a selected canvas block already `stopPropagation()`
   * (workspace-shell panel, `selectBlock`/`startDrag`) so they never reach
   * `document`; this only has to exclude the chrome rail (avoid a double
   * toggle — it manages the panel itself) and any CDK overlay (dialogs).
   */
  @HostListener('document:click', ['$event'])
  onDocumentClickOutside(event: MouseEvent): void {
    if (this.panelCollapsed()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.cdk-overlay-container')) return;
    if (target.closest('[data-test="studio-tools-panel"]')) return;
    if (target.closest('.shell-rail')) return;
    if (target.closest('[data-test="studio-icon-rail-horizontal"]')) return;
    this.onSheetClick();
  }

  canDeactivate(): Promise<boolean> {
    return this.facade.confirmLeave();
  }

  // ─── One-line method delegates — same names/signatures as before, so the
  // template above and existing `TestableEditor`-cast specs need no rewrite. ───
  onSection(id: string): void { this.facade.onSection(id); }
  onTokenDisplayModeChange(mode: 'tokens' | 'values'): void { this.facade.onTokenDisplayModeChange(mode); }
  onEditSelection(key: string): void { this.facade.onEditSelection(key); }
  saveDocument(): Promise<boolean> { return this.facade.saveDocument(); }
  isStudioDirty(): boolean { return this.facade.isStudioDirty(); }
  confirmLeave(): Promise<boolean> { return this.facade.confirmLeave(); }
  openDocumentList(): void { this.facade.openDocumentList(); }
  setOrientation(orientation: 'portrait' | 'landscape'): void { this.facade.setOrientation(orientation); }
  setBackgroundIndex(index: number): void { this.facade.setBackgroundIndex(index); }
  setBackgroundOpacity(opacity: number): void { this.facade.setBackgroundOpacity(opacity); }
  togglePageNumbering(enabled: boolean): void { this.facade.togglePageNumbering(enabled); }
  togglePanel(): void { this.facade.togglePanel(); }
  setViewMode(mode: 'editor' | 'preview'): void { this.facade.setViewMode(mode); }
  onLayoutCommit(): void { this.facade.onLayoutCommit(); }
  onSheetClick(): void { this.facade.onSheetClick(); }
  onSelect(id: string): void { this.facade.onSelect(id); }
  activateLayer(id: string): void { this.facade.activateLayer(id); }
  openLayerProperties(id: string): void { this.facade.openLayerProperties(id); }
  addLayer(): void { this.facade.addLayer(); }
  addTableLayer(): void { this.facade.addTableLayer(); }
  insertCatalogTable(kind: StudioShowcaseKind): void { this.facade.insertCatalogTable(kind); }
  onCatalogEntitySaved(kind: StudioShowcaseKind): void { this.facade.onCatalogEntitySaved(kind); }
  refreshCatalogTablesOfKind(kind: StudioShowcaseKind): Promise<void> { return this.facade.refreshCatalogTablesOfKind(kind); }
  addTextToActiveLayer(): void { this.facade.addTextToActiveLayer(); }
  insertPartyText(key: string): void { this.facade.insertPartyText(key); }
  addImageToActiveLayer(file: File): void { this.facade.addImageToActiveLayer(file); }
  setImageAsBackground(): void { this.facade.setImageAsBackground(); }
  clearImageBackground(): void { this.facade.clearImageBackground(); }
  prevPage(): void { this.facade.prevPage(); }
  nextPage(): void { this.facade.nextPage(); }
  goToPage(page: number): void { this.facade.goToPage(page); }
  changeLayout(id: string, layout: StudioBlockLayout): void { this.facade.changeLayout(id, layout); }
  applyLayerZOrder(blockIdsTopToBottom: readonly string[]): void { this.facade.applyLayerZOrder(blockIdsTopToBottom); }
  patchBlockStyle(patch: Partial<StudioBlockStyle>): void { this.facade.patchBlockStyle(patch); }
  patchBlockContent(content: string): void { this.facade.patchBlockContent(content); }
  patchBlockContentFromCanvas(id: string, content: string): void { this.facade.patchBlockContentFromCanvas(id, content); }
  patchTableRows(rows: string[][]): void { this.facade.patchTableRows(rows); }
  onTableSourceChange(source: StudioTableRowSource): void { this.facade.onTableSourceChange(source); }
  patchTableSettings(patch: Record<string, unknown>): void { this.facade.patchTableSettings(patch); }
  patchTableDisabledRows(indices: number[]): void { this.facade.patchTableDisabledRows(indices); }
  onLiveTableQtyChange(event: { rowIndex: number; value: string }): void { this.facade.onLiveTableQtyChange(event); }
  openSaveTableTemplateDialog(): void { this.facade.openSaveTableTemplateDialog(); }
  applyLibraryText(textBlock: TextBlock): void { this.facade.applyLibraryText(textBlock); }
  openSaveTextBlockDialog(): void { this.facade.openSaveTextBlockDialog(); }
  removeCatalogChip(kind: string): void { this.facade.removeCatalogChip(kind); }
  onCatalogSelectionChange(change: { kind: StudioShowcaseKind; ids: readonly string[] }): void { this.facade.onCatalogSelectionChange(change); }
  onCounterpartyChange(counterpartyId: string): void { this.facade.onCounterpartyChange(counterpartyId); }
  onAnchorChange(anchorKey: 'payer' | 'supplier', entityId: string): void { this.facade.onAnchorChange(anchorKey, entityId); }
  onQuotationChange(quotationId: string): void { this.facade.onQuotationChange(quotationId); }
  onOrderChange(orderId: string): void { this.facade.onOrderChange(orderId); }
  onDocTypeChange(docTypeId: string): void { this.facade.onDocTypeChange(docTypeId); }
  onIssuerOrgChange(organizationId: string): void { this.facade.onIssuerOrgChange(organizationId); }
  onQuotationStatusChange(status: QuotationStatus): void { this.facade.onQuotationStatusChange(status); }
  openRenameDialog(): void { this.facade.openRenameDialog(); }
  openSaveAsTemplateDialog(): void { this.facade.openSaveAsTemplateDialog(); }
  onDownloadPdf(): void { this.facade.onDownloadPdf(); }
  onFinalize(): void { this.facade.onFinalize(); }
  patchBlockTitle(title: string): void { this.facade.patchBlockTitle(title); }
  deleteLayerById(id: string | null | undefined): void { this.facade.deleteLayerById(id); }
  addPage(): void { this.facade.addPage(); }
  toggleOrientation(): void { this.facade.toggleOrientation(); }
  toggleLock(block: StudioBlock): void { this.facade.toggleLock(block); }
  toggleVisible(block: StudioBlock): void { this.facade.toggleVisible(block); }

  // ─── The rest of the facade's methods stay facade-internal (implementation
  // detail, never called from the template/HostListener/shellTools-effect
  // above) — EXCEPT these two, which existing specs invoke directly on
  // `componentInstance` despite being private pre-extraction (TS `private`
  // is compile-time only; the spec's own `Testable`-style cast reaches them
  // at runtime). Delegated here for zero-rewrite spec compatibility. ───
  insertTextContent(content: string, title?: string): void { this.facade.insertTextContent(content, title); }
  saveLayouts(): Promise<boolean> { return this.facade.saveLayouts(); }

  /** Two more spec-reached facade fields (`catalogWriteChain` awaited directly; `layoutsDirty` set directly) — live passthrough accessors, not a one-time value copy. */
  get catalogWriteChain(): Promise<void> { return this.facade.catalogWriteChain; }
  get layoutsDirty(): boolean { return this.facade.layoutsDirty; }
  set layoutsDirty(value: boolean) { this.facade.layoutsDirty = value; }
}
