import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  LucideAngularModule,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { formatPrice } from '../../../shared/util/format';
import type { ProposalDraftLine, ProposalRowPresentation } from './proposal-product-rail.component';
import type {
  ProposalTableChrome,
  ProposalTableLayoutColumn,
  ProposalTableTarget,
} from './proposal-create-inspector.component';

export interface ProposalCompositionLineChange {
  index: number;
  patch: Partial<ProposalDraftLine>;
}

export type ProposalRowAction =
  'open-card' | 'duplicate-kp' | 'create-product-copy' | 'update-product';

const DEFAULT_ROW_PRESENTATION: Required<ProposalRowPresentation> = {
  density: 'auto',
  emphasis: 'normal',
  separatorBefore: false,
  pageBreakBefore: false,
  showDescription: true,
  photoFit: 'inherit',
};

/** Width hint stored per column key (%). */
type ColumnWidths = Record<string, number>;

/**
 * TZ-SALES-359 + 360 — unified table editor.
 *
 * Toolbar: Колонки ▾ · «⋯ Ещё» (Добавить поля КП / Открыть пресет / Сбросить ширины)
 * Column header: caret → Левее · Правее · Ширина % · Скрыть
 * Hidden columns: «Скрыто:» chip strip
 * Widths normalised to 100% for visible columns.
 */
