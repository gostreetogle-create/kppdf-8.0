import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideAngularModule,
  ChevronDown,
  ChevronUp,
  Minus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { formatPrice } from '../../../shared/util/format';
import type { ProposalDraftLine } from './proposal-product-rail.component';

export interface ProposalCompositionLineChange {
  index: number;
  patch: Partial<ProposalDraftLine>;
}

/**
 * TZ-SALES-355.1 — dense composition table (compact controls, editable sum,
 * vertical reorder on the left, no «База» clutter / no duplicate-row chrome).
 */
@Component({
  selector: 'app-proposal-create-composition',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent],
  template: `
    <section class="composition" data-test="kp-composition-panel">
      <header class="composition__header">
        <div>
          <p class="eyebrow m-0">КП</p>
          <h2 class="composition__title">Состав КП</h2>
          <p class="composition__hint">
            Количество, цена и сумма — здесь. Лист A4 только показывает результат.
          </p>
        </div>
        <div class="composition__header-actions">
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            [disabled]="readOnly()"
            (click)="addCustom.emit()"
            data-test="kp-add-custom-line"
          >
            Своя строка
          </app-pi-button>
          <span class="composition__total" data-test="kp-composition-total">{{
            price(total())
          }}</span>
        </div>
      </header>

      @if (lines().length === 0) {
        <div class="composition__empty" data-test="kp-composition-empty">
          <p>Добавьте изделия из панели «Товары».</p>
          <p>Или нажмите «Своя строка» для услуги, доставки или монтажа.</p>
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            data-test="kp-composition-open-products"
            [disabled]="readOnly()"
            (click)="openProducts.emit()"
          >
            Открыть «Товары»
          </app-pi-button>
        </div>
      } @else {
        <div class="composition__table-wrap" data-test="kp-composition-lines">
          <table class="composition__table">
            <thead>
              <tr>
                <th class="composition__col-move" scope="col">
                  <span class="sr-only">Порядок</span>
                </th>
                <th class="composition__col-num" scope="col">№</th>
                <th class="composition__col-name" scope="col">Наименование</th>
                <th class="composition__col-qty" scope="col">Кол-во</th>
                <th class="composition__col-unit" scope="col">Ед.</th>
                <th class="composition__col-price" scope="col">Цена</th>
                <th class="composition__col-disc" scope="col">%</th>
                <th class="composition__col-sum" scope="col">Сумма</th>
                <th class="composition__col-opt" scope="col" title="Не входит в итог">Опц.</th>
                <th class="composition__col-act" scope="col">
                  <span class="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (line of lines(); track line.productId + '-' + $index; let index = $index) {
                <tr
                  class="composition__row"
                  [class.composition__row--optional]="line.isOptional === true"
                  [attr.data-test]="'kp-composition-line-' + index"
                >
                  <td class="composition__col-move">
                    <div class="composition__move">
                      <button
                        type="button"
                        class="composition__icon-btn"
                        [disabled]="readOnly() || index === 0"
                        (click)="move.emit({ index, direction: -1 })"
                        [attr.aria-label]="'Поднять строку: ' + line.productName"
                        title="Выше"
                      >
                        <lucide-angular [img]="upIcon" [size]="14" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        class="composition__icon-btn"
                        [disabled]="readOnly() || index === lines().length - 1"
                        (click)="move.emit({ index, direction: 1 })"
                        [attr.aria-label]="'Опустить строку: ' + line.productName"
                        title="Ниже"
                      >
                        <lucide-angular [img]="downIcon" [size]="14" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                  <td class="composition__col-num">{{ index + 1 }}</td>
                  <td class="composition__col-name">
                    <div class="composition__name-cell">
                      @if (line.photoUrl) {
                        <img [src]="line.photoUrl" [alt]="" class="composition__photo" />
                      } @else {
                        <span
                          class="composition__photo composition__photo--empty"
                          aria-hidden="true"
                          >□</span
                        >
                      }
                      <div class="composition__name-body">
                        @if (line.lineKind === 'custom') {
                          <input
                            class="composition__field"
                            type="text"
                            [value]="line.productName"
                            [disabled]="readOnly()"
                            (change)="nameChanged(index, $event)"
                            [attr.data-test]="'kp-composition-name-' + index"
                            aria-label="Название своей строки"
                          />
                        } @else {
                          <strong class="composition__name">{{
                            line.productName || 'Без названия'
                          }}</strong>
                          @if (line.productSku) {
                            <span class="composition__sku">{{ line.productSku }}</span>
                          }
                        }
                        <input
                          class="composition__field composition__field--muted"
                          type="text"
                          [value]="line.description || ''"
                          [disabled]="readOnly()"
                          (change)="descriptionChanged(index, $event)"
                          [attr.data-test]="'kp-composition-description-' + index"
                          placeholder="Описание"
                          aria-label="Описание строки"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="composition__col-qty">
                    <div class="composition__stepper">
                      <button
                        type="button"
                        class="composition__icon-btn"
                        [disabled]="readOnly()"
                        (click)="stepQuantity(index, -1)"
                        [attr.aria-label]="'Уменьшить количество: ' + line.productName"
                      >
                        <lucide-angular [img]="minusIcon" [size]="12" aria-hidden="true" />
                      </button>
                      <input
                        class="composition__field composition__field--num"
                        type="number"
                        min="0.001"
                        step="1"
                        [value]="line.quantity"
                        [disabled]="readOnly()"
                        (change)="quantityChanged(index, $event)"
                        [attr.data-test]="'kp-composition-quantity-' + index"
                      />
                      <button
                        type="button"
                        class="composition__icon-btn"
                        [disabled]="readOnly()"
                        (click)="stepQuantity(index, 1)"
                        [attr.aria-label]="'Увеличить количество: ' + line.productName"
                      >
                        <lucide-angular [img]="plusIcon" [size]="12" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                  <td class="composition__col-unit">
                    <input
                      class="composition__field"
                      type="text"
                      [value]="line.unit || ''"
                      [disabled]="readOnly()"
                      (change)="unitChanged(index, $event)"
                      [attr.data-test]="'kp-composition-unit-' + index"
                      aria-label="Единица"
                    />
                  </td>
                  <td class="composition__col-price">
                    <input
                      class="composition__field composition__field--num"
                      type="number"
                      min="0"
                      step="0.01"
                      [value]="line.unitPrice"
                      [disabled]="readOnly()"
                      (change)="priceChanged(index, $event)"
                      [attr.data-test]="'kp-composition-price-' + index"
                      aria-label="Цена за единицу в КП"
                      title="Цена только в этом КП, каталог не меняется"
                    />
                  </td>
                  <td class="composition__col-disc">
                    <input
                      class="composition__field composition__field--num"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      [value]="line.discountPercent || 0"
                      [disabled]="readOnly()"
                      (change)="discountChanged(index, $event)"
                      [attr.data-test]="'kp-composition-discount-' + index"
                      aria-label="Скидка %"
                    />
                  </td>
                  <td class="composition__col-sum">
                    <input
                      class="composition__field composition__field--num composition__field--sum"
                      type="number"
                      min="0"
                      step="0.01"
                      [value]="lineTotal(line)"
                      [disabled]="readOnly()"
                      (change)="sumChanged(index, $event)"
                      [attr.data-test]="'kp-composition-sum-' + index"
                      aria-label="Сумма строки в КП"
                      title="Правка суммы пересчитает цену за ед. только в этом КП"
                    />
                  </td>
                  <td class="composition__col-opt">
                    <label class="composition__optional" title="Не входит в итог">
                      <input
                        type="checkbox"
                        [checked]="line.isOptional === true"
                        [disabled]="readOnly()"
                        (change)="optionalChanged(index, $event)"
                        [attr.data-test]="'kp-composition-optional-' + index"
                      />
                      <span class="sr-only">Не входит в итог</span>
                    </label>
                  </td>
                  <td class="composition__col-act">
                    <div class="composition__actions">
                      @if (canEditCatalog(line)) {
                        <button
                          type="button"
                          class="composition__icon-btn"
                          [disabled]="readOnly()"
                          (click)="editLine.emit(index)"
                          [attr.aria-label]="'Редактировать: ' + line.productName"
                          title="Карточка каталога"
                          [attr.data-test]="'kp-composition-edit-' + index"
                        >
                          <lucide-angular [img]="pencilIcon" [size]="14" aria-hidden="true" />
                        </button>
                      }
                      <button
                        type="button"
                        class="composition__icon-btn composition__icon-btn--danger"
                        [disabled]="readOnly()"
                        (click)="remove.emit(index)"
                        [attr.aria-label]="'Удалить строку: ' + line.productName"
                        title="Убрать из КП"
                        [attr.data-test]="'kp-composition-remove-' + index"
                      >
                        <lucide-angular [img]="trashIcon" [size]="14" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
      height: 100%;
    }
    .composition {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 0.1rem 0.15rem 0.25rem;
      min-height: 0;
      height: 100%;
    }
    .composition__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.65rem;
      flex: 0 0 auto;
    }
    .composition__title {
      margin: 0.05rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.2rem;
      line-height: 1.15;
    }
    .composition__hint {
      margin: 0.25rem 0 0;
      color: var(--color-muted);
      font-size: 0.7rem;
      line-height: 1.35;
      max-width: 26rem;
    }
    .composition__header-actions {
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }
    .composition__total {
      color: var(--color-ink);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      font-size: 0.95rem;
    }
    .composition__empty {
      padding: 1.5rem 1rem;
      border: 1px dashed var(--color-rule);
      text-align: center;
      color: var(--color-ink);
    }
    .composition__empty p {
      margin: 0 0 0.3rem;
      font-size: 0.8125rem;
    }
    .composition__table-wrap {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
    }
    .composition__table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 0.75rem;
    }
    .composition__table thead th {
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
    }
    .composition__row td {
      border-bottom: 1px solid var(--color-rule);
      padding: 0.3rem 0.25rem;
      vertical-align: middle;
    }
    .composition__row--optional {
      background: color-mix(in oklch, var(--color-muted) 7%, transparent);
    }
    .composition__col-move {
      width: 1.75rem;
    }
    .composition__col-num {
      width: 1.75rem;
      text-align: center;
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
    }
    .composition__col-qty {
      width: 6.25rem;
    }
    .composition__col-unit {
      width: 2.75rem;
    }
    .composition__col-price,
    .composition__col-sum {
      width: 5.25rem;
    }
    .composition__col-disc {
      width: 3.25rem;
    }
    .composition__col-opt {
      width: 2rem;
      text-align: center;
    }
    .composition__col-act {
      width: 3.75rem;
    }
    .composition__move,
    .composition__actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
    }
    .composition__actions {
      flex-direction: row;
      justify-content: flex-end;
      gap: 0.15rem;
    }
    .composition__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.35rem;
      height: 1.35rem;
      padding: 0;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
      border-radius: 2px;
    }
    .composition__icon-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .composition__icon-btn--danger:hover:not(:disabled) {
      border-color: var(--color-destructive, #b00);
      color: var(--color-destructive, #b00);
    }
    .composition__name-cell {
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      min-width: 0;
    }
    .composition__photo {
      width: 1.75rem;
      height: 1.75rem;
      flex: 0 0 1.75rem;
      object-fit: cover;
      border: 1px solid var(--color-rule);
    }
    .composition__photo--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
      font-size: 0.75rem;
    }
    .composition__name-body {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
      flex: 1 1 auto;
    }
    .composition__name {
      color: var(--color-ink);
      font-size: 0.78rem;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .composition__sku {
      color: var(--color-muted);
      font-size: 0.65rem;
      line-height: 1.2;
    }
    .composition__field {
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
    .composition__field--muted {
      color: var(--color-muted);
    }
    .composition__field--num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .composition__field--sum {
      font-weight: 600;
    }
    .composition__field:disabled {
      opacity: 0.55;
    }
    .composition__stepper {
      display: grid;
      grid-template-columns: 1.35rem minmax(0, 1fr) 1.35rem;
      gap: 0.12rem;
      align-items: center;
    }
    .composition__optional {
      display: inline-flex;
      margin: 0;
      cursor: pointer;
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
export class ProposalCreateCompositionComponent {
  readonly lines = input<ProposalDraftLine[]>([]);
  readonly total = input(0);
  readonly readOnly = input(false);
  readonly lineChange = output<ProposalCompositionLineChange>();
  readonly addCustom = output<void>();
  readonly openProducts = output<void>();
  readonly remove = output<number>();
  readonly duplicate = output<number>();
  readonly move = output<{ index: number; direction: -1 | 1 }>();
  readonly editLine = output<number>();

  protected readonly minusIcon = Minus;
  protected readonly plusIcon = Plus;
  protected readonly upIcon = ChevronUp;
  protected readonly downIcon = ChevronDown;
  protected readonly trashIcon = Trash2;
  protected readonly pencilIcon = Pencil;

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

  protected stepQuantity(index: number, delta: number): void {
    const line = this.lines()[index];
    if (!line || this.readOnly()) return;
    this.lineChange.emit({ index, patch: { quantity: Math.max(0.001, line.quantity + delta) } });
  }

  protected quantityChanged(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value))
      this.lineChange.emit({ index, patch: { quantity: Math.max(0.001, value) } });
  }

  protected priceChanged(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value))
      this.lineChange.emit({
        index,
        patch: { unitPrice: Math.max(0, Math.round(value * 100) / 100) },
      });
  }

  /** KP-only: editing sum back-calculates unitPrice (catalog listPrice untouched). */
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

  protected descriptionChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: { description: (event.target as HTMLInputElement).value.trim() || undefined },
    });
  }

  protected unitChanged(index: number, event: Event): void {
    this.lineChange.emit({
      index,
      patch: { unit: (event.target as HTMLInputElement).value.trim() || undefined },
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
}
