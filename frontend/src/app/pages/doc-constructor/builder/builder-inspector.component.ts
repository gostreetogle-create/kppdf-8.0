import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  LucideAngularModule,
  RotateCcw,
  BookOpen,
  Columns,
  Hash,
  List,
  FileText,
  Eye,
  File,
  Upload,
} from 'lucide-angular';
import {
  BLOCK_TYPE_LABELS,
  type BlockType,
  type DataBinding,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';

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
  imports: [
    LucideAngularModule,
    ButtonComponent,
    SwitchComponent,
  ],
  template: `
    <aside class="inspector" aria-label="Свойства блока">
      <header class="inspector__header">
        <h2 class="inspector__title">Свойства</h2>
        @if (block(); as b) {
          <span class="inspector__type-pill">{{ typeLabel(b) }}</span>
        }
      </header>

      @if (!block() && selectedCount() === 0 && !templateSelected()) {
        <div class="inspector__empty">
          <p class="inspector__empty-title">Ничего не выбрано</p>
          <p class="inspector__empty-hint">
            Кликните по блоку или на пустое место холста
          </p>
        </div>
      } @else if (templateSelected() && template(); as t) {
        <!-- Template properties panel -->
        <div class="inspector__form">
          <span class="inspector__section-title">Свойства шаблона</span>

          <!-- Orientation -->
          <div class="field">
            <span class="field__label">Ориентация</span>
            <div class="orientation-btns">
              <button
                type="button"
                class="orientation-btn"
                [class.is-active]="t.orientation === 'portrait' || !t.orientation"
                (click)="onOrientationChange('portrait')"
              >
                <lucide-icon [img]="BookOpenIcon" [size]="14"></lucide-icon>
                Книжная
              </button>
              <button
                type="button"
                class="orientation-btn"
                [class.is-active]="t.orientation === 'landscape'"
                (click)="onOrientationChange('landscape')"
              >
                <lucide-icon [img]="ColumnsIcon" [size]="14"></lucide-icon>
                Альбомная
              </button>
            </div>
          </div>

          <!-- Page size -->
          <div class="field">
            <span class="field__label">Формат страницы</span>
            <div class="orientation-btns">
              <button
                type="button"
                class="orientation-btn orientation-btn--sm"
                [class.is-active]="t.pageSize === 'A3'"
                (click)="onPageSizeChange('A3')"
              >A3</button>
              <button
                type="button"
                class="orientation-btn orientation-btn--sm"
                [class.is-active]="t.pageSize === 'A4' || !t.pageSize"
                (click)="onPageSizeChange('A4')"
              >A4</button>
              <button
                type="button"
                class="orientation-btn orientation-btn--sm"
                [class.is-active]="t.pageSize === 'A5'"
                (click)="onPageSizeChange('A5')"
              >A5</button>
            </div>
          </div>

          <!-- Background opacity -->
          <div class="field">
            <span class="field__label">
              <lucide-icon [img]="EyeIcon" [size]="12"></lucide-icon>
              Прозрачность фона: {{ opacityPercent() }}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              [value]="t.backgroundOpacity"
              (input)="onOpacityInput($event)"
              class="field__slider"
            />
          </div>

          <!-- Page numbering -->
          <label class="field field--row">
            <span class="field__label">
              <lucide-icon [img]="HashIcon" [size]="12"></lucide-icon>
              Нумерация страниц
            </span>
            <app-pi-switch
              [checked]="t.pageNumbering ?? false"
              (checkedChange)="onTemplateSettingChange('pageNumbering', $event)"
            />
          </label>

          <!-- Table of contents -->
          <label class="field field--row">
            <span class="field__label">
              <lucide-icon [img]="ListIcon" [size]="12"></lucide-icon>
              Оглавление
            </span>
            <app-pi-switch
              [checked]="t.tableOfContents ?? false"
              (checkedChange)="onTemplateSettingChange('tableOfContents', $event)"
            />
          </label>

          <!-- Header text -->
          <label class="field">
            <span class="field__label">
              <lucide-icon [img]="FileTextIcon" [size]="12"></lucide-icon>
              Шапка документа
            </span>
            <input
              class="field__input pi-focus-ring"
              type="text"
              [value]="t.headerText ?? ''"
              (input)="onTemplateTextInput('headerText', $event)"
              placeholder="Текст шапки (необязательно)"
            />
          </label>

          <!-- Footer text -->
          <label class="field">
            <span class="field__label">
              <lucide-icon [img]="FileTextIcon" [size]="12"></lucide-icon>
              Подвал документа
            </span>
            <input
              class="field__input pi-focus-ring"
              type="text"
              [value]="t.footerText ?? ''"
              (input)="onTemplateTextInput('footerText', $event)"
              placeholder="Текст подвала (необязательно)"
            />
          </label>

          <!-- Background images -->
          <div class="field">
            <span class="field__label">
              <lucide-icon [img]="FileIcon" [size]="12"></lucide-icon>
              Фоновое изображение
            </span>
            @if (t.backgroundImage && t.backgroundImage.length > 0) {
              <div class="bg-preview-list">
                @for (url of t.backgroundImage; track url; let i = $index) {
                  <div
                    class="bg-preview-item"
                    [class.is-default]="t.defaultBackgroundIndex === i"
                  >
                    <div class="bg-preview-thumb" [style.background-image]="'url(' + url + ')'"></div>
                    <div class="bg-preview-actions">
                      <span class="bg-preview-label">Фон {{ i + 1 }}</span>
                      <button
                        type="button"
                        class="bg-action-btn"
                        [class.is-active]="t.defaultBackgroundIndex === i"
                        (click)="onSetDefaultBackground(i)"
                        [attr.aria-label]="t.defaultBackgroundIndex === i ? 'Убрать из дефолтных' : 'Сделать по умолчанию'"
                      >
                        {{ t.defaultBackgroundIndex === i ? '★' : '☆' }}
                      </button>
                      <button
                        type="button"
                        class="bg-action-btn bg-action-btn--danger"
                        (click)="onRemoveBackground(i)"
                        aria-label="Удалить фон"
                      >×</button>
                    </div>
                  </div>
                }
              </div>
            }
            <label class="bg-upload-label">
              <input
                #bgFileInput
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="bg-file-input"
                (change)="onFileChange($event)"
              />
              <span class="bg-upload-button">
                <lucide-icon [img]="UploadIcon" [size]="12"></lucide-icon>
                Загрузить фон
              </span>
            </label>
          </div>
        </div>
      } @else if (!block() && selectedCount() > 0) {
        <!-- Multi-select mode -->
        <div class="inspector__multi">
          <p class="inspector__multi-count">Выбрано: {{ selectedCount() }}</p>

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
                    [value]="multiMarginLeftPx()"
                    (input)="onMultiMarginLeftInput($event)"
                    placeholder="—"
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
                    [value]="multiMarginRightPx()"
                    (input)="onMultiMarginRightInput($event)"
                    placeholder="—"
                  />
                  <span class="margin-controls__unit">px</span>
                </div>
              </label>
            </div>
            <button
              type="button"
              class="field__reset-btn pi-focus-ring"
              (click)="onMultiResetMargins()"
            >
              <lucide-icon [img]="ResetIcon" [size]="12"></lucide-icon>
              Сбросить отступы
            </button>
          </div>

          <!-- Delete (separated by divider, at the bottom) -->
          <div class="inspector__section inspector__section--danger">
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
          <!-- Title (not for spacer) -->
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
              <span class="field__label">Линия снизу</span>
              <app-pi-switch [checked]="showLine()" (checkedChange)="onShowLineChange($event)" />
            </label>
          }

          <!-- Content (text/header) -->
          @if (block()!.type === 'text' || block()!.type === 'header') {
            <label class="field">
              <span class="field__label">Содержимое</span>
              <textarea
                class="field__textarea pi-focus-ring"
                rows="4"
                [value]="content()"
                (input)="onContentInput($event)"
                placeholder="Текст блока…"
              ></textarea>
            </label>
          }

          <!-- Height (image/signature) -->
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

          <!-- Height slider (spacer) -->
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

          <!-- Table template info -->
          @if (block()!.type === 'table' && settingsTableId(); as tid) {
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
            @if (b.source === 'static') {
              <label class="field">
                <span class="field__label">Значение</span>
                <input
                  class="field__input pi-focus-ring"
                  type="text"
                  [value]="b.value ?? ''"
                  (input)="onBindingValueInput($event)"
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
                    [max]="maxMarginLeftPx()"
                    [value]="marginLeftPx()"
                    (input)="onMarginLeftInput($event)"
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
                    [max]="maxMarginRightPx()"
                    [value]="marginRightPx()"
                    (input)="onMarginRightInput($event)"
                  />
                  <span class="margin-controls__unit">px</span>
                </div>
              </label>
            </div>
            <button
              type="button"
              class="field__reset-btn pi-focus-ring"
              (click)="onResetMargins()"
              [disabled]="marginLeftPx() === 0 && marginRightPx() === 0"
            >
              <lucide-icon [img]="ResetIcon" [size]="12"></lucide-icon>
              Сбросить отступы
            </button>
          </div>

          <!-- Actions -->
          <div class="inspector__section inspector__section--actions">
            @if (block()!.type === 'text' || block()!.type === 'table') {
              <app-pi-button variant="outline" size="sm" (click)="editSelected.emit()">
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
        padding: 16px;
        text-align: center;
      }

      .inspector__multi-count {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-sunrise-warm);
        margin: 0 0 16px;
      }

      .inspector__section {
        padding: 12px 0;
        border-top: 1px solid var(--color-rule);
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
        color: var(--color-muted);
        margin-bottom: 10px;
      }

      .inspector__section--danger {
        margin-top: auto;
        padding-top: 16px;
      }

      .inspector__section--actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
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
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: 2px solid var(--color-paper);
      }

      .field__slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: 2px solid var(--color-paper);
      }

      .field__slider::-moz-range-track {
        height: 4px;
        background: var(--color-rule);
        border-radius: 2px;
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

      /* Margin controls */
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
        color: var(--color-muted);
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
        color: var(--color-muted);
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
        color: var(--color-muted);
        background: transparent;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .field__reset-btn:hover:not(:disabled) {
        color: var(--color-ink);
        border-color: var(--color-ink);
        background: var(--color-paper-2);
      }

      .field__reset-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Orientation buttons */
      .orientation-btns {
        display: flex;
        gap: 6px;
      }

      .orientation-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        background: var(--color-paper);
        color: var(--color-muted-foreground-strong);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .orientation-btn:hover {
        border-color: var(--color-ink);
        color: var(--color-ink);
      }

      .orientation-btn.is-active {
        background: var(--color-ink);
        border-color: var(--color-ink);
        color: var(--color-paper);
      }

      .orientation-btn--sm {
        flex: none;
        padding: 6px 12px;
        min-width: 56px;
      }

      /* Background preview */
      .bg-preview-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .bg-preview-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .bg-preview-thumb {
        width: 48px;
        height: 48px;
        border-radius: 4px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--color-paper-2);
        border: 1px solid var(--color-rule);
      }

      .bg-preview-item.is-default .bg-preview-thumb {
        border-color: var(--color-sunrise-warm);
        border-width: 2px;
      }

      .bg-preview-label {
        font-size: 10px;
        color: var(--color-muted);
      }

      .bg-preview-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .bg-action-btn {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        font-size: 10px;
        cursor: pointer;
        color: var(--color-muted);
        transition: all 100ms ease;
        padding: 0;
      }

      .bg-action-btn:hover {
        border-color: var(--color-ink);
        color: var(--color-ink);
      }

      .bg-action-btn.is-active {
        color: var(--color-sunrise-warm);
        border-color: var(--color-sunrise-warm);
      }

      .bg-action-btn--danger:hover {
        color: var(--color-destructive);
        border-color: var(--color-destructive);
      }

      .bg-upload-label {
        display: block;
        margin-top: 6px;
        cursor: pointer;
      }

      .bg-file-input {
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

      .bg-upload-button {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        background: var(--color-paper-2);
        color: var(--color-ink);
        border: 1px dashed var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .bg-upload-button:hover {
        border-color: var(--color-ink);
        border-style: solid;
        background: var(--color-paper);
      }
    `,
  ],
})
export class BuilderInspectorComponent {
  /** The currently-selected block (null = nothing selected). */
  readonly block = input<TemplateBlock | null>(null);
  /** Number of blocks in multi-select mode. */
  readonly selectedCount = input<number>(0);
  /** Selected blocks for multi-select margin computation. */
  readonly selectedBlocks = input<TemplateBlock[]>([]);
  /** Paper width in px (720 for portrait, 900 for landscape). */
  readonly paperWidth = input<number>(720);
  /** When true, show template properties instead of block properties. */
  readonly templateSelected = input<boolean>(false);
  /** Current template (for template properties panel). */
  readonly template = input<DocumentTemplate | null>(null);
  /** Emitted when the user changes a field value. */
  readonly update = output<Partial<TemplateBlock> & { _id: string }>();
  /** Emitted when the user clicks "Удалить блок". */
  readonly delete = output<string>();
  /** Emitted when the user clicks "Удалить выбранные" (multi-select). */
  readonly deleteSelected = output<void>();
  /** Emitted when the user clicks "Редактировать" (multi-select single). */
  readonly editSelected = output<void>();
  /** Emitted when the user clicks "Сбросить отступы". */
  readonly marginReset = output<string>();
  /** Emitted when multi-select margin is changed. Carries patches for all selected blocks. */
  readonly multiMarginUpdate = output<Array<{ _id: string; settings: Record<string, unknown> }>>();
  /** Emitted when template properties are changed. */
  readonly templateUpdate = output<Partial<DocumentTemplate>>();
  /** Emitted when user uploads a background image. */
  readonly uploadBackground = output<File>();
  /** Emitted when user removes a background image by index. */
  readonly removeBackground = output<number>();
  /** Emitted when user sets default background by index. */
  readonly setDefaultBackground = output<number>();