@Component({
  selector: 'app-proposal-create-table-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, PiOverflowSelectComponent],
  template: `
    <section class="editor" data-test="kp-table-editor">
      <!-- Header -->
      <header class="editor__header">
        <div>
          <p class="eyebrow m-0">КП</p>
          <h2 class="editor__title">Редактор таблицы</h2>
          <p class="editor__hint">
            Количество, цена, скидка и сумма — здесь. Лист A4 только показывает результат.
          </p>
        </div>
        <div class="editor__header-actions">
          <span class="editor__meta">{{ lines().length }}&nbsp;позиций</span>
          <span class="editor__total" data-test="kp-table-editor-total">{{ price(total()) }}</span>
        </div>
      </header>

      <!-- Toolbar -->
      @if (lines().length > 0) {
        <div class="editor__toolbar" data-test="kp-table-editor-toolbar">
          <!-- Колонки ▾ -->
          <div class="editor__toolbar-group">
            <button
              type="button"
              class="editor__toolbar-btn"
              [disabled]="readOnly()"
              (click)="toggleColumnsMenu()"
              [attr.aria-expanded]="columnsMenuOpen()"
              data-test="kp-table-editor-columns-toggle"
            >
              Колонки
              <lucide-angular [img]="chevronDownIcon" [size]="12" aria-hidden="true" />
            </button>
            @if (columnsMenuOpen()) {
              <div class="editor__dropdown" data-test="kp-table-editor-columns-dropdown">
                @for (col of tableLayout(); track col.key) {
                  <label class="editor__dropdown-item">
                    <input
                      type="checkbox"
                      [checked]="col.visible"
                      [disabled]="
                        readOnly() ||
                        isEssentialColumn(col.key) ||
                        (col.visible && visibleLayoutColumns().length === 1)
                      "
                      (change)="toggleColumnVisibility(col.key)"
                    />
                    <span>{{ col.label }}</span>
                  </label>
                }
              </div>
            }
          </div>

          <!-- Рамка -->
          <div class="editor__toolbar-group">
            <button
              type="button"
              class="editor__toolbar-btn"
              [disabled]="readOnly()"
              (click)="cycleBorderWeight()"
              data-test="kp-table-editor-border"
            >
              Рамка: {{ borderLabel() }}
            </button>
          </div>

          <!-- Шапка -->
          <div class="editor__toolbar-group">
            <button
              type="button"
              class="editor__toolbar-btn"
              [disabled]="readOnly()"
              (click)="toggleHeaderWeight()"
              data-test="kp-table-editor-header"
            >
              Шапка: {{ headerLabel() }}
            </button>
          </div>

          <!-- Шрифт (sheetLayout.tableFontSize) -->
          <div class="editor__toolbar-group editor__toolbar-group--font">
            <span class="editor__font-label">Шрифт</span>
            <app-pi-overflow-select
              [items]="tableFontSizeItems"
              [value]="tableFontSizeValue()"
              (valueChange)="onTableFontSizeChange($event)"
              [searchable]="false"
              placeholder="12"
              ariaLabel="Шрифт таблицы"
              dataTest="kp-table-editor-font"
              [disabled]="readOnly()"
            />
          </div>

          <!-- Spacer -->
          <span class="editor__toolbar-spacer"></span>

          <!-- ⋯ Ещё -->
          <div class="editor__toolbar-group">
            <button
              type="button"
              class="editor__toolbar-btn"
              [disabled]="readOnly()"
              (click)="toggleMoreMenu()"
              [attr.aria-expanded]="moreMenuOpen()"
              data-test="kp-table-editor-more-toggle"
            >
              <lucide-angular [img]="moreIcon" [size]="14" aria-hidden="true" />
              Ещё
            </button>
            @if (moreMenuOpen()) {
              <div
                class="editor__dropdown editor__dropdown--right"
                data-test="kp-table-editor-more-dropdown"
                (mouseleave)="moreMenuOpen.set(false)"
              >
                <button
                  type="button"
                  class="editor__dropdown-item editor__dropdown-item--btn"
                  [disabled]="readOnly()"
                  (click)="addCommercialColumns(); moreMenuOpen.set(false)"
                  data-test="kp-table-editor-add-commercial"
                >
                  Добавить поля КП (кол-во/цена)
                </button>
                <button
                  type="button"
                  class="editor__dropdown-item editor__dropdown-item--btn"
                  [disabled]="readOnly()"
                  (click)="openTableTemplate.emit(); moreMenuOpen.set(false)"
                  data-test="kp-table-editor-open-template"
                >
                  Открыть пресет в Документах
                </button>
                <button
                  type="button"
                  class="editor__dropdown-item editor__dropdown-item--btn"
                  [disabled]="readOnly()"
                  (click)="resetWidths(); moreMenuOpen.set(false)"
                  data-test="kp-table-editor-reset-widths"
                >
                  Сбросить ширины
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Hidden columns strip -->
      @if (hiddenColumns().length > 0) {
        <div class="editor__hidden-strip" data-test="kp-table-editor-hidden">
          <span class="editor__hidden-label">Скрыто:</span>
          @for (col of hiddenColumns(); track col.key) {
            <button
              type="button"
              class="editor__hidden-chip"
              [disabled]="readOnly()"
              (click)="showColumn(col.key)"
              [attr.data-test]="'kp-table-editor-show-' + col.key"
            >
              {{ col.label }}
              <lucide-angular [img]="xIcon" [size]="10" aria-hidden="true" />
            </button>
          }
        </div>
      }

      <!-- Empty state -->
      @if (lines().length === 0) {
        <div class="editor__empty" data-test="kp-table-editor-empty">
          <p>Добавьте изделия из панели «Товары».</p>
          <p>Или нажмите «Своя строка» для услуги, доставки или монтажа.</p>
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            data-test="kp-table-editor-open-products"
            [disabled]="readOnly()"
            (click)="openProducts.emit()"
          >
            Открыть «Товары»
          </app-pi-button>
        </div>
      } @else {
        <!-- Zone labels -->
        <div class="editor__zones" aria-hidden="true">
          <span class="editor__zone-label editor__zone-label--gutter">Служебное</span>
          <span class="editor__zone-label editor__zone-label--blank">На бланке</span>
          <span class="editor__zone-label editor__zone-label--kp">Только в КП</span>
          <span class="editor__zone-label editor__zone-label--gutter">Служебное</span>
        </div>

        <hr class="editor__divider" />

        <!-- Lines table -->
        <div class="editor__table-wrap" data-test="kp-table-editor-lines" (scroll)="closeMenus()">
          <table class="editor__table" [style.font-size.px]="tableFontSize()">
            <colgroup>
              <col class="editor__col-move" />
              <col class="editor__col-num" />
              @for (col of visibleLayoutColumns(); track col.key) {
                <col
                  [class]="'editor__col-' + col.key"
                  [style.width.%]="columnWidthPercent(col.key)"
                />
              }
              <col class="editor__col-disc" />
              <col class="editor__col-opt" />
              <col class="editor__col-act" />
            </colgroup>
            <thead>
              <tr>
                <th class="editor__col-move" scope="col">
                  <span class="sr-only">Порядок</span>
                </th>
                <th class="editor__col-num" scope="col">№</th>
                @for (col of visibleLayoutColumns(); track col.key; let ci = $index) {
                  <th [class]="'editor__col-' + col.key" scope="col">
                    <div class="editor__th-inner">
                      <span class="editor__th-label">{{ col.label }}</span>
                      <button
                        type="button"
                        class="editor__th-caret"
                        [disabled]="readOnly()"
                        (click)="columnMenuIndex.set(columnMenuIndex() === ci ? -1 : ci)"
                        [attr.aria-label]="'Настройки колонки: ' + col.label"
                        [attr.data-test]="'kp-table-editor-col-caret-' + col.key"
                      >
                        <lucide-angular [img]="chevronDownIcon" [size]="10" aria-hidden="true" />
                      </button>
                    </div>
                    @if (columnMenuIndex() === ci) {
                      <div
                        class="editor__col-menu"
                        data-test="kp-table-editor-col-menu"
                        (mouseleave)="columnMenuIndex.set(-1)"
                      >
                        <button
                          type="button"
                          class="editor__col-menu-item"
                          [disabled]="readOnly() || firstVisibleIndex(col.key)"
                          (click)="moveLayoutColumn(col.key, -1); columnMenuIndex.set(-1)"
                          [attr.data-test]="'kp-table-editor-col-left-' + col.key"
                        >
                          Левее
                        </button>
                        <button
                          type="button"
                          class="editor__col-menu-item"
                          [disabled]="readOnly() || lastVisibleIndex(col.key)"
                          (click)="moveLayoutColumn(col.key, 1); columnMenuIndex.set(-1)"
                          [attr.data-test]="'kp-table-editor-col-right-' + col.key"
                        >
                          Правее
                        </button>
                        <label class="editor__col-menu-item editor__col-menu-item--pct">
                          Ширина %
                          <input
                            class="editor__width-input"
                            type="number"
                            min="5"
                            max="80"
                            [value]="columnWidthPercent(col.key)"
                            [disabled]="readOnly()"
                            (change)="setColumnWidth(col.key, $event); columnMenuIndex.set(-1)"
                            [attr.data-test]="'kp-table-editor-col-width-' + col.key"
                          />
                        </label>
                        <button
                          type="button"
                          class="editor__col-menu-item"
                          [disabled]="
                            readOnly() ||
                            isEssentialColumn(col.key) ||
                            visibleLayoutColumns().length === 1
                          "
                          (click)="hideColumn(col.key); columnMenuIndex.set(-1)"
                          [attr.data-test]="'kp-table-editor-col-hide-' + col.key"
                        >
                          <lucide-angular [img]="eyeOffIcon" [size]="12" aria-hidden="true" />
                          Скрыть
                        </button>
                      </div>
                    }
                  </th>
                }
                <th class="editor__col-disc" scope="col">%</th>
                <th class="editor__col-opt" scope="col" title="Не входит в итог">Опц.</th>
                <th class="editor__col-act" scope="col">
                  <span class="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (line of lines(); track line.productId + '-' + $index; let index = $index) {
                <tr
                  class="editor__row"
                  [class.editor__row--optional]="line.isOptional === true"
                  [class.editor__row--accent]="resolvedPresentation(line).emphasis === 'accent'"
                  [class.editor__row--compact]="resolvedPresentation(line).density === 'compact'"
                  [class.editor__row--large]="resolvedPresentation(line).density === 'large'"
                  [class.editor__row--separator]="resolvedPresentation(line).separatorBefore"
                  [attr.data-test]="'kp-table-editor-line-' + index"
                >
                  <!-- Left gutter -->
                  <td
                    class="editor__col-move"
                    [class.editor__col-move--drag-over]="dragOverIndex() === index"
                    [class.editor__col-move--dragging]="dragIndex() === index"
                    [draggable]="!readOnly()"
                    (dragstart)="onDragStart($event, index)"
                    (dragover)="onDragOver($event, index)"
                    (dragleave)="onDragLeave()"
                    (drop)="onDrop($event, index)"
                  >
                    <div class="editor__move">
                      <button
                        type="button"
                        class="editor__icon-btn"
                        [disabled]="readOnly() || index === 0"
                        (click)="moveRow(index, -1)"
                        [attr.aria-label]="'Поднять строку: ' + line.productName"
                        title="Выше"
                      >
                        <lucide-angular [img]="upIcon" [size]="14" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        class="editor__icon-btn"
                        [disabled]="readOnly() || index === lines().length - 1"
                        (click)="moveRow(index, 1)"
                        [attr.aria-label]="'Опустить строку: ' + line.productName"
                        title="Ниже"
                      >
                        <lucide-angular [img]="downIcon" [size]="14" aria-hidden="true" />
                      </button>
                    </div>
                  </td>

                  <td class="editor__col-num">{{ index + 1 }}</td>

                  <!-- Template columns -->
                  @for (col of visibleLayoutColumns(); track col.key) {
                    <td [class]="'editor__col-' + col.key">
                      @switch (col.key) {
                        @case ('productName') {
                          <div class="editor__name-cell">
                            @if (line.photoUrl) {
                              <img
                                [src]="line.photoUrl"
                                [alt]=""
                                class="editor__photo"
                                [class.editor__photo--contain]="
                                  resolvedPresentation(line).photoFit === 'contain'
                                "
                                [class.editor__photo--cover]="
                                  resolvedPresentation(line).photoFit === 'cover'
                                "
                              />
                            } @else {
                              <span class="editor__photo editor__photo--empty" aria-hidden="true"
                                >Нет фото</span
                              >
                            }
                            <div class="editor__name-body">
                              @if (line.lineKind === 'custom' || canEditCatalog(line)) {
                                <input
                                  class="editor__field"
                                  type="text"
                                  [value]="line.productName"
                                  [disabled]="readOnly()"
                                  (change)="nameChanged(index, $event)"
                                  [attr.data-test]="'kp-table-editor-name-' + index"
                                  [attr.aria-label]="
                                    line.lineKind === 'custom'
                                      ? 'Название своей строки'
                                      : 'Наименование изделия в КП'
                                  "
                                />
                              } @else {
                                <strong class="editor__name">{{
                                  line.productName || 'Без названия'
                                }}</strong>
                              }
                              @if (canEditCatalog(line)) {
                                <input
                                  class="editor__field editor__field--muted"
                                  type="text"
                                  [value]="line.productSku || ''"
                                  [disabled]="readOnly()"
                                  (change)="skuChanged(index, $event)"
                                  [attr.data-test]="'kp-table-editor-sku-' + index"
                                  aria-label="Артикул изделия в КП"
                                  placeholder="Артикул"
                                />
                              } @else if (line.productSku) {
                                <span class="editor__sku">{{ line.productSku }}</span>
                              }
                              @if (line.catalogDirtyFields?.length) {
                                <span class="editor__catalog-badge">
                                  {{
                                    line.catalogDecision === 'kp-only' ? 'Только в КП' : 'Изменено'
                                  }}
                                </span>
                              }
                              <input
                                class="editor__field editor__field--muted"
                                type="text"
                                [value]="line.description || ''"
                                [disabled]="readOnly()"
                                (change)="descriptionChanged(index, $event)"
                                [attr.data-test]="'kp-table-editor-description-' + index"
                                [placeholder]="
                                  resolvedPresentation(line).showDescription
                                    ? 'Описание'
                                    : 'Описание (скрыто на бланке)'
                                "
                                aria-label="Описание строки"
                              />
                            </div>
                          </div>
                        }
                        @case ('quantity') {
                          <div class="editor__stepper">
                            <button
                              type="button"
                              class="editor__icon-btn"
                              [disabled]="readOnly()"
                              (click)="stepQuantity(index, -1)"
                              [attr.aria-label]="'Уменьшить количество: ' + line.productName"
                            >
                              <lucide-angular [img]="minusIcon" [size]="12" aria-hidden="true" />
                            </button>
                            <input
                              class="editor__field editor__field--num"
                              type="number"
                              min="0.001"
                              step="1"
                              [value]="line.quantity"
                              [disabled]="readOnly()"
                              (change)="quantityChanged(index, $event)"
                              [attr.data-test]="'kp-table-editor-quantity-' + index"
                            />
                            <button
                              type="button"
                              class="editor__icon-btn"
                              [disabled]="readOnly()"
                              (click)="stepQuantity(index, 1)"
                              [attr.aria-label]="'Увеличить количество: ' + line.productName"
                            >
                              <lucide-angular [img]="plusIcon" [size]="12" aria-hidden="true" />
                            </button>
                          </div>
                        }
                        @case ('unitPrice') {
                          <input
                            class="editor__field editor__field--num"
                            type="number"
                            min="0"
                            step="0.01"
                            [value]="line.unitPrice"
                            [disabled]="readOnly()"
                            (change)="priceChanged(index, $event)"
                            [attr.data-test]="'kp-table-editor-price-' + index"
                            aria-label="Цена за единицу в КП"
                            title="Цена только в этом КП, каталог не меняется"
                          />
                        }
                        @case ('sum') {
                          <input
                            class="editor__field editor__field--num editor__field--sum"
                            type="number"
                            min="0"
                            step="0.01"
                            [value]="lineTotal(line)"
                            [disabled]="readOnly()"
                            (change)="sumChanged(index, $event)"
                            [attr.data-test]="'kp-table-editor-sum-' + index"
                            aria-label="Сумма строки в КП"
                            title="Правка суммы пересчитает цену за ед. только в этом КП"
                          />
                        }
                        @case ('unit') {
                          <input
                            class="editor__field"
                            type="text"
                            [value]="line.unit || ''"
                            [disabled]="readOnly()"
                            (change)="unitChanged(index, $event)"
                            [attr.data-test]="'kp-table-editor-unit-' + index"
                            aria-label="Единица"
                          />
                        }
                        @case ('photo') {
                          @if (line.photoUrl) {
                            <img
                              [src]="line.photoUrl"
                              [alt]=""
                              class="editor__photo-cell"
                              [class.editor__photo-cell--contain]="
                                resolvedPresentation(line).photoFit === 'contain'
                              "
                              [class.editor__photo-cell--cover]="
                                resolvedPresentation(line).photoFit === 'cover'
                              "
                            />
                          } @else {
                            <span
                              class="editor__photo-cell editor__photo-cell--empty"
                              aria-label="Нет фото"
                              >Нет фото</span
                            >
                          }
                        }
                        @default {
                          <span class="editor__cell-value">{{ columnValue(line, col.key) }}</span>
                        }
                      }
                    </td>
                  }

                  <!-- Only in KP zone -->
                  <td class="editor__col-disc">
                    <input
                      class="editor__field editor__field--num"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      [value]="line.discountPercent || 0"
                      [disabled]="readOnly()"
                      (change)="discountChanged(index, $event)"
                      [attr.data-test]="'kp-table-editor-discount-' + index"
                      aria-label="Скидка %"
                    />
                  </td>
                  <td class="editor__col-opt">
                    <label class="editor__optional" title="Не входит в итог">
                      <input
                        type="checkbox"
                        [checked]="line.isOptional === true"
                        [disabled]="readOnly()"
                        (change)="optionalChanged(index, $event)"
                        [attr.data-test]="'kp-table-editor-optional-' + index"
                      />
                      <span class="sr-only">Не входит в итог</span>
                    </label>
                  </td>

                  <!-- Right gutter -->
                  <td class="editor__col-act">
                    <div class="editor__actions">
                      <button
                        type="button"
                        class="editor__icon-btn"
                        [class.editor__icon-btn--active]="openRowIndex() === index"
                        [class.editor__icon-btn--custom]="hasCustomPresentation(line)"
                        (click)="toggleRowDrawer(index)"
                        [attr.aria-label]="'Настройки строки: ' + line.productName"
                        [attr.aria-expanded]="openRowIndex() === index"
                        [attr.aria-controls]="'kp-row-drawer-' + index"
                        title="Настройки строки"
                        [attr.data-test]="'kp-table-editor-row-settings-' + index"
                      >
                        <lucide-angular
                          [img]="openRowIndex() === index ? upIcon : downIcon"
                          [size]="14"
                          aria-hidden="true"
                        />
                        @if (hasCustomPresentation(line)) {
                          <span
                            class="editor__row-indicator"
                            [attr.title]="presentationTooltip(line)"
                            [attr.aria-label]="presentationTooltip(line)"
                            data-test="kp-table-editor-row-indicator"
                          ></span>
                        }
                      </button>
                      @if (canEditCatalog(line)) {
                        <button
                          type="button"
                          class="editor__icon-btn"
                          [disabled]="readOnly()"
                          (click)="editLine.emit(index)"
                          [attr.aria-label]="'Открыть карточку изделия: ' + line.productName"
                          title="Открыть карточку изделия"
                          [attr.data-test]="'kp-table-editor-edit-' + index"
                        >
                          <lucide-angular [img]="pencilIcon" [size]="14" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          class="editor__icon-btn"
                          [disabled]="readOnly()"
                          (click)="toggleRowMenu(index)"
                          [attr.aria-expanded]="rowMenuIndex() === index"
                          [attr.aria-label]="'Действия строки: ' + line.productName"
                          title="Действия строки"
                          [attr.data-test]="'kp-table-editor-row-actions-' + index"
                        >
                          <lucide-angular [img]="moreIcon" [size]="14" aria-hidden="true" />
                        </button>
                        @if (rowMenuIndex() === index) {
                          <div
                            class="editor__row-menu"
                            [attr.data-test]="'kp-table-editor-row-menu-' + index"
                          >
                            <button type="button" (click)="emitRowAction(index, 'duplicate-kp')">
                              Дублировать строку КП
                            </button>
                            @if (line.lineKind === 'catalog') {
                              <button
                                type="button"
                                (click)="emitRowAction(index, 'create-product-copy')"
                              >
                                Создать копию изделия
                              </button>
                              @if (line.catalogDirtyFields?.length) {
                                <button
                                  type="button"
                                  (click)="emitRowAction(index, 'update-product')"
                                >
                                  Обновить изделие из строки
                                </button>
                              }
                            }
                          </div>
                        }
                      }
                      <button
                        type="button"
                        class="editor__icon-btn editor__icon-btn--danger"
                        [disabled]="readOnly()"
                        (click)="onRemoveRow(index)"
                        [attr.aria-label]="'Удалить строку: ' + line.productName"
                        title="Убрать из КП"
                        [attr.data-test]="'kp-table-editor-remove-' + index"
                      >
                        <lucide-angular [img]="trashIcon" [size]="14" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>

                @if (openRowIndex() === index) {
                  <tr
                    class="editor__row-drawer"
                    [attr.id]="'kp-row-drawer-' + index"
                    [attr.data-test]="'kp-table-editor-row-drawer-' + index"
                  >
                    <td [attr.colspan]="drawerColspan()">
                      <div
                        class="editor__drawer"
                        role="region"
                        [attr.aria-label]="'Настройки вида строки ' + (index + 1)"
                      >
                        <div class="editor__drawer-section">
                          <p class="editor__drawer-title">Вид строки</p>
                          <div class="editor__drawer-group" role="group" aria-label="Высота строки">
                            <span class="editor__drawer-label">Высота</span>
                            <div class="editor__seg">
                              @for (opt of densityOptions; track opt.value) {
                                <button
                                  type="button"
                                  class="editor__seg-btn"
                                  [class.editor__seg-btn--on]="
                                    resolvedPresentation(line).density === opt.value
                                  "
                                  [disabled]="readOnly()"
                                  (click)="setPresentation(index, { density: opt.value })"
                                  [attr.data-test]="'kp-row-density-' + opt.value"
                                >
                                  {{ opt.label }}
                                </button>
                              }
                            </div>
                          </div>
                          <div class="editor__drawer-group" role="group" aria-label="Выделение">
                            <span class="editor__drawer-label">Выделение</span>
                            <div class="editor__seg">
                              @for (opt of emphasisOptions; track opt.value) {
                                <button
                                  type="button"
                                  class="editor__seg-btn"
                                  [class.editor__seg-btn--on]="
                                    resolvedPresentation(line).emphasis === opt.value
                                  "
                                  [disabled]="readOnly()"
                                  (click)="setPresentation(index, { emphasis: opt.value })"
                                  [attr.data-test]="'kp-row-emphasis-' + opt.value"
                                >
                                  {{ opt.label }}
                                </button>
                              }
                            </div>
                          </div>
                          <label class="editor__drawer-check">
                            <input
                              type="checkbox"
                              [checked]="resolvedPresentation(line).separatorBefore"
                              [disabled]="readOnly()"
                              (change)="onSeparatorToggle(index, $event)"
                              data-test="kp-row-separator"
                            />
                            Разделитель сверху
                          </label>
                        </div>

                        <div class="editor__drawer-section">
                          <p class="editor__drawer-title">Печать</p>
                          <label class="editor__drawer-check">
                            <input
                              type="checkbox"
                              [checked]="resolvedPresentation(line).pageBreakBefore"
                              [disabled]="readOnly()"
                              (change)="onPageBreakToggle(index, $event)"
                              data-test="kp-row-pagebreak"
                            />
                            С новой страницы
                          </label>
                          <label class="editor__drawer-check">
                            <input
                              type="checkbox"
                              [checked]="resolvedPresentation(line).showDescription"
                              [disabled]="readOnly()"
                              (change)="onShowDescriptionToggle(index, $event)"
                              data-test="kp-row-show-description"
                            />
                            Показывать описание на бланке
                          </label>
                        </div>

                        @if (line.photoUrl) {
                          <div class="editor__drawer-section">
                            <p class="editor__drawer-title">Фото</p>
                            <div class="editor__drawer-group" role="group" aria-label="Режим фото">
                              <div class="editor__seg">
                                @for (opt of photoFitOptions; track opt.value) {
                                  <button
                                    type="button"
                                    class="editor__seg-btn"
                                    [class.editor__seg-btn--on]="
                                      resolvedPresentation(line).photoFit === opt.value
                                    "
                                    [disabled]="readOnly()"
                                    (click)="setPresentation(index, { photoFit: opt.value })"
                                    [attr.data-test]="'kp-row-photo-' + opt.value"
                                  >
                                    {{ opt.label }}
                                  </button>
                                }
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Footer -->
      <footer class="editor__footer">
        <app-pi-button
          type="button"
          variant="outline"
          size="sm"
          [disabled]="readOnly()"
          (click)="addCustom.emit()"
          data-test="kp-table-editor-add-custom"
        >
          + Своя строка
        </app-pi-button>
      </footer>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
      height: 100%;
    }

    .editor {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 0.1rem 0.15rem 0.25rem;
      min-height: 0;
      height: 100%;
    }

    /* ── Header ── */
    .editor__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.65rem;
      flex: 0 0 auto;
    }

    .editor__title {
      margin: 0.05rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.2rem;
      line-height: 1.15;
    }

    .editor__hint {
      margin: 0.25rem 0 0;
      color: var(--color-muted);
      font-size: 0.7rem;
      line-height: 1.35;
      max-width: 30rem;
    }

    .editor__header-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .editor__meta {
      color: var(--color-muted);
      font-size: 0.7rem;
      white-space: nowrap;
    }

    .editor__total {
      color: var(--color-ink);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      font-size: 0.95rem;
    }

    /* ── Toolbar ── */
    .editor__toolbar {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0;
      flex: 0 0 auto;
      background: var(--color-paper-raised, #f8f8f8);
      border-radius: 2px;
    }

    .editor__toolbar-group {
      position: relative;
    }

    .editor__toolbar-group--font {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .editor__font-label {
      font-size: 0.68rem;
      color: var(--color-muted-foreground, #6b7280);
      white-space: nowrap;
    }

    .editor__toolbar-group--font app-pi-overflow-select {
      display: block;
      width: 3.5rem;
    }

    .editor__toolbar-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      padding: 0.2rem 0.45rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
      color: var(--color-ink);
      font-size: 0.68rem;
      cursor: pointer;
      border-radius: 2px;
      white-space: nowrap;
    }

    .editor__toolbar-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .editor__toolbar-spacer {
      flex: 1 1 auto;
    }

    /* ── Dropdowns ── */
    .editor__dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.15rem;
      min-width: 13rem;
      background: var(--color-paper, #fff);
      border: 1px solid var(--color-rule);
      box-shadow: var(--shadow-raised, 0 4px 12px oklch(0.2 0.02 260 / 0.1));
      z-index: 10;
      padding: 0.2rem 0;
    }

    .editor__dropdown--right {
      left: auto;
      right: 0;
    }

    .editor__dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.68rem;
      cursor: pointer;
      white-space: nowrap;
      color: var(--color-ink);
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }

    .editor__dropdown-item--btn:hover:not(:disabled) {
      background: color-mix(in oklch, var(--color-gold) 15%, transparent);
    }

    .editor__dropdown-item--btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .editor__dropdown-item input[type='checkbox'] {
      margin: 0;
    }

    /* ── Hidden strip ── */
    .editor__hidden-strip {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.3rem;
      border: 1px dashed var(--color-rule);
      flex: 0 0 auto;
      font-size: 0.65rem;
    }

    .editor__hidden-label {
      color: var(--color-muted);
      white-space: nowrap;
    }

    .editor__hidden-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.1rem 0.35rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
      color: var(--color-ink);
      font-size: 0.62rem;
      cursor: pointer;
      border-radius: 2px;
    }

    .editor__hidden-chip:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* ── Empty ── */
    .editor__empty {
      padding: 1.5rem 1rem;
      border: 1px dashed var(--color-rule);
      text-align: center;
      color: var(--color-ink);
    }

    .editor__empty p {
      margin: 0 0 0.3rem;
      font-size: 0.8125rem;
    }

    /* ── Zones ── */
    .editor__zones {
      display: flex;
      justify-content: space-between;
      padding: 0 0.15rem;
      flex: 0 0 auto;
    }

    .editor__zone-label {
      font-size: 0.58rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-muted);
    }

    .editor__zone-label--blank {
      flex: 1 1 auto;
      text-align: center;
    }

    .editor__zone-label--kp {
      font-style: italic;
    }

    .editor__divider {
      margin: 0;
      border: none;
      border-top: 1px solid var(--color-rule);
    }

    /* ── Table ── */
    .editor__table-wrap {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
    }

    .editor__table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 0.75rem;
    }

    /* ── TH with caret ── */
    .editor__th-inner {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      min-width: 0;
    }

    .editor__th-label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .editor__th-caret {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.1rem;
      height: 1.1rem;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-muted);
      cursor: pointer;
      border-radius: 2px;
      flex: 0 0 auto;
    }

    .editor__th-caret:hover:not(:disabled) {
      color: var(--color-ink);
      background: color-mix(in oklch, var(--color-muted) 12%, transparent);
    }

    .editor__th-caret:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* ── Column menu ── */
    .editor__col-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.1rem;
      min-width: 9rem;
      background: var(--color-paper, #fff);
      border: 1px solid var(--color-rule);
      box-shadow: var(--shadow-raised, 0 4px 12px oklch(0.2 0.02 260 / 0.1));
      z-index: 10;
      padding: 0.15rem 0;
    }

    .editor__col-menu-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.55rem;
      font-size: 0.65rem;
      cursor: pointer;
      white-space: nowrap;
      color: var(--color-ink);
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }

    .editor__col-menu-item:hover:not(:disabled) {
      background: color-mix(in oklch, var(--color-gold) 12%, transparent);
    }

    .editor__col-menu-item:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .editor__col-menu-item--pct {
      gap: 0.35rem;
      cursor: default;
    }

    .editor__col-menu-item--pct:hover {
      background: none;
    }

    .editor__width-input {
      width: 2.8rem;
      height: 1.25rem;
      padding: 0 0.2rem;
      border: 1px solid var(--color-rule);
      font-size: 0.65rem;
      font-variant-numeric: tabular-nums;
      text-align: right;
      border-radius: 2px;
    }

    /* ── Table header ── */
    .editor__table thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--color-paper-raised, var(--color-paper, #fff));
      border-bottom: 1px solid var(--color-rule);
      padding: 0.35rem 0.3rem;
      text-align: left;
      color: var(--color-muted);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
      position: relative;
    }

    .editor__row td {
      border-bottom: 1px solid var(--color-rule);
      padding: 0.3rem 0.25rem;
      vertical-align: middle;
    }

    .editor__row--optional {
      background: color-mix(in oklch, var(--color-muted) 7%, transparent);
    }

    .editor__row--accent {
      background: color-mix(in oklch, var(--color-ink) 6%, var(--color-paper, #fff));
    }

    .editor__row--compact td {
      padding-block: 0.12rem;
    }

    .editor__row--large td {
      padding-block: 0.55rem;
    }

    .editor__row--separator td {
      border-top: 2px solid var(--color-ink);
    }

    .editor__row-drawer td {
      padding: 0;
      border-bottom: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-muted) 6%, var(--color-paper, #fff));
    }

    .editor__drawer {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 0.65rem 1rem;
      padding: 0.55rem 0.65rem 0.65rem;
    }

    .editor__drawer-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }

    .editor__drawer-title {
      margin: 0;
      color: var(--color-muted);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .editor__drawer-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .editor__drawer-label {
      color: var(--color-ink);
      font-size: 0.72rem;
    }

    .editor__drawer-check {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin: 0;
      color: var(--color-ink);
      font-size: 0.72rem;
      cursor: pointer;
    }

    .editor__seg {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.15rem;
    }

    .editor__seg-btn {
      padding: 0.18rem 0.4rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
      color: var(--color-ink);
      font-size: 0.68rem;
      border-radius: 2px;
      cursor: pointer;
    }

    .editor__seg-btn--on {
      border-color: var(--color-ink);
      background: color-mix(in oklch, var(--color-ink) 8%, var(--color-paper, #fff));
      font-weight: 600;
    }

    .editor__seg-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* ── Column widths ── */
    .editor__col-move {
      cursor: grab;
      width: 1.75rem;
    }
    .editor__col-move--dragging {
      opacity: 0.4;
    }
    .editor__col-move--drag-over {
      border-top: 2px solid var(--color-accent, gold);
    }
    .editor__col-num {
      width: 1.75rem;
      text-align: center;
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
    }
    .editor__col-quantity {
      width: 6.25rem;
    }
    .editor__col-unit {
      width: 2.75rem;
    }
    .editor__col-unitPrice,
    .editor__col-sum {
      width: 5.25rem;
    }
    .editor__col-disc {
      width: 3.25rem;
      background: color-mix(in oklch, var(--color-muted) 5%, transparent);
    }
    .editor__col-opt {
      width: 2rem;
      text-align: center;
      background: color-mix(in oklch, var(--color-muted) 5%, transparent);
    }
    .editor__col-act {
      width: 5.25rem;
    }

    /* ── Buttons ── */
    .editor__move,
    .editor__actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
      position: relative;
    }

    .editor__row-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 0.15rem);
      z-index: 12;
      display: flex;
      flex-direction: column;
      min-width: 12rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
      box-shadow: var(--shadow-raised, 0 4px 12px oklch(0.2 0.02 260 / 0.1));
    }

    .editor__row-menu button {
      padding: 0.3rem 0.45rem;
      border: 0;
      background: transparent;
      color: var(--color-ink);
      text-align: left;
      font-size: 0.68rem;
      cursor: pointer;
    }

    .editor__row-menu button:hover {
      background: color-mix(in oklch, var(--color-gold) 12%, transparent);
    }

    .editor__actions {
      flex-direction: row;
      justify-content: flex-end;
      gap: 0.15rem;
    }

    .editor__icon-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.45rem;
      height: 1.45rem;
      padding: 0;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
      border-radius: 2px;
    }

    .editor__icon-btn:focus-visible {
      outline: 2px solid var(--color-accent, #c9a227);
      outline-offset: 1px;
    }

    .editor__icon-btn--active {
      border-color: var(--color-ink);
      background: color-mix(in oklch, var(--color-ink) 8%, transparent);
    }

    .editor__row-indicator {
      position: absolute;
      top: 0.1rem;
      right: 0.1rem;
      width: 0.35rem;
      height: 0.35rem;
      border-radius: 999px;
      background: var(--color-accent, #c9a227);
      pointer-events: none;
    }

    .editor__photo--contain,
    .editor__photo-cell--contain {
      object-fit: contain;
    }

    .editor__photo--cover,
    .editor__photo-cell--cover {
      object-fit: cover;
    }

    .editor__icon-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .editor__icon-btn--danger:hover:not(:disabled) {
      border-color: var(--color-destructive, #b00);
      color: var(--color-destructive, #b00);
    }

    /* ── Cells ── */
    .editor__name-cell {
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      min-width: 0;
    }

    .editor__photo {
      width: 1.75rem;
      height: 1.75rem;
      flex: 0 0 1.75rem;
      object-fit: cover;
      border: 1px solid var(--color-rule);
    }

    .editor__photo--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
      font-size: 0.75rem;
    }

    /* Photo cell in dedicated photo column */
    .editor__photo-cell {
      width: 2.5rem;
      height: 2rem;
      object-fit: cover;
      border: 1px solid var(--color-rule);
    }

    .editor__photo-cell--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
      font-size: 0.75rem;
      border: 1px dashed var(--color-rule);
    }

    .editor__col-photo {
      width: 3rem;
    }

    .editor__name-body {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
      flex: 1 1 auto;
    }

    .editor__name {
      color: var(--color-ink);
      font-size: 0.78rem;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .editor__sku {
      color: var(--color-muted);
      font-size: 0.65rem;
      line-height: 1.2;
    }

    .editor__catalog-badge {
      display: inline-block;
      width: fit-content;
      padding: 0.08rem 0.25rem;
      border: 1px solid var(--color-rule);
      color: var(--color-muted);
      font-size: 0.58rem;
      line-height: 1.2;
    }

    .editor__cell-value {
      color: var(--color-muted);
      font-size: 0.7rem;
    }

    /* ── Fields ── */
    .editor__field {
      width: 100%;
      min-width: 0;
      height: 1.45rem;
      box-sizing: border-box;
      padding: 0 0.3rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
      color: var(--color-ink);
      font-size: 0.72rem;
      border-radius: 2px;
    }

    .editor__field--muted {
      color: var(--color-muted);
    }
    .editor__field--num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .editor__field--sum {
      font-weight: 600;
    }
    .editor__field:disabled {
      opacity: 0.55;
    }

    .editor__stepper {
      display: grid;
      grid-template-columns: 1.35rem minmax(0, 1fr) 1.35rem;
      gap: 0.12rem;
      align-items: center;
    }

    .editor__optional {
      display: inline-flex;
      margin: 0;
      cursor: pointer;
    }

    /* ── Footer ── */
    .editor__footer {
      flex: 0 0 auto;
      padding: 0.15rem 0;
      border-top: 1px dashed var(--color-rule);
      text-align: center;
    }

    .sr-only {
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
  `,
})
export class ProposalCreateTableEditorComponent {
  // ── Inputs ──
  readonly lines = input<ProposalDraftLine[]>([]);
  readonly total = input(0);
  readonly readOnly = input(false);
  readonly tableLayout = input<ProposalTableLayoutColumn[]>([]);
  readonly tableTemplateId = input<string | null>(null);
  readonly tableTargets = input<ProposalTableTarget[]>([]);
  readonly selectedTableTargetId = input<string | null>(null);

