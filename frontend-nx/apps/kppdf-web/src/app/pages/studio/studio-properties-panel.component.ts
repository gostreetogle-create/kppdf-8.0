import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { StudioBlock, StudioBlockAlign, StudioBlockStyle } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { studioImageUrl, studioLayerTypeLabel } from './studio-block-helpers';
import { studioTableColumns, studioTableRowCount, studioTableRows } from './studio-table-defaults';
import { StudioTableEditorComponent } from './studio-table-editor.component';

function pct(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

function layerDisplayName(block: StudioBlock): string {
  if (block.title?.trim()) return block.title.trim();
  if (block.content?.trim()) {
    const t = block.content.trim();
    return t.length > 24 ? `${t.slice(0, 24)}…` : t;
  }
  return 'Без названия';
}

const ALIGN_OPTIONS: readonly { value: StudioBlockAlign; label: string }[] = [
  { value: 'left', label: 'Слева' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'Справа' },
  { value: 'justify', label: 'По ширине' },
];

@Component({
  selector: 'pi-studio-properties-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, StudioTableEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="properties" data-test="studio-properties-panel">
      @if (block; as selected) {
        <p class="context-subhead">
          Слой: {{ layerName(selected) }} · тип: {{ typeLabel(selected) }}
        </p>

        <h3 class="section-title">Слой</h3>
        <label class="field">
          <span>Название</span>
          <input
            type="text"
            [ngModel]="selected.title ?? ''"
            (ngModelChange)="titleChange.emit($event)"
            data-test="studio-layer-title"
          />
        </label>
        @if (selected.locked) {
          <p class="lock-hint">Слой заблокирован — редактирование недоступно</p>
        }

        <h3 class="section-title">Контент</h3>
        @if (selected.type === 'text') {
          <label class="field">
            <span>Текст</span>
            <textarea
              rows="4"
              [ngModel]="selected.content ?? ''"
              (ngModelChange)="contentChange.emit($event)"
              [disabled]="!!selected.locked"
              data-test="studio-block-content"
            ></textarea>
          </label>
        } @else if (selected.type === 'image') {
          @if (imageUrl(selected); as url) {
            <img [src]="url" alt="" class="image-preview" data-test="studio-image-preview" />
          } @else {
            <p class="content-hint">Изображение не загружено</p>
          }
        } @else if (selected.type === 'table') {
          <pi-studio-table-editor
            [block]="selected"
            [rows]="tableRows(selected)"
            [disabled]="!!selected.locked"
            (rowsChange)="tableRowsChange.emit($event)"
          />
        }

        @if (selected.type === 'text') {
          <h3 class="section-title">Типографика</h3>
          <div class="typo" data-test="studio-typography-controls">
            <label>
              <span>Размер (pt)</span>
              <input
                type="number"
                min="6"
                max="96"
                step="1"
                [ngModel]="selected.style?.fontSizePt ?? 14"
                (ngModelChange)="patchStyle({ fontSizePt: toFontSize($event) })"
                [disabled]="!!selected.locked"
                data-test="studio-font-size"
              />
            </label>
            <label>
              <span>Цвет</span>
              <input
                type="color"
                [ngModel]="selected.style?.color ?? '#000000'"
                (ngModelChange)="patchStyle({ color: $event })"
                [disabled]="!!selected.locked"
                data-test="studio-font-color"
              />
            </label>
            <label>
              <span>Выравнивание</span>
              <select
                [ngModel]="selected.style?.align ?? 'left'"
                (ngModelChange)="patchStyle({ align: $event })"
                [disabled]="!!selected.locked"
                data-test="studio-text-align"
              >
                @for (opt of alignOptions; track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </label>
          </div>
        }

        @if (selected.layout; as layout) {
          <h3 class="section-title">Геометрия</h3>
          <dl class="geom">
            <div><dt>X</dt><dd>{{ pct(layout.x) }}</dd></div>
            <div><dt>Y</dt><dd>{{ pct(layout.y) }}</dd></div>
            <div><dt>Ширина</dt><dd>{{ pct(layout.width) }}</dd></div>
            <div><dt>Высота</dt><dd>{{ pct(layout.height) }}</dd></div>
            <div><dt>Z-index</dt><dd>{{ layout.zIndex }}</dd></div>
          </dl>
        }

        <h3 class="section-title">Действия</h3>
        <div class="actions">
          @if (selected.type === 'image') {
            <app-pi-button
              variant="secondary"
              size="sm"
              class="w-full"
              data-test="studio-image-full-page"
              [disabled]="!!selected.locked"
              (click)="imageFullPage.emit()"
            >
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
            Удалить слой
          </app-pi-button>
        </div>
      } @else {
        <p class="empty">Выберите слой в панели «Слои» слева</p>
      }
    </section>
  `,
  styles: [`
    .properties { padding: 0; }
    .context-subhead {
      margin: 0 0 12px;
      font-size: 12px;
      color: var(--color-muted-foreground);
      line-height: 1.4;
    }
    .section-title {
      margin: 16px 0 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--color-muted-foreground);
    }
    .section-title:first-of-type { margin-top: 0; }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0 0 8px;
      font-size: 12px;
    }
    .field input, .field textarea { font-size: 13px; padding: 6px 8px; }
    .field textarea { min-height: 72px; resize: vertical; }
    .lock-hint {
      margin: 0 0 8px;
      font-size: 12px;
      color: var(--color-destructive);
    }
    .content-hint {
      margin: 0;
      font-size: 12px;
      color: var(--color-muted-foreground);
      line-height: 1.4;
    }
    dl { margin: 0; }
    .geom div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
      font-size: 13px;
    }
    dt { color: var(--color-muted-foreground); }
    dd { margin: 0; font-variant-numeric: tabular-nums; }
    .empty { font-size: 13px; color: var(--color-muted-foreground); margin: 0; }
    .typo { display: flex; flex-direction: column; gap: 10px; }
    .typo label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--color-ink-muted, #444);
    }
    .typo input, .typo select { font-size: 13px; padding: 4px 6px; }
    .typo input[type="color"] { width: 48px; height: 32px; padding: 2px; }
    .image-preview {
      display: block;
      max-width: 100%;
      max-height: 128px;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm);
    }
    .actions { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  `],
})
export class StudioPropertiesPanelComponent {
  @Input() block: StudioBlock | null = null;
  @Output() readonly styleChange = new EventEmitter<Partial<StudioBlockStyle>>();
  @Output() readonly contentChange = new EventEmitter<string>();
  @Output() readonly titleChange = new EventEmitter<string>();
  @Output() readonly imageFullPage = new EventEmitter<void>();
  @Output() readonly deleteLayer = new EventEmitter<void>();
  @Output() readonly tableRowsChange = new EventEmitter<string[][]>();

  protected readonly alignOptions = ALIGN_OPTIONS;
  protected readonly imageUrl = studioImageUrl;
  protected readonly pct = pct;

  protected layerName(block: StudioBlock): string {
    return layerDisplayName(block);
  }

  protected typeLabel(block: StudioBlock): string {
    return studioLayerTypeLabel(block);
  }

  tableCols(block: StudioBlock): number {
    return studioTableColumns(block).length;
  }

  tableRows(block: StudioBlock): string[][] {
    return studioTableRows(block);
  }

  tableRowCount(block: StudioBlock): number {
    return studioTableRowCount(block);
  }

  patchStyle(patch: Partial<StudioBlockStyle>): void {
    this.styleChange.emit(patch);
  }

  toFontSize(value: number | string): number {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return 14;
    return Math.min(96, Math.max(6, Math.round(n)));
  }
}
