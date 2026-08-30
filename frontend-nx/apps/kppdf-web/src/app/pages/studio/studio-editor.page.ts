import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChevronLeft, ChevronRight, FileText, Layers, LucideAngularModule, Settings2 } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import {
  PiStudioBlocksService,
  PiStudioDocumentsService,
  type StudioBlock,
  type StudioBlockLayout,
  type StudioBlockStyle,
  type StudioDocument,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiToastService } from '@kppdf/ui/toast';
import { extractErrorMessage } from '@kppdf/util-http';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { StudioBlocksCanvasComponent } from './studio-blocks-canvas.component';
import { StudioElementsPanelComponent } from './studio-elements-panel.component';
import { StudioLayersPanelComponent } from './studio-layers-panel.component';
import { StudioPropertiesPanelComponent } from './studio-properties-panel.component';
import {
  onStudioSectionClick,
  studioPanelSide,
  studioPanelTitle,
  type StudioWorkspaceSection,
} from './studio-workspace-chrome';
import { StudioWorkspaceShellComponent } from './studio-workspace-shell.component';
import {
  coerceStudioBlockLayout,
  normalizeStudioBlockLayout,
  studioCenteredImageLayout,
  studioCenteredTableLayout,
  studioCenteredTextLayout,
  zIndexFromLayerOrder,
} from './studio-layout';
import {
  STUDIO_DEFAULT_TABLE_COLUMNS,
  STUDIO_DEFAULT_TABLE_ROWS,
} from './studio-table-defaults';

const STUDIO_TOOL_OWNER = 'studio-editor';