  // ── Outputs ──
  readonly lineChange = output<ProposalCompositionLineChange>();
  readonly addCustom = output<void>();
  readonly openProducts = output<void>();
  readonly remove = output<number>();
  readonly move = output<{ index: number; direction: -1 | 1 }>();
  readonly editLine = output<number>();
  readonly rowAction = output<{ index: number; action: ProposalRowAction }>();
  readonly tableLayoutChange = output<ProposalTableLayoutColumn[]>();
  readonly commercialColumnsRequest = output<void>();
  readonly openTableTemplate = output<void>();
  readonly tableTargetChange = output<string>();
  readonly chrome = input<ProposalTableChrome>({ borderWeight: 'normal', headerWeight: 'normal' });
  readonly chromeChange = output<ProposalTableChrome>();
  /** Live KP sheetLayout.tableFontSize (TZ-SALES-373). */
  readonly tableFontSize = input(12);
  readonly tableFontSizeChange = output<number>();

  // ── Local state ──
  protected readonly columnsMenuOpen = signal(false);
  protected readonly moreMenuOpen = signal(false);
  protected readonly columnMenuIndex = signal(-1);
  /** Per-column width overrides in %. */
  protected readonly columnWidths = signal<ColumnWidths>({});

  /** Font size options 8…20 — same binding as «Вид листа». */
  protected readonly tableFontSizeItems = Array.from({ length: 13 }, (_, i) => {
    const n = 8 + i;
    return { id: String(n), label: String(n) };
  });

