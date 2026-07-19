import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';
import {
  BLOCK_TYPE_LABELS,
  DATA_BINDING_FORMATS,
  type BlockType,
  type DataBinding,
  type DataBindingFormat,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SelectOptionComponent } from '../../../shared/ui/select/select-option.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';

/**
 * TZ-86 Phase D.1 — `BuilderInspector` (right pane).
 *
 * Renders an editable form for the currently-selected block. State is
 * signal-bound (no FormGroup): each field is a signal, and an `effect()`
 * watches them and emits `(update)` with the full patched block to the
 * parent. The parent then merges the patch into its in-memory list signal
 * and debounces a PATCH to the backend.
 *
 * Fields:
 *   - common: title (text), isActive (switch), showLine (switch)
 *   - text/header: content (textarea)
 *   - table: settings.tableTemplateId (readonly badge — change via re-add)
 *   - image/signature: height (number)
 *   - dataBinding: source (readonly badge), field (readonly badge),
 *     format (select: text | date | currency | number), value (text, for static)
 *
 * Empty state: when no block is selected, shows a centered hint
 * «Выберите блок для редактирования».
 */
@Component({
  selector: 'app-builder-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, SwitchComponent, SelectComponent, SelectOptionComponent],
  template: `
    <aside class="inspector" aria-label="Свойства блока">
      <header class="inspector__header">
        <h2 class="inspector__title">Свойства</h2>
        @if (block(); as b) {
          <span class="inspector__type-pill">{{ typeLabel(b) }}</span>
        }
      </header>

      @if (!block() && selectedCount() === 0) {
        <div class="inspector__empty">
          <p class="inspector__empty-title">Ничего не выбрано</p>
          <p class="inspector__empty-hint">
            Кликните по блоку на холсте, чтобы изменить его свойства
          </p>
        </div>
      } @else if (!block() && selectedCount() > 0) {
        <!-- Multi-select mode: show delete button -->
        <div class="inspector__multi">
          <p class="inspector__multi-count">Выбрано: {{ selectedCount() }}</p>
          <div class="inspector__actions">
            <app-pi-button
              variant="destructive"
              size="sm"
              (click)="deleteSelected.emit()"
              ariaLabel="Удалить выбранные блоки"
            >
              Удалить ({{ selectedCount() }})
            </app-pi-button>
          </div>
        </div>
      } @else {
        <div class="inspector__form">
          <!-- title (not for spacer) -->
          @if (block()!.type !== 'spacer') {
            <label class="field">
              <span class="field__label">Заголовок</span>
              <input
                class="field__input pi-focus-ring"
                type="text"
                [value]="title()"
                (input)="onTitleInput($event)"
                placeholder="Необязательно"
              />
            </label>
          }

          <!-- isActive (not for spacer) -->
          @if (block()!.type !== 'spacer') {
            <label class="field field--row">
              <span class="field__label">Активен</span>
              <app-pi-switch [checked]="isActive()" (checkedChange)="onIsActiveChange($event)" />
            </label>
          }

          <!-- showLine (not for spacer) -->
          @if (block()!.type !== 'spacer') {
            <label class="field field--row">
              <span class="field__label">Показывать линию снизу</span>
              <app-pi-switch [checked]="showLine()" (checkedChange)="onShowLineChange($event)" />
            </label>
          }

          @if (block()!.type === 'text' || block()!.type === 'header') {
            <label class="field">
              <span class="field__label">Содержимое</span>
              <textarea
                class="field__textarea pi-focus-ring"
                rows="6"
                [value]="content()"
                (input)="onContentInput($event)"
                placeholder="Текст блока…"
              ></textarea>
            </label>
          }

          @if (block()!.type === 'image' || block()!.type === 'signature') {
            <label class="field">
              <span class="field__label">Высота (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="20"
                max="1200"
                [value]="height()"
                (input)="onHeightInput($event)"
              />
            </label>
          }

          @if (block()!.type === 'spacer') {
            <label class="field">
              <span class="field__label">Высота: {{ height() }}px</span>
              <div class="field__slider-row">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  [value]="height()"
                  (input)="onHeightInput($event)"
                  class="field__slider"
                />
                <input
                  class="field__input field__input--small pi-focus-ring"
                  type="number"
                  min="10"
                  max="1000"
                  [value]="height()"
                  (input)="onHeightInput($event)"
                />
              </div>
            </label>
          }

          @if (block()!.type === 'table' && settingsTableId(); as tid) {
            <div class="field">
              <span class="field__label">Шаблон таблицы</span>
              <div class="badge">
                <span class="badge__label">ID</span>
                <span class="badge__value">{{ tid }}</span>
              </div>
              <p class="field__hint">Чтобы сменить шаблон, удалите блок и добавьте заново.</p>
            </div>
          }

          @if (block()!.dataBinding; as b) {
            <div class="field">
              <span class="field__label">Привязка к данным</span>
              <div class="badge-row">
                <div class="badge">
                  <span class="badge__label">Источник</span>
                  <span class="badge__value">{{ b.source }}</span>
                </div>
                @if (b.field) {
                  <div class="badge">
                    <span class="badge__label">Поле</span>
                    <span class="badge__value">{{ b.field }}</span>
                  </div>
                }
              </div>
            </div>
            <label class="field">
              <span class="field__label">Формат</span>
              <app-pi-select
                [value]="b.format ?? 'text'"
                (valueChange)="onFormatChange($event)"
              >
                @for (opt of formatOptions; track opt.value) {
                  <app-pi-select-option [value]="opt.value">{{ opt.label }}</app-pi-select-option>
                }
              </app-pi-select>
            </label>
            @if (b.source === 'static') {
              <label class="field">
                <span class="field__label">Значение (статическое)</span>
                <input
                  class="field__input pi-focus-ring"
                  type="text"
                  [value]="b.value ?? ''"
                  (input)="onBindingValueInput($event)"
                />
              </label>
            }
          }

          <div class="inspector__actions">
            @if (block()!.type === 'text' || block()!.type === 'table') {
              <app-pi-button
                variant="outline"
                size="sm"
                (click)="editSelected.emit()"
              >
                Редактировать
              </app-pi-button>
            }
            <app-pi-button
              variant="destructive"
              size="sm"
              (click)="onDelete()"
              ariaLabel="Удалить блок"
            >
              Удалить блок
            </app-pi-button>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 320px;
        flex-shrink: 0;
        height: 100%;
        overflow-y: auto;
        background: var(--color-paper);
        border-left: 1px solid var(--color-rule);
      }

      .inspector__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--color-rule);
      }

      .inspector__title {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-ink);
        margin: 0;
      }

      .inspector__type-pill {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--color-paper-2);
        color: var(--color-ink);
        padding: 2px 8px;
        border-radius: 2px;
        font-weight: 600;
      }

      .inspector__empty {
        padding: 48px 16px;
        text-align: center;
      }

      .inspector__empty-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-muted);
        margin: 0 0 4px;
      }

      .inspector__empty-hint {
        font-size: 12px;
        color: var(--color-muted);
        margin: 0;
      }

      .inspector__multi {
        padding: 48px 16px;
        text-align: center;
      }

      .inspector__multi-count {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-sunrise-warm);
        margin: 0 0 16px;
      }

      .inspector__form {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field--row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .field__label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted);
      }

      .field__input,
      .field__textarea {
        width: 100%;
        padding: 6px 8px;
        background: var(--color-paper);
        color: var(--color-ink);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        font-size: 13px;
        font-family: inherit;
        box-sizing: border-box;
      }

      .field__textarea {
        resize: vertical;
        font-family: ui-monospace, monospace;
        font-size: 12px;
      }

      .field__slider {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--color-rule);
        border-radius: 2px;
        outline: none;
        cursor: pointer;
        flex: 1;
      }

      .field__slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: 2px solid var(--color-paper);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .field__slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: 2px solid var(--color-paper);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .field__slider-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .field__input--small {
        width: 64px;
        flex-shrink: 0;
        text-align: center;
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted);
        margin: 4px 0 0;
      }

      .badge-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--color-paper-2);
        padding: 2px 6px;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        font-size: 11px;
      }

      .badge__label {
        color: var(--color-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .badge__value {
        color: var(--color-ink);
        font-family: ui-monospace, monospace;
      }

      .inspector__actions {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--color-rule);
      }
    `,
  ],
})
export class BuilderInspectorComponent {
  /** The currently-selected block (null = nothing selected). */
  readonly block = input<TemplateBlock | null>(null);
  /** Number of blocks in multi-select mode. */
  readonly selectedCount = input<number>(0);
  /** Emitted when the user changes a field value. */
  readonly update = output<Partial<TemplateBlock> & { _id: string }>();
  /** Emitted when the user clicks "Удалить блок". */
  readonly delete = output<string>();
  /** Emitted when the user clicks "Удалить выбранные" (multi-select). */
  readonly deleteSelected = output<void>();
  /** Emitted when the user clicks "Редактировать" (multi-select single). */
  readonly editSelected = output<void>();

