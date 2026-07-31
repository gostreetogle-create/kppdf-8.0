/**
 * BlockRendererStateService — extracted state, computations, and mutating
 * DOM event handlers for `BlockRendererComponent` (the leaf presentational
 * component that renders ONE TemplateBlock on the builder canvas).
 *
 * TZ-235.B. Migrated from `block-renderer.component.ts` (1484 lines → ~870 lines)
 * to:
 *   - Make SAFE addition of group drag (TZ-235.D), undo/redo (TZ-235.E),
 *     alignment guides for snap (TZ-236+), and any other complex state
 *     extensions without bloating the component.
 *   - Reduce coupling between BlockRenderer's template (HTML/CSS) and its
 *     imperative drag/resize/snap logic.
 *   - Reuse the proven TZ-235.A R3 pattern (service = source of truth,
 *     component = thin coordinator with template-only syntax).
 *
 * Scope (this batch — TZ-235.B):
 *   - Mirrored input signals (block + 3 snap settings). Component forwards
 *     its Angular `input()` values here via `effect()` in constructor.
 *   - 8 state signals (width/margin current + 6 drag/resize state).
 *   - 15 computed (hasColumns, imageUrl, imageWidth, imageHeight, isOverlay,
 *     overlayLeft, overlayTop, blockBgColor, tableColumns, tableRows,
 *     columnsGridTemplate, typeLabel, bindingBadge, bindingBadgeTooltip,
 *     renderedContent).
 *   - 3 effects in constructor (sync width+margin from block.settings, clear
 *     drag override on settings catch-up, clear resize override on settings
 *     catch-up).
 *   - 3 mutating DOM-event handlers (onResizeStart, onOverlayDragStart,
 *     onCornerResizeStart) — all contain document.addEventListener
 *     call-site cleanup. Pure handlers (onSelect/onCheckboxClick/
 *     onDeleteClick/onArrowKey/formatTableCell/byPassHtml) STAY in the
 *     component because they are either pure-output emits or formatting
 *     helpers.
 *   - 4 Subjects for service-emitted stream-style outputs (widthChange$,
 *     overlayMove$, overlayResize$, positionedGeometryChange$) — component subscribes with
 *     takeUntilDestroyed() to re-emit as Angular `output()`.
 *   - 3 private snap helpers (snapValueToGrid, applySnapToGrid,
 *     snapToBlockEdges) + 2 axis private fields + SNAP_THRESHOLD constant
 *     + 2 overlay default dimensions.
 *
 * OUT OF SCOPE (future rounds):
 *   - Group drag (TZ-235.D) — multi-block snapping + alignment guides
 *   - Undo/redo stack (TZ-235.E) — history buffer + apply()/unapply()
 *
 * Lifetime: COMPONENT-SCOPED (per-instance). Each `<app-block-renderer>` on
 * the canvas owns its own service instance. Registered via
 * `providers: [BlockRendererStateService]` on the @Component decorator.
 *
 * Rationale (mirrors TZ-235.A R3 verdict):
 *   - `providedIn: 'root'` would share drag/resize state across ALL
 *     renderer instances → interference when multiple blocks dragged.
 *   - Per-instance guarantees state dies when the component is destroyed.
 *   - Two browser tabs have separate JS contexts; no cross-tab concern.
 */