  protected readonly tableFontSizeValue = computed(() => String(this.tableFontSize() ?? 12));

  /** Drag-and-drop row reordering. */
  protected readonly dragIndex = signal(-1);
  protected readonly dragOverIndex = signal(-1);
  /** At most one open row drawer. */
  protected readonly openRowIndex = signal(-1);
  protected readonly rowMenuIndex = signal(-1);

  protected readonly densityOptions = [
    { value: 'auto' as const, label: 'Авто' },
    { value: 'compact' as const, label: 'Компактная' },
    { value: 'large' as const, label: 'Крупная' },
  ];
  protected readonly emphasisOptions = [
    { value: 'normal' as const, label: 'Обычная' },
    { value: 'accent' as const, label: 'Акцент' },
  ];
  protected readonly photoFitOptions = [
    { value: 'inherit' as const, label: 'Как в таблице' },
    { value: 'contain' as const, label: 'Вписать' },
    { value: 'cover' as const, label: 'Обрезать' },
  ];

  protected readonly drawerColspan = computed(() => this.visibleLayoutColumns().length + 5);

  protected readonly borderLabel = computed(() => {
    const w = this.chrome().borderWeight ?? 'normal';
    return ({ thin: 'Тонкая', normal: 'Обычная', thick: 'Жирная' } as const)[w];
  });

