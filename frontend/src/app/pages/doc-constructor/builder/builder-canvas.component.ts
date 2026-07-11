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

/**
 * TZ-86 Phase D.1 — `BuilderCanvas` (center pane).
 *
 * Hosts the document-template blocks in a vertical `cdkDropList`. Each block
 * is a `BlockRenderer` with its own `cdkDrag` so the user can:
 *   - drag from the tool pane (tool-pane's `cdkDrag` items, MVP: click «+»
 *     instead — drag-from-pane is TZ-86D.2 follow-up)
 *   - drag within the canvas to reorder
 *
 * Reorder: `cdkDropListDropped` event → `moveItemInArray` on the local
 * shadow (parent holds the canonical blocks signal; we just emit the new
 * order). Parent fires the atomic POST `/reorder` after debounce.
 *
 * Empty state: when `blocks()` is empty, render a hairline-bordered
 * empty hint «Перетащите блок сюда» (the message is intentional even though
 * drag-from-pane is deferred — text + visual placeholder reduces blank-page
 * anxiety during onboarding).
 */
@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, BlockRendererComponent, PiCanvasPageComponent],
  template: `
    <pi-canvas-page [pageSize]="'A4'" [maxWidthPx]="720">
      <div
        cdkDropList
        class="canvas-dropzone"
        [class.is-empty]="blocks().length === 0"
        (cdkDropListDropped)="onDrop($event)"
      >
        @if (blocks().length === 0) {
          <div class="canvas-dropzone__empty" aria-live="polite">
            <p class="canvas-dropzone__empty-title">Холст пуст</p>
            <p class="canvas-dropzone__empty-hint">
              Добавьте блок из палитры слева или нажмите «+» рядом с типом блока
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

      .canvas-dropzone {
        min-height: 200px;
        display: flex;
        flex-direction: column;
        gap: 8px;
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

  /** Emits when user selects a block. */
  readonly select = output<TemplateBlock>();
  /** Emits when user drops to reorder. Carries the new in-memory ordering. */
  readonly reorder = output<TemplateBlock[]>();

  /** Re-export the key helper so the template can call it. */
  protected readonly blockKey = blockKey;

  protected readonly isEmpty = computed<boolean>(() => this.blocks().length === 0);

  protected onSelect(block: TemplateBlock): void {
    this.select.emit(block);
  }

  /**
   * CDK drop handler. We only support intra-canvas reordering for the MVP
   * (drag-from-tool-pane to canvas is a TZ-86D.2 follow-up). The new
   * ordering is computed locally; the parent will fire the atomic POST.
   */
  protected onDrop(event: CdkDragDrop<TemplateBlock[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const next = [...this.blocks()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.reorder.emit(next);
  }
}
