import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  LucideAngularModule,
  RotateCcw,
  Hash,
  Upload,
  X,
  Check,
  Star,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Lock,
  Unlock,
  RectangleVertical,
  RectangleHorizontal,
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
import {
  DocumentTemplateCategoriesService,
  type DocumentTemplateCategory,
} from '../../../shared/services/pi-document-template-categories.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { PiToastService } from '../../../shared/ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';

type PageSize = 'A3' | 'A4' | 'A5';
type Orientation = 'portrait' | 'landscape';

/**
 * BuilderInspector (right pane) — TZ-DOC-332 IA + visual canon.
 *
 * Modes A–D share one section chrome (parity with top tool-pane).
 * Signal-bound fields; parent owns PATCH debounce.
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
        @if (templateSelected()) {
          <button
            type="button"
            class="inspector__close pi-focus-ring"
            (click)="onClosePanel()"
            aria-label="Закрыть панель свойств"
          >
            <lucide-icon [img]="CloseIcon" [size]="16"></lucide-icon>
          </button>
        }
      </header>

      @if (!block() && selectedCount() === 0 && !templateSelected()) {
        <!-- Mode A: document context -->
        <section class="insp-section" data-test="insp-section-context">
          <h3 class="insp-section__title" data-test="insp-section-header">Контекст</h3>
          <p class="insp-context__label">Документ</p>
          @if (allBlocks().length > 0) {
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
          } @else {
            <p class="insp-hint">Нет блоков на холсте</p>
          }
          <p class="insp-hint insp-hint--muted">Кликните по блоку или на пустое место холста</p>
        </section>

        <section class="insp-section" data-test="insp-section-snap">
          <h3 class="insp-section__title" data-test="insp-section-header">Привязка к сетке</h3>
          <div class="snap-controls">
            <label class="field field--row">
              <span class="field__label">Привязка</span>
              <app-pi-switch
                [checked]="localSnapEnabled()"
                (checkedChange)="onSnapEnabledChange($event)"
              />
            </label>
            <label class="field">
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
            </label>
            <label class="field">
              <span class="field__label">Отступ от краёв (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="0"
                max="100"
                [value]="localBoundaryPadding()"
                (input)="onBoundaryPaddingInput($event)"
              />
            </label>
          </div>
        </section>
      } @else if (templateSelected() && template(); as t) {
        <!-- Mode B: template create-parity (TZ-DOC-343) -->
        <section class="insp-section" data-test="insp-section-basics">
          <h3 class="insp-section__title" data-test="insp-section-header">Основные</h3>
          <label class="field">
            <span class="field__label">Название</span>
            <input
              type="text"
              class="pi-input w-full"
              data-test="insp-template-name"
              aria-label="Название шаблона"
              [value]="nameDraft()"
              (input)="onNameDraftInput($event)"
              (blur)="commitTemplateName()"
              (keydown.enter)="$event.preventDefault(); commitTemplateName()"
            />
          </label>
          <label class="field">
            <span class="field__label">Категория шаблона</span>
            @if (categoriesLoading()) {
              <p class="insp-hint insp-hint--muted m-0">Загрузка категорий…</p>
            } @else if (categoriesError()) {
              <p class="insp-hint m-0" role="alert">{{ categoriesError() }}</p>
            } @else if (categories().length === 0) {
              <p class="insp-hint insp-hint--muted m-0">Нет активных категорий</p>
            } @else {
              <select
                class="pi-input w-full"
                data-test="insp-template-category"
                aria-label="Категория шаблона"
                [value]="templateCategoryId()"
                (change)="onCategoryChange($event)"
              >
                @for (cat of categories(); track cat._id) {
                  <option [value]="cat._id">{{ cat.name }}</option>
                }
              </select>
            }
          </label>
        </section>

        <section class="insp-section" data-test="insp-section-page">
          <h3 class="insp-section__title" data-test="insp-section-header">Страница</h3>
          <div class="field">
            <span class="field__label" id="insp-page-size-label">Формат</span>
            <div class="field__chips" role="group" aria-labelledby="insp-page-size-label">
              @for (size of pageSizes; track size) {
                <button
                  type="button"
                  class="chip pi-focus-ring"
                  [class.chip--active]="t.pageSize === size"
                  [attr.aria-pressed]="t.pageSize === size"
                  [attr.data-test]="'insp-page-size-' + size"
                  (click)="onPageSizeChange(size)"
                >
                  {{ size }}
                </button>
              }
            </div>
          </div>
          <div class="field">
            <span class="field__label" id="insp-orientation-label">Ориентация</span>
            <div class="field__chips" role="group" aria-labelledby="insp-orientation-label">
              @for (orient of orientations; track orient.value) {
                <button
                  type="button"
                  class="chip pi-focus-ring"
                  [class.chip--active]="t.orientation === orient.value"
                  [attr.aria-pressed]="t.orientation === orient.value"
                  [attr.data-test]="'insp-orientation-' + orient.value"
                  (click)="onOrientationChange(orient.value)"
                >
                  <lucide-icon [img]="orient.icon" [size]="14"></lucide-icon>
                  {{ orient.label }}
                </button>
              }
            </div>
          </div>
          <label class="field field--row">
            <span class="field__label">
              <lucide-icon [img]="HashIcon" [size]="14"></lucide-icon>
              Нумерация страниц
            </span>
            <app-pi-switch
              [checked]="t.pageNumbering ?? false"
              (checkedChange)="onTemplateSettingChange('pageNumbering', $event)"
            />
          </label>
        </section>

        <section class="insp-section" data-test="insp-section-background">
          <h3 class="insp-section__title" data-test="insp-section-header">Фон</h3>
          <label class="field">
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
              aria-label="Прозрачность фона"
            />
          </label>
          @if (t.backgroundImage && t.backgroundImage.length > 0) {
            <div class="bg-grid">
              @for (url of t.backgroundImage; track url; let i = $index) {
                <div class="bg-grid__item" [class.is-default]="effectiveDefaultBgIndex(t) === i">
                  <div class="bg-grid__thumb" [style.background-image]="'url(' + url + ')'"></div>
                  @if (effectiveDefaultBgIndex(t) === i) {
                    <div class="bg-grid__check">
                      <lucide-icon [img]="CheckIcon" [size]="20"></lucide-icon>
                    </div>
                  }
                  <div class="bg-grid__actions">
                    <button
                      type="button"
                      class="bg-grid__action-btn"
                      [class.is-active]="effectiveDefaultBgIndex(t) === i"
                      (click)="onSetDefaultBackground(i)"
                      [attr.aria-label]="
                        effectiveDefaultBgIndex(t) === i
                          ? 'Фон по умолчанию'
                          : 'Сделать по умолчанию'
                      "
                      [attr.aria-pressed]="effectiveDefaultBgIndex(t) === i"
                    >
                      <lucide-icon
                        [img]="StarIcon"
                        [size]="14"
                        [class.bg-grid__star--on]="effectiveDefaultBgIndex(t) === i"
                        [attr.data-star-fill]="effectiveDefaultBgIndex(t) === i ? 'gold' : null"
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
              <lucide-icon [img]="UploadIcon" [size]="14"></lucide-icon>
              <span class="bg-upload__text">Загрузить фон</span>
            </span>
          </label>
        </section>
      } @else if (!block() && selectedCount() > 0) {
        <!-- Mode C: multi-select -->
        <section class="insp-section" data-test="insp-section-context">
          <h3 class="insp-section__title" data-test="insp-section-header">Контекст</h3>
          <p class="insp-context__label">Выбрано: {{ selectedCount() }}</p>
          @if (grouped()) {
            <p class="inspector__group-badge" data-test="inspector-group-badge">
              Группа из {{ selectedCount() }} блоков
            </p>
          }
        </section>

        <section class="insp-section" data-test="insp-section-geometry">
          <h3 class="insp-section__title" data-test="insp-section-header">Геометрия</h3>
          <button
            type="button"
            class="lock-toggle pi-focus-ring"
            [class.lock-toggle--on]="selectionLocked()"
            (click)="onToggleLock()"
            data-test="insp-lock-toggle"
            [attr.aria-pressed]="selectionLocked()"
          >
            <lucide-icon
              [img]="selectionLocked() ? LockIcon : UnlockIcon"
              [size]="13"
            ></lucide-icon>
            {{ selectionLocked() ? 'Разблокировать' : 'Заблокировать' }}
          </button>
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
                  [disabled]="selectionLocked()"
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
                  [disabled]="selectionLocked()"
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
            [disabled]="selectionLocked()"
          >
            <lucide-icon [img]="ResetIcon" [size]="12"></lucide-icon>
            Сбросить отступы
          </button>
        </section>

        <section class="insp-section" data-test="insp-section-group">
          <h3 class="insp-section__title" data-test="insp-section-header">Группа</h3>
          @if (grouped()) {
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
        </section>

        @if (layerOrderTargets().length > 0) {
          <section class="insp-section" data-test="insp-section-layer">
            <h3 class="insp-section__title" data-test="insp-section-header">Слой</h3>
            <div class="layer-order-actions">
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('front')"
                title="На передний план"
                aria-label="На передний план"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerFrontIcon" [size]="14"></lucide-icon>
              </button>
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('raise')"
                title="Выше"
                aria-label="Выше"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerRaiseIcon" [size]="14"></lucide-icon>
              </button>
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('lower')"
                title="Ниже"
                aria-label="Ниже"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerLowerIcon" [size]="14"></lucide-icon>
              </button>
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('back')"
                title="На задний план"
                aria-label="На задний план"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerBackIcon" [size]="14"></lucide-icon>
              </button>
            </div>
          </section>
        }

        <section class="insp-section insp-section--danger" data-test="insp-section-danger">
          <h3 class="insp-section__title" data-test="insp-section-header">Опасная зона</h3>
          <app-pi-button
            variant="destructive"
            size="sm"
            (click)="deleteSelected.emit()"
            [disabled]="selectionLocked()"
            ariaLabel="Удалить выбранные блоки"
          >
            {{ selectionLocked() ? 'Сначала разблокируйте' : 'Удалить (' + selectedCount() + ')' }}
          </app-pi-button>
        </section>
      } @else if (block(); as b) {
        <!-- Mode D: single block -->
        <section class="insp-section" data-test="insp-section-context">
          <h3 class="insp-section__title" data-test="insp-section-header">Контекст</h3>
          <div class="insp-context__row">
            <span class="inspector__type-pill">{{ typeLabel(b) }}</span>
            @if (b.groupId) {
              <span class="insp-context__group" data-test="inspector-ingroup-readonly"
                >В группе</span
              >
            }
          </div>
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
          <label class="field field--row">
            <span class="field__label">Активен</span>
            <app-pi-switch [checked]="isActive()" (checkedChange)="onIsActiveChange($event)" />
          </label>
        </section>

        <section class="insp-section" data-test="insp-section-geometry">
          <h3 class="insp-section__title" data-test="insp-section-header">Геометрия</h3>
          <button
            type="button"
            class="lock-toggle pi-focus-ring"
            [class.lock-toggle--on]="selectionLocked()"
            (click)="onToggleLock()"
            data-test="insp-lock-toggle"
            [attr.aria-pressed]="selectionLocked()"
          >
            <lucide-icon
              [img]="selectionLocked() ? LockIcon : UnlockIcon"
              [size]="13"
            ></lucide-icon>
            {{ selectionLocked() ? 'Разблокировать' : 'Заблокировать' }}
          </button>
          @if (b.layout) {
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
                    [disabled]="selectionLocked()"
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
                    [disabled]="selectionLocked()"
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
                    [disabled]="selectionLocked()"
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
                    [disabled]="selectionLocked()"
                  />
                  <span class="margin-controls__unit">px</span>
                </div>
              </label>
            </div>
          } @else if (b.type === 'image' && imageOverlay()) {
            <label class="field">
              <span class="field__label">Позиция X (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="0"
                max="2000"
                [value]="overlayLeft()"
                (input)="onOverlayLeftInput($event)"
                [disabled]="selectionLocked()"
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
                [disabled]="selectionLocked()"
              />
            </label>
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
                [disabled]="selectionLocked()"
              />
            </label>
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
                [disabled]="selectionLocked()"
              />
            </label>
          } @else if (b.type === 'image') {
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
                [disabled]="selectionLocked()"
              />
            </label>
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
                [disabled]="selectionLocked()"
              />
            </label>
          } @else if (b.type === 'signature') {
            <label class="field">
              <span class="field__label">Высота (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="20"
                max="1200"
                [value]="height()"
                (input)="onHeightInput($event)"
                [disabled]="selectionLocked()"
              />
            </label>
          } @else {
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
                    [disabled]="selectionLocked()"
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
                    [disabled]="selectionLocked()"
                  />
                  <span class="margin-controls__unit">px</span>
                </div>
              </label>
            </div>
            <button
              type="button"
              class="field__reset-btn pi-focus-ring"
              (click)="onResetMargins()"
              [disabled]="selectionLocked() || (marginLeftPx() === 0 && marginRightPx() === 0)"
            >
              <lucide-icon [img]="ResetIcon" [size]="12"></lucide-icon>
              Сбросить отступы
            </button>
          }
        </section>

        @if (b.type === 'table' && isLineItemsTable()) {
          <section class="insp-section" data-test="insp-section-pagination">
            <h3 class="insp-section__title" data-test="insp-section-header">Перенос на страницы</h3>
            <label class="field">
              <span class="field__label">Строк на 1-й странице</span>
              <input
                type="number"
                class="field__input w-full pi-focus-ring"
                min="0"
                max="200"
                [value]="rowsFirstPage()"
                (change)="onRowsFirstPageChange($event)"
                [disabled]="selectionLocked()"
              />
            </label>
            <label class="field">
              <span class="field__label">Строк на следующих</span>
              <input
                type="number"
                class="field__input w-full pi-focus-ring"
                min="0"
                max="200"
                [value]="rowsNextPage()"
                (change)="onRowsNextPageChange($event)"
                [disabled]="selectionLocked()"
              />
            </label>
            <p class="insp-hint">
              0 — автоматически по высоте рамки; явное число — override для всех новых КП с этим
              бланком.
            </p>
          </section>
        }

        <section class="insp-section" data-test="insp-section-content">
          <h3 class="insp-section__title" data-test="insp-section-header">Содержимое</h3>
          @if (b.type === 'text' || b.type === 'header') {
            <label class="field">
              <span class="field__label">Текст</span>
              <textarea
                class="field__textarea pi-focus-ring"
                rows="4"
                [value]="content()"
                (input)="onContentInput($event)"
                placeholder="Текст блока…"
              ></textarea>
            </label>
          }
          @if (b.type === 'image') {
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
                  class="bg-file-input"
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
          }
          @if (b.type === 'table' && settingsTableId(); as tid) {
            <div class="field">
              <span class="field__label">Шаблон таблицы</span>
              <div class="badge">
                <span class="badge__label">ID</span>
                <span class="badge__value">{{ tid }}</span>
              </div>
              <p class="field__hint">Для смены шаблона — удалите блок и добавьте заново.</p>
            </div>
          }
          @if (isLineItemsTable()) {
            <div class="field">
              <span class="field__label">Перенос на страницы</span>
              <label class="field field--row">
                <span class="field__label">Строк на 1-й странице</span>
                <input
                  class="field__input field__input--small pi-focus-ring"
                  type="number"
                  min="0"
                  max="200"
                  [value]="rowsFirstPage()"
                  (input)="onRowsFirstPageChange($event)"
                  [disabled]="selectionLocked()"
                />
              </label>
              <label class="field field--row">
                <span class="field__label">Строк на следующих</span>
                <input
                  class="field__input field__input--small pi-focus-ring"
                  type="number"
                  min="0"
                  max="200"
                  [value]="rowsNextPage()"
                  (input)="onRowsNextPageChange($event)"
                  [disabled]="selectionLocked()"
                />
              </label>
              <p class="field__hint">
                0 — автоматически по высоте рамки; явное число — override для всех новых КП с этим
                бланком.
              </p>
            </div>
          }
          @if (b.dataBinding; as db) {
            <div class="field">
              <span class="field__label">Привязка к данным</span>
              <div class="badge-row">
                <div class="badge">
                  <span class="badge__label">Источник</span>
                  <span class="badge__value">{{ db.source }}</span>
                </div>
                @if (db.field) {
                  <div class="badge">
                    <span class="badge__label">Поле</span>
                    <span class="badge__value">{{ db.field }}</span>
                  </div>
                }
              </div>
            </div>
            @if (db.source === 'static') {
              <label class="field">
                <span class="field__label">Значение</span>
                <input
                  class="field__input pi-focus-ring"
                  type="text"
                  [value]="db.value ?? ''"
                  (input)="onBindingValueInput($event)"
                />
              </label>
            }
          }
          @if (b.type === 'text' || b.type === 'table') {
            <app-pi-button variant="outline" size="sm" (click)="editSelected.emit()">
              Редактировать
            </app-pi-button>
          }
          @if (
            b.type !== 'text' &&
            b.type !== 'header' &&
            b.type !== 'image' &&
            b.type !== 'table' &&
            !b.dataBinding
          ) {
            <p class="insp-hint">Нет полей содержимого для этого типа</p>
          }
        </section>

        <section class="insp-section" data-test="insp-section-style">
          <h3 class="insp-section__title" data-test="insp-section-header">Стиль</h3>
          <label class="field field--row">
            <span class="field__label">Линия снизу</span>
            <app-pi-switch [checked]="showLine()" (checkedChange)="onShowLineChange($event)" />
          </label>
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
                aria-label="Прозрачность фона блока"
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
          @if (b.type === 'image') {
            <label class="field field--row">
              <span class="field__label">Поверх других блоков</span>
              <app-pi-switch
                [checked]="imageOverlay()"
                (checkedChange)="onImageOverlayToggle($event)"
                [disabled]="selectionLocked()"
              />
            </label>
          }
        </section>

        @if (b.layout) {
          <section class="insp-section" data-test="insp-section-layer">
            <h3 class="insp-section__title" data-test="insp-section-header">Слой</h3>
            <div class="layer-order-actions">
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('front')"
                title="На передний план"
                aria-label="На передний план"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerFrontIcon" [size]="14"></lucide-icon>
              </button>
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('raise')"
                title="Выше"
                aria-label="Выше"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerRaiseIcon" [size]="14"></lucide-icon>
              </button>
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('lower')"
                title="Ниже"
                aria-label="Ниже"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerLowerIcon" [size]="14"></lucide-icon>
              </button>
              <button
                type="button"
                class="layer-order-btn pi-focus-ring"
                (click)="onLayerOrder('back')"
                title="На задний план"
                aria-label="На задний план"
                [disabled]="selectionLocked()"
              >
                <lucide-icon [img]="LayerBackIcon" [size]="14"></lucide-icon>
              </button>
            </div>
          </section>
        }

        <section class="insp-section insp-section--danger" data-test="insp-section-danger">
          <h3 class="insp-section__title" data-test="insp-section-header">Опасная зона</h3>
          <app-pi-button
            variant="destructive"
            size="sm"
            (click)="onDelete()"
            ariaLabel="Удалить блок"
            [disabled]="selectionLocked()"
          >
            {{ selectionLocked() ? 'Сначала разблокируйте' : 'Удалить блок' }}
          </app-pi-button>
        </section>
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
        background: var(--pi-bg-elevated);
        background-size: var(--pi-bg-elevated-size);
        background-blend-mode: var(--pi-bg-elevated-blend);
        border-left: 1px solid var(--color-rule);
      }

      .inspector__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: var(--space-control-y-md) var(--space-4);
        border-bottom: 1px solid var(--color-rule);
        position: sticky;
        top: 0;
        background: var(--pi-bg-elevated);
        background-size: var(--pi-bg-elevated-size);
        background-blend-mode: var(--pi-bg-elevated-blend);
        z-index: 10;
        min-height: 36px;
        box-sizing: border-box;
      }

      .inspector__title {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-ink);
        margin: 0;
        font-family: inherit;
      }

      .inspector__type-pill {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--color-paper);
        color: var(--color-ink);
        border: 1px solid var(--color-rule);
        padding: 0.125rem var(--space-2);
        border-radius: 2px;
        font-weight: 600;
      }

      .inspector__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted);
        transition: all 100ms ease;
      }

      .inspector__close:hover {
        background: color-mix(in oklch, var(--color-sunrise-soft) 40%, transparent);
        color: var(--color-ink);
        border-color: var(--color-rule);
      }

      .insp-section {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--color-rule);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .insp-section__title {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted);
        font-family: inherit;
      }

      .insp-section--danger {
        border-bottom: none;
      }

      .insp-context__label {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-ink);
      }

      .insp-context__row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .insp-context__group {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        padding: 0.125rem 0.375rem;
      }

      .insp-hint {
        margin: 0;
        font-size: 12px;
        color: var(--color-muted);
      }

      .insp-hint--muted {
        font-size: 11px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field--row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .field__label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted);
        font-family: inherit;
      }

      .field__row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .field__value {
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--color-ink);
        font-family: inherit;
      }

      .field__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex: 1 1 auto;
        min-width: 3.5rem;
        padding: 0.375rem var(--space-control-y-md);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        color: var(--color-muted);
        cursor: pointer;
      }

      .chip:hover {
        border-color: var(--color-ink);
        color: var(--color-ink);
      }

      .chip--active {
        background: var(--color-sunrise-warm, var(--color-gold));
        border-color: var(--color-sunrise-warm, var(--color-gold));
        color: var(--color-on-gold, var(--color-paper));
      }

      .field__input,
      .field__textarea {
        width: 100%;
        height: 30px;
        padding: var(--space-1) var(--space-2);
        background: var(--color-paper);
        color: var(--color-ink);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        font-size: 13px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 100ms ease;
      }

      .field__textarea {
        height: auto;
        min-height: 72px;
        resize: vertical;
        padding: var(--space-2);
      }

      .field__input:focus,
      .field__textarea:focus {
        outline: none;
        border-color: var(--color-ink);
      }

      .field__input::placeholder,
      .field__textarea::placeholder {
        color: var(--color-muted);
      }

      .field__slider {
        width: 100%;
        height: 2px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--color-rule);
        border-radius: 1px;
        outline: none;
        cursor: pointer;
      }

      .field__slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: none;
      }

      .field__slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: none;
      }

      .field__input--small {
        width: 64px;
        flex-shrink: 0;
        text-align: center;
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted);
        margin: 0;
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
        padding: 0.125rem 0.375rem;
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
        font-family: inherit;
      }

      .margin-controls {
        display: flex;
        gap: 12px;
      }

      .lock-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        justify-content: center;
        margin-bottom: var(--space-control-y-md);
        padding: 0.375rem var(--space-control-y-md);
        font-size: 11px;
        font-weight: 600;
        font-family: var(--font-mono);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--color-gold);
        background: color-mix(in oklch, var(--color-gold) 10%, var(--color-paper));
        border: 1px solid color-mix(in oklch, var(--color-gold) 40%, var(--color-rule));
        border-radius: 2px;
        cursor: pointer;
        transition:
          background 120ms ease,
          border-color 120ms ease,
          color 120ms ease;
      }

      .lock-toggle:hover {
        background: color-mix(in oklch, var(--color-gold) 18%, var(--color-paper));
      }

      .lock-toggle--on {
        color: var(--color-paper);
        background: var(--color-gold);
        border-color: var(--color-gold);
      }

      .lock-toggle--on:hover {
        filter: brightness(1.05);
      }

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
        align-self: flex-start;
        padding: var(--space-1) var(--space-2);
        height: 24px;
        font-size: 11px;
        font-weight: 500;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .field__reset-btn:hover:not(:disabled) {
        border-color: var(--color-ink);
        background: color-mix(in oklch, var(--color-sunrise-soft) 35%, transparent);
      }

      .field__reset-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .block-bg-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .block-bg-swatch {
        width: 28px;
        height: 28px;
        padding: 0.125rem;
        border: 1px solid var(--color-rule);
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

      .layer-order-actions {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .layer-order-btn {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .layer-order-btn:hover:not(:disabled) {
        background: color-mix(in oklch, var(--color-sunrise-soft) 40%, transparent);
        border-color: var(--color-ink);
      }

      .layer-order-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .inspector__group-badge {
        margin: 0;
        padding: var(--space-1) var(--space-2);
        font-size: 11px;
        font-weight: 500;
        color: var(--color-ink);
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
      }

      .snap-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .bg-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .bg-grid__item {
        position: relative;
        aspect-ratio: 1;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 100ms ease;
      }

      .bg-grid__item:hover {
        border-color: var(--color-ink);
      }

      .bg-grid__item.is-default {
        border-color: var(--color-ink);
        border-width: 2px;
      }

      .bg-grid__thumb {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--color-paper-2);
      }

      .bg-grid__check {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in oklch, var(--color-ink) 12%, transparent);
        color: var(--color-ink);
      }

      .bg-grid__actions {
        position: absolute;
        bottom: 4px;
        right: 4px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 100ms ease;
      }

      .bg-grid__item:hover .bg-grid__actions,
      .bg-grid__item.is-default .bg-grid__actions {
        opacity: 1;
      }

      .bg-grid__action-btn {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted);
        transition: all 100ms ease;
        padding: 0;
      }

      .bg-grid__action-btn:hover {
        color: var(--color-ink);
        border-color: var(--color-ink);
      }

      .bg-grid__action-btn.is-active {
        color: var(--color-gold);
        border-color: var(--color-gold-deep);
        background: color-mix(in oklch, var(--color-gold) 18%, var(--color-paper));
      }

      .bg-grid__action-btn.is-active .bg-grid__star--on,
      .bg-grid__star--on {
        color: var(--color-gold);
      }

      /* Lucide renders the SVG in a child component; pierce that boundary so
         the active/default star is visibly yellow-filled, not outline-only. */
      :host ::ng-deep .bg-grid__star--on svg,
      :host ::ng-deep .bg-grid__star--on svg path {
        fill: var(--color-gold);
        stroke: var(--color-gold-deep);
      }

      .bg-grid__action-btn--danger:hover {
        color: var(--color-destructive);
        border-color: var(--color-destructive);
      }

      .bg-upload {
        display: block;
        cursor: pointer;
      }

      .bg-file-input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -0.0625rem;
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
        height: 28px;
        padding: 0 var(--space-3);
        font-size: 11px;
        font-weight: 600;
        font-family: inherit;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-ink);
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        box-sizing: border-box;
        transition: all 100ms ease;
      }

      .bg-upload__inner:hover {
        border-color: var(--color-ink);
        background: color-mix(in oklch, var(--color-sunrise-soft) 35%, transparent);
      }

      .bg-upload__text {
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .image-preview {
        position: relative;
        display: inline-block;
        margin-bottom: var(--space-2);
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

      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
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
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted);
        font-family: inherit;
      }

      .summary-item__value {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-ink);
        font-family: inherit;
      }

      .summary-item__value--small {
        font-size: 11px;
        font-weight: 400;
        color: var(--color-muted);
      }
    `,
  ],
})
export class BuilderInspectorComponent implements OnInit {
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

  // TZ-DOC-333: upload-first photo persist for image blocks (never blob:).
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly toast = inject(PiToastService);
  private readonly categoriesSvc = inject(DocumentTemplateCategoriesService);

  /** Local draft for Mode B template name (commit on blur/Enter only). */
  protected readonly nameDraft = signal('');
  protected readonly categories = signal<DocumentTemplateCategory[]>([]);
  protected readonly categoriesLoading = signal(false);
  protected readonly categoriesError = signal<string | null>(null);
  protected readonly pageSizes: PageSize[] = ['A3', 'A4', 'A5'];
  /** TZ-KP-443 — Lucide icons moved here from the KP ribbon (single orientation control). */
  protected readonly orientations: ReadonlyArray<{
    value: Orientation;
    label: string;
    icon: typeof RectangleVertical;
  }> = [
    { value: 'portrait', label: 'Книжная', icon: RectangleVertical },
    { value: 'landscape', label: 'Альбомная', icon: RectangleHorizontal },
  ];

  // Icons
  protected readonly ResetIcon = RotateCcw;
  protected readonly HashIcon = Hash;
  protected readonly UploadIcon = Upload;
  protected readonly CloseIcon = X;
  protected readonly CheckIcon = Check;
  protected readonly StarIcon = Star;
  protected readonly CloseSmallIcon = X;
  protected readonly LayerFrontIcon = ChevronsUp;
  protected readonly LayerRaiseIcon = ChevronUp;
  protected readonly LayerLowerIcon = ChevronDown;
  protected readonly LayerBackIcon = ChevronsDown;
  protected readonly LockIcon = Lock;
  protected readonly UnlockIcon = Unlock;

  /** True when the single selected block — or every multi-selected block — is locked. */
  protected readonly selectionLocked = computed(() => {
    const b = this.block();
    if (b) return !!b.locked;
    const sel = this.selectedBlocks();
    return sel.length > 0 && sel.every((x) => !!x.locked);
  });

  /** Toggle geometry lock for current selection (single or multi). */
  protected onToggleLock(): void {
    const next = !this.selectionLocked();
    const single = this.block();
    if (single?._id) {
      this.update.emit({ _id: single._id, locked: next });
      return;
    }
    for (const sb of this.selectedBlocks()) {
      if (sb._id) this.update.emit({ _id: sb._id, locked: next });
    }
  }

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

  protected isLineItemsTable(): boolean {
    const b = this.block();
    if (b?.type !== 'table') return false;
    const settings = b.settings as { kpLineItems?: boolean; role?: string } | undefined;
    if (settings?.role === 'line-items' || settings?.kpLineItems === true) return true;

    const liveTables = this.allBlocks().filter((block) => {
      if (block.type !== 'table') return false;
      if (block.source?.kind === 'table-template' && block.source.mode === 'snapshot') {
        return false;
      }
      const s = block.settings as { tableTemplateId?: string } | undefined;
      return block.source?.kind === 'table-template'
        ? Boolean(block.source.refId)
        : Boolean(s?.tableTemplateId);
    });
    return liveTables.length === 1 && liveTables[0]._id === b._id;
  }

  protected readonly rowsFirstPage = computed(() => {
    return this.template()?.defaultSheetLayout?.rowsFirstPage ?? 0;
  });

  protected readonly rowsNextPage = computed(() => {
    return this.template()?.defaultSheetLayout?.rowsNextPage ?? 0;
  });

  protected onRowsFirstPageChange(event: Event): void {
    if (this.selectionLocked()) return;
    const val = Number((event.target as HTMLInputElement).value) || 0;
    const current = this.template()?.defaultSheetLayout ?? {};
    this.templateUpdate.emit({
      defaultSheetLayout: { ...current, rowsFirstPage: Math.max(0, Math.min(200, val)) },
    });
  }

  protected onRowsNextPageChange(event: Event): void {
    if (this.selectionLocked()) return;
    const val = Number((event.target as HTMLInputElement).value) || 0;
    const current = this.template()?.defaultSheetLayout ?? {};
    this.templateUpdate.emit({
      defaultSheetLayout: { ...current, rowsNextPage: Math.max(0, Math.min(200, val)) },
    });
  }

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

    // Mode B: keep name draft in sync with template (after successful PATCH / load).
    effect(() => {
      this.nameDraft.set(this.template()?.name ?? '');
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    this.categoriesSvc.list({ activeOnly: true }).subscribe((res) => {
      this.categoriesLoading.set(false);
      if (!res.ok) {
        this.categories.set([]);
        this.categoriesError.set('Не удалось загрузить категории');
        return;
      }
      const systemOnly = (res.data ?? []).filter((c) => !c.organizationId);
      this.categories.set(systemOnly);
    });
  }

  protected templateCategoryId(): string {
    const cat = this.template()?.categoryId;
    if (!cat) return '';
    return typeof cat === 'string' ? cat : (cat._id ?? '');
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
    if (this.selectionLocked()) return;
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
    if (this.selectionLocked()) return;
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

  protected onNameDraftInput(event: Event): void {
    this.nameDraft.set((event.target as HTMLInputElement).value);
  }

  /** Commit rename on blur / Enter — no per-keystroke PATCH. */
  protected commitTemplateName(): void {
    const current = this.template()?.name ?? '';
    const trimmed = this.nameDraft().trim();
    if (!trimmed) {
      this.toast.error('Название обязательно');
      this.nameDraft.set(current);
      return;
    }
    if (trimmed === current) {
      this.nameDraft.set(current);
      return;
    }
    this.templateUpdate.emit({ name: trimmed });
  }

  protected onCategoryChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    if (!id || id === this.templateCategoryId()) return;
    this.templateUpdate.emit({ categoryId: id });
  }

  protected onOrientationChange(orientation: Orientation): void {
    this.templateUpdate.emit({ orientation });
  }

  protected onPageSizeChange(pageSize: PageSize): void {
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
    input.value = '';

    const b = this.block();
    if (!b?._id) {
      this.toast.error('Сначала сохраните блок, затем загрузите фото.');
      return;
    }
    const blockId = b._id;

    // TZ-DOC-333: `blob:` URLs are session-local and the backend rejects
    // them on PATCH (400). Flow: optimistic object-URL preview → upload via
    // POST /template-blocks/:id/image (server persists settings.imageUrl) →
    // emit the canonical /uploads/... URL against the CAPTURED block id (not
    // `this.block()` — selection may change while the request is in flight,
    // and patchSettings re-reads the current block). On failure revert the
    // preview and release the object URL — no blob ever reaches persist.
    const previous = this.imageUrl();
    const localUrl = URL.createObjectURL(file);
    this.imageUrl.set(localUrl);
    this.blocksSvc.uploadImage(blockId, file).subscribe((res) => {
      if (res.ok) {
        URL.revokeObjectURL(localUrl);
        this.imageUrl.set(res.data.url);
        const current = (b.settings ?? {}) as Record<string, unknown>;
        this.update.emit({ _id: blockId, settings: { ...current, imageUrl: res.data.url } });
      } else {
        URL.revokeObjectURL(localUrl);
        this.imageUrl.set(previous);
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onRemoveImage(): void {
    this.imageUrl.set('');
    this.imageWidth.set(null);
    this.imageHeight.set(null);
    this.patchSettings({ imageUrl: '', imageWidth: null, imageHeight: null });
  }

  protected onImageWidthInput(event: Event): void {
    if (this.selectionLocked()) return;
    const v = (event.target as HTMLInputElement).value;
    const num = v ? Number(v) : null;
    this.imageWidth.set(num);
    this.patchSettings({ imageWidth: num });
  }

  protected onImageHeightInput(event: Event): void {
    if (this.selectionLocked()) return;
    const v = (event.target as HTMLInputElement).value;
    const num = v ? Number(v) : null;
    this.imageHeight.set(num);
    this.patchSettings({ imageHeight: num });
  }

  protected onImageOverlayToggle(checked: boolean): void {
    if (this.selectionLocked()) return;
    this.imageOverlay.set(checked);
    this.patchSettings({ overlay: checked });
  }

  protected onOverlayLeftInput(event: Event): void {
    if (this.selectionLocked()) return;
    const v = Number((event.target as HTMLInputElement).value) || 0;
    this.overlayLeft.set(v);
    this.patchSettings({ overlayLeft: v });
  }

  protected onOverlayTopInput(event: Event): void {
    if (this.selectionLocked()) return;
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
    if (this.selectionLocked()) return;
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

  /** Invalid / missing default → treat as 0 when backgrounds exist (TZ-DOC-344). */
  protected effectiveDefaultBgIndex(t: {
    backgroundImage?: string[] | null;
    defaultBackgroundIndex?: number | null;
  }): number {
    const all = t.backgroundImage ?? [];
    if (all.length === 0) return -1;
    const idx = t.defaultBackgroundIndex ?? -1;
    return idx >= 0 && idx < all.length ? idx : 0;
  }

  protected onSetDefaultBackground(index: number): void {
    this.setDefaultBackground.emit(index);
  }

  // ── TZ-259.4: canonical layout geometry handlers (positioned blocks) ──

  protected onLayoutXInput(event: Event): void {
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutXpx.set(Math.max(0, px));
    this.emitLayoutPatch();
  }

  protected onLayoutYInput(event: Event): void {
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutYpx.set(Math.max(0, px));
    this.emitLayoutPatch();
  }

  protected onLayoutWidthInput(event: Event): void {
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    this.layoutWidthPx.set(Math.max(20, px));
    this.emitLayoutPatch();
  }

  protected onLayoutHeightInput(event: Event): void {
    if (this.selectionLocked()) return;
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
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const percent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    const rightPercent = 100 - this.blockWidth() - this.blockMarginLeft();
    const newWidth = Math.max(20, 100 - percent - rightPercent);
    this.blockMarginLeft.set(Math.round(percent));
    this.blockWidth.set(Math.round(newWidth));
    this.emitMarginSettings();
  }

  protected onMarginRightInput(event: Event): void {
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const rightPercent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    const newWidth = Math.max(20, 100 - this.blockMarginLeft() - rightPercent);
    this.blockWidth.set(Math.round(newWidth));
    this.emitMarginSettings();
  }

  protected onResetMargins(): void {
    if (this.selectionLocked()) return;
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
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const percent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    this.emitMultiMarginPatch({ marginLeft: Math.round(percent) });
  }

  protected onMultiMarginRightInput(event: Event): void {
    if (this.selectionLocked()) return;
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const rightPercent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    this.emitMultiMarginPatch({ rightMarginPercent: Math.round(rightPercent) });
  }

  protected onMultiResetMargins(): void {
    if (this.selectionLocked()) return;
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