  // Icons
  protected readonly ResetIcon = RotateCcw;
  protected readonly BookOpenIcon = BookOpen;
  protected readonly ColumnsIcon = Columns;
  protected readonly HashIcon = Hash;
  protected readonly ListIcon = List;
  protected readonly FileTextIcon = FileText;
  protected readonly EyeIcon = Eye;
  protected readonly FileIcon = File;
  protected readonly UploadIcon = Upload;

  // Local form-state signals (mirror the selected block for fast edits).
  protected readonly title = signal<string>('');
  protected readonly content = signal<string>('');
  protected readonly height = signal<number>(100);
  protected readonly isActive = signal<boolean>(true);
  protected readonly showLine = signal<boolean>(false);
  protected readonly bindingValue = signal<string>('');
  protected readonly blockWidth = signal<number>(100);
  protected readonly blockMarginLeft = signal<number>(0);

  // Template opacity display
  protected readonly opacityPercent = computed<number>(() => {
    const t = this.template();
    return Math.round((t?.backgroundOpacity ?? 0.3) * 100);
  });

  // Derived — pixel values for single block
  protected readonly marginLeftPx = computed<number>(() => {
    return Math.round((this.blockMarginLeft() / 100) * this.paperWidth());
  });
  protected readonly marginRightPx = computed<number>(() => {
    const rightPercent = 100 - this.blockWidth() - this.blockMarginLeft();
    return Math.round((rightPercent / 100) * this.paperWidth());
  });
  protected readonly maxMarginLeftPx = computed<number>(() => {
    return Math.round((80 / 100) * this.paperWidth());
  });
  protected readonly maxMarginRightPx = computed<number>(() => {
    return Math.round(((100 - this.blockMarginLeft() - 20) / 100) * this.paperWidth());
  });