  protected readonly headerLabel = computed(() => {
    const w = this.chrome().headerWeight ?? 'normal';
    return w === 'bold' ? 'Жирный' : 'Обычный';
  });

  // ── Icons ──
  protected readonly minusIcon = Minus;
  protected readonly plusIcon = Plus;
  protected readonly upIcon = ChevronUp;
  protected readonly downIcon = ChevronDown;
  protected readonly trashIcon = Trash2;
  protected readonly pencilIcon = Pencil;
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly moreIcon = MoreHorizontal;
  protected readonly eyeOffIcon = EyeOff;
  protected readonly xIcon = X;

  // ── Visible / hidden columns ──
  private readonly essentialColumnKeys = new Set([
    'productName',
    'quantity',
    'unit',
    'unitPrice',
    'sum',
  ]);

  protected isEssentialColumn(key: string): boolean {
    return this.essentialColumnKeys.has(key);
  }

  protected readonly visibleLayoutColumns = computed(() =>
    this.tableLayout().filter((c) => c.visible || this.isEssentialColumn(c.key)),
  );

  protected readonly hiddenColumns = computed(() =>
    this.tableLayout().filter((c) => !c.visible && !this.isEssentialColumn(c.key)),
  );

  // ── Normalised width (shares remaining space among columns without explicit %) ──
  protected columnWidthPercent(key: string): number {
    const explicit = this.columnWidths()[key];
    if (explicit !== undefined) return explicit;
    const visible = this.visibleLayoutColumns();
    const withWidth = visible.filter((c) => this.columnWidths()[c.key] !== undefined);
    const used = withWidth.reduce((s, c) => s + (this.columnWidths()[c.key] ?? 0), 0);
    const remaining = visible.length - withWidth.length;
    if (remaining <= 0) return 0;
    return Math.max(5, Math.round((100 - used) / remaining));
  }

