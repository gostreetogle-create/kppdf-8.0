/**
 * TZ-235.C — BlockInspectorComponent (sub-component of `BuilderInspector`).
 *
 * Renders the per-block editable form for the currently-selected block.
 * Mounted by the parent `BuilderInspectorComponent` switcher when a single
 * block is selected (i.e. `block()` is non-null AND not templateSelected).
 *
 * Per-type dispatch (extracted verbatim from the original monolithic inspector):
 *   • common (all types except spacer): title, isActive, showLine
 *   • text / header: content textarea
 *   • image: image upload + width + height + overlay toggle + overlay position
 *   • signature: height input
 *   • spacer: height slider + numeric input
 *   • table: read-only badge for tableTemplateId
 *   • dataBinding (any block with binding): source/field badges + value input (for static)
 *   • margin controls (all blocks): left px / right px / reset
 *   • actions (text/table): edit button + delete button
 *
 * State source: single `BuilderInspectorStateService` injected from
 * parent DI tree (no inputs/outputs on this sub-component — all data
 * flows through the service).
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, RotateCcw, Upload, X } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { BuilderInspectorStateService } from './builder-inspector-state.service';

@Component({
  selector: 'app-block-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, SwitchComponent],
  template: `
    <div class="inspector__form">
      <!-- Title (not for spacer) -->
      @if (state.block()!.type !== 'spacer') {
        <label class="field">
          <span class="field__label">Заголовок</span>
          <input
            class="field__input pi-focus-ring"
            type="text"
            [value]="state.title()"
            (input)="state.onTitleInput($event)"
            placeholder="Необязательно"
          />
        </label>
      }

      <!-- isActive (not for spacer) -->
      @if (state.block()!.type !== 'spacer') {
        <label class="field field--row">
          <span class="field__label">Активен</span>
          <app-pi-switch [checked]="state.isActive()" (checkedChange)="state.onIsActiveChange($event)" />
        </label>
      }

      <!-- showLine (not for spacer) -->
      @if (state.block()!.type !== 'spacer') {
        <label class="field field--row">
          <span class="field__label">Линия снизу</span>
          <app-pi-switch [checked]="state.showLine()" (checkedChange)="state.onShowLineChange($event)" />
        </label>
      }

      <!-- Content (text/header) -->
      @if (state.block()!.type === 'text' || state.block()!.type === 'header') {
        <label class="field">
          <span class="field__label">Содержимое</span>
          <textarea
            class="field__textarea pi-focus-ring"
            rows="4"
            [value]="state.content()"
            (input)="state.onContentInput($event)"
            placeholder="Текст блока…"
          ></textarea>
        </label>
      }

      <!-- Image upload + controls -->
      @if (state.block()!.type === 'image') {
        <div class="field">
          <span class="field__label">Изображение</span>
          @if (state.imageUrl()) {
            <div class="image-preview">
              <img [src]="state.imageUrl()" alt="Превью" class="image-preview__img" />
              <button type="button" class="image-preview__remove" (click)="state.onRemoveImage()" title="Удалить изображение">
                <lucide-icon [img]="CloseIcon" [size]="14"></lucide-icon>
              </button>
            </div>
          }
          <label class="bg-upload">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="bg-upload__input"
              (change)="state.onImageUpload($event)"
            />
            <span class="bg-upload__inner">
              <lucide-icon [img]="UploadIcon" [size]="14"></lucide-icon>
              <span class="bg-upload__text">{{ state.imageUrl() ? 'Заменить' : 'Загрузить фото' }}</span>
            </span>
          </label>
        </div>

        <!-- Width -->
        <label class="field">
          <span class="field__label">Ширина (px)</span>
          <input
            class="field__input pi-focus-ring"
            type="number"
            min="50"
            max="2000"
            [value]="state.imageWidth() ?? ''"
            (input)="state.onImageWidthInput($event)"
            placeholder="Авто"
          />
        </label>

        <!-- Height -->
        <label class="field">
          <span class="field__label">Высота (px)</span>
          <input
            class="field__input pi-focus-ring"
            type="number"
            min="20"
            max="2000"
            [value]="state.imageHeight() ?? ''"
            (input)="state.onImageHeightInput($event)"
            placeholder="Авто"
          />
        </label>

        <!-- Overlay toggle -->
        <label class="field field--row">
          <span class="field__label">Поверх других блоков</span>
          <app-pi-switch
            [checked]="state.imageOverlay()"
            (checkedChange)="state.onImageOverlayToggle($event)"
          />
        </label>

        <!-- Overlay position (only when overlay is ON) -->
        @if (state.imageOverlay()) {
          <label class="field">
            <span class="field__label">Позиция X (px)</span>
            <input
              class="field__input pi-focus-ring"
              type="number"
              min="0"
              max="2000"
              [value]="state.overlayLeft()"
              (input)="state.onOverlayLeftInput($event)"
            />
          </label>
          <label class="field">
            <span class="field__label">Позиция Y (px)</span>
            <input
              class="field__input pi-focus-ring"
              type="number"
              min="0"
              max="2000"
              [value]="state.overlayTop()"
              (input)="state.onOverlayTopInput($event)"
            />
          </label>
        }
      }

      <!-- Height (signature only) -->
      @if (state.block()!.type === 'signature') {
        <label class="field">
          <span class="field__label">Высота (px)</span>
          <input
            class="field__input pi-focus-ring"
            type="number"
            min="20"
            max="1200"
            [value]="state.height()"
            (input)="state.onHeightInput($event)"
          />
        </label>
      }

      <!-- Height slider (spacer) -->
      @if (state.block()!.type === 'spacer') {
        <label class="field">
          <span class="field__label">Высота: {{ state.height() }}px</span>
          <div class="field__slider-row">
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              [value]="state.height()"
              (input)="state.onHeightInput($event)"
              class="field__slider"
            />
            <input
              class="field__input field__input--small pi-focus-ring"
              type="number"
              min="10"
              max="1000"
              [value]="state.height()"
              (input)="state.onHeightInput($event)"
            />
          </div>
        </label>
      }

      <!-- Table template info -->
      @if (state.block()!.type === 'table' && state.settingsTableId(); as tid) {
        <div class="field">
          <span class="field__label">Шаблон таблицы</span>
          <div class="badge">
            <span class="badge__label">ID</span>
            <span class="badge__value">{{ tid }}</span>
          </div>
          <p class="field__hint">Для смены шаблона — удалите блок и добавьте заново.</p>
        </div>
      }

      <!-- Data binding info (read-only badges) -->
      @if (state.block()!.dataBinding; as b) {
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
        @if (b.source === 'static') {
          <label class="field">
            <span class="field__label">Значение</span>
            <input
              class="field__input pi-focus-ring"
              type="text"
              [value]="b.value ?? ''"
              (input)="state.onBindingValueInput($event)"
            />
          </label>
        }
      }

      <!-- Margin controls -->
      <div class="inspector__section">
        <span class="inspector__section-title">Отступы</span>
        <div class="margin-controls">
          <label class="margin-controls__item">
            <span class="margin-controls__label">Слева</span>
            <div class="margin-controls__input-row">
              <input
                class="field__input field__input--small pi-focus-ring"
                type="number"
                min="0"
                [max]="state.maxMarginLeftPx()"
                [value]="state.marginLeftPx()"
                (input)="state.onMarginLeftInput($event)"
              />
              <span class="margin-controls__unit">px</span>
            </div>
          </label>
          <label class="margin-controls__item">
            <span class="margin-controls__label">Справа</span>
            <div class="margin-controls__input-row">
              <input
                class="field__input field__input--small pi-focus-ring"
                type="number"
                min="0"
                [max]="state.maxMarginRightPx()"
                [value]="state.marginRightPx()"
                (input)="state.onMarginRightInput($event)"
              />
              <span class="margin-controls__unit">px</span>
            </div>
          </label>
        </div>
        <button
          type="button"
          class="field__reset-btn pi-focus-ring"
          (click)="state.onResetMargins()"
          [disabled]="state.marginLeftPx() === 0 && state.marginRightPx() === 0"
        >
          <lucide-icon [img]="ResetIcon" [size]="12"></lucide-icon>
          Сбросить отступы
        </button>
      </div>

      <!-- Actions -->
      <div class="inspector__section inspector__section--actions">
        @if (state.block()!.type === 'text' || state.block()!.type === 'table') {
          <app-pi-button variant="outline" size="sm" (click)="state.triggerEditSelected()">
            Редактировать
          </app-pi-button>
        }
        <app-pi-button
          variant="destructive"
          size="sm"
          (click)="state.onDelete()"
          ariaLabel="Удалить блок"
        >
          Удалить блок
        </app-pi-button>
      </div>
    </div>
  `,
  styles: [
    `
      .inspector__form {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* ── Fields ── */
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field--row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__input,
      .field__textarea {
        width: 100%;
        padding: 10px 12px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-ink, #191c1d);
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
        transition: border-color 120ms ease;
      }

      .field__input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm, #735c00);
      }

      .field__input::placeholder {
        color: var(--color-muted, #7f7663);
      }

      .field__input--small {
        width: 64px;
        flex-shrink: 0;
        text-align: center;
      }

      .field__textarea {
        resize: vertical;
        font-family: ui-monospace, monospace;
        font-size: 12px;
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted, #7f7663);
        margin: 4px 0 0;
      }

      /* ── Slider ── */
      .field__slider {
        width: 100%;
        height: 2px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--color-rule, #d0c5af);
        border-radius: 1px;
        outline: none;
        cursor: pointer;
      }

      .field__slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: none;
      }

      .field__slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: none;
      }

      .field__slider::-moz-range-track {
        height: 2px;
        background: var(--color-rule, #d0c5af);
        border-radius: 1px;
      }

      .field__slider-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* ═══ Image preview in inspector ═══ */
      .image-preview {
        position: relative;
        display: inline-block;
        margin-bottom: 8px;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        overflow: hidden;
        max-width: 100%;
      }

      .image-preview__img {
        display: block;
        max-width: 100%;
        max-height: 120px;
        object-fit: contain;
      }

      .image-preview__remove {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 150ms ease;
        color: var(--color-muted);
      }

      .image-preview:hover .image-preview__remove {
        opacity: 1;
      }

      .image-preview__remove:hover {
        color: var(--color-destructive);
        border-color: var(--color-destructive);
      }

      /* ═══ Upload styles (image) ═══ */
      .bg-upload {
        display: block;
        margin-top: 8px;
        cursor: pointer;
      }

      .bg-upload__input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .bg-upload__inner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 14px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-sunrise-warm, #735c00);
        background: transparent;
        border: 1px dashed var(--color-rule, #d0c5af);
        border-radius: 2px;
        cursor: pointer;
        transition: all 120ms ease;
      }

      .bg-upload__inner:hover {
        border-color: var(--color-sunrise-warm, #735c00);
        background: rgba(115, 92, 0, 0.05);
      }

      .bg-upload__text {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      /* ── Badges ── */
      .badge-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--color-paper-2, #e1e3e4);
        padding: 2px 6px;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        font-size: 11px;
      }

      .badge__label {
        color: var(--color-muted, #7f7663);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .badge__value {
        color: var(--color-ink, #191c1d);
        font-family: ui-monospace, monospace;
      }

      /* ── Sections ── */
      .inspector__section {
        padding: 12px 0;
        border-top: 1px solid var(--color-rule, #d0c5af);
        text-align: left;
      }

      .inspector__section:first-of-type {
        border-top: none;
        padding-top: 0;
      }

      .inspector__section-title {
        display: block;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted, #7f7663);
        margin-bottom: 10px;
      }

      .inspector__section--actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* ── Margin controls ── */
      .margin-controls {
        display: flex;
        gap: 12px;
      }

      .margin-controls__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .margin-controls__label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted, #7f7663);
        text-align: center;
      }

      .margin-controls__input-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .margin-controls__unit {
        font-size: 10px;
        color: var(--color-muted, #7f7663);
        flex-shrink: 0;
      }

      .field__reset-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        color: var(--color-muted, #7f7663);
        background: transparent;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .field__reset-btn:hover:not(:disabled) {
        color: var(--color-ink, #191c1d);
        border-color: var(--color-ink, #191c1d);
        background: var(--color-paper-2, #e1e3e4);
      }

      .field__reset-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ],
})
export class BlockInspectorComponent {
  protected readonly state = inject(BuilderInspectorStateService);

  // Icons
  protected readonly ResetIcon = RotateCcw;
  protected readonly UploadIcon = Upload;
  protected readonly CloseIcon = X;
}
