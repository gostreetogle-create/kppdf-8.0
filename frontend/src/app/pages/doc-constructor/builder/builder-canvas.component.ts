import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CdkDrag, CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BlockRendererComponent } from './block-renderer.component';
import { PiCanvasPageComponent } from '../../../shared/ui/canvas/pi-canvas-page.component';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';
import { moveItemInArray } from '../../../shared/util/move-item-in-array';
import type { AddBlockPayload } from './builder-tool-pane.component';

/**
 * D.2.2 nit (code-reviewer): the cdkDropList id is now exported so the tool
 * pane can import it (instead of duplicating the string in two places).
 * The tool pane uses it in `[cdkDropListConnectedTo]`.
 */
export const CANVAS_DROPLIST_ID = 'canvas-droplist';

/**
 * TZ-86 Phase D.1 + D.2 — `BuilderCanvas` (center pane).
 *
 * Hosts the document-template blocks in a vertical `cdkDropList`. Each block
 * is a `BlockRenderer` with its own `cdkDrag`. Phase D.2 adds:
 *   - **`backgroundImages` input** — array of `/uploads/...` URLs rendered
 *     as absolute-positioned bg layers (opacity 0.4, pointer-events none,
 *     z-index 0). Layered via `position: absolute; inset: 0` so they don't
 *     interfere with the dropzone's normal flow.
 *   - **Drag-from-palette** — dropzone has `id="canvas-droplist"` so the
 *     tool pane's `cdkDropList` can connect via `cdkDropListConnectedTo`.
 *     The `onDrop` handler checks `event.previousContainer.id`:
 *       - `=== 'canvas-droplist'` → intra-canvas reorder (existing path)
 *       - `!== 'canvas-droplist'` → from-palette drop → emit `(dropAdd)`
 *         with the carried `cdkDragData` (an `AddBlockPayload`) and the
 *         target `currentIndex`.
 *
 * Empty state: when `blocks()` is empty, render a hairline-bordered
 * empty hint «Перетащите блок сюда» (the message now applies to both
 * drag-from-pane and «+» button paths in D.2).
 */
@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, BlockRendererComponent, PiCanvasPageComponent],
  template: `
    <pi-canvas-page [pageSize]="'A4'" [maxWidthPx]="720">
      <!-- D.2.1: background layers (z-index 0, pointer-events none). -->
      @if (backgroundImages().length > 0) {
        <div class="canvas-bg-stack" aria-hidden="true">
          @for (url of backgroundImages(); track url) {
            <div
              class="canvas-bg"
              [style.background-image]="'url(' + url + ')'"
            ></div>
          }
        </div>
      }

      <div
        cdkDropList
        [id]="CANVAS_DROPLIST_ID"
        [cdkDropListData]="blocks()"
        class="canvas-dropzone"
        [class.is-empty]="blocks().length === 0"
        (cdkDropListDropped)="onDrop($event)"
      >
        @if (blocks().length === 0) {
          <div class="canvas-dropzone__empty" aria-live="polite">
            <p class="canvas-dropzone__empty-title">Холст пуст</p>
            <p class="canvas-dropzone__empty-hint">
              Перетащите блок из палитры слева или нажмите «+» рядом с типом блока
            </p>
          </div>
        } @else {
          @for (block of blocks(); track blockKey(block)) {
            <app-block-renderer
              [block]="block"
              [selected]="blockKey(block) === selectedId()"
              (select)="onSelect($event)"
            />
          }
        }
      </div>
    </pi-canvas-page>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1;
        min-width: 0;
        height: 100%;
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
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.4;
      }

      .canvas-dropzone {
        min-height: 200px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        z-index: 1;
      }

      .canvas-dropzone.is-empty {
        align-items: center;
        justify-content: center;
        border: 1px dashed oklch(var(--color-rule));
        padding: 48px 24px;
        text-align: center;
      }

      .canvas-dropzone__empty-title {
        font-size: 14px;
        font-weight: 600;
        color: oklch(var(--color-muted));
        margin: 0 0 4px;
      }

      .canvas-dropzone__empty-hint {
        font-size: 12px;
        color: oklch(var(--color-muted));
        margin: 0;
        max-width: 320px;
      }

      /* CDK drag-drop animations */
      .cdk-drag-preview {
        box-sizing: border-box;
        border: 1px solid oklch(var(--color-ink));
        background: oklch(var(--color-paper));
        opacity: 0.9;
      }

      .cdk-drag-placeholder {
        opacity: 0.3;
      }

      .cdk-drop-list-dragging .canvas-dropzone:not(.is-empty) {
        background: oklch(var(--color-sunrise-soft) / 0.3);
      }
    `,
  ],
})
export class BuilderCanvasComponent {
  /** All blocks in display order (parent owns canonical state). */
  readonly blocks = input.required<TemplateBlock[]>();
  /** Currently-selected block id (drives the 2px outline on BlockRenderer). */
  readonly selectedId = input<string | null>(null);
  /** D.2.1: background image URLs to render as bg layers (z-index 0, opacity 0.4). */
  readonly backgroundImages = input<string[]>([]);

  /** Emits when user selects a block. */
  readonly select = output<TemplateBlock>();
  /** Emits when user drops to reorder. Carries the new in-memory ordering. */
  readonly reorder = output<TemplateBlock[]>();
  /** D.2.2: emitted when a palette item is dropped onto the canvas. */
  readonly dropAdd = output<{ payload: AddBlockPayload; insertIndex: number }>();

  /** Constant exposed to the template for `cdkDropList id`. */
  protected readonly CANVAS_DROPLIST_ID: string = CANVAS_DROPLIST_ID;

  /** Re-export the key helper so the template can call it. */
  protected readonly blockKey = blockKey;

  protected readonly isEmpty = computed<boolean>(() => this.blocks().length === 0);

  protected onSelect(block: TemplateBlock): void {
    this.select.emit(block);
  }

  /**
   * D.2.2: CDK drop handler.
   *   - intra-canvas (`previousContainer === container`): reorder via moveItemInArray.
   *   - from-palette (`previousContainer !== container`): emit dropAdd with
   *     carried `cdkDragData` (an `AddBlockPayload`) and `currentIndex`.
   */
  protected onDrop(event: CdkDragDrop<TemplateBlock[]>): void {
    if (event.previousContainer === event.container) {
      // Intra-canvas reorder
      if (event.previousIndex === event.currentIndex) return;
      const next = [...this.blocks()];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      this.reorder.emit(next);
    } else {
      // From palette (or any connected list) → add new block
      const payload = event.item.data as AddBlockPayload | undefined;
      if (!payload) return;
      this.dropAdd.emit({ payload, insertIndex: event.currentIndex });
    }
  }
}
