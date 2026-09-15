import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — dumb presenter extracted from
 * `StudioBlocksCanvasComponent`'s image-block `@if` branch, verbatim. Same
 * split rationale as `StudioTextBlockPresenterComponent`.
 */
@Component({
  selector: 'pi-studio-image-block-presenter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="studio-block studio-block--image"
      [class.selected]="selected"
      [class.studio-block--editable]="selected && !block.locked"
      [class.studio-block--passive]="!selected || block.locked"
      [class.locked]="block.locked"
      [class.snapping]="snapping"
      [style.left.%]="layout.x * 100"
      [style.top.%]="layout.y * 100"
      [style.width.%]="layout.width * 100"
      [style.height.%]="(layout.height ?? 0.28) * 100"
      [style.z-index]="layout.zIndex"
      (click)="select.emit($event)"
      (pointerdown)="dragStart.emit($event)"
    >
      @if (imageUrl) {
        <img [src]="imageUrl" alt="" draggable="false" />
      } @else {
        <span class="image-placeholder">Фото</span>
      }
      @if (selected && !block.locked && !readOnly) {
        <span class="selection-frame" aria-hidden="true"></span>
        <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="resizeStart.emit($event)"></button>
      }
    </article>
  `,
  styles: [`
    /* Shared block scaffolding — duplicated identically across all 3 block
       presenters (view-encapsulated per component; see the host's own
       comment for why). */
    .studio-block {
      position:absolute; box-sizing:border-box; min-width:4%; min-height:3%;
      padding:4px; border:1px solid transparent; overflow:hidden;
      pointer-events:auto; cursor:move; user-select:none;
    }
    .studio-block.selected { border-color:#1c7c54; }
    .studio-block--passive {
      cursor: pointer;
      border-color: transparent;
    }
    .studio-block--passive:hover {
      outline: 1px dashed color-mix(in oklch, var(--color-gold) 55%, transparent);
      outline-offset: 1px;
    }
    .studio-block.snapping .selection-frame { border-color:#c9a227; }
    .studio-block.locked { cursor:not-allowed; opacity:.65; }
    .selection-frame {
      position:absolute; inset:-3px; pointer-events:none;
      border:2px solid #1c7c54; box-shadow:0 0 0 1px rgba(28,124,84,.25);
    }
    .resize-handle {
      position:absolute; right:-5px; bottom:-5px; width:12px; height:12px;
      padding:0; border:2px solid #1c7c54; background:#fff; cursor:nwse-resize;
      pointer-events:auto; z-index:1;
    }

    .studio-block--image {
      background: transparent;
      padding: 0;
    }
    .studio-block--image img {
      width:100%; height:100%; object-fit:cover; display:block; pointer-events:none;
    }
    .image-placeholder {
      display:flex; align-items:center; justify-content:center;
      width:100%; height:100%; font-size:12px; color:#666;
    }
  `],
})
export class StudioImageBlockPresenterComponent {
  @Input({ required: true }) block!: StudioBlock;
  @Input({ required: true }) layout!: StudioBlockLayout;
  @Input() selected = false;
  @Input() snapping = false;
  @Input() readOnly = false;
  @Input() imageUrl: string | null = null;

  @Output() select = new EventEmitter<MouseEvent>();
  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() resizeStart = new EventEmitter<PointerEvent>();
}
