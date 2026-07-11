import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { LucideAngularModule, GripVertical } from 'lucide-angular';

/**
 * TZ-86 Phase D.1 — `pi-canvas-block-handle` Paper & Ink primitive.
 *
 * Vertical-grip handle for reordering TemplateBlocks on the canvas. The
 * handle is a `cdkDragHandle` — when the user clicks+drags on it, the
 * parent `cdkDrag` block is moved. Click events elsewhere on the block
 * (e.g. on the block content itself) do NOT trigger drag — they can be
 * used for block selection.
 *
 * Visibility:
 *   - Default: `opacity: 0` (handle is invisible)
 *   - Group-hover (parent block or its descendants): `opacity: 1`
 *   - Active drag: `opacity: 1` (cdk-drag-preview class hooks)
 *
 * Implements `pi-focus-ring` for keyboard accessibility — Tab onto the
 * handle, then Arrow keys to reorder (CDK drag-drop supports this via
 * `cdkDragHandleDisabled` + manual movement; we keep it simple and only
 * expose mouse drag for the MVP).
 *
 * Usage:
 *   <div cdkDrag class="group">
 *     <pi-canvas-block-handle />
 *     <ng-content />
 *   </div>
 */
@Component({
  selector: 'pi-canvas-block-handle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDragHandle, LucideAngularModule],
  template: `
    <button
      type="button"
      cdkDragHandle
      class="pi-canvas-block-handle pi-focus-ring"
      [attr.aria-label]="'Перетащить блок'"
      title="Перетащить блок"
    >
      <lucide-icon [img]="GripVerticalIcon" [size]="14"></lucide-icon>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .pi-canvas-block-handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        background: transparent;
        border: none;
        color: oklch(var(--color-muted));
        cursor: grab;
        opacity: 0;
        transition: opacity 120ms ease, color 120ms ease;
        padding: 0;
      }

      .pi-canvas-block-handle:hover {
        color: oklch(var(--color-ink));
      }

      .pi-canvas-block-handle:active {
        cursor: grabbing;
      }

      /* parent group-hover (Tailwind "group" class) reveals handle */
      :host-context(.group:hover) .pi-canvas-block-handle,
      /* drag-active state keeps the handle visible */
      :host-context(.cdk-drag-preview) .pi-canvas-block-handle,
      :host-context(.cdk-drag-placeholder) .pi-canvas-block-handle {
        opacity: 1;
      }
    `,
  ],
})
export class PiCanvasBlockHandleComponent {
  protected readonly GripVerticalIcon = GripVertical;
  // CdkDragHandle directive is applied via the `cdkDragHandle` attribute in
  // the template above; no class-level DI is needed (the directive is
  // declared in `imports: [CdkDragHandle, LucideAngularModule]`).
}
