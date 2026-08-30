import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { StudioBlock, StudioBlockStyle, TextBlock } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import {
  Image,
  Layers,
  LucideAngularModule,
  Maximize2,
  Table2,
  Trash2,
  Type,
} from 'lucide-angular';
import { studioImageUrl, studioLayerTypeLabel } from './studio-block-helpers';
import { StudioTablePropertiesComponent } from './studio-table-properties.component';
import { StudioTextPropertiesComponent } from './studio-text-properties.component';

function layerDisplayName(block: StudioBlock): string {
  if (block.title?.trim()) return block.title.trim();
  return 'Без названия';
}

@Component({
  selector: 'pi-studio-properties-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, StudioTablePropertiesComponent, StudioTextPropertiesComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="props" data-test="studio-properties-panel" (click)="$event.stopPropagation()">
      @if (block; as selected) {
        <header class="props__hero">
          <span class="props__hero-icon" aria-hidden="true">
            <lucide-angular [img]="typeIconFor(selected)" [size]="18" />
          </span>
          <div class="props__hero-text">
            <strong class="props__hero-name">{{ layerName(selected) }}</strong>
            <span class="props__hero-type">{{ typeLabel(selected) }}</span>
          </div>
        </header>

        @if (selected.locked) {
          <p class="props__lock">Слой заблокирован</p>
        }

        <div class="props__card">
          <h3 class="props__card-title">
            <lucide-angular [img]="layersIcon" [size]="14" aria-hidden="true" />
            Слой
          </h3>
          <label class="props__field">
            <span class="props__label">Название</span>
            <input
              class="props__input"
              type="text"
              [ngModel]="selected.title ?? ''"
              (ngModelChange)="titleChange.emit($event)"
              [disabled]="!!selected.locked"
              data-test="studio-layer-title"
            />
          </label>
        </div>

        @if (selected.type === 'table') {
          <div class="props__card">
            <h3 class="props__card-title">
              <lucide-angular [img]="tableIcon" [size]="14" aria-hidden="true" />
              Вид таблицы
            </h3>
            <pi-studio-table-properties
              [block]="selected"
              [disabled]="!!selected.locked"
              (settingsChange)="tableSettingsChange.emit($event)"
              (saveTemplate)="saveTableTemplate.emit()"
            />
          </div>
        }

        @if (selected.type === 'text') {
          <div class="props__card">
            <h3 class="props__card-title">
              <lucide-angular [img]="typeIconConst" [size]="14" aria-hidden="true" />
              Текст
            </h3>
            <pi-studio-text-properties
              [block]="selected"
              [disabled]="!!selected.locked"
              (contentChange)="contentChange.emit($event)"
              (styleChange)="styleChange.emit($event)"
              (applyLibraryText)="applyLibraryText.emit($event)"
              (saveToLibrary)="saveTextBlock.emit()"
            />
          </div>
        } @else if (selected.type === 'image') {
        <div class="props__card">
          <h3 class="props__card-title">
            <lucide-angular [img]="imageIcon" [size]="14" aria-hidden="true" />
            Контент
          </h3>
            @if (imageUrl(selected); as url) {
              <img [src]="url" alt="" class="props__image" data-test="studio-image-preview" />
            } @else {
              <p class="props__hint">Изображение не загружено</p>
            }
        </div>
        }

        <div class="props__card props__card--actions">
          <h3 class="props__card-title">Действия</h3>
          @if (selected.type === 'image') {
            <app-pi-button
              variant="secondary"
              size="sm"
              class="w-full"
              data-test="studio-image-full-page"
              [disabled]="!!selected.locked"
              (click)="imageFullPage.emit()"
            >
              <lucide-angular [img]="maximizeIcon" [size]="14" aria-hidden="true" />
              На весь лист
            </app-pi-button>
          }
          <app-pi-button
            variant="destructive"
            size="sm"
            class="w-full"
            data-test="studio-delete-layer"
            [disabled]="!!selected.locked"
            (click)="deleteLayer.emit()"
          >
            <lucide-angular [img]="trashIcon" [size]="14" aria-hidden="true" />
            Удалить слой
          </app-pi-button>
        </div>
      } @else {
        <div class="props__empty">
          <lucide-angular [img]="layersIcon" [size]="28" aria-hidden="true" />
          <p>Выберите слой в панели «Слои» слева или нажмите ⚙ на плитке слоя.</p>
        </div>
      }
    </section>
  `,
  styles: [`
    .props {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      min-width: 0;
      color: var(--color-ink);
      opacity: 1;
    }

    .props__hero {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
    }
    .props__hero-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: color-mix(in oklch, var(--color-gold) 18%, var(--color-paper-raised));
      color: var(--color-ink);
      flex-shrink: 0;
    }
    .props__hero-text { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .props__hero-name {
      font-size: 14px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .props__hero-type {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-muted-foreground);
    }

    .props__lock {
      margin: 0;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-destructive);
      border: 1px solid color-mix(in oklch, var(--color-destructive) 40%, var(--color-rule));
      border-radius: var(--radius-sm);
      background: color-mix(in oklch, var(--color-destructive) 8%, var(--color-paper-raised));
    }

    .props__card {
      padding: 8px 10px;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm);
      background: var(--color-paper-raised);
    }
    .props__card--actions { display: flex; flex-direction: column; gap: 8px; }

    .props__card-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0 0 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--color-ink);
    }

    .props__field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0;
    }
    .props__label {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-muted-foreground);
    }

    .props__input {
      width: 100%;
      box-sizing: border-box;
      padding: 7px 9px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-ink);
      font-size: 13px;
      opacity: 1;
    }
    .props__input:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .props__input:focus {
      outline: 2px solid var(--color-gold);
      outline-offset: 0;
      border-color: var(--color-gold-deep);
    }

    .props__image {
      display: block;
      max-width: 100%;
      max-height: 140px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
    }
    .props__hint {
      margin: 0;
      font-size: 12px;
      color: var(--color-muted-foreground);
    }

    .props__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 24px 12px;
      text-align: center;
      color: var(--color-muted-foreground);
      font-size: 13px;
      line-height: 1.45;
    }
    .props__empty p { margin: 0; }
  `],
})
export class StudioPropertiesPanelComponent {
  @Input() block: StudioBlock | null = null;
  @Output() readonly styleChange = new EventEmitter<Partial<StudioBlockStyle>>();
  @Output() readonly contentChange = new EventEmitter<string>();
  @Output() readonly titleChange = new EventEmitter<string>();
  @Output() readonly imageFullPage = new EventEmitter<void>();
  @Output() readonly deleteLayer = new EventEmitter<void>();
  @Output() readonly tableSettingsChange = new EventEmitter<Record<string, unknown>>();
  @Output() readonly saveTableTemplate = new EventEmitter<void>();
  @Output() readonly applyLibraryText = new EventEmitter<TextBlock>();
  @Output() readonly saveTextBlock = new EventEmitter<void>();

  protected readonly imageUrl = studioImageUrl;
  protected readonly layersIcon = Layers;
  protected readonly typeIconConst = Type;
  protected readonly imageIcon = Image;
  protected readonly tableIcon = Table2;
  protected readonly maximizeIcon = Maximize2;
  protected readonly trashIcon = Trash2;

  protected layerName(block: StudioBlock): string {
    return layerDisplayName(block);
  }

  protected typeLabel(block: StudioBlock): string {
    return studioLayerTypeLabel(block);
  }

  protected typeIconFor(block: StudioBlock): typeof Type {
    if (block.type === 'image') return this.imageIcon;
    if (block.type === 'table') return this.tableIcon;
    return this.typeIconConst;
  }
}