  // ── Helpers ──

  protected firstVisibleIndex(key: string): boolean {
    const vis = this.visibleLayoutColumns();
    return vis.length > 0 && vis[0].key === key;
  }

  protected lastVisibleIndex(key: string): boolean {
    const vis = this.visibleLayoutColumns();
    return vis.length > 0 && vis[vis.length - 1].key === key;
  }

  protected canEditCatalog(line: ProposalDraftLine): boolean {
    const kind = line.lineKind ?? 'catalog';
    return kind === 'catalog' || kind === 'module' || kind === 'material';
  }

  protected price(value: number): string {
    return formatPrice(Number.isFinite(value) ? value : 0);
  }

  protected lineTotal(line: ProposalDraftLine): number {
    const discount = Math.min(100, Math.max(0, line.discountPercent ?? 0));
    return (
      Math.round((line.quantity * line.unitPrice * (1 - discount / 100) + Number.EPSILON) * 100) /
      100
    );
  }

  protected columnValue(line: ProposalDraftLine, key: string): string {
    if (key === 'index') return '';
    if (key === 'productSku') return line.productSku ?? '';
    return '';
  }

  // ── Column actions ──

  protected toggleColumnsMenu(): void {
    this.columnsMenuOpen.update((v) => !v);
    if (this.columnsMenuOpen()) this.moreMenuOpen.set(false);
  }

