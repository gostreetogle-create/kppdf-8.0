import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BlockRendererComponent } from './block-renderer.component';
import { PiCanvasPageComponent } from '../../../shared/ui/canvas/pi-canvas-page.component';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';
import { moveItemInArray } from '../../../shared/util/move-item-in-array';
import { CANVAS_DROPLIST_ID, type AddBlockPayload } from './builder.types';

/**
 * BuilderCanvas — center pane of the document constructor.
 *
 * The canvas wrapper (pi-canvas-page) fills the available height. The
 * dropzone inside fills the wrapper via flex:1 so clicking anywhere on
 * the paper (between blocks, above/below blocks, on empty canvas) opens
 * the template properties panel.
 */
@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, BlockRendererComponent, PiCanvasPageComponent],
  template: `
    <pi-canvas-page
      [pageSize]="pageSize()"
      [maxWidthPx]="maxWidthPx()"
      [orientation]="orientation()"
    >
      <!-- Background layers (z-index 0, pointer-events none). -->
      @if (backgroundImages().length > 0) {
        <div class="canvas-bg-stack" aria-hidden="true">
          @for (url of backgroundImages(); track url) {
            <div
              class="canvas-bg"
              [style.background-image]="'url(' + url + ')'"
              [style.opacity]="backgroundOpacity()"
            ></div>
          }
        </div>
      }

      <!-- Header text indicator -->
      @if (headerText()) {
        <div class="canvas-header-text">{{ headerText() }}</div>
      }

      <div
        cdkDropList
        [id]="CANVAS_DROPLIST_ID"
        [cdkDropListData]="blocks()"
        class="canvas-dropzone"
        [class.is-empty]="blocks().length === 0"
        role="list"
        aria-label="Блоки документа"
        (cdkDropListDropped)="onDrop($event)"
        (click)="onCanvasClick($event)"
      >
        @if (blocks().length === 0) {
          <div class="canvas-dropzone__empty" aria-live="polite">
            <p class="canvas-dropzone__empty-title">Холст пуст</p>
            <p class="canvas-dropzone__empty-hint">
              Добавьте блоки из выпадающих списков выше. Кликните в любое место холста для свойств
              шаблона.
            </p>
          </div>
        } @else {
          @for (block of blocks(); track blockKey(block)) {
            <!-- Regular blocks (in flow) -->
            @if (!isOverlayBlock(block)) {
              <app-block-renderer
                [block]="block"
                [selected]="blockKey(block) === selectedId()"
                [multiSelected]="selectedIds().has(blockKey(block))"
                (select)="onSelect($event)"
                (multiSelect)="onMultiSelect($event)"
                (widthChange)="onBlockWidthChange(block, $event)"
                (deleteRequest)="deleteRequest.emit($event)"
              />
            }
          }
          <!-- Overlay blocks (absolute positioned, rendered after flow blocks) -->
          @for (block of overlayBlocks(); track blockKey(block)) {
            <app-block-renderer
              [block]="block"
              [selected]="blockKey(block) === selectedId()"
              [multiSelected]="selectedIds().has(blockKey(block))"
              (select)="onSelect($event)"
              (multiSelect)="onMultiSelect($event)"
              (widthChange)="onBlockWidthChange(block, $event)"
              (deleteRequest)="deleteRequest.emit($event)"
            />
          }
        }
      </div>

      <!-- Footer text indicator -->
      @if (footerText()) {
        <div class="canvas-footer-text">{{ footerText() }}</div>
      }

      <!-- Page number indicator -->
      @if (pageNumbering()) {
        <div class="canvas-page-number">1</div>
      }
    </pi-canvas-page>
  `,
  styles: [
    `
      /* TZ-211: Executive shadow on canvas wrapper */
      :host {
        display: block;
        flex: 1;
        min-width: 0;
        height: 100%;
        box-shadow: var(--shadow-executive);
        border-radius: 4px;
        overflow: hidden;
      }

      .canvas-bg-stack {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .canvas-bg {
        position: absolute;
        inset: 0;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--color-paper);
      }

      /* Dropzone fills the entire paper height — click anywhere = template props */
      .canvas-dropzone {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;
        position: relative;
        z-index: 1;
        min-height: 100%;
      }

      .canvas-dropzone.is-empty {
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--color-rule);
        margin: 16px;
        padding: 48px 24px;
        text-align: center;
        border-radius: 4px;
      }

      .canvas-dropzone__empty-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-muted);
        margin: 0 0 4px;
      }

      .canvas-dropzone__empty-hint {
        font-size: 12px;
        color: var(--color-muted);
        margin: 0;
        max-width: 320px;
      }

      /* Header text on canvas */
      .canvas-header-text {
        position: relative;
        z-index: 2;
        padding: 12px 16px 8px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted);
        border-bottom: 1px dashed var(--color-rule);
        text-align: center;
      }

      /* Footer text on canvas */
      .canvas-footer-text {
        position: relative;
        z-index: 2;
        padding: 8px 16px 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-muted);
        border-top: 1px dashed var(--color-rule);
        text-align: center;
      }

      /* Page number on canvas */
      .canvas-page-number {
        position: relative;
        z-index: 2;
        padding: 4px 16px 12px;
        font-size: 11px;
        color: var(--color-muted);
        text-align: right;
        font-family: ui-monospace, monospace;
      }

      /* ═══ CDK drag-drop — TZ-211: Design System ═══ */
      .cdk-drag-preview {
        box-sizing: border-box;
        border: 1px solid var(--color-gold);
        background: var(--color-paper);
        opacity: 0.92;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.15);
        border-radius: 2px;
      }

      .cdk-drag-placeholder {
        opacity: 0.25;
        border: 1px dashed var(--color-gold);
        border-radius: 2px;
        background: var(--color-gold-soft);
      }

      .cdk-drop-list-dragging .canvas-dropzone:not(.is-empty) {
        background: var(--color-paper-3);
      }
    `,
  ],
})
export class BuilderCanvasComponent {
  readonly blocks = input.required<TemplateBlock[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectedIds = input<Set<string>>(new Set());
  readonly backgroundImages = input<string[]>([]);
  readonly orientation = input<'portrait' | 'landscape'>('portrait');
  readonly backgroundOpacity = input<number>(0.3);
  readonly headerText = input<string>('');
  readonly footerText = input<string>('');
  readonly pageNumbering = input<boolean>(false);
  readonly pageSize = input<'A3' | 'A4' | 'A5'>('A4');

  protected readonly maxWidthPx = computed<number>(() => {
    const isLandscape = this.orientation() === 'landscape';
    const ps = this.pageSize();
    if (ps === 'A3') return isLandscape ? 1100 : 900;
    if (ps === 'A5') return isLandscape ? 680 : 520;
    return isLandscape ? 900 : 720;
  });

  readonly select = output<TemplateBlock>();
  readonly multiSelect = output<TemplateBlock>();
  readonly reorder = output<TemplateBlock[]>();
  readonly dropAdd = output<{ payload: AddBlockPayload; insertIndex: number }>();
  readonly blockWidthChange = output<{ block: TemplateBlock; width: number; marginLeft: number; imageWidth?: number; imageHeight?: number }>();
  readonly canvasClick = output<void>();
  /** TZ-211: Emitted when user clicks delete button on a block. */
  readonly deleteRequest = output<string>();

  protected readonly CANVAS_DROPLIST_ID: string = CANVAS_DROPLIST_ID;
  protected readonly blockKey = blockKey;

  /** Check if a block is in overlay mode. */
  protected isOverlayBlock(block: TemplateBlock): boolean {
    if (block.type !== 'image') return false;
    const settings = block.settings as Record<string, unknown> | undefined;
    return (settings?.['overlay'] as boolean) ?? false;
  }

  /** Get only overlay blocks for absolute positioning. */
  protected readonly overlayBlocks = computed(() =>
    this.blocks().filter((b) => this.isOverlayBlock(b)),
  );

  protected onSelect(block: TemplateBlock): void {
    this.select.emit(block);
  }

  protected onMultiSelect(block: TemplateBlock): void {
    this.multiSelect.emit(block);
  }

  protected onBlockWidthChange(
    block: TemplateBlock,
    event: { width: number; marginLeft: number },
  ): void {
    this.blockWidthChange.emit({ block, width: event.width, marginLeft: event.marginLeft });
  }

  protected onCanvasClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.block-renderer')) {
      this.canvasClick.emit();
    }
  }

  protected onDrop(event: CdkDragDrop<TemplateBlock[]>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      const next = [...this.blocks()];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      this.reorder.emit(next);
    } else {
      const payload = event.item.data as AddBlockPayload | undefined;
      if (!payload) return;
      this.dropAdd.emit({ payload, insertIndex: event.currentIndex });
    }
  }
}