  // Local form-state signals (mirror the selected block for fast edits).
  protected readonly title = signal<string>('');
  protected readonly content = signal<string>('');
  protected readonly height = signal<number>(100);
  protected readonly isActive = signal<boolean>(true);
  protected readonly showLine = signal<boolean>(false);
  protected readonly bindingValue = signal<string>('');

  // Derived
  protected readonly settingsTableId = computed<string | null>(() => {
    const b = this.block();
    if (!b || b.type !== 'table') return null;
    const settings = b.settings as { tableTemplateId?: string } | undefined;
    return settings?.tableTemplateId ?? null;
  });

  protected readonly formatOptions = DATA_BINDING_FORMATS.map((f) => ({
    value: f,
    label: f === 'currency' ? 'Сумма' : f === 'date' ? 'Дата' : f === 'number' ? 'Число' : 'Текст',
  }));

  constructor() {
    // Whenever the selected block changes, hydrate the form signals.
    effect(() => {
      const b = this.block();
      this.title.set(b?.title ?? '');
      this.content.set(b?.content ?? '');
      this.height.set(b?.height ?? 100);
      this.isActive.set(b?.isActive ?? true);
      this.showLine.set(b?.showLine ?? false);
      this.bindingValue.set(b?.dataBinding?.value ?? '');
    });
  }