  // Derived — pixel values for multi-select (common values or null)
  protected readonly multiMarginLeftPx = computed<number | null>(() => {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return null;
    const values = blocks.map((b) => {
      const s = b.settings as Record<string, unknown> | undefined;
      return typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
    });
    const first = values[0];
    return values.every((v) => v === first) ? Math.round((first / 100) * this.paperWidth()) : null;
  });
  protected readonly multiMarginRightPx = computed<number | null>(() => {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return null;
    const values = blocks.map((b) => {
      const s = b.settings as Record<string, unknown> | undefined;
      const w = typeof s?.['width'] === 'number' ? s['width'] : 100;
      const ml = typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
      return 100 - w - ml;
    });
    const first = values[0];
    return values.every((v) => v === first) ? Math.round((first / 100) * this.paperWidth()) : null;
  });

  // Derived
  protected readonly settingsTableId = computed<string | null>(() => {
    const b = this.block();
    if (!b || b.type !== 'table') return null;
    const settings = b.settings as { tableTemplateId?: string } | undefined;
    return settings?.tableTemplateId ?? null;
  });

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
      // Hydrate margin signals from settings
      const settings = b?.settings as Record<string, unknown> | undefined;
      const w = typeof settings?.['width'] === 'number' ? settings['width'] : 100;
      const ml = typeof settings?.['marginLeft'] === 'number' ? settings['marginLeft'] : 0;
      this.blockWidth.set(Math.max(20, Math.min(100, w)));
      this.blockMarginLeft.set(Math.max(0, Math.min(80, ml)));
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

