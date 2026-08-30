import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import {
  Eye,
  EyeOff,
  GripVertical,
  Image,
  Lock,
  LucideAngularModule,
  Settings2,
  Table2,
  Trash2,
  Type,
  Unlock,
} from 'lucide-angular';
import { ButtonComponent } from '@kppdf/ui/button';
import type { StudioBlock } from '@kppdf/data-access';

function layerLabel(block: StudioBlock): string {
  if (block.title?.trim()) return block.title.trim();
  if (block.content?.trim()) {
    const t = block.content.trim();
    return t.length > 36 ? `${t.slice(0, 36)}…` : t;
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
    <section class="layers" data-test="studio-layers-panel" (click)="$event.stopPropagation()">
      <app-pi-button
        variant="secondary"
        size="sm"
        class="layers__add"
        data-test="studio-add-layer"
        (click)="addLayer.emit()"
      >
        + Слой
      </app-pi-button>

      <p class="layers__hint">Сверху — передний план. Тяните за ⋮⋮ для смены порядка.</p>

      <div
        cdkDropList
        cdkDropListLockAxis="y"
        class="layers__list"
        data-test="studio-layers-list"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (block of orderedBlocks(); track block._id) {
          <div
            cdkDrag
            cdkDragLockAxis="y"
            cdkDragPreviewContainer="parent"
            class="layer-row"
            [class.layer-row--active]="activeLayerId() === block._id"
            [class.layer-row--hidden]="block.isActive === false"
            [attr.data-test]="'studio-layer-row-' + block._id"
            data-test="studio-layer-row"
          >
            <button
              type="button"
              cdkDragHandle
              class="layer-row__grip pi-focus-ring"
              aria-label="Перетащить слой"
              title="Перетащить"
              (click)="$event.stopPropagation()"
            >
              <lucide-angular [img]="gripIcon" [size]="15" aria-hidden="true" />
            </button>

            <button
              type="button"
              class="layer-row__main pi-focus-ring"
              [attr.aria-pressed]="activeLayerId() === block._id"
              (click)="activateLayer.emit(block._id)"
            >
              <span class="layer-row__type" aria-hidden="true">
                <lucide-angular [img]="iconFor(block)" [size]="14" />
              </span>
              <span class="layer-row__label">{{ labelFor(block) }}</span>
              <span class="layer-row__z">z{{ block.layout?.zIndex ?? 0 }}</span>
            </button>

            <div class="layer-row__actions">
              <button
                type="button"
                class="layer-row__btn pi-focus-ring"
                aria-label="Свойства слоя"
                title="Свойства"
                data-test="studio-layer-properties"
                (click)="openProperties.emit(block._id); $event.stopPropagation()"
              >
                <lucide-angular [img]="settingsIcon" [size]="14" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="layer-row__btn pi-focus-ring"
                [attr.aria-label]="block.locked ? 'Разблокировать' : 'Заблокировать'"
                [attr.aria-pressed]="!!block.locked"
                title="{{ block.locked ? 'Разблокировать' : 'Заблокировать' }}"
                (click)="toggleLock.emit(block); $event.stopPropagation()"
              >
                <lucide-angular [img]="block.locked ? lockIcon : unlockIcon" [size]="14" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="layer-row__btn pi-focus-ring"
                [class.layer-row__btn--off]="block.isActive === false"
                [attr.aria-label]="block.isActive === false ? 'Показать слой' : 'Скрыть слой'"
                [attr.aria-pressed]="block.isActive !== false"
                title="{{ block.isActive === false ? 'Показать' : 'Скрыть' }}"
                (click)="toggleVisible.emit(block); $event.stopPropagation()"
              >
                <lucide-angular
                  [img]="block.isActive === false ? eyeOffIcon : eyeIcon"
                  [size]="14"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                class="layer-row__btn layer-row__btn--danger pi-focus-ring"
                aria-label="Удалить слой"
                title="Удалить"
                data-test="studio-layer-delete"
                [disabled]="!!block.locked"
                (click)="deleteLayer.emit(block._id); $event.stopPropagation()"
              >
                <lucide-angular [img]="trashIcon" [size]="14" aria-hidden="true" />
              </button>
            </div>
          </div>
        } @empty {
          <p class="layers__empty">Нет слоёв — нажмите «+ Слой»</p>
        }
      </div>
    </section>
  `,
  styles: [`
    .layers {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      min-width: 0;
      color: var(--color-ink);
      opacity: 1;
    }
    .layers__add { width: 100%; }
    .layers__hint {
      margin: 0;
      font-size: 11px;
      line-height: 1.35;
      color: var(--color-muted-foreground);
    }
    .layers__empty {
      margin: 0;
      padding: 8px 0;
      font-size: 12px;
      color: var(--color-muted-foreground);
    }
    .layers__list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      min-width: 0;
    }
    .layers__list.cdk-drop-list-dragging .layer-row:not(.cdk-drag-placeholder) {
      transition: transform 180ms ease;
    }

    .layer-row {
      display: flex;
      align-items: center;
      gap: 3px;
      width: 100%;
      min-height: 34px;
      padding: 2px 3px 2px 2px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-raised);
      color: var(--color-ink);
      box-sizing: border-box;
      opacity: 1;
    }
    .layer-row--active {
      border-color: var(--color-gold-deep);
      background: color-mix(in oklch, var(--color-gold) 14%, var(--color-paper-raised));
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--color-gold) 35%, transparent);
    }
    .layer-row--hidden .layer-row__label {
      text-decoration: line-through;
      color: var(--color-muted-foreground);
    }

    .layer-row__grip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 26px;
      height: 30px;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-muted-foreground);
      cursor: grab;
      touch-action: none;
    }
    .layer-row__grip:active { cursor: grabbing; }

    .layer-row__main {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      height: 32px;
      padding: 0 8px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-ink);
      text-align: left;
      cursor: pointer;
    }
    .layer-row__main:hover { background: var(--color-paper-2); }

    .layer-row__type {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--color-muted-foreground);
    }
    .layer-row__label {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .layer-row__z {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: var(--color-muted-foreground);
      padding: 1px 5px;
      border-radius: 999px;
      background: var(--color-paper-2);
      border: 1px solid var(--color-rule);
    }

    .layer-row__actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .layer-row__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      padding: 0;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-ink);
      cursor: pointer;
    }
    .layer-row__btn:hover {
      background: var(--color-paper-3);
      border-color: var(--color-rule-strong);
    }
    .layer-row__btn--off {
      color: var(--color-muted-foreground);
      background: var(--color-paper);
    }
    .layer-row__btn--danger {
      color: var(--color-destructive);
      border-color: color-mix(in oklch, var(--color-destructive) 35%, var(--color-rule));
    }
    .layer-row__btn--danger:hover:not(:disabled) {
      background: color-mix(in oklch, var(--color-destructive) 10%, var(--color-paper-2));
      border-color: var(--color-destructive);
    }
    .layer-row__btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .cdk-drag-preview.layer-row {
      box-sizing: border-box;
      box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.22);
      opacity: 1 !important;
      background: var(--color-paper-raised) !important;
      border-color: var(--color-gold-deep);
      color: var(--color-ink) !important;
    }
    .cdk-drag-placeholder {
      min-height: 36px;
      border: 1px dashed var(--color-gold-deep);
      border-radius: var(--radius-sm);
      background: color-mix(in oklch, var(--color-gold) 8%, var(--color-paper-2));
      opacity: 1 !important;
    }
    .cdk-drag-placeholder > * { visibility: hidden; }
    .cdk-drag-animating { transition: transform 200ms ease; }
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
  @Output() readonly deleteLayer = new EventEmitter<string>();

  protected readonly gripIcon = GripVertical;
  protected readonly lockIcon = Lock;
  protected readonly unlockIcon = Unlock;
  protected readonly settingsIcon = Settings2;
  protected readonly eyeIcon = Eye;
  protected readonly eyeOffIcon = EyeOff;
  protected readonly trashIcon = Trash2;
  protected readonly typeIcon = Type;
  protected readonly imageIcon = Image;
  protected readonly tableIcon = Table2;

  readonly orderedBlocks = computed(() =>
    [...this.blocks()]
      .filter((b) => b.layout)
      .sort((a, b) => (b.layout!.zIndex ?? 0) - (a.layout!.zIndex ?? 0)),
  );

  protected labelFor(block: StudioBlock): string {
    return layerLabel(block);
  }

  protected iconFor(block: StudioBlock): typeof Type {
    if (block.type === 'image') return this.imageIcon;
    if (block.type === 'table') return this.tableIcon;
    return this.typeIcon;
  }

  protected onDrop(event: CdkDragDrop<readonly StudioBlock[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const ordered = [...this.orderedBlocks()];
    moveItemInArray(ordered, event.previousIndex, event.currentIndex);
    this.layerReorder.emit(ordered.map((b) => b._id));
  }
}
