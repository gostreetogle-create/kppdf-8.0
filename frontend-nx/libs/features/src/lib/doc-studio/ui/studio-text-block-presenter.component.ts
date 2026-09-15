import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — dumb presenter extracted from
 * `StudioBlocksCanvasComponent`'s text-block `@if` branch, verbatim. All
 * derivation (`textHtml`, `textLineHeight`) and every interaction handler
 * (`selectBlock`, `openTextBlock`, `startDrag`, `startResize`) stay on the
 * host — this component only renders precomputed values and re-emits raw
 * DOM events for the host to interpret exactly as before.
 */
@Component({
  selector: 'pi-studio-text-block-presenter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="studio-block studio-block--text"
      [class.selected]="selected"
      [class.studio-block--editable]="selected && !block.locked"
      [class.studio-block--passive]="!selected || block.locked"
      [class.locked]="block.locked"
      [class.snapping]="snapping"
      [style.left.%]="layout.x * 100"
      [style.top.%]="layout.y * 100"
      [style.width.%]="layout.width * 100"
      [style.height.%]="(layout.height ?? 0.12) * 100"
      [style.z-index]="layout.zIndex"
      [style.font-size.pt]="block.style?.fontSizePt ?? 14"
      [style.color]="block.style?.color ?? '#000'"
      [style.text-align]="block.style?.align ?? 'left'"
      [style.font-family]="block.style?.fontFamily ?? 'Times New Roman'"
      [style.line-height]="lineHeight"
      (click)="select.emit($event)"
      (dblclick)="openText.emit($event)"
      (pointerdown)="dragStart.emit($event)"
    >
      <div class="studio-block__text-body" [innerHTML]="textHtml"></div>
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

    .studio-block--text {
      white-space: normal;
      background: transparent;
      display: flex;
      flex-direction: column;
    }
    .studio-block__text-body {
      flex: 1;
      width: 100%;
      min-height: 0;
      overflow: hidden;
      pointer-events: none;
      line-height: 1.35;
    }
    .studio-block__text-body :where(p) {
      margin: 0;
    }
    .studio-block--text.studio-block--editable.selected {
      background: transparent;
    }
  `],
})
export class StudioTextBlockPresenterComponent {
  @Input({ required: true }) block!: StudioBlock;
  @Input({ required: true }) layout!: StudioBlockLayout;
  @Input() selected = false;
  @Input() snapping = false;
  @Input() readOnly = false;
  @Input() textHtml: SafeHtml = '';
  @Input() lineHeight: string | null = null;

  @Output() select = new EventEmitter<MouseEvent>();
  @Output() openText = new EventEmitter<MouseEvent>();
  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() resizeStart = new EventEmitter<PointerEvent>();
}