  // ── Template property handlers ──

  protected onOrientationChange(orientation: 'portrait' | 'landscape'): void {
    this.templateUpdate.emit({ orientation });
  }

  protected onPageSizeChange(pageSize: 'A3' | 'A4' | 'A5'): void {
    this.templateUpdate.emit({ pageSize });
  }

  protected onTemplateSettingChange(key: string, value: boolean): void {
    this.templateUpdate.emit({ [key]: value } as Partial<DocumentTemplate>);
  }

  protected onTemplateTextInput(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.templateUpdate.emit({ [key]: value } as Partial<DocumentTemplate>);
  }

  protected onOpacityInput(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.templateUpdate.emit({ backgroundOpacity: value } as Partial<DocumentTemplate>);
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadBackground.emit(file);
    input.value = '';
  }

  protected onRemoveBackground(index: number): void {
    this.removeBackground.emit(index);
  }

  protected onSetDefaultBackground(index: number): void {
    this.setDefaultBackground.emit(index);
  }

  // ── Margin handlers (single block) ──

  protected onMarginLeftInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const percent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    const rightPercent = 100 - this.blockWidth() - this.blockMarginLeft();
    const newWidth = Math.max(20, 100 - percent - rightPercent);
    this.blockMarginLeft.set(Math.round(percent));
    this.blockWidth.set(Math.round(newWidth));
    this.emitMarginSettings();
  }

  protected onMarginRightInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const rightPercent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    const newWidth = Math.max(20, 100 - this.blockMarginLeft() - rightPercent);
    this.blockWidth.set(Math.round(newWidth));
    this.emitMarginSettings();
  }

  protected onResetMargins(): void {
    this.blockWidth.set(100);
    this.blockMarginLeft.set(0);
    this.emitMarginSettings();
  }

  private emitMarginSettings(): void {
    const b = this.block();
    if (!b?._id) return;
    const settings = {
      ...(b.settings as Record<string, unknown> | undefined),
      width: this.blockWidth(),
      marginLeft: this.blockMarginLeft(),
    };
    this.update.emit({ _id: b._id, settings });
  }

  // ── Margin handlers (multi-select) ──

  protected onMultiMarginLeftInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const percent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    this.emitMultiMarginPatch({ marginLeft: Math.round(percent) });
  }

  protected onMultiMarginRightInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const rightPercent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    this.emitMultiMarginPatch({ rightMarginPercent: Math.round(rightPercent) });
  }

  protected onMultiResetMargins(): void {
    this.emitMultiMarginPatch({ marginLeft: 0, rightMarginPercent: 0 });
  }

  private emitMultiMarginPatch(patch: { marginLeft?: number; rightMarginPercent?: number }): void {
    const blocks = this.selectedBlocks();
    const updates = blocks
      .filter((b) => b._id)
      .map((b) => {
        const s = b.settings as Record<string, unknown> | undefined;
        const w = typeof s?.['width'] === 'number' ? s['width'] : 100;
        const ml = typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
        const rightPercent = 100 - w - ml;

        let newMl = ml;
        let newWidth = w;

        if (patch.marginLeft !== undefined) {
          newMl = patch.marginLeft;
          newWidth = Math.max(20, 100 - newMl - rightPercent);
        }
        if (patch.rightMarginPercent !== undefined) {
          newWidth = Math.max(20, 100 - newMl - patch.rightMarginPercent);
        }

        // Clamp values
        newMl = Math.max(0, Math.min(80, newMl));
        newWidth = Math.max(20, Math.min(100, newWidth));

        return {
          _id: b._id!,
          settings: { ...(s ?? {}), width: Math.round(newWidth), marginLeft: Math.round(newMl) },
        };
      });
    if (updates.length > 0) {
      this.multiMarginUpdate.emit(updates);
    }
  }
}