@Component({
  selector: 'pi-studio-editor-page',
  standalone: true,
  imports: [
    StudioWorkspaceShellComponent,
    StudioBlocksCanvasComponent,
    StudioElementsPanelComponent,
    StudioLayersPanelComponent,
    StudioPropertiesPanelComponent,
    ButtonComponent,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (document(); as doc) {
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
        (sectionChange)="onSection($event)"
        (panelToggle)="togglePanel()"
        (sheetClick)="onSheetClick()"
      >
        <div kpWsRibbonExtra class="studio-ribbon-extra">
          <span class="ribbon-label">Студия документов</span>
          <app-pi-button variant="secondary" size="sm" data-test="studio-add-page" (click)="addPage()">
            + Страница
          </app-pi-button>
          <div class="page-nav" data-test="studio-page-nav">
            <button
              type="button"
              class="page-nav__btn pi-focus-ring"
              data-test="studio-page-prev"
              [disabled]="currentPage() <= 1"
              aria-label="Предыдущая страница"
              (click)="prevPage()"
            >
              <lucide-angular [img]="chevronLeft" [size]="16" aria-hidden="true" />
            </button>
            <span class="page-nav__label">Стр. {{ currentPage() }} / {{ pageCount() }}</span>
            <button
              type="button"
              class="page-nav__btn pi-focus-ring"
              data-test="studio-page-next"
              [disabled]="currentPage() >= pageCount()"
              aria-label="Следующая страница"
              (click)="nextPage()"
            >
              <lucide-angular [img]="chevronRight" [size]="16" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            data-test="studio-toggle-orientation"
            (click)="toggleOrientation()"
          >
            {{ doc.orientation === 'landscape' ? 'Альбомная' : 'Книжная' }}
          </button>
        </div>

        <div kpWsRibbonActions class="studio-ribbon-actions">
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            [class.kp-ws-ribbon-btn--active]="viewMode() === 'editor'"
            (click)="setViewMode('editor')"
          >
            Редактор
          </button>
          <button
            type="button"
            class="kp-ws-ribbon-btn"
            [class.kp-ws-ribbon-btn--active]="viewMode() === 'preview'"
            data-test="studio-view-preview"
            (click)="setViewMode('preview')"
          >
            Просмотр
          </button>
        </div>

        <div kpWsPanel class="studio-panel-inner text-sm">
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
              />
            }
            @case ('properties') {
              <pi-studio-properties-panel
                [block]="propertiesBlock()"
                (styleChange)="patchBlockStyle($event)"
                (contentChange)="patchBlockContent($event)"
                (titleChange)="patchBlockTitle($event)"
                (imageFullPage)="setImageFullPage()"
                (deleteLayer)="deleteActiveLayer()"
                (tableRowsChange)="patchTableRows($event)"
              />
            }
          }
        </div>

        <div kpWsSheet class="studio-canvas-host" #sheetHost>
          @if (viewMode() === 'preview') {
            @if (previewLoading()) {
              <p class="preview-state">Рендер документа…</p>
            } @else if (previewError()) {
              <p class="preview-state preview-state--error">{{ previewError() }}</p>
            } @else if (previewHtml()) {
              <iframe
                class="studio-preview-frame"
                title="Просмотр документа"
                [attr.srcdoc]="previewHtml()"
                data-test="studio-preview-frame"
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
              (selected)="onSelect($event)"
              (layoutChanged)="changeLayout($event.id, $event.layout)"
              (contentChanged)="patchBlockContentFromCanvas($event.id, $event.content)"
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
    .studio-ribbon-extra, .studio-ribbon-actions {
      display: inline-flex; align-items: center; gap: var(--space-1, 4px); flex-shrink: 0;
    }
    .ribbon-label {
      font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--color-muted-foreground); margin-right: var(--space-1, 4px);
    }
    .page-nav {
      display: inline-flex; align-items: center; gap: 6px; margin-left: 8px;
      padding: 2px 4px; border: 1px solid var(--color-rule); border-radius: var(--radius-sm);
      background: var(--color-paper-raised);
    }
    .page-nav__btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; padding: 0;
      border: 1px solid var(--color-rule-strong); border-radius: var(--radius-sm);
      background: var(--color-paper-2); color: var(--color-ink); cursor: pointer;
    }
    .page-nav__btn:disabled { opacity: 0.35; cursor: default; }
    .page-nav__btn:not(:disabled):hover { background: var(--color-paper-3); }
    .page-nav__label {
      font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
      color: var(--color-ink); min-width: 6.5rem; text-align: center;
    }
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
    :host ::ng-deep .kp-ws-ribbon-btn--active {
      background: var(--color-gold); border-color: var(--color-gold-deep); color: var(--color-on-gold);
    }
  `],
})
export class StudioEditorPage implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly documents = inject(PiStudioDocumentsService);
  private readonly blocksService = inject(PiStudioBlocksService);
  private readonly toast = inject(PiToastService);
  private readonly shellTools = inject(ShellToolRailService);
  private readonly sheetHostRef = viewChild<ElementRef<HTMLElement>>('sheetHost');
  private timer?: number;
  private resizeObserver?: ResizeObserver;

  readonly document = signal<StudioDocument | null>(null);
  readonly blocks = signal<readonly StudioBlock[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly activeLayerId = signal<string | null>(null);
  readonly activeSection = signal<StudioWorkspaceSection | null>('layers');
  readonly panelCollapsed = signal(false);
  readonly viewMode = signal<'editor' | 'preview'>('editor');
  readonly previewHtml = signal<string | null>(null);
  readonly previewLoading = signal(false);
  readonly previewError = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly sheetSize = signal({ width: 800, height: 566 });

  readonly selectedBlock = computed(() => {
    const id = this.selectedId();
    return id ? this.blocks().find((b) => b._id === id) ?? null : null;
  });

  readonly propertiesBlock = computed(() => this.selectedBlock() ?? this.activeLayerBlock());

  readonly panelSide = computed(() => studioPanelSide(this.activeSection()));

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
          this.document.set(r.data);
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
              this.activeSection.set('layers');
              this.panelCollapsed.set(false);
            }
          });
        }
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncSheetSize());
    }

    effect(() => {
      const section = this.activeSection();
      const collapsed = this.panelCollapsed();
      this.shellTools.setTools(STUDIO_TOOL_OWNER, {
        left: [
          {
            id: 'elements',
            side: 'left',
            ariaLabel: 'Элементы',
            title: 'Элементы',
            icon: FileText,
            active: !collapsed && section === 'elements',
            onClick: () => this.onSection('elements'),
          },
          {
            id: 'layers',
            side: 'left',
            ariaLabel: 'Слои',
            title: 'Слои',
            icon: Layers,
            active: !collapsed && section === 'layers',
            onClick: () => this.onSection('layers'),
          },
        ],
        right: [
          {
            id: 'properties',
            side: 'right',
            ariaLabel: 'Свойства',
            title: 'Свойства',
            icon: Settings2,
            active: !collapsed && section === 'properties',
            onClick: () => this.onSection('properties'),
          },
        ],
      });
    });
  }

  ngAfterViewInit(): void {
    const el = this.sheetHostRef()?.nativeElement;
    if (el && this.resizeObserver) {
      this.resizeObserver.observe(el);
      this.syncSheetSize();
    }
  }

  ngOnDestroy(): void {
    this.shellTools.clear(STUDIO_TOOL_OWNER);
    this.resizeObserver?.disconnect();
    if (this.timer) clearTimeout(this.timer);
  }

  onSection(id: string): void {
    onStudioSectionClick(id as StudioWorkspaceSection, this.activeSection, this.panelCollapsed);
  }

  togglePanel(): void {
    this.panelCollapsed.update((v) => !v);
  }

  setViewMode(mode: 'editor' | 'preview'): void {
    this.viewMode.set(mode);
    if (mode === 'preview') {
      this.panelCollapsed.set(true);
      this.selectedId.set(null);
      this.fetchPreview();
      return;
    }
    this.previewHtml.set(null);
    this.previewError.set(null);
  }

  onSheetClick(): void {
    this.selectedId.set(null);
    this.panelCollapsed.set(true);
  }

  onSelect(id: string): void {
    if (this.activeLayerId() !== id) return;
    this.selectedId.set(id);
    this.activeSection.set('properties');
    this.panelCollapsed.set(false);
  }

  activateLayer(id: string): void {
    this.activeLayerId.set(id);
    this.selectedId.set(id);
    this.activeSection.set('layers');
    this.panelCollapsed.set(false);
  }

  openLayerProperties(id: string): void {
    this.activeLayerId.set(id);
    this.selectedId.set(id);
    this.activeSection.set('properties');
    this.panelCollapsed.set(false);
  }

  addLayer(): void {
    void this.createTextLayer();
  }

  addTableLayer(): void {
    const d = this.document();
    if (!d) return;
    const layerNo = this.layersForPage().length + 1;
    const zIndex = this.nextZIndex();
    void firstValueFrom(
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
    const layerId = this.activeLayerId();
    const block = layerId ? this.blocks().find((b) => b._id === layerId) : null;
    if (block?.type === 'image') {
      void this.uploadImageToBlock(block._id, file);
      return;
    }
    void this.createImageLayer(file);
  }

  setImageFullPage(): void {
    const block = this.propertiesBlock();
    if (!block?.layout || block.type !== 'image' || block._id !== this.activeLayerId()) return;
    this.changeLayout(block._id, normalizeStudioBlockLayout({ ...block.layout, x: 0, y: 0, width: 1, height: 1 }));
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
    const createRes = await firstValueFrom(
      this.blocksService.create(d._id, {
        expectedRevision: d.revision ?? 1,
        type: 'image',
        order: this.blocks().length,
        title,
        content: '',
        layout: studioCenteredImageLayout(zIndex, this.currentPage()),
        settings: { overlay: true },
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
          settings: { overlay: true, imageUrl: localUrl },
        }
      : { ...createRes.data, settings: { overlay: true, imageUrl: localUrl } };
    this.blocks.update((b) => [...b, block]);
    this.document.update((x) => (x ? { ...x, revision: (x.revision ?? 1) + 1 } : x));
    this.activateLayer(block._id);
    await this.uploadImageToBlock(block._id, file, localUrl);
  }

  private async uploadImageToBlock(
    blockId: string,
    file: File,
    existingLocalUrl?: string,
  ): Promise<void> {
    const localUrl = existingLocalUrl ?? URL.createObjectURL(file);
    if (!existingLocalUrl) {
      this.blocks.update((b) =>
        b.map((x) =>
          x._id === blockId
            ? { ...x, settings: { ...(x.settings ?? {}), imageUrl: localUrl } }
            : x,
        ),
      );
    }
    const uploadRes = await firstValueFrom(this.blocksService.uploadImage(blockId, file));
    URL.revokeObjectURL(localUrl);
    if (uploadRes.ok) {
      this.blocks.update((b) =>
        b.map((x) =>
          x._id === blockId
            ? { ...x, settings: { ...(x.settings ?? {}), imageUrl: uploadRes.data.url } }
            : x,
        ),
      );
    } else {
      this.toast.error(extractErrorMessage(uploadRes.error));
    }
  }

  private syncActiveLayerForPage(): void {
    this.selectedId.set(null);
    this.pickDefaultLayer(this.layersForPage());
  }

  changeLayout(id: string, layout: StudioBlockLayout): void {
    const normalized = normalizeStudioBlockLayout(layout);
    this.blocks.update((b) => b.map((x) => (x._id === id ? { ...x, layout: normalized } : x)));
    this.schedule();
  }

  applyLayerZOrder(blockIdsTopToBottom: readonly string[]): void {
    const zMap = zIndexFromLayerOrder(blockIdsTopToBottom);
    this.blocks.update((blocks) =>
      blocks.map((b) => {
        const zIndex = zMap.get(b._id);
        if (zIndex === undefined || !b.layout || b.layout.zIndex === zIndex) return b;
        return { ...b, layout: normalizeStudioBlockLayout({ ...b.layout, zIndex }) };
      }),
    );
    this.schedule();
  }

  patchBlockStyle(patch: Partial<StudioBlockStyle>): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'text' || block._id !== this.activeLayerId()) return;
    const nextStyle = { ...block.style, ...patch };
    this.blocks.update((b) =>
      b.map((x) => (x._id === block._id ? { ...x, style: nextStyle } : x)),
    );
    void firstValueFrom(this.blocksService.update(block._id, { style: patch })).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
      } else {
        this.conflict();
      }
    });
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
    void firstValueFrom(this.blocksService.update(blockId, { content })).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
      } else {
        this.conflict();
      }
    });
  }

  patchTableRows(rows: string[][]): void {
    const block = this.propertiesBlock();
    if (!block || block.type !== 'table' || block._id !== this.activeLayerId()) return;
    const settings = { ...(block.settings ?? {}), tableTemplateSampleRows: rows };
    this.blocks.update((b) =>
      b.map((x) => (x._id === block._id ? { ...x, settings } : x)),
    );
    void firstValueFrom(this.blocksService.update(block._id, { settings })).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
      } else {
        this.conflict();
      }
    });
  }

  patchBlockTitle(title: string): void {
    const block = this.propertiesBlock();
    if (!block || block._id !== this.activeLayerId()) return;
    this.blocks.update((b) => b.map((x) => (x._id === block._id ? { ...x, title } : x)));
    void firstValueFrom(this.blocksService.update(block._id, { title })).then((r) => {
      if (r.ok) {
        this.blocks.update((b) => b.map((x) => (x._id === r.data._id ? r.data : x)));
      } else {
        this.conflict();
      }
    });
  }

  deleteActiveLayer(): void {
    const id = this.activeLayerId();
    const doc = this.document();
    if (!id || !doc) return;
    const block = this.blocks().find((b) => b._id === id);
    if (block?.locked) {
      this.toast.error('Слой заблокирован');
      return;
    }
    void firstValueFrom(this.blocksService.remove(id)).then((r) => {
      if (!r.ok) {
        this.conflict();
        return;
      }
      this.blocks.update((b) => b.filter((x) => x._id !== id));
      this.selectedId.set(null);
      this.syncActiveLayerForPage();
      this.toast.success('Слой удалён');
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
    this.blocks.update((b) => b.map((x) => (x._id === block._id ? { ...x, locked: !x.locked } : x)));
    this.schedule();
  }

  toggleVisible(block: StudioBlock): void {
    this.blocks.update((b) =>
      b.map((x) =>
        x._id === block._id ? { ...x, isActive: x.isActive === false ? true : false } : x,
      ),
    );
    this.schedule();
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
    this.sheetSize.set({
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
    });
  }

  private nextZIndex(): number {
    const max = this.blocks().reduce((m, b) => Math.max(m, b.layout?.zIndex ?? 0), 0);
    return max + 1;
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.saveLayouts(), 400);
  }

  private saveLayouts(): void {
    const d = this.document();
    if (!d) return;
    const updates = this.blocks()
      .filter((b): b is StudioBlock & { layout: StudioBlockLayout } => Boolean(b.layout))
      .map((b) => ({
        blockId: b._id,
        layout: normalizeStudioBlockLayout(b.layout),
      }));
    void firstValueFrom(
      this.blocksService.updateLayouts(d._id, { expectedRevision: d.revision ?? 1, updates }),
    ).then((r) => {
      if (r.ok) {
        const normalized = r.data.map((block) =>
          block.layout ? { ...block, layout: coerceStudioBlockLayout(block.layout) } : block,
        );
        this.blocks.set(normalized);
        this.document.update((x) => (x ? { ...x, revision: (x.revision ?? 1) + 1 } : x));
      } else {
        this.conflict();
      }
    });
  }

  private conflict(): void {
    this.toast.error('Документ изменён в другом месте');
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
