import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { StudioBlock } from '@kppdf/data-access';

@Component({ selector: 'pi-studio-layers-panel', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `
  <section class="layers" data-test="studio-layers-panel"><h2>Слои</h2>
    @for (block of blocks; track block._id) { <div class="layer" [class.selected]="selectedId === block._id"><button type="button" (click)="selected.emit(block._id)">{{ block.title || block.content || 'Текст' }}</button><button type="button" [attr.aria-label]="block.locked ? 'Разблокировать' : 'Заблокировать'" (click)="toggleLock.emit(block)">{{ block.locked ? '🔒' : '🔓' }}</button><button type="button" [attr.aria-label]="block.isActive === false ? 'Показать' : 'Скрыть'" (click)="toggleVisible.emit(block)">{{ block.isActive === false ? '○' : '●' }}</button></div> }
  </section>`, styles: [`.layers{padding:16px}.layer{display:flex;gap:4px;align-items:center;padding:4px}.layer.selected{background:#e8f4ee}.layer button:first-child{flex:1;text-align:left}`] })
export class StudioLayersPanelComponent {
  @Input() blocks: readonly StudioBlock[] = [];
  @Input() selectedId: string | null = null;
  @Output() selected = new EventEmitter<string>();
  @Output() toggleLock = new EventEmitter<StudioBlock>();
  @Output() toggleVisible = new EventEmitter<StudioBlock>();
}