  protected typeLabel(b: TemplateBlock): string {
    return BLOCK_TYPE_LABELS[b.type as BlockType] ?? b.type;
  }

  private patch(partial: Partial<TemplateBlock>): void {
    const b = this.block();
    if (!b?._id) return;
    this.update.emit({ _id: b._id, ...partial });
  }

  protected onTitleInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.title.set(v);
    this.patch({ title: v });
  }

  protected onContentInput(event: Event): void {
    const v = (event.target as HTMLTextAreaElement).value;
    this.content.set(v);
    this.patch({ content: v });
  }

  protected onHeightInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 100;
    this.height.set(v);
    this.patch({ height: v });
  }

  protected onIsActiveChange(checked: boolean): void {
    this.isActive.set(checked);
    this.patch({ isActive: checked });
  }

  protected onShowLineChange(checked: boolean): void {
    this.showLine.set(checked);
    this.patch({ showLine: checked });
  }

  protected onFormatChange(format: string | null): void {
    const b = this.block();
    if (!b?._id || !b.dataBinding) return;
    const next: DataBinding = {
      ...b.dataBinding,
      format: format as DataBindingFormat,
    };
    this.update.emit({ _id: b._id, dataBinding: next });
  }

  protected onBindingValueInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.bindingValue.set(v);
    const b = this.block();
    if (!b?._id || !b.dataBinding) return;
    const next: DataBinding = { ...b.dataBinding, value: v };
    this.update.emit({ _id: b._id, dataBinding: next });
  }

  protected onDelete(): void {
    const b = this.block();
    if (!b?._id) return;
    this.delete.emit(b._id);
  }
}