  protected toggleMoreMenu(): void {
    this.moreMenuOpen.update((v) => !v);
    if (this.moreMenuOpen()) this.columnsMenuOpen.set(false);
  }

  protected closeMenus(): void {
    this.columnsMenuOpen.set(false);
    this.moreMenuOpen.set(false);
    this.columnMenuIndex.set(-1);
  }

  protected toggleColumnVisibility(key: string): void {
    const layout = this.tableLayout().map((c) =>
      c.key === key ? { ...c, visible: !c.visible } : c,
    );
    this.tableLayoutChange.emit(layout);
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.columnsMenuOpen() && !this.moreMenuOpen() && this.columnMenuIndex() < 0) {
      return;
    }
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (
      t.closest('[data-test="kp-table-editor-columns-dropdown"]') ||
      t.closest('[data-test="kp-table-editor-columns-toggle"]') ||
      t.closest('[data-test="kp-table-editor-more-dropdown"]') ||
      t.closest('[data-test="kp-table-editor-more-toggle"]')
    ) {
      return;
    }
    this.closeMenus();
  }

  @HostListener('document:keydown.escape')
  protected onDocumentEscape(): void {
    if (this.columnsMenuOpen() || this.moreMenuOpen() || this.columnMenuIndex() >= 0) {
      this.closeMenus();
    }
  }

  protected showColumn(key: string): void {
    this.toggleColumnVisibility(key);
  }

  protected hideColumn(key: string): void {
    const layout = this.tableLayout().map((c) => (c.key === key ? { ...c, visible: false } : c));
    this.tableLayoutChange.emit(layout);
  }

  // ── Drag-and-drop ──

  protected onDragStart(event: DragEvent, index: number): void {
    if (this.readOnly()) return;
    this.dragIndex.set(index);
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', String(index));
  }

  protected onDragOver(event: DragEvent, index: number): void {
    if (this.readOnly() || this.dragIndex() < 0) return;
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverIndex.set(index);
  }

  protected onDragLeave(): void {
    this.dragOverIndex.set(-1);
  }

  protected onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const fromIndex = this.dragIndex();
    this.dragIndex.set(-1);
    this.dragOverIndex.set(-1);
    if (this.readOnly() || fromIndex < 0 || fromIndex === targetIndex) return;
    this.openRowIndex.set(-1);
    const direction = fromIndex < targetIndex ? 1 : -1;
    const steps = Math.abs(targetIndex - fromIndex);
    for (let i = 0; i < steps; i++) {
      this.move.emit({ index: fromIndex, direction });
    }
  }

  protected moveLayoutColumn(key: string, direction: -1 | 1): void {
    const layout = [...this.tableLayout()];
    const idx = layout.findIndex((c) => c.key === key);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= layout.length) return;
    [layout[idx], layout[target]] = [layout[target], layout[idx]];
    this.tableLayoutChange.emit(layout);
  }

  protected setColumnWidth(key: string, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(raw)) return;
    const pct = Math.min(80, Math.max(5, Math.round(raw)));
    this.columnWidths.update((w) => ({ ...w, [key]: pct }));
  }

  protected resetWidths(): void {
    this.columnWidths.set({});
  }

  protected cycleBorderWeight(): void {
    const order: Array<ProposalTableChrome['borderWeight']> = ['thin', 'normal', 'thick'];
    const cur = this.chrome().borderWeight ?? 'normal';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    this.chromeChange.emit({ ...this.chrome(), borderWeight: next });
  }

  protected toggleHeaderWeight(): void {
    const cur = this.chrome().headerWeight ?? 'normal';
    const next = cur === 'bold' ? 'normal' : 'bold';
    this.chromeChange.emit({ ...this.chrome(), headerWeight: next });
  }

  protected onTableFontSizeChange(raw: string): void {
    if (this.readOnly()) return;
    const n = Number(raw);
    const value = Number.isFinite(n) ? Math.min(20, Math.max(8, Math.round(n))) : 12;
    this.tableFontSizeChange.emit(value);
  }

  protected addCommercialColumns(): void {
    this.commercialColumnsRequest.emit();
  }

  // ── Edit handlers ──

  protected stepQuantity(index: number, delta: number): void {
    const line = this.lines()[index];
    if (!line || this.readOnly()) return;
    this.lineChange.emit({
      index,
      patch: { quantity: Math.max(0.001, line.quantity + delta) },
    });
  }

  protected quantityChanged(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value))
      this.lineChange.emit({
        index,
        patch: { quantity: Math.max(0.001, value) },
      });
  }

  protected priceChanged(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value))
      this.lineChange.emit({
        index,
        patch: { unitPrice: Math.max(0, Math.round(value * 100) / 100) },
      });
  }

  protected sumChanged(index: number, event: Event): void {
    const line = this.lines()[index];
    if (!line || this.readOnly()) return;
    const sum = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(sum) || sum < 0) return;
    const qty = Math.max(0.001, line.quantity);
    const discount = Math.min(100, Math.max(0, line.discountPercent ?? 0));
    const factor = 1 - discount / 100;
    const denom = qty * (factor <= 0 ? 1 : factor);
    const unitPrice = Math.max(0, Math.round((sum / denom) * 100) / 100);
    this.lineChange.emit({ index, patch: { unitPrice } });
  }

  protected nameChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: {
        productName: (event.target as HTMLInputElement).value.trim() || 'Своя строка',
      },
    });
  }

  protected skuChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: { productSku: (event.target as HTMLInputElement).value.trim() || undefined },
    });
  }

  protected descriptionChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: {
        description: (event.target as HTMLInputElement).value.trim() || undefined,
      },
    });
  }

  protected unitChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: {
        unit: (event.target as HTMLInputElement).value.trim() || undefined,
      },
    });
  }

  protected discountChanged(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value)) {
      this.lineChange.emit({
        index,
        patch: { discountPercent: Math.min(100, Math.max(0, value)) },
      });
    }
  }

  protected optionalChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: { isOptional: (event.target as HTMLInputElement).checked },
    });
  }

  // ── Row presentation drawer (TZ-SALES-370) ──

  protected resolvedPresentation(line: ProposalDraftLine): Required<ProposalRowPresentation> {
    const raw = line.rowPresentation ?? {};
    return {
      density: raw.density ?? DEFAULT_ROW_PRESENTATION.density,
      emphasis: raw.emphasis ?? DEFAULT_ROW_PRESENTATION.emphasis,
      separatorBefore: raw.separatorBefore === true,
      pageBreakBefore: raw.pageBreakBefore === true,
      showDescription: raw.showDescription !== false,
      photoFit: raw.photoFit ?? DEFAULT_ROW_PRESENTATION.photoFit,
    };
  }

  protected hasCustomPresentation(line: ProposalDraftLine): boolean {
    const p = this.resolvedPresentation(line);
    return (
      p.density !== 'auto' ||
      p.emphasis !== 'normal' ||
      p.separatorBefore ||
      p.pageBreakBefore ||
      !p.showDescription ||
      p.photoFit !== 'inherit'
    );
  }

  protected presentationTooltip(line: ProposalDraftLine): string {
    const p = this.resolvedPresentation(line);
    const parts: string[] = [];
    if (p.density !== 'auto') {
      parts.push(p.density === 'compact' ? 'компактная высота' : 'крупная высота');
    }
    if (p.emphasis === 'accent') parts.push('акцент');
    if (p.separatorBefore) parts.push('разделитель сверху');
    if (p.pageBreakBefore) parts.push('с новой страницы');
    if (!p.showDescription) parts.push('без описания на бланке');
    if (p.photoFit === 'contain') parts.push('фото: вписать');
    if (p.photoFit === 'cover') parts.push('фото: обрезать');
    return parts.length ? `Особые настройки: ${parts.join(', ')}` : '';
  }

  protected toggleRowDrawer(index: number): void {
    this.openRowIndex.update((current) => (current === index ? -1 : index));
    this.rowMenuIndex.set(-1);
  }

  protected toggleRowMenu(index: number): void {
    this.rowMenuIndex.update((current) => (current === index ? -1 : index));
  }

  protected emitRowAction(index: number, action: ProposalRowAction): void {
    this.rowMenuIndex.set(-1);
    this.rowAction.emit({ index, action });
  }

  protected onRemoveRow(index: number): void {
    const open = this.openRowIndex();
    if (open === index) this.openRowIndex.set(-1);
    else if (open > index) this.openRowIndex.set(open - 1);
    this.remove.emit(index);
  }

  protected moveRow(index: number, direction: -1 | 1): void {
    const open = this.openRowIndex();
    const target = index + direction;
    if (open === index) this.openRowIndex.set(target);
    else if (open === target) this.openRowIndex.set(index);
    this.move.emit({ index, direction });
  }

  protected setPresentation(index: number, patch: Partial<ProposalRowPresentation>): void {
    if (this.readOnly()) return;
    const line = this.lines()[index];
    if (!line) return;
    const next = { ...this.resolvedPresentation(line), ...patch };
    const isDefault =
      next.density === 'auto' &&
      next.emphasis === 'normal' &&
      !next.separatorBefore &&
      !next.pageBreakBefore &&
      next.showDescription &&
      next.photoFit === 'inherit';
    this.lineChange.emit({
      index,
      patch: {
        rowPresentation: isDefault ? undefined : next,
      },
    });
  }

  protected onSeparatorToggle(index: number, event: Event): void {
    this.setPresentation(index, {
      separatorBefore: (event.target as HTMLInputElement).checked,
    });
  }

  protected onPageBreakToggle(index: number, event: Event): void {
    this.setPresentation(index, {
      pageBreakBefore: (event.target as HTMLInputElement).checked,
    });
  }

  protected onShowDescriptionToggle(index: number, event: Event): void {
    this.setPresentation(index, {
      showDescription: (event.target as HTMLInputElement).checked,
    });
  }
}
