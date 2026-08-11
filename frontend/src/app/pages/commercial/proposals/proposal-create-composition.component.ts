import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideAngularModule,
  ChevronDown,
  ChevronUp,
  Copy,
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
 * TZ-SALES-355 — «Состав КП» as a wide table (not a card heap).
 * A4 stays visual-only; qty/price/discount edit lives here.
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
            Здесь правятся количество, цена и скидка. Лист A4 — только превью.
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
          <span class="text-xs text-muted-foreground"
            >Здесь появятся позиции, количество и итог.</span
          >
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
                <th class="composition__col-num" scope="col">№</th>
                <th class="composition__col-name" scope="col">Наименование</th>
                <th class="composition__col-qty" scope="col">Кол-во</th>
                <th class="composition__col-unit" scope="col">Ед.</th>
                <th class="composition__col-price" scope="col">Цена, ₽</th>
                <th class="composition__col-disc" scope="col">Скидка %</th>
                <th class="composition__col-sum" scope="col">Сумма</th>
                <th class="composition__col-opt" scope="col" title="Не входит в стоимость">Опц.</th>
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
                            class="pi-input composition__name-input"
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
                        }
                        <span class="composition__meta"
                          >Арт: {{ line.productSku || '—' }} · База:
                          {{ price(line.unitPrice) }}</span
                        >
                        <input
                          class="pi-input composition__desc-input"
                          type="text"
                          [value]="line.description || ''"
                          [disabled]="readOnly()"
                          (change)="descriptionChanged(index, $event)"
                          [attr.data-test]="'kp-composition-description-' + index"
                          placeholder="Описание (необязательно)"
                          aria-label="Описание строки"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="composition__col-qty">
                    <div class="composition__stepper">
                      <button
                        type="button"
                        class="composition__step"
                        [disabled]="readOnly()"
                        (click)="stepQuantity(index, -1)"
                        [attr.aria-label]="'Уменьшить количество: ' + line.productName"
                      >
                        <lucide-angular [img]="minusIcon" [size]="13" aria-hidden="true" />
                      </button>
                      <input
                        class="pi-input"
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
                        class="composition__step"
                        [disabled]="readOnly()"
                        (click)="stepQuantity(index, 1)"
                        [attr.aria-label]="'Увеличить количество: ' + line.productName"
                      >
                        <lucide-angular [img]="plusIcon" [size]="13" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                  <td class="composition__col-unit">
                    <input
                      class="pi-input"
                      type="text"
                      [value]="line.unit || ''"
                      [disabled]="readOnly()"
                      (change)="unitChanged(index, $event)"
                      [attr.data-test]="'kp-composition-unit-' + index"
                      aria-label="Единица измерения"
                    />
                  </td>
                  <td class="composition__col-price">
                    <input
                      class="pi-input"
                      type="number"
                      min="0"
                      step="0.01"
                      [value]="line.unitPrice"
                      [disabled]="readOnly()"
                      (change)="priceChanged(index, $event)"
                      [attr.data-test]="'kp-composition-price-' + index"
                      aria-label="Цена за единицу"
                    />
                  </td>
                  <td class="composition__col-disc">
                    <input
                      class="pi-input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      [value]="line.discountPercent || 0"
                      [disabled]="readOnly()"
                      (change)="discountChanged(index, $event)"
                      [attr.data-test]="'kp-composition-discount-' + index"
                      aria-label="Скидка в процентах"
                    />
                  </td>
                  <td class="composition__col-sum">
                    <strong class="composition__line-total">{{ price(lineTotal(line)) }}</strong>
                  </td>
                  <td class="composition__col-opt">
                    <label class="composition__optional" title="Не входит в стоимость">
                      <input
                        type="checkbox"
                        [checked]="line.isOptional === true"
                        [disabled]="readOnly()"
                        (change)="optionalChanged(index, $event)"
                        [attr.data-test]="'kp-composition-optional-' + index"
                      />
                      <span class="sr-only">Не входит в стоимость</span>
                    </label>
                  </td>
                  <td class="composition__col-act">
                    <div class="composition__actions">
                      @if (canEditCatalog(line)) {
                        <app-pi-button
                          type="button"
                          variant="ghost"
                          size="sm"
                          [disabled]="readOnly()"
                          (click)="editLine.emit(index)"
                          [attr.aria-label]="'Редактировать изделие: ' + line.productName"
                          title="Редактировать в каталоге"
                          [attr.data-test]="'kp-composition-edit-' + index"
                        >
                          <lucide-angular [img]="pencilIcon" [size]="14" aria-hidden="true" />
                        </app-pi-button>
                      }
                      <app-pi-button
                        type="button"
                        variant="ghost"
                        size="sm"
                        [disabled]="readOnly() || index === 0"
                        (click)="move.emit({ index, direction: -1 })"
                        [attr.aria-label]="'Поднять строку: ' + line.productName"
                        title="Поднять"
                      >
                        <lucide-angular [img]="upIcon" [size]="14" aria-hidden="true" />
                      </app-pi-button>
                      <app-pi-button
                        type="button"
                        variant="ghost"
                        size="sm"
                        [disabled]="readOnly() || index === lines().length - 1"
                        (click)="move.emit({ index, direction: 1 })"
                        [attr.aria-label]="'Опустить строку: ' + line.productName"
                        title="Опустить"
                      >
                        <lucide-angular [img]="downIcon" [size]="14" aria-hidden="true" />
                      </app-pi-button>
                      <app-pi-button
                        type="button"
                        variant="ghost"
                        size="sm"
                        [disabled]="readOnly()"
                        (click)="duplicate.emit(index)"
                        [attr.aria-label]="'Дублировать строку: ' + line.productName"
                        title="Дублировать"
                      >
                        <lucide-angular [img]="copyIcon" [size]="14" aria-hidden="true" />
                      </app-pi-button>
                      <app-pi-button
                        type="button"
                        variant="ghost"
                        size="sm"
                        [disabled]="readOnly()"
                        (click)="remove.emit(index)"
                        [attr.aria-label]="'Удалить строку: ' + line.productName"
                        title="Удалить"
                      >
                        <lucide-angular [img]="trashIcon" [size]="14" aria-hidden="true" />
                      </app-pi-button>
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
      gap: 0.75rem;
      padding: 0.15rem 0.25rem 0.35rem;
      min-height: 0;
      height: 100%;
    }
    .composition__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      flex: 0 0 auto;
    }
    .composition__title {
      margin: 0.1rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.35rem;
      line-height: 1.1;
    }
    .composition__hint {
      margin: 0.35rem 0 0;
      color: var(--color-muted);
      font-size: 0.75rem;
      line-height: 1.35;
      max-width: 28rem;
    }
    .composition__header-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex: 0 0 auto;
    }
    .composition__total {
      color: var(--color-ink);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      font-size: 1rem;
    }
    .composition__empty {
      padding: 2rem 1rem;
      border: 1px dashed var(--color-rule);
      color: var(--color-ink);
      text-align: center;
    }
    .composition__empty p {
      margin: 0 0 0.35rem;
      font-size: 0.875rem;
    }
    .composition__table-wrap {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 96%, transparent);
    }
    .composition__table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 0.8125rem;
    }
    .composition__table thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--color-paper-raised, var(--color-paper, #fff));
      border-bottom: 1px solid var(--color-rule);
      padding: 0.45rem 0.4rem;
      text-align: left;
      color: var(--color-muted);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .composition__row td {
      border-bottom: 1px solid var(--color-rule);
      padding: 0.45rem 0.35rem;
      vertical-align: top;
    }
    .composition__row--optional {
      background: color-mix(in oklch, var(--color-muted) 6%, transparent);
    }
    .composition__col-num {
      width: 2.25rem;
      text-align: center;
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
    }
    .composition__col-name {
      width: auto;
    }
    .composition__col-qty {
      width: 7.5rem;
    }
    .composition__col-unit {
      width: 3.5rem;
    }
    .composition__col-price {
      width: 5.5rem;
    }
    .composition__col-disc {
      width: 4.5rem;
    }
    .composition__col-sum {
      width: 6rem;
      text-align: right;
    }
    .composition__col-opt {
      width: 2.5rem;
      text-align: center;
    }
    .composition__col-act {
      width: 9.5rem;
    }
    .composition__name-cell {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      min-width: 0;
    }
    .composition__photo {
      width: 2.25rem;
      height: 2.25rem;
      flex: 0 0 2.25rem;
      object-fit: cover;
      border: 1px solid var(--color-rule);
    }
    .composition__photo--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
      font-size: 1rem;
    }
    .composition__name-body {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
      flex: 1 1 auto;
    }
    .composition__name {
      color: var(--color-ink);
      font-size: 0.875rem;
      line-height: 1.25;
      font-weight: 600;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .composition__meta {
      color: var(--color-muted);
      font-size: 0.7rem;
      line-height: 1.2;
    }
    .composition__name-input,
    .composition__desc-input {
      width: 100%;
      min-width: 0;
    }
    .composition__desc-input {
      font-size: 0.75rem;
    }
    .composition__stepper {
      display: grid;
      grid-template-columns: 1.4rem minmax(0, 1fr) 1.4rem;
      gap: 0.15rem;
    }
    .composition__step {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
      min-height: 1.75rem;
    }
    .composition__step:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
    .composition__line-total {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      font-size: 0.8125rem;
    }
    .composition__optional {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      cursor: pointer;
    }
    .composition__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.1rem;
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
    .pi-input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
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
  /** Open FullEditor for catalog/module/material without leaving the studio. */
  readonly editLine = output<number>();

  protected readonly minusIcon = Minus;
  protected readonly plusIcon = Plus;
  protected readonly upIcon = ChevronUp;
  protected readonly downIcon = ChevronDown;
  protected readonly copyIcon = Copy;
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