import {
  afterNextRender,
  DestroyRef,
  ElementRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  clampPositionedGeometry,
  clientToDocumentPoint,
  getPageDimensions,
  readPositionedGeometry,
  type BuilderOrientation,
  type BuilderPageSize,
  type PositionedGeometry,
} from './builder-geometry';
import { Subject } from 'rxjs';
import {
  BLOCK_TYPE_LABELS,
  type BlockType,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { TableColumn } from '../../../shared/services/pi-table-templates.service';

@Injectable()
export class BlockRendererStateService {
  // ─────────────────────────────────────────────────────────────────
  // Mirrored input signals (set via component effect() in constructor)
  // ─────────────────────────────────────────────────────────────────
  private readonly _block = signal<TemplateBlock | null>(null);
  private readonly _snapEnabled = signal<boolean>(true);
  private readonly _gridSize = signal<number>(20);
  private readonly _boundaryPadding = signal<number>(0);
  private readonly _pageSize = signal<BuilderPageSize>('A4');
  private readonly _orientation = signal<BuilderOrientation>('portrait');
  private readonly _canvasScale = signal<number>(1);

  /** Readonly public views — for component.template & computeds. */
  readonly block = this._block.asReadonly();
  readonly snapEnabled = this._snapEnabled.asReadonly();
  readonly gridSize = this._gridSize.asReadonly();
  readonly boundaryPadding = this._boundaryPadding.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly orientation = this._orientation.asReadonly();
  readonly canvasScale = this._canvasScale.asReadonly();

  // ─────────────────────────────────────────────────────────────────
  // State signals (flow mode: width + margin)
  // ─────────────────────────────────────────────────────────────────
  readonly currentWidth = signal<number>(100);
  readonly currentMarginLeft = signal<number>(0);

  // ─────────────────────────────────────────────────────────────────
  // State signals (overlay mode: drag)
  // ─────────────────────────────────────────────────────────────────
  readonly dragActive = signal(false);
  readonly dragLeft = signal(0);
  readonly dragTop = signal(0);
  readonly positionedDragActive = signal(false);
  readonly positionedDragGeometry = signal<PositionedGeometry | null>(null);

  // ─────────────────────────────────────────────────────────────────
  // State signals (overlay mode: corner resize)
  // ─────────────────────────────────────────────────────────────────
  readonly resizeActive = signal(false);
  readonly resizeWidth = signal(0);
  readonly resizeHeight = signal(0);
  readonly positionedResizeActive = signal(false);
  readonly positionedResizeWidth = signal(0);
  readonly positionedResizeHeight = signal(0);

  // ─────────────────────────────────────────────────────────────────
  // Snap state (private — used only during interactive drag)
  // ─────────────────────────────────────────────────────────────────
  private snapAxisX: string | null = null;
  private snapAxisY: string | null = null;
  private readonly SNAP_THRESHOLD = 8;

  /** Default image width when overlay is toggled on without explicit dimensions. */
  readonly overlayDefaultWidth = 300;
  /** Default image height calculated from 3:2 ratio fallback. */
  readonly overlayDefaultHeight = 200;

  // ─────────────────────────────────────────────────────────────────
  // Output streams (Subject→Observable). Component subscribes &
  // re-emits as Angular output().
  // ─────────────────────────────────────────────────────────────────
  private readonly widthChangeSub = new Subject<{
    width: number;
    marginLeft: number;
  }>();
  readonly widthChange$ = this.widthChangeSub.asObservable();

  private readonly overlayMoveSub = new Subject<{
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }>();
  readonly overlayMove$ = this.overlayMoveSub.asObservable();

  private readonly overlayResizeSub = new Subject<{
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }>();
  readonly overlayResize$ = this.overlayResizeSub.asObservable();

  private readonly positionedGeometryChangeSub = new Subject<{
    block: TemplateBlock;
    geometry: PositionedGeometry;
  }>();
  readonly positionedGeometryChange$ = this.positionedGeometryChangeSub.asObservable();

  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private paperResizeObserver: ResizeObserver | null = null;
  private observedPaper: HTMLElement | null = null;

  // ─────────────────────────────────────────────────────────────────
  // 15 COMPUTED signals
  // ─────────────────────────────────────────────────────────────────

  readonly hasColumns = computed<boolean>(() => {
    const b = this._block();
    if (!b) return false;
    const cols = b.columns;
    return !!cols && cols.length > 0;
  });

  /** Image URL from block.settings.imageUrl. */
  readonly imageUrl = computed<string | null>(() => {
    const b = this._block();
    if (!b || b.type !== 'image') return null;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['imageUrl'] as string) ?? null;
  });

  /** Image width in pixels from block.settings.imageWidth. */
  readonly imageWidth = computed<number | null>(() => {
    const b = this._block();
    if (!b) return null;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['imageWidth'] as number) ?? null;
  });

  /** Image height in pixels from block.settings.imageHeight. */
  readonly imageHeight = computed<number | null>(() => {
    const b = this._block();
    if (!b) return null;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['imageHeight'] as number) ?? null;
  });

  /** Whether image overlays other blocks (absolute positioning). */
  readonly isOverlay = computed<boolean>(() => {
    const b = this._block();
    if (!b || b.type !== 'image') return false;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['overlay'] as boolean) ?? false;
  });

  /** Overlay X position in pixels. */
  readonly overlayLeft = computed<number>(() => {
    const b = this._block();
    if (!b) return 0;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['overlayLeft'] as number) ?? 0;
  });

  /** Overlay Y position in pixels. */
  readonly overlayTop = computed<number>(() => {
    const b = this._block();
    if (!b) return 0;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['overlayTop'] as number) ?? 0;
  });

  readonly positionedGeometry = computed<PositionedGeometry | null>(() => {
    const b = this._block();
    const raw = readPositionedGeometry(b?.settings as Record<string, unknown> | undefined);
    if (!raw) return null;
    return clampPositionedGeometry(
      raw,
      getPageDimensions(this._pageSize(), this._orientation()),
      this._boundaryPadding(),
    );
  });

  readonly isPositioned = computed<boolean>(() => this.positionedGeometry() !== null);

  readonly positionedRenderedGeometry = computed<PositionedGeometry | null>(() => {
    const geometry = this.positionedResizeActive()
      ? {
          ...(this.positionedGeometry() ?? { x: 0, y: 0 }),
          width: this.positionedResizeWidth(),
          height: this.positionedResizeHeight(),
        }
      : this.positionedDragActive()
        ? this.positionedDragGeometry()
        : this.positionedGeometry();
    return geometry;
  });

  readonly renderedLeft = computed<number>(() => {
    const geometry = this.positionedRenderedGeometry();
    return geometry ? geometry.x * this._canvasScale() : this.overlayLeft();
  });

  readonly renderedTop = computed<number>(() => {
    const geometry = this.positionedRenderedGeometry();
    return geometry ? geometry.y * this._canvasScale() : this.overlayTop();
  });

  readonly renderedWidth = computed<number | null>(() => {
    const geometry = this.positionedRenderedGeometry();
    return geometry ? geometry.width * this._canvasScale() : null;
  });

  readonly renderedHeight = computed<number | null>(() => {
    const geometry = this.positionedRenderedGeometry();
    return geometry ? geometry.height * this._canvasScale() : null;
  });

  /**
   * Computed background-color CSS value.
   * Combines blockBackgroundColor (hex) with blockOpacity (alpha) into rgba().
   * Returns empty string when no color is set → block stays transparent.
   */
  readonly blockBgColor = computed<string>(() => {
    const b = this._block();
    if (!b) return '';
    const settings = b.settings as Record<string, unknown> | undefined;
    const color = settings?.['blockBackgroundColor'];
    const opacity = typeof settings?.['blockOpacity'] === 'number' ? settings['blockOpacity'] : 0;

    if (typeof color !== 'string' || color.length === 0) {
      return '';
    }

    // Parse hex (#RGB, #RRGGBB) to {r, g, b}
    const hex = color.replace('#', '');
    let r = 0,
      g = 0,
      b2 = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b2 = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b2 = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b2}, ${opacity})`;
  });

  /** Table columns from block.settings.tableTemplateColumns. */
  readonly tableColumns = computed<TableColumn[]>(() => {
    const b = this._block();
    if (!b || b.type !== 'table') return [];
    const settings = b.settings as Record<string, unknown> | undefined;
    const cols = settings?.['tableTemplateColumns'] as TableColumn[] | undefined;
    return cols ?? [];
  });

  /** Table sample rows from block.settings.tableTemplateSampleRows. */
  readonly tableRows = computed<unknown[][]>(() => {
    const b = this._block();
    if (!b || b.type !== 'table') return [];
    const settings = b.settings as Record<string, unknown> | undefined;
    const rows = settings?.['tableTemplateSampleRows'] as unknown[][] | undefined;
    return rows ?? [];
  });

  /**
   * TZ-104.7 NIT #1 — defensive width normalization. Legacy DB rows from
   * pre-TZ-104.6 epochs can have col.width === undefined. Fall back to
   * equal share so legacy rows still render visibly.
   */
  readonly columnsGridTemplate = computed<string>(() => {
    const b = this._block();
    if (!b) return '1fr';
    const cols = b.columns;
    if (!cols || cols.length === 0) return '1fr';
    const total = cols.reduce((sum, c) => sum + (c.width ?? 1), 0);
    return cols.map((c) => `${((c.width ?? 1) / total) * 100}fr`).join(' ');
  });

  /**
   * Per-type label lookup. Reuses shared `BLOCK_TYPE_LABELS` constant from
   * `../../../shared/template-block/template-block.types` — single source of
   * truth for block-type labels across the builder UI.
   */
  readonly typeLabel = computed<string>(() => {
    const b = this._block();
    if (!b) return '';
    return BLOCK_TYPE_LABELS[b.type] ?? b.type;
  });

  readonly bindingBadge = computed<string | null>(() => {
    const b = this._block();
    if (!b) return null;
    const db = b.dataBinding;
    if (!db) return null;
    if (db.source === 'static') return `static: ${db.value ?? ''}`;
    if (db.field) return `${db.source}.${db.field}`;
    return db.source;
  });

  readonly bindingBadgeTooltip = computed<string>(() => {
    const b = this._block();
    if (!b) return '';
    const db = b.dataBinding;
    if (!db) return '';
    const parts: string[] = [db.source];
    if (db.field) parts.push(db.field);
    if (db.format) parts.push(`format: ${db.format}`);
    return parts.join(' · ');
  });

  /**
   * Per-type rendering — for MVP we keep all types text-based.
   */
  readonly renderedContent = computed<string>(() => {
    const b = this._block();
    if (!b) return '';
    const parts: string[] = [];
    if (b.title) parts.push(b.title);
    if (b.content) parts.push(b.content);
    if (!parts.length) {
      const placeholders: Record<BlockType, string> = {
        header: 'Заголовок без текста',
        text: 'Текстовый блок без содержимого',
        table: 'Таблица без шаблона',
        image: 'Изображение не выбрано',
        signature: 'Место для подписи',
        spacer: 'Разделитель',
      };
      return placeholders[b.type] ?? '—';
    }
    return parts.join(' · ');
  });

  // ─────────────────────────────────────────────────────────────────
  // Constructor — 3 effects for auto-sync + auto-clear overrides
  // ─────────────────────────────────────────────────────────────────

  constructor() {
    this.destroyRef.onDestroy(() => this.paperResizeObserver?.disconnect());
    // The per-renderer host is not guaranteed to be attached while the
    // service constructor runs. Attach after the first render, then keep the
    // explicit setPageSettings() retry for page changes.
    afterNextRender(() => this.observePaper());

    // 1. Sync width & marginLeft from block settings when block changes
    effect(() => {
      const b = this._block();
      if (!b) return;
      const settings = b.settings as Record<string, unknown> | undefined;
      const w = typeof settings?.['width'] === 'number' ? settings['width'] : 100;
      const ml = typeof settings?.['marginLeft'] === 'number' ? settings['marginLeft'] : 0;
      this.currentWidth.set(Math.max(20, Math.min(100, w)));
      this.currentMarginLeft.set(Math.max(0, Math.min(80, ml)));
    });

    // 2. Auto-clear local drag override when settings catch up (after API debounce + response)
    effect(() => {
      const ol = this.overlayLeft();
      const dl = this.dragLeft();
      if (dl > 0 && ol === dl) {
        this.dragActive.set(false);
        this.dragLeft.set(0);
        this.dragTop.set(0);
      }
    });

    // 3. Auto-clear local resize override when settings catch up
    effect(() => {
      const w = this.imageWidth();
      const d = this.resizeWidth();
      if (d > 0 && w === d) {
        this.resizeActive.set(false);
        this.resizeWidth.set(0);
        this.resizeHeight.set(0);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Input setters (called by component's input-mirroring effect())
  // ─────────────────────────────────────────────────────────────────

  setBlock(b: TemplateBlock | null): void {
    this._block.set(b);
  }

  setSnapSettings(snapEnabled: boolean, gridSize: number, boundaryPadding: number): void {
    this._snapEnabled.set(snapEnabled);
    this._gridSize.set(gridSize);
    this._boundaryPadding.set(boundaryPadding);
  }

  setPageSettings(pageSize: BuilderPageSize, orientation: BuilderOrientation): void {
    this._pageSize.set(pageSize);
    this._orientation.set(orientation);
    this.observePaper();
    const paper =
      this.observedPaper ?? this.hostElement.nativeElement.closest('.pi-canvas-page-paper');
    if (paper) this.refreshCanvasScale(paper);
  }

  private observePaper(): void {
    const paper = this.hostElement.nativeElement.closest(
      '.pi-canvas-page-paper',
    ) as HTMLElement | null;
    if (!paper || this.observedPaper === paper || typeof ResizeObserver === 'undefined') return;
    this.paperResizeObserver?.disconnect();
    this.observedPaper = paper;
    this.paperResizeObserver = new ResizeObserver(() => this.refreshCanvasScale(paper));
    this.paperResizeObserver.observe(paper);
    this.refreshCanvasScale(paper);
  }

  refreshCanvasScale(paper?: HTMLElement): void {
    const page = paper ?? this.hostElement.nativeElement.closest('.pi-canvas-page-paper');
    if (!page) return;
    const documentWidth = getPageDimensions(this._pageSize(), this._orientation()).width;
    const renderedWidth = page.getBoundingClientRect().width || page.clientWidth;
    if (renderedWidth > 0 && documentWidth > 0) {
      this._canvasScale.set(renderedWidth / documentWidth);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // MUTATING DOM-EVENT HANDLERS (extracted from block-renderer.component)
  // ─────────────────────────────────────────────────────────────────

  /** Start a positioned text/block drag in document-space coordinates. */
  onPositionedDragStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (
      target?.closest('.block-renderer__delete') ||
      target?.closest('.block-renderer__positioned-resize')
    )
      return;

    const startGeometry = this.positionedGeometry();
    if (!startGeometry) return;
    event.preventDefault();
    event.stopPropagation();

    // `getBoundingClientRect()` is viewport-relative and already reflects
    // scrolling. Re-read it for each pointer event instead of adding scroll
    // offsets to a cached rect (which would double-count scroll).
    const toDocumentPoint = (clientX: number, clientY: number) => {
      const currentPaper = this.hostElement.nativeElement.closest(
        '.pi-canvas-page-paper',
      ) as HTMLElement | null;
      const rect = currentPaper?.getBoundingClientRect();
      return clientToDocumentPoint(clientX, clientY, {
        left: rect?.left ?? 0,
        top: rect?.top ?? 0,
        scale: this._canvasScale() > 0 ? this._canvasScale() : 1,
      });
    };
    const startPoint = toDocumentPoint(event.clientX, event.clientY);
    this.positionedDragActive.set(true);
    this.positionedDragGeometry.set(startGeometry);

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMove = (moveEvent: MouseEvent): void => {
      if (moveEvent.buttons === 0) {
        onLeave();
        return;
      }
      const currentPoint = toDocumentPoint(moveEvent.clientX, moveEvent.clientY);
      const deltaX = currentPoint.x - startPoint.x;
      const deltaY = currentPoint.y - startPoint.y;
      const page = getPageDimensions(this._pageSize(), this._orientation());
      const next = clampPositionedGeometry(
        { ...startGeometry, x: startGeometry.x + deltaX, y: startGeometry.y + deltaY },
        page,
        this._boundaryPadding(),
      );
      this.positionedDragGeometry.set(next);
    };

    const onUp = (): void => {
      cleanup();
      const finalGeometry = this.positionedDragGeometry();
      const block = this._block();
      this.positionedDragActive.set(false);
      this.positionedDragGeometry.set(null);
      if (block && finalGeometry) {
        this.positionedGeometryChangeSub.next({ block, geometry: finalGeometry });
      }
    };

    const onLeave = (): void => {
      cleanup();
      this.positionedDragActive.set(false);
      this.positionedDragGeometry.set(null);
    };

    // The adapter above keeps persisted deltas in document-space even when the
    // rendered paper is scaled or its scroll host moves during the gesture.
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  /** Resize a positioned block while preserving document-space geometry. */
  onPositionedResizeStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    const startGeometry = this.positionedGeometry();
    if (!startGeometry) return;
    event.preventDefault();
    event.stopPropagation();

    // `getBoundingClientRect()` is viewport-relative and already reflects
    // scrolling. Re-read it for each pointer event instead of adding scroll
    // offsets to a cached rect (which would double-count scroll).
    const toDocumentPoint = (clientX: number, clientY: number) => {
      const currentPaper = this.hostElement.nativeElement.closest(
        '.pi-canvas-page-paper',
      ) as HTMLElement | null;
      const rect = currentPaper?.getBoundingClientRect();
      return clientToDocumentPoint(clientX, clientY, {
        left: rect?.left ?? 0,
        top: rect?.top ?? 0,
        scale: this._canvasScale() > 0 ? this._canvasScale() : 1,
      });
    };
    const startPoint = toDocumentPoint(event.clientX, event.clientY);
    this.positionedResizeActive.set(true);
    this.positionedResizeWidth.set(startGeometry.width);
    this.positionedResizeHeight.set(startGeometry.height);

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMove = (moveEvent: MouseEvent): void => {
      if (moveEvent.buttons === 0) {
        onLeave();
        return;
      }
      const currentPoint = toDocumentPoint(moveEvent.clientX, moveEvent.clientY);
      const deltaX = currentPoint.x - startPoint.x;
      const deltaY = currentPoint.y - startPoint.y;
      const page = getPageDimensions(this._pageSize(), this._orientation());
      const next = clampPositionedGeometry(
        {
          ...startGeometry,
          width: startGeometry.width + deltaX,
          height: startGeometry.height + deltaY,
        },
        page,
        this._boundaryPadding(),
      );
      this.positionedResizeWidth.set(next.width);
      this.positionedResizeHeight.set(next.height);
    };

    const onUp = (): void => {
      cleanup();
      const block = this._block();
      const geometry = clampPositionedGeometry(
        {
          ...startGeometry,
          width: this.positionedResizeWidth(),
          height: this.positionedResizeHeight(),
        },
        getPageDimensions(this._pageSize(), this._orientation()),
        this._boundaryPadding(),
      );
      this.positionedResizeActive.set(false);
      this.positionedResizeWidth.set(0);
      this.positionedResizeHeight.set(0);
      if (block) this.positionedGeometryChangeSub.next({ block, geometry });
    };

    const onLeave = (): void => {
      cleanup();
      this.positionedResizeActive.set(false);
      this.positionedResizeWidth.set(0);
      this.positionedResizeHeight.set(0);
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  /**
   * Resize handle mousedown — starts a document-level drag to resize the block.
   * Side 'left' adjusts marginLeft; side 'right' adjusts width.
   * Width is calculated as a percentage of the paper container width.
   */
  onResizeStart(event: MouseEvent, side: 'left' | 'right'): void {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = this.currentWidth();
    const startMarginLeft = this.currentMarginLeft();
    // Find the paper container to get its width for percentage calculation
    const paper = (event.target as HTMLElement)?.closest('.pi-canvas-page-paper') as HTMLElement;
    const containerWidth = paper?.clientWidth ?? 720;

    // Visual feedback — highlight the active handle
    const handle = event.target as HTMLElement;
    handle.classList.add('is-dragging');

    const onMove = (e: MouseEvent): void => {
      const deltaPx = e.clientX - startX;
      const deltaPercent = (deltaPx / containerWidth) * 100;

      if (side === 'left') {
        // Left handle: drag right → increase marginLeft, decrease width
        const newMarginLeft = Math.max(0, Math.min(80, startMarginLeft + deltaPercent));
        const newWidth = Math.max(20, 100 - newMarginLeft);
        this.currentMarginLeft.set(Math.round(newMarginLeft));
        this.currentWidth.set(Math.round(newWidth));
      } else {
        // Right handle: drag left → decrease width
        const newWidth = Math.max(20, Math.min(100 - startMarginLeft, startWidth + deltaPercent));
        this.currentWidth.set(Math.round(newWidth));
      }
    };

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      handle.classList.remove('is-dragging');
      this.widthChangeSub.next({
        width: this.currentWidth(),
        marginLeft: this.currentMarginLeft(),
      });
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /**
   * Start dragging an overlay block — captures start mouse position and block
   * position. On mousemove: updates overlayLeft/overlayTop. On mouseup:
   * emits overlayMove.
   */
  onOverlayDragStart(event: MouseEvent): void {
    // Only left mouse button, only on image blocks, only if not clicking delete/resize handles
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (
      target.closest('.block-renderer__delete') ||
      target.closest('.block-renderer__corner-resize')
    )
      return;

    event.preventDefault();
    event.stopPropagation();

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startLeft = this.dragActive() ? this.dragLeft() : this.overlayLeft();
    const startTop = this.dragActive() ? this.dragTop() : this.overlayTop();

    // Activate local signal override
    this.dragActive.set(true);
    this.dragLeft.set(startLeft);
    this.dragTop.set(startTop);

    // Cache DOM refs at drag start
    const hostEl = (event.target as HTMLElement).closest(
      '.block-renderer--overlay',
    ) as HTMLElement | null;
    const paper = document.querySelector('.pi-canvas-page-paper') as HTMLElement | null;
    const img = hostEl?.querySelector('.block-renderer__image--overlay') as HTMLImageElement | null;
    const cachedBlockW = img?.offsetWidth ?? this.imageWidth() ?? this.overlayDefaultWidth;
    const cachedBlockH = img?.offsetHeight ?? this.imageHeight() ?? this.overlayDefaultHeight;

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMove = (e: MouseEvent): void => {
      if (e.buttons === 0) {
        cleanup();
        return;
      }
      e.preventDefault();
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;

      // Clamp to paper boundaries (using cached paper ref + cached block dimensions)
      if (paper) {
        const pad = this._boundaryPadding();
        const maxLeft = Math.max(0, paper.clientWidth - cachedBlockW - pad);
        const maxTop = Math.max(0, paper.scrollHeight - cachedBlockH - pad);
        newLeft = Math.max(pad, Math.min(maxLeft, newLeft));
        newTop = Math.max(pad, Math.min(maxTop, newTop));
      } else {
        newLeft = Math.max(0, newLeft);
        newTop = Math.max(0, newTop);
      }

      // Apply snapping if enabled
      if (this._snapEnabled()) {
        // Snap to grid
        const gridResult = this.applySnapToGrid(newLeft, newTop, this._gridSize());
        let hadSnap = gridResult.snappedLeft !== newLeft || gridResult.snappedTop !== newTop;
        newLeft = gridResult.snappedLeft;
        newTop = gridResult.snappedTop;

        // Snap to other blocks' edges
        const blockSnap = this.snapToBlockEdges(newLeft, newTop, hostEl, paper);
        if (blockSnap.snappedLeft !== newLeft || blockSnap.snappedTop !== newTop) {
          hadSnap = true;
          this.snapAxisX = blockSnap.axisX;
          this.snapAxisY = blockSnap.axisY;
          newLeft = blockSnap.snappedLeft;
          newTop = blockSnap.snappedTop;
        }

        if (!hadSnap) {
          this.snapAxisX = null;
          this.snapAxisY = null;
        }
      } else {
        this.snapAxisX = null;
        this.snapAxisY = null;
      }

      // Update local signals
      this.dragLeft.set(newLeft);
      this.dragTop.set(newTop);
      // Inline style for INSTANT visual feedback
      if (hostEl) {
        hostEl.style.left = `${newLeft}px`;
        hostEl.style.top = `${newTop}px`;
        hostEl.classList.toggle('is-snapping', this.snapAxisX !== null || this.snapAxisY !== null);
        hostEl.dataset['snapAxisX'] = this.snapAxisX ?? '';
        hostEl.dataset['snapAxisY'] = this.snapAxisY ?? '';
      }
    };

    const onUp = (): void => {
      cleanup();
      const finalLeft = this.dragLeft();
      const finalTop = this.dragTop();
      // Effect will auto-clear when overlayLeft()/overlayTop() catch up.
      const blockSnap = this._block();
      if (blockSnap) {
        this.overlayMoveSub.next({
          block: blockSnap,
          overlayLeft: finalLeft,
          overlayTop: finalTop,
        });
      }
    };

    const onLeave = (): void => {
      cleanup();
      this.dragActive.set(false);
      this.dragLeft.set(0);
      this.dragTop.set(0);
    };

    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  /**
   * Corner resize start — captures start mouse position and original image
   * dimensions. On mousemove: calculates new size maintaining aspect ratio.
   * On mouseup: emits overlayResize.
   */
  onCornerResizeStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const img = (event.target as HTMLElement)
      .closest('.block-renderer__image-wrap--overlay')
      ?.querySelector('img') as HTMLImageElement | null;
    const naturalW = img?.naturalWidth ?? this.imageWidth() ?? 200;
    const naturalH = img?.naturalHeight ?? this.imageHeight() ?? 200;
    const aspectRatio = naturalW / naturalH;

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startWidth = this.resizeActive() ? this.resizeWidth() : (this.imageWidth() ?? 200);
    const startHeight = this.resizeActive() ? this.resizeHeight() : (this.imageHeight() ?? 200);

    this.resizeActive.set(true);
    this.resizeWidth.set(startWidth);
    this.resizeHeight.set(startHeight);

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMove = (e: MouseEvent): void => {
      if (e.buttons === 0) {
        cleanup();
        return;
      }
      e.preventDefault();
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const sign = deltaX + deltaY >= 0 ? 1 : -1;
      const smoothDelta = sign * distance;

      let newWidth = Math.round(Math.max(50, startWidth + smoothDelta));
      let newHeight = Math.round(newWidth / aspectRatio);

      if (newHeight < 20) {
        newHeight = 20;
        newWidth = Math.round(newHeight * aspectRatio);
      }

      this.resizeWidth.set(newWidth);
      this.resizeHeight.set(newHeight);
    };

    const onUp = (): void => {
      cleanup();
      const finalW = this.resizeWidth();
      const finalH = this.resizeHeight();

      if (finalW > 0 && finalH > 0) {
        const blockSnap = this._block();
        if (blockSnap) {
          this.overlayResizeSub.next({
            block: blockSnap,
            imageWidth: finalW,
            imageHeight: finalH,
          });
        }
      }
    };

    const onLeave = (): void => {
      cleanup();
      this.resizeActive.set(false);
      this.resizeWidth.set(0);
      this.resizeHeight.set(0);
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE SNAP HELPERS
  // ─────────────────────────────────────────────────────────────────

  private snapValueToGrid(
    value: number,
    gridSize: number,
  ): { snapped: number; isSnapped: boolean } {
    const nearest = Math.round(value / gridSize) * gridSize;
    if (Math.abs(value - nearest) <= this.SNAP_THRESHOLD) {
      return { snapped: nearest, isSnapped: true };
    }
    return { snapped: value, isSnapped: false };
  }

  private applySnapToGrid(
    left: number,
    top: number,
    gridSize: number,
  ): { snappedLeft: number; snappedTop: number } {
    const snapX = this.snapValueToGrid(left, gridSize);
    const snapY = this.snapValueToGrid(top, gridSize);
    return { snappedLeft: snapX.snapped, snappedTop: snapY.snapped };
  }

  private snapToBlockEdges(
    left: number,
    top: number,
    hostEl: HTMLElement | null,
    paper: HTMLElement | null,
  ): { snappedLeft: number; snappedTop: number; axisX: string | null; axisY: string | null } {
    if (!paper) return { snappedLeft: left, snappedTop: top, axisX: null, axisY: null };
    const img = hostEl?.querySelector('.block-renderer__image--overlay') as HTMLImageElement | null;
    const width = img?.offsetWidth ?? this.imageWidth() ?? this.overlayDefaultWidth;
    const height = img?.offsetHeight ?? this.imageHeight() ?? this.overlayDefaultHeight;

    const paperRect = paper.getBoundingClientRect();
    const allBlocks = Array.from(
      paper.querySelectorAll<HTMLElement>(
        ':scope > .canvas-dropzone .block-renderer[role="button"], :scope > .canvas-overlay-layer .block-renderer--overlay',
      ),
    );

    const otherBlocks = allBlocks.filter((el) => el !== hostEl);

    let snappedLeft = left;
    let snappedTop = top;
    let axisX: string | null = null;
    let axisY: string | null = null;

    const right = left + width;
    const bottom = top + height;
    const threshold = this.SNAP_THRESHOLD;

    for (const block of otherBlocks) {
      const rect = block.getBoundingClientRect();
      const bLeft = rect.left - paperRect.left;
      const bRight = bLeft + rect.width;
      const bTop = rect.top - paperRect.top;
      const bBottom = bTop + rect.height;

      // Snap left edge
      if (Math.abs(left - bLeft) <= threshold) {
        snappedLeft = bLeft;
        axisX = 'left';
      } else if (Math.abs(left - bRight) <= threshold) {
        snappedLeft = bRight;
        axisX = 'left';
      }
      // Snap right edge
      if (Math.abs(right - bLeft) <= threshold) {
        snappedLeft = bLeft - width;
        axisX = 'right';
      } else if (Math.abs(right - bRight) <= threshold) {
        snappedLeft = bRight - width;
        axisX = 'right';
      }

      // Snap top edge
      if (Math.abs(top - bTop) <= threshold) {
        snappedTop = bTop;
        axisY = 'top';
      } else if (Math.abs(top - bBottom) <= threshold) {
        snappedTop = bBottom;
        axisY = 'top';
      }
      // Snap bottom edge
      if (Math.abs(bottom - bTop) <= threshold) {
        snappedTop = bTop - height;
        axisY = 'bottom';
      } else if (Math.abs(bottom - bBottom) <= threshold) {
        snappedTop = bBottom - height;
        axisY = 'bottom';
      }
    }

    return { snappedLeft, snappedTop, axisX, axisY };
  }
}
