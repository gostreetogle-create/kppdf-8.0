import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';

@Component({
  selector: 'pi-studio-blocks-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (block of blocks; track block._id) {
      @if (block.type === 'text' && block.layout; as layout) {
        @if (layout.page === 1 && block.isActive !== false) {
        <article class="studio-text-block" [class.selected]="selectedId === block._id" [class.locked]="block.locked" [style.left.%]="layout.x" [style.top.%]="layout.y" [style.width.%]="layout.width" [style.height.%]="layout.height ?? 12" [style.z-index]="layout.zIndex" (click)="selectBlock($event, block._id)" (pointerdown)="startDrag($event, block)">
          <span>{{ block.content || block.title || 'Текст' }}</span>
          @if (selectedId === block._id && !block.locked) { <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button> }
        </article>
        }
      }
    }
  `,
  styles: [`
    :host { position:absolute; inset:0; pointer-events:none; }
    .studio-text-block { position:absolute; box-sizing:border-box; min-width:6%; min-height:4%; padding:8px; border:1px solid transparent; overflow:hidden; white-space:pre-wrap; pointer-events:auto; cursor:move; user-select:none; background:rgba(255,255,255,.7); }
    .studio-text-block.selected { border:1px solid #1c7c54; box-shadow:0 0 0 2px rgba(28,124,84,.15); }
    .studio-text-block.locked { cursor:not-allowed; opacity:.65; }
    .resize-handle { position:absolute; right:-1px; bottom:-1px; width:12px; height:12px; padding:0; border:1px solid #1c7c54; background:#fff; cursor:nwse-resize; }
  `],
})
export class StudioBlocksCanvasComponent {
  @Input() blocks: readonly StudioBlock[] = [];
  @Input() selectedId: string | null = null;
  @Output() selected = new EventEmitter<string>();
  @Output() layoutChanged = new EventEmitter<{ id: string; layout: StudioBlockLayout }>();

  selectBlock(event: MouseEvent, id: string): void { event.stopPropagation(); this.selected.emit(id); }

  startDrag(event: PointerEvent, block: StudioBlock): void {
    event.stopPropagation();
    if (block.locked || !block.layout) return;
    const target = event.currentTarget as HTMLElement;
    const parent = target.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, layout: block.layout };
    const move = (e: PointerEvent) => {
      const dx = ((e.clientX - start.x) / rect.width) * 100;
      const dy = ((e.clientY - start.y) / rect.height) * 100;
      this.layoutChanged.emit({ id: block._id, layout: { ...start.layout, x: Math.max(0, Math.min(100 - start.layout.width, start.layout.x + dx)), y: Math.max(0, Math.min(100 - (start.layout.height ?? 12), start.layout.y + dy)) } });
    };
    const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end, { once: true });
  }

  startResize(event: PointerEvent, block: StudioBlock): void {
    event.stopPropagation();
    if (block.locked || !block.layout) return;
    const parent = (event.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, layout: block.layout };
    const move = (e: PointerEvent) => this.layoutChanged.emit({ id: block._id, layout: { ...start.layout, width: Math.max(6, Math.min(100 - start.layout.x, start.layout.width + ((e.clientX - start.x) / rect.width) * 100)), height: Math.max(4, Math.min(100 - start.layout.y, (start.layout.height ?? 12) + ((e.clientY - start.y) / rect.height) * 100)) } });
    const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end, { once: true });
  }
}
