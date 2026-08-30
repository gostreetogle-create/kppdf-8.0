import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, input } from '@angular/core';
import { GripVertical, Image, Lock, LucideAngularModule, Settings2, Table2, Type, Unlock } from 'lucide-angular';
import { ButtonComponent } from '@kppdf/ui/button';
import type { StudioBlock } from '@kppdf/data-access';

function layerLabel(block: StudioBlock): string {
  if (block.title?.trim()) return block.title.trim();
  if (block.content?.trim()) {
    const t = block.content.trim();
    return t.length > 28 ? `${t.slice(0, 28)}…` : t;
  }
  switch (block.type) {
    case 'image':
      return 'Изображение';
    case 'table':
      return 'Таблица';
    default:
      return 'Текст';
  }
}

@Component({
  selector: 'pi-studio-layers-panel',
  standalone: true,
  imports: [ButtonComponent, CdkDropList, CdkDrag, CdkDragHandle, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="layers" data-test="studio-layers-panel">
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-add-layer"
        (click)="addLayer.emit()"
      >
        + Слой
      </app-pi-button>

      <p class="hint">Плитки сверху вниз — от переднего к заднему. Перетащите для смены порядка.</p>

      <div
        cdkDropList
        class="layer-tiles"
        data-test="studio-layers-list"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (block of orderedBlocks(); track block._id) {
          <div
            cdkDrag
            class="layer-tile"
            [class.layer-tile--active]="activeLayerId() === block._id"
            [class.layer-tile--inactive]="activeLayerId() !== null && activeLayerId() !== block._id"
            data-test="studio-layer-row"
          >
            <button
              type="button"
              class="layer-tile__body pi-focus-ring"
              [attr.aria-pressed]="activeLayerId() === block._id"
              (click)="activateLayer.emit(block._id)"
            >
              <span cdkDragHandle class="layer-tile__grip" aria-label="Перетащить слой" title="Перетащить">
                <lucide-angular [img]="gripIcon" [size]="14" aria-hidden="true" />
              </span>
              <span class="layer-tile__icon" aria-hidden="true">
                <lucide-angular [img]="iconFor(block)" [size]="14" />
              </span>
              <span class="layer-tile__text">
                <span class="layer-tile__name">{{ labelFor(block) }}</span>
                <span class="layer-tile__meta">z{{ block.layout?.zIndex ?? 0 }}</span>
              </span>
            </button>
            <div class="layer-tile__actions">
              <button
                type="button"
                class="layer-tile__icon-btn pi-focus-ring"
                aria-label="Свойства слоя"
                title="Свойства"
                data-test="studio-layer-properties"
                (click)="openProperties.emit(block._id); $event.stopPropagation()"
              >
                <lucide-angular [img]="settingsIcon" [size]="13" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="layer-tile__icon-btn pi-focus-ring"
                [attr.aria-label]="block.locked ? 'Разблокировать' : 'Заблокировать'"
                (click)="toggleLock.emit(block); $event.stopPropagation()"
              >
                <lucide-angular [img]="block.locked ? lockIcon : unlockIcon" [size]="13" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="layer-tile__icon-btn pi-focus-ring"
                [attr.aria-label]="block.isActive === false ? 'Показать слой' : 'Скрыть слой'"
                (click)="toggleVisible.emit(block); $event.stopPropagation()"
              >
                {{ block.isActive === false ? '○' : '●' }}
              </button>
            </div>
          </div>
        } @empty {
          <p class="empty">Нет слоёв — нажмите «+ Слой»</p>
        }
      </div>
    </section>
  `,
  styles: [`
    .layers { display: flex; flex-direction: column; gap: 10px; }
    .hint { margin: 0; font-size: 11px; color: var(--color-muted-foreground); line-height: 1.35; }
    .layer-tiles { display: flex; flex-direction: column; gap: 6px; }
    .layer-tiles.cdk-drop-list-dragging .layer-tile:not(.cdk-drag-placeholder) {
      transition: transform 200ms ease;
    }
    .layer-tile {
      display: flex;
      align-items: stretch;
      gap: 4px;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm);
      background: var(--color-paper-raised);
    }
    .layer-tile--active {
      border-color: var(--color-gold-deep);
      background: color-mix(in oklch, var(--color-gold) 10%, var(--color-paper-raised));
    }
    .layer-tile--inactive {
      border-color: var(--color-rule);
      background: var(--color-paper-raised);
    }
    .layer-tile__body {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 8px;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      color: inherit;
    }
    .layer-tile__grip {
      display: inline-flex;
      color: var(--color-muted-foreground);
      cursor: grab;
      flex-shrink: 0;
    }
    .layer-tile__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--color-muted-foreground);
    }
    .layer-tile__text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .layer-tile__name {
      font-size: 13px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .layer-tile__meta {
      font-size: 10px;
      color: var(--color-muted-foreground);
      font-variant-numeric: tabular-nums;
    }
    .layer-tile__actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      padding: 4px 4px 4px 0;
    }
    .layer-tile__icon-btn {
      width: 26px;
      height: 26px;
      padding: 0;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      cursor: pointer;
      font-size: 11px;
      line-height: 1;
    }
    .empty { margin: 0; font-size: 12px; color: var(--color-muted-foreground); }
    .cdk-drag-preview {
      box-shadow: var(--shadow-executive, 0 4px 12px rgba(0,0,0,.12));
    }
    .cdk-drag-placeholder {
      opacity: 0.35;
    }
  `],
})
export class StudioLayersPanelComponent {
  readonly blocks = input<readonly StudioBlock[]>([]);
  readonly activeLayerId = input<string | null>(null);

  @Output() readonly addLayer = new EventEmitter<void>();
  @Output() readonly activateLayer = new EventEmitter<string>();
  @Output() readonly openProperties = new EventEmitter<string>();
  @Output() readonly layerReorder = new EventEmitter<readonly string[]>();
  @Output() readonly toggleLock = new EventEmitter<StudioBlock>();
  @Output() readonly toggleVisible = new EventEmitter<StudioBlock>();

  protected readonly gripIcon = GripVertical;
  protected readonly lockIcon = Lock;
  protected readonly unlockIcon = Unlock;
  protected readonly settingsIcon = Settings2;
  protected readonly typeIcon = Type;
  protected readonly imageIcon = Image;

  readonly orderedBlocks = computed(() =>
    [...this.blocks()]
      .filter((b) => b.layout)
      .sort((a, b) => (b.layout!.zIndex ?? 0) - (a.layout!.zIndex ?? 0)),
  );

  protected labelFor(block: StudioBlock): string {
    return layerLabel(block);
  }

  protected readonly tableIcon = Table2;

  protected iconFor(block: StudioBlock): typeof Type {
    if (block.type === 'image') return this.imageIcon;
    if (block.type === 'table') return this.tableIcon;
    return this.typeIcon;
  }

  protected onDrop(event: CdkDragDrop<StudioBlock[]>): void {
    const ordered = [...this.orderedBlocks()];
    moveItemInArray(ordered, event.previousIndex, event.currentIndex);
    this.layerReorder.emit(ordered.map((b) => b._id));
  }
}
