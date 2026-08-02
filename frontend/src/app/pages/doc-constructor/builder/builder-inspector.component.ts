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
  Hash,
  Eye,
  File,
  Upload,
  X,
  Check,
  Star,
  FileText,
} from 'lucide-angular';
import {
  BLOCK_TYPE_LABELS,
  blockKey,
  type BlockType,
  type DataBinding,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import {
  computeLayerOrder,
  normalizeBlockLayout,
  type LayerOrderMode,
} from '../../../shared/template-block/template-block-layout';
import { clampOpacity } from './block-renderer-state.service';
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
  imports: [LucideAngularModule, ButtonComponent, SwitchComponent],
  template: `
    <aside class="inspector" aria-label="Свойства блока">
      <header class="inspector__header">
        <h2 class="inspector__title">Свойства</h2>
        @if (block(); as b) {
          <span class="inspector__type-pill">{{ typeLabel(b) }}</span>
        }
        @if (templateSelected()) {
          <button
            type="button"
            class="inspector__close"
            (click)="onClosePanel()"
            aria-label="Закрыть панель свойств"
          >
            <lucide-icon [img]="CloseIcon" [size]="18"></lucide-icon>
          </button>
        }
      </header>

      @if (!block() && selectedCount() === 0 && !templateSelected()) {
        <div class="inspector__empty">
          <p class="inspector__empty-title">Ничего не выбрано</p>
          <p class="inspector__empty-hint">Кликните по блоку или на пустое место холста</p>
        </div>

        <!-- TZ-211: Document Summary -->
        @if (allBlocks().length > 0) {
          <div class="summary-section">
            <div class="props-section__header">
              <span class="props-section__number">00</span>
              <h3 class="props-section__title">Сводка документа</h3>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-item__label">Всего блоков</span>
                <span class="summary-item__value">{{ blockCount() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-item__label">Активных</span>
                <span class="summary-item__value">{{ activeBlockCount() }}</span>
              </div>
              <div class="summary-item summary-item--full">
                <span class="summary-item__label">Типы</span>
                <span class="summary-item__value summary-item__value--small">{{
                  blockTypeSummary()
                }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Snap settings -->
        <div class="props-section" style="margin-top: 16px; padding: 12px;">
          <div class="props-section__header">
            <span class="props-section__number">SNAP</span>
            <h3 class="props-section__title">Привязка к сетке</h3>
          </div>
          <div class="snap-controls">
            <label class="toggle-row">
              <div class="toggle-row__left">
                <span class="toggle-row__label">Привязка</span>
              </div>
              <input
                type="checkbox"
                class="toggle-checkbox"
                [checked]="localSnapEnabled()"
                (change)="onSnapEnabledChange($any($event.target).checked)"
              />
            </label>
            <!-- TZ-DOC-269 (revoked 2026-08-02): декоративная сетка (dots)
                 убрана из UI; магнитная привязка (snap-to-grid) и направляющие
                 снапа работают и без визуальной сетки. Настройка «Шаг сетки»
                 ниже остаётся — это параметр математической привязки, не
                 визуальный слой. -->
            <div class="field">
              <span class="field__label">Шаг сетки (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="5"
                max="50"
                step="5"
                [value]="localGridSize()"
                (input)="onGridSizeInput($event)"
              />
            </div>
            <div class="field">
              <span class="field__label">Отступ от краёв (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="0"
                max="100"
                [value]="localBoundaryPadding()"
                (input)="onBoundaryPaddingInput($event)"
              />
            </div>
          </div>
        </div>
      } @else if (templateSelected() && template(); as t) {
        <!-- Template properties panel -->
        <div class="inspector__form">
          <!-- Section 01: Visual Style (orientation/format removed — set at creation via dialog) -->
          <section class="props-section">
            <div class="props-section__header">
              <span class="props-section__number">01</span>
              <h3 class="props-section__title">Визуальный стиль</h3>
            </div>

            <!-- Background opacity -->
            <div class="field">
              <div class="field__row-header">
                <span class="field__label">Прозрачность фона</span>
                <span class="field__value">{{ opacityPercent() }}%</span>
              </div>
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
            <div class="toggle-row">
              <div class="toggle-row__left">
                <lucide-icon [img]="HashIcon" [size]="18"></lucide-icon>
                <span class="toggle-row__label">Нумерация страниц</span>
              </div>
              <input
                type="checkbox"
                class="toggle-checkbox"
                [checked]="t.pageNumbering ?? false"
                (change)="onTemplateSettingChange('pageNumbering', $any($event.target).checked)"
              />
            </div>
          </section>

          <!-- Section 02: Background Image -->
          <section class="props-section props-section--last">
            <div class="props-section__header">
              <span class="props-section__number">02</span>
              <h3 class="props-section__title">Фоновое изображение</h3>
            </div>

            @if (t.backgroundImage && t.backgroundImage.length > 0) {
              <div class="bg-grid">
                @for (url of t.backgroundImage; track url; let i = $index) {
                  <div class="bg-grid__item" [class.is-default]="t.defaultBackgroundIndex === i">
                    <div class="bg-grid__thumb" [style.background-image]="'url(' + url + ')'"></div>
                    @if (t.defaultBackgroundIndex === i) {
                      <div class="bg-grid__check">
                        <lucide-icon [img]="CheckIcon" [size]="20"></lucide-icon>
                      </div>
                    }
                    <div class="bg-grid__actions">
                      <button
                        type="button"
                        class="bg-grid__action-btn"
                        [class.is-active]="t.defaultBackgroundIndex === i"
                        (click)="onSetDefaultBackground(i)"
                        [attr.aria-label]="
                          t.defaultBackgroundIndex === i
                            ? 'Убрать из дефолтных'
                            : 'Сделать по умолчанию'
                        "
                      >
                        <lucide-icon
                          [img]="t.defaultBackgroundIndex === i ? StarFilledIcon : StarIcon"
                          [size]="14"
                        ></lucide-icon>
                      </button>
                      <button
                        type="button"
                        class="bg-grid__action-btn bg-grid__action-btn--danger"
                        (click)="onRemoveBackground(i)"
                        aria-label="Удалить фон"
                      >
                        <lucide-icon [img]="CloseSmallIcon" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
            <label class="bg-upload">
              <input
                #bgFileInput
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="bg-file-input"
                (change)="onFileChange($event)"
              />
              <span class="bg-upload__inner">
                <lucide-icon [img]="UploadIcon" [size]="16"></lucide-icon>
                <span class="bg-upload__text">Загрузить фон</span>
              </span>
            </label>
          </section>
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

          <!-- TZ-DOC-272: explicit editor-only group actions. -->
          <div class="inspector__section">
            <span class="inspector__section-title">Группа</span>
            @if (grouped()) {
              <p class="inspector__group-badge">Группа из {{ selectedCount() }} блоков</p>
              <app-pi-button variant="outline" size="sm" (click)="ungroupSelected.emit()">
                Разгруппировать
              </app-pi-button>
            } @else {
              <app-pi-button
                variant="outline"
                size="sm"
                (click)="groupSelected.emit()"
                [disabled]="layerOrderTargets().length < 2"
              >
                Сгруппировать
              </app-pi-button>
            }
          </div>

          <!-- TZ-DOC-271: group layer order (multi-select) — operates on the
               selected positioned blocks as a unit. -->
          @if (layerOrderTargets().length > 0) {
            <div class="inspector__section">
              <span class="inspector__section-title">Порядок слоёв</span>
              <div class="layer-order-actions">
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('front')"
                  title="На передний план"
                >
                  На передний план
                </button>
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('raise')"
                  title="Выше"
                >
                  Выше
                </button>
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('lower')"
                  title="Ниже"
                >
                  Ниже
                </button>
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('back')"
                  title="На задний план"
                >
                  На задний план
                </button>
              </div>
            </div>
          }

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
          <!-- Title -->
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

          <!-- isActive -->
          <label class="field field--row">
            <span class="field__label">Активен</span>
            <app-pi-switch [checked]="isActive()" (checkedChange)="onIsActiveChange($event)" />
          </label>

          <!-- showLine -->
          <label class="field field--row">
            <span class="field__label">Линия снизу</span>
            <app-pi-switch [checked]="showLine()" (checkedChange)="onShowLineChange($event)" />
          </label>

          <!-- TZ-DOC-273: block background color + opacity -->
          <div class="field">
            <div class="field__row-header">
              <span class="field__label">Фон блока</span>
              <span class="field__value">{{ blockBgOpacityPercent() }}%</span>
            </div>
            <div class="block-bg-row">
              <input
                type="color"
                class="block-bg-swatch pi-focus-ring"
                [value]="blockBgColorHex()"
                (input)="onBlockBgColorInput($event)"
                aria-label="Цвет фона блока"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                class="field__slider"
                [value]="blockBgOpacityPercent()"
                (input)="onBlockBgOpacityInput($event)"
              />
              <button
                type="button"
                class="field__reset-btn"
                (click)="onBlockBgReset()"
                [disabled]="!hasBlockBg()"
              >
                Сбросить
              </button>
            </div>
          </div>

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

          <!-- Image upload + controls -->
          @if (block()!.type === 'image') {
            <div class="field">
              <span class="field__label">Изображение</span>
              @if (imageUrl()) {
                <div class="image-preview">
                  <img [src]="imageUrl()" alt="Превью" class="image-preview__img" />
                  <button
                    type="button"
                    class="image-preview__remove"
                    (click)="onRemoveImage()"
                    title="Удалить изображение"
                  >
                    <lucide-icon [img]="CloseIcon" [size]="14"></lucide-icon>
                  </button>
                </div>
              }
              <label class="bg-upload">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  class="bg-upload__input"
                  (change)="onImageUpload($event)"
                />
                <span class="bg-upload__inner">
                  <lucide-icon [img]="UploadIcon" [size]="14"></lucide-icon>
                  <span class="bg-upload__text">{{
                    imageUrl() ? 'Заменить' : 'Загрузить фото'
                  }}</span>
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
                [value]="imageWidth() ?? ''"
                (input)="onImageWidthInput($event)"
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
                [value]="imageHeight() ?? ''"
                (input)="onImageHeightInput($event)"
                placeholder="Авто"
              />
            </label>

            <!-- Overlay toggle -->
            <label class="field field--row">
              <span class="field__label">Поверх других блоков</span>
              <app-pi-switch
                [checked]="imageOverlay()"
                (checkedChange)="onImageOverlayToggle($event)"
              />
            </label>

            <!-- Overlay position (only when overlay is ON) -->
            @if (imageOverlay()) {
              <label class="field">
                <span class="field__label">Позиция X (px)</span>
                <input
                  class="field__input pi-focus-ring"
                  type="number"
                  min="0"
                  max="2000"
                  [value]="overlayLeft()"
                  (input)="onOverlayLeftInput($event)"
                />
              </label>
              <label class="field">
                <span class="field__label">Позиция Y (px)</span>
                <input
                  class="field__input pi-focus-ring"
                  type="number"
                  min="0"
                  max="2000"
                  [value]="overlayTop()"
                  (input)="onOverlayTopInput($event)"
                />
              </label>
            }
          }

          <!-- Height (signature only) -->
          @if (block()!.type === 'signature') {
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

          <!-- Height slider removed for spacer (TZ-DOC-319) -->

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

          <!-- TZ-259.4: canonical positioned blocks use layout (px fields
               below); legacy flow margin section is hidden for them. -->
          @if (block()!.layout) {
            <div class="inspector__section">
              <span class="inspector__section-title">Позиция и размер (px)</span>
              <div class="margin-controls margin-controls--grid">
                <label class="margin-controls__item">
                  <span class="margin-controls__label">X</span>
                  <div class="margin-controls__input-row">
                    <input
                      class="field__input field__input--small pi-focus-ring"
                      type="number"
                      min="0"
                      [value]="layoutXpx()"
                      (input)="onLayoutXInput($event)"
                    />
                    <span class="margin-controls__unit">px</span>
                  </div>
                </label>
                <label class="margin-controls__item">
                  <span class="margin-controls__label">Y</span>
                  <div class="margin-controls__input-row">
                    <input
                      class="field__input field__input--small pi-focus-ring"
                      type="number"
                      min="0"
                      [value]="layoutYpx()"
                      (input)="onLayoutYInput($event)"
                    />
                    <span class="margin-controls__unit">px</span>
                  </div>
                </label>
                <label class="margin-controls__item">
                  <span class="margin-controls__label">Ширина</span>
                  <div class="margin-controls__input-row">
                    <input
                      class="field__input field__input--small pi-focus-ring"
                      type="number"
                      min="20"
                      [value]="layoutWidthPx()"
                      (input)="onLayoutWidthInput($event)"
                    />
                    <span class="margin-controls__unit">px</span>
                  </div>
                </label>
                <label class="margin-controls__item">
                  <span class="margin-controls__label">Высота</span>
                  <div class="margin-controls__input-row">
                    <input
                      class="field__input field__input--small pi-focus-ring"
                      type="number"
                      min="20"
                      [value]="layoutHeightPx()"
                      (input)="onLayoutHeightInput($event)"
                    />
                    <span class="margin-controls__unit">px</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- TZ-DOC-271: layer order for canonical positioned blocks. -->
            <div class="inspector__section">
              <span class="inspector__section-title">Порядок слоёв</span>
              <div class="layer-order-actions">
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('front')"
                  title="На передний план"
                >
                  На передний план
                </button>
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('raise')"
                  title="Выше"
                >
                  Выше
                </button>
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('lower')"
                  title="Ниже"
                >
                  Ниже
                </button>
                <button
                  type="button"
                  class="layer-order-btn"
                  (click)="onLayerOrder('back')"
                  title="На задний план"
                >
                  На задний план
                </button>
              </div>
            </div>
          } @else {
            <!-- Margin controls (flow model — legacy) -->
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
          }

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
        background: var(--color-paper, #f8f9fa);
        border-left: 1px solid var(--color-rule, #d0c5af);
      }

      /* ── Header ── */
      .inspector__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 12px;
        border-bottom: 1px solid var(--color-rule, #d0c5af);
        position: sticky;
        top: 0;
        background: var(--color-paper, #f8f9fa);
        z-index: 10;
      }

      .inspector__title {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: -0.01em;
        color: var(--color-ink, #191c1d);
        margin: 0;
      }

      .inspector__type-pill {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--color-paper-2, #e1e3e4);
        color: var(--color-ink, #191c1d);
        padding: 2px 8px;
        border-radius: 2px;
        font-weight: 600;
      }

      .inspector__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted, #7f7663);
        transition: all 100ms ease;
      }

      .inspector__close:hover {
        background: var(--color-paper-2, #e1e3e4);
        color: var(--color-ink, #191c1d);
      }

      /* ── Empty state ── */
      .inspector__empty {
        padding: 48px 16px;
        text-align: center;
      }

      .inspector__empty-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-muted, #7f7663);
        margin: 0 0 4px;
      }

      .inspector__empty-hint {
        font-size: 12px;
        color: var(--color-muted, #7f7663);
        margin: 0;
      }

      /* ── Multi-select ── */
      .inspector__multi {
        padding: 16px;
        text-align: center;
      }

      .inspector__multi-count {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-sunrise-warm, #735c00);
        margin: 0 0 16px;
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

      .inspector__section--danger {
        margin-top: auto;
        padding-top: 16px;
      }

      .inspector__section--actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* ── Form container ── */
      .inspector__form {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* ── Properties sections ── */
      .props-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .props-section--last {
        padding-bottom: 24px;
      }

      .props-section__header {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .props-section__number {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        line-height: 14px;
        letter-spacing: 0.05em;
        color: var(--color-sunrise-warm, #735c00);
      }

      .props-section__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-ink, #191c1d);
        margin: 0;
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

      .field__row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .field__value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.05em;
        color: var(--color-ink, #191c1d);
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

      .field__textarea {
        resize: vertical;
        font-family: ui-monospace, monospace;
        font-size: 12px;
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

      .field__input--small {
        width: 64px;
        flex-shrink: 0;
        text-align: center;
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted, #7f7663);
        margin: 4px 0 0;
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

      .inspector__actions {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--color-rule, #d0c5af);
      }

      /* ── Margin controls ── */
      .margin-controls {
        display: flex;
        gap: 12px;
      }

      /* TZ-259.4: 2×2 grid for the four canonical layout fields (X/Y/Ш/В). */
      .margin-controls--grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
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

      /* TZ-DOC-273: block background color + opacity controls. */
      .block-bg-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
      }

      .block-bg-swatch {
        width: 36px;
        height: 32px;
        padding: 2px;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: transparent;
        cursor: pointer;
      }

      .block-bg-swatch::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      .block-bg-swatch::-webkit-color-swatch {
        border: none;
        border-radius: 1px;
      }

      /* TZ-DOC-271: compact layer-order actions (front/raise/lower/back). */
      .layer-order-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .layer-order-btn {
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .layer-order-btn:hover:not(:disabled) {
        color: var(--color-paper);
        background: var(--color-ink);
        border-color: var(--color-ink);
      }

      .layer-order-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* TZ-DOC-272: editor-only group badge. */
      .inspector__group-badge {
        margin: 0 0 8px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        color: var(--color-gold);
        background: var(--color-gold-soft);
        border: 1px solid var(--color-gold);
        border-radius: 2px;
        text-align: center;
      }

      /* ── Orientation buttons ── */
      .orientation-btns {
        display: flex;
        gap: 8px;
      }

      .orientation-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-muted, #7f7663);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .orientation-btn:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .orientation-btn.is-active {
        background: var(--color-ink, #191c1d);
        border-color: var(--color-ink, #191c1d);
        color: var(--color-paper, #f8f9fa);
      }

      .orientation-btn__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      /* ── Page size buttons ── */
      .pagesize-btns {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .pagesize-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-muted, #7f7663);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .pagesize-btn:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .pagesize-btn.is-active {
        background: var(--color-sunrise-warm, #735c00);
        border-color: var(--color-sunrise-warm, #735c00);
        color: var(--color-paper, #f8f9fa);
      }

      /* ── Toggle rows (checkboxes) ── */
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(208, 197, 175, 0.3);
      }

      .toggle-row:last-child {
        border-bottom: none;
      }

      .toggle-row__left {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--color-muted, #7f7663);
      }

      .toggle-row__label {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--color-ink, #191c1d);
      }

      .toggle-checkbox {
        width: 18px;
        height: 18px;
        accent-color: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
      }

      /* ── Background grid ── */
      .bg-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .bg-grid__item {
        position: relative;
        aspect-ratio: 1;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 120ms ease;
      }

      .bg-grid__item:hover {
        border-color: var(--color-ink, #191c1d);
      }

      .bg-grid__item.is-default {
        border-color: var(--color-sunrise-warm, #735c00);
        border-width: 2px;
      }

      .bg-grid__thumb {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--color-paper-2, #e1e3e4);
      }

      .bg-grid__check {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(115, 92, 0, 0.1);
        color: var(--color-sunrise-warm, #735c00);
      }

      .bg-grid__actions {
        position: absolute;
        bottom: 4px;
        right: 4px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 120ms ease;
      }

      .bg-grid__item:hover .bg-grid__actions {
        opacity: 1;
      }

      .bg-grid__item.is-default .bg-grid__actions {
        opacity: 1;
      }

      .bg-grid__action-btn {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.8);
        border: none;
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted, #7f7663);
        transition: all 100ms ease;
        padding: 0;
      }

      .bg-grid__action-btn:hover {
        background: rgba(255, 255, 255, 1);
        color: var(--color-ink, #191c1d);
      }

      .bg-grid__action-btn.is-active {
        color: var(--color-sunrise-warm, #735c00);
      }

      .bg-grid__action-btn--danger:hover {
        color: var(--color-destructive, #ba1a1a);
      }

      /* ── Upload button ── */
      .bg-upload {
        display: block;
        margin-top: 8px;
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

      .bg-upload__inner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
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

      .bg-upload__text {
        font-family: 'JetBrains Mono', monospace;

        /* ═══ Document Summary — TZ-211 ═══ */
        .summary-section {
          margin-top: 16px;
          padding: 12px;
          background: var(--color-paper-2);
          border: 1px solid var(--color-rule);
          border-radius: 2px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .summary-item--full {
          grid-column: 1 / -1;
        }

        .summary-item__label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-muted);
        }

        .summary-item__value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-ink);
        }

        .summary-item__value--small {
          font-size: 11px;
          font-weight: 400;
          color: var(--color-muted-strong);
        }
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
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
  /** Paper height in px (portrait ≈ width × 1.414, landscape ≈ width / 1.414). */
  readonly paperHeight = input<number>(1018);
  /** When true, show template properties instead of block properties. */
  readonly templateSelected = input<boolean>(false);
  /** Current template (for template properties panel). */
  readonly template = input<DocumentTemplate | null>(null);
  /** TZ-211: All blocks for summary/totals computation. */
  readonly allBlocks = input<TemplateBlock[]>([]);
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
  /** Snap-to-grid enabled (input from parent). */
  readonly snapEnabled = input<boolean>(true);
  /** Grid size for snapping (px) (input from parent). */
  readonly gridSize = input<number>(20);
  /** Padding from paper edges (px) (input from parent). */
  readonly boundaryPadding = input<number>(8);
  /**
   * TZ-DOC-269 (revoked 2026-08-02): видимая сетка (dots) удалена из UI.
   * Магнитная привязка и направляющие продолжают работать через
   * `gridSize` (математический шаг). Поле намеренно оставлено в типе
   * с дефолтом `false` ради обратной совместимости существующих binding'ов
   * в `builder.page.ts`; новые потребители должны полагаться только на
   * `snapEnabled` + `gridSize`.
   *
   * @deprecated со 2 августа 2026 — не использовать в новом коде.
   */
  readonly gridVisible = input<boolean>(false);
  /** Emitted when user changes snap settings via the inspector. */
  readonly snapSettingsChange = output<{
    snapEnabled: boolean;
    gridSize: number;
    boundaryPadding?: number;
  }>();
  /** Emitted when user clicks close on template properties panel. */
  readonly closePanel = output<void>();
  /**
   * TZ-DOC-271: emitted when a layer-order action (front/back/raise/lower)
   * is applied. Carries only the blocks whose zIndex actually changed, in
   * the same shape as the canvas `layoutChanges` output so the page can
   * route both through the single batch `updateLayouts` + rollback path.
   */
  readonly layoutOrderChange =
    output<Array<{ block: TemplateBlock; layout: NonNullable<TemplateBlock['layout']> }>>();
  /** TZ-DOC-272: true while the selection is an explicit editor-only group. */
  readonly grouped = input<boolean>(false);
  /** TZ-DOC-272: emitted when the user clicks «Сгруппировать». */
  readonly groupSelected = output<void>();
  /** TZ-DOC-272: emitted when the user clicks «Разгруппировать». */
  readonly ungroupSelected = output<void>();

  // Icons
  protected readonly ResetIcon = RotateCcw;
  protected readonly HashIcon = Hash;
  protected readonly FileTextIcon = FileText;
  protected readonly EyeIcon = Eye;
  protected readonly UploadIcon = Upload;
  protected readonly CloseIcon = X;
  protected readonly CheckIcon = Check;
  protected readonly StarIcon = Star;
  protected readonly StarFilledIcon = Star;
  protected readonly CloseSmallIcon = X;

  // Local form-state signals (mirror the selected block for fast edits).
  protected readonly title = signal<string>('');
  protected readonly content = signal<string>('');
  protected readonly height = signal<number>(100);
  protected readonly isActive = signal<boolean>(true);
  protected readonly showLine = signal<boolean>(false);
  protected readonly bindingValue = signal<string>('');
  protected readonly blockWidth = signal<number>(100);
  protected readonly blockMarginLeft = signal<number>(0);

  // Image block signals
  protected readonly imageUrl = signal<string>('');
  protected readonly imageWidth = signal<number | null>(null);
  protected readonly imageHeight = signal<number | null>(null);
  protected readonly imageOverlay = signal<boolean>(false);
  protected readonly overlayLeft = signal<number>(0);
  protected readonly overlayTop = signal<number>(0);

  // TZ-259.4: canonical layout geometry (px) for positioned blocks.
  protected readonly layoutXpx = signal<number>(0);
  protected readonly layoutYpx = signal<number>(0);
  protected readonly layoutWidthPx = signal<number>(0);
  protected readonly layoutHeightPx = signal<number>(0);

  // Snap settings internal state
  protected readonly localSnapEnabled = signal<boolean>(true);
  protected readonly localGridSize = signal<number>(20);
  protected readonly localBoundaryPadding = signal<number>(8);

  // Template opacity display
  protected readonly opacityPercent = computed<number>(() => {
    const t = this.template();
    return Math.round((t?.backgroundOpacity ?? 0.3) * 100);
  });

  // TZ-211: Document summary computed values
  protected readonly blockCount = computed<number>(() => this.allBlocks().length);
  protected readonly activeBlockCount = computed<number>(
    () => this.allBlocks().filter((b) => b.isActive).length,
  );
  protected readonly blockTypeSummary = computed<string>(() => {
    const blocks = this.allBlocks();
    if (blocks.length === 0) return 'Нет блоков';
    const types = new Map<string, number>();
    for (const b of blocks) {
      types.set(b.type, (types.get(b.type) ?? 0) + 1);
    }
    return Array.from(types.entries())
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
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
      // Hydrate image signals
      this.imageUrl.set((settings?.['imageUrl'] as string) ?? '');
      this.imageWidth.set((settings?.['imageWidth'] as number) ?? null);
      this.imageHeight.set((settings?.['imageHeight'] as number) ?? null);
      this.imageOverlay.set((settings?.['overlay'] as boolean) ?? false);
      this.overlayLeft.set((settings?.['overlayLeft'] as number) ?? 0);
      this.overlayTop.set((settings?.['overlayTop'] as number) ?? 0);
      // Hydrate canonical layout geometry (TZ-259.4).
      const layout = b?.layout;
      this.layoutXpx.set(layout ? Math.round(layout.x * this.paperWidth()) : 0);
      this.layoutYpx.set(layout ? Math.round(layout.y * this.paperHeight()) : 0);
      this.layoutWidthPx.set(layout ? Math.round(layout.width * this.paperWidth()) : 0);
      this.layoutHeightPx.set(
        layout ? Math.round((layout.height ?? 0.06) * this.paperHeight()) : 0,
      );
    });

    // Hydrate snap settings from inputs when they change.
    effect(() => {
      this.localSnapEnabled.set(this.snapEnabled());
      this.localGridSize.set(this.gridSize());
      this.localBoundaryPadding.set(this.boundaryPadding());
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

  // ── TZ-DOC-273: block background color + opacity ──

  /**
   * Current safe hex from block settings, normalized to `#rrggbb` for the
   * native `<input type="color">` value (defaults to white when unset).
   */
  protected readonly blockBgColorHex = computed<string>(() => {
    const s = this.block()?.settings as Record<string, unknown> | undefined;
    const color = s?.['blockBackgroundColor'];
    if (typeof color === 'string') {
      const stripped = color.startsWith('#') ? color.slice(1) : color;
      if (/^[0-9a-fA-F]{6}$/.test(stripped)) return `#${stripped.toLowerCase()}`;
    }
    return '#ffffff';
  });

  /** Block opacity as a 0–100 percent for the slider. */
  protected readonly blockBgOpacityPercent = computed<number>(() => {
    const s = this.block()?.settings as Record<string, unknown> | undefined;
    const o = s?.['blockOpacity'];
    return typeof o === 'number' && Number.isFinite(o) ? Math.round(clampOpacity(o) * 100) : 0;
  });

  /** Whether a non-empty background color is set (enables the reset button). */
  protected readonly hasBlockBg = computed<boolean>(() => {
    const s = this.block()?.settings as Record<string, unknown> | undefined;
    const color = s?.['blockBackgroundColor'];
    return typeof color === 'string' && color.length > 0;
  });

  protected onBlockBgColorInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value; // native picker → #rrggbb
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) return;
    this.patchSettings({ blockBackgroundColor: v });
  }

  protected onBlockBgOpacityInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(v)) return;
    this.patchSettings({ blockOpacity: clampOpacity(v / 100) });
  }

  protected onBlockBgReset(): void {
    this.patchSettings({ blockBackgroundColor: '', blockOpacity: 0 });
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

  // ── Snap settings handlers ──

  protected onSnapEnabledChange(enabled: boolean): void {
    this.localSnapEnabled.set(enabled);
    this.emitSnapSettings();
  }

  protected onGridSizeInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 20;
    const clamped = Math.max(5, Math.min(50, v));
    this.localGridSize.set(clamped);
    this.emitSnapSettings();
  }

  protected onBoundaryPaddingInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 8;
    const clamped = Math.max(0, Math.min(100, v));
    this.localBoundaryPadding.set(clamped);
    this.emitSnapSettings();
  }

  private emitSnapSettings(): void {
    this.snapSettingsChange.emit({
      snapEnabled: this.localSnapEnabled(),
      gridSize: this.localGridSize(),
      boundaryPadding: this.localBoundaryPadding(),
    });
  }

  // ── Template property handlers ──

  protected onClosePanel(): void {
    this.closePanel.emit();
  }

  protected onOrientationChange(orientation: 'portrait' | 'landscape'): void {
    this.templateUpdate.emit({ orientation });
  }

  protected onPageSizeChange(pageSize: 'A3' | 'A4' | 'A5'): void {
    this.templateUpdate.emit({ pageSize });
  }

  protected onTemplateSettingChange(key: string, value: boolean): void {
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

  // ── Image block handlers ──

  protected onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Create a local object URL for immediate display
    const url = URL.createObjectURL(file);
    this.imageUrl.set(url);
    this.patchSettings({ imageUrl: url });
    input.value = '';
  }

  protected onRemoveImage(): void {
    this.imageUrl.set('');
    this.imageWidth.set(null);
    this.imageHeight.set(null);
    this.patchSettings({ imageUrl: '', imageWidth: null, imageHeight: null });
  }

  protected onImageWidthInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    const num = v ? Number(v) : null;
    this.imageWidth.set(num);
    this.patchSettings({ imageWidth: num });
  }

  protected onImageHeightInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    const num = v ? Number(v) : null;
    this.imageHeight.set(num);
    this.patchSettings({ imageHeight: num });
  }

  protected onImageOverlayToggle(checked: boolean): void {
    this.imageOverlay.set(checked);
    this.patchSettings({ overlay: checked });
  }

  protected onOverlayLeftInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 0;
    this.overlayLeft.set(v);
    this.patchSettings({ overlayLeft: v });
  }

  protected onOverlayTopInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 0;
    this.overlayTop.set(v);
    this.patchSettings({ overlayTop: v });
  }

  /** Helper to patch block.settings with partial updates. */
  private patchSettings(partial: Record<string, unknown>): void {
    const b = this.block();
    if (!b?._id) return;
    const current = (b.settings ?? {}) as Record<string, unknown>;
    this.update.emit({ _id: b._id, settings: { ...current, ...partial } });
  }

  // ── TZ-DOC-271: layer order (front/back/raise/lower) ──

  /**
   * The positioned blocks a layer-order action applies to. In single-select
   * that is the selected positioned block; in multi-select it is the subset
   * of the selection that has canonical geometry. Returns [] when nothing
   * can be re-ordered (flow-only selection).
   */
  protected readonly layerOrderTargets = computed<TemplateBlock[]>(() => {
    const single = this.block();
    if (single?.layout) return [single];
    return this.selectedBlocks().filter((b) => !!b.layout);
  });

  /**
   * Apply a layer-order operation to the current targets. Only the blocks
   * whose zIndex actually changed are emitted (diff against the compact
   * reindex), so a no-op action produces zero network traffic.
   */
  protected onLayerOrder(mode: LayerOrderMode): void {
    const targets = this.layerOrderTargets();
    if (targets.length === 0) return;
    const targetIds = new Set(targets.map((b) => blockKey(b)));
    const entries = this.allBlocks()
      .filter((b) => !!b.layout)
      .map((b) => ({ blockId: blockKey(b), zIndex: b.layout!.zIndex ?? 1 }));
    const next = computeLayerOrder(entries, targetIds, mode);
    // Emit EVERY positioned block whose zIndex changed under the compact
    // reindex (targets AND non-targets). Diffing only the targets would leave
    // neighbours with stale zIndex locally and on the server — breaking
    // refresh persistence and the visual overlap order.
    const changes = this.allBlocks()
      .filter((b) => !!b.layout)
      .map((b) => {
        const zIndex = next.get(blockKey(b)) ?? b.layout!.zIndex;
        return {
          block: b,
          layout: normalizeBlockLayout({ ...b.layout, zIndex }),
        };
      })
      .filter((c) => c.layout.zIndex !== (c.block.layout?.zIndex ?? 1));
    if (changes.length > 0) this.layoutOrderChange.emit(changes);
  }

  protected onRemoveBackground(index: number): void {
    this.removeBackground.emit(index);
  }

  protected onSetDefaultBackground(index: number): void {
    this.setDefaultBackground.emit(index);
  }

  // ── TZ-259.4: canonical layout geometry handlers (positioned blocks) ──

  protected onLayoutXInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutXpx.set(Math.max(0, px));
    this.emitLayoutPatch();
  }

  protected onLayoutYInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutYpx.set(Math.max(0, px));
    this.emitLayoutPatch();
  }

  protected onLayoutWidthInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutWidthPx.set(Math.max(20, px));
    this.emitLayoutPatch();
  }

  protected onLayoutHeightInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutHeightPx.set(Math.max(20, px));
    this.emitLayoutPatch();
  }

  /** Emit a normalized `layout` patch for the selected positioned block. */
  private emitLayoutPatch(): void {
    const b = this.block();
    if (!b?._id || !b.layout) return;
    const pw = Math.max(1, this.paperWidth());
    const ph = Math.max(1, this.paperHeight());
    const layout = normalizeBlockLayout({
      ...b.layout,
      x: Math.min(1, this.layoutXpx() / pw),
      y: Math.min(1, this.layoutYpx() / ph),
      width: Math.min(1, this.layoutWidthPx() / pw),
      height: Math.min(1, this.layoutHeightPx() / ph),
    });
    this.update.emit({ _id: b._id, layout });
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
