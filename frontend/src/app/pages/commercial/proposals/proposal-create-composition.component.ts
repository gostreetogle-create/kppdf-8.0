import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideAngularModule,
  ChevronDown,
  ChevronUp,
  Copy,
  Minus,
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
        </div>
      } @else {
        <div class="composition__list" data-test="kp-composition-lines">
          @for (line of lines(); track line.productId + '-' + $index; let index = $index) {
            <article class="composition__line" [attr.data-test]="'kp-composition-line-' + index">
              <div class="composition__line-heading">
                <div class="composition__identity">
                  @if (line.photoUrl) {
                    <img
                      [src]="line.photoUrl"
                      [alt]="line.productName"
                      class="composition__photo"
                    />
                  } @else {
                    <span class="composition__photo composition__photo--empty" aria-hidden="true"
                      >□</span
                    >
                  }
                  <div class="composition__name-wrap">
                    <strong>{{ line.productName }}</strong>
                    <span
                      >Арт: {{ line.productSku || '—' }} · База: {{ price(line.unitPrice) }}</span
                    >
                  </div>
                </div>
                <strong class="composition__line-total">{{ price(lineTotal(line)) }}</strong>
              </div>

              @if (line.lineKind === 'custom') {
                <label class="composition__custom-field">
                  <span>Название</span>
                  <input
                    class="pi-input"
                    type="text"
                    [value]="line.productName"
                    [disabled]="readOnly()"
                    (change)="nameChanged(index, $event)"
                    [attr.data-test]="'kp-composition-name-' + index"
                  />
                </label>
              }
              <label class="composition__description-field">
                <span>Описание</span>
                <input
                  class="pi-input"
                  type="text"
                  [value]="line.description || ''"
                  [disabled]="readOnly()"
                  (change)="descriptionChanged(index, $event)"
                  [attr.data-test]="'kp-composition-description-' + index"
                />
              </label>

              <div class="composition__fields">
                <label>
                  <span>Количество</span>
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
                </label>
                <label>
                  <span>Цена за ед., ₽</span>
                  <input
                    class="pi-input"
                    type="number"
                    min="0"
                    step="0.01"
                    [value]="line.unitPrice"
                    [disabled]="readOnly()"
                    (change)="priceChanged(index, $event)"
                    [attr.data-test]="'kp-composition-price-' + index"
                  />
                </label>
                <label>
                  <span>Ед. изм.</span>
                  <input
                    class="pi-input"
                    type="text"
                    [value]="line.unit || ''"
                    [disabled]="readOnly()"
                    (change)="unitChanged(index, $event)"
                    [attr.data-test]="'kp-composition-unit-' + index"
                  />
                </label>
                <label>
                  <span>Скидка, %</span>
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
                  />
                </label>
                <label class="composition__optional">
                  <span>Стоимость</span>
                  <span class="composition__checkbox">
                    <input
                      type="checkbox"
                      [checked]="line.isOptional === true"
                      [disabled]="readOnly()"
                      (change)="optionalChanged(index, $event)"
                      [attr.data-test]="'kp-composition-optional-' + index"
                    />
                    Не входит
                  </span>
                </label>
              </div>

              <footer class="composition__actions">
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
              </footer>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
    }
    .composition {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 0.25rem;
      min-height: 0;
    }
    .composition__header,
    .composition__header-actions,
    .composition__line-heading,
    .composition__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
    }
    .composition__title {
      margin: 0.15rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.35rem;
      line-height: 1.1;
    }
    .composition__header-actions {
      justify-content: flex-end;
    }
    .composition__custom-field,
    .composition__description-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .composition__custom-field > span,
    .composition__description-field > span {
      color: var(--color-muted);
      font-size: 0.68rem;
    }
    .composition__checkbox {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--color-ink) !important;
      font-size: 0.72rem !important;
    }
    .composition__total {
      color: var(--color-ink);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
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
    .composition__list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      overflow: auto;
      min-height: 0;
    }
    .composition__line {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 0.7rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 92%, transparent);
    }
    .composition__identity {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }
    .composition__photo {
      width: 2.5rem;
      height: 2.5rem;
      flex: 0 0 2.5rem;
      object-fit: cover;
      border: 1px solid var(--color-rule);
    }
    .composition__photo--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
      font-size: 1.25rem;
    }
    .composition__name-wrap {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 0.15rem;
    }
    .composition__name-wrap strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.85rem;
    }
    .composition__name-wrap span {
      color: var(--color-muted);
      font-size: 0.7rem;
    }
    .composition__line-total {
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .composition__fields {
      display: grid;
      grid-template-columns: 1.2fr 1fr 0.8fr 0.7fr 1fr;
      gap: 0.45rem;
    }
    .composition__fields label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }
    .composition__fields label > span {
      color: var(--color-muted);
      font-size: 0.68rem;
    }
    .composition__stepper {
      display: grid;
      grid-template-columns: 1.5rem minmax(0, 1fr) 1.5rem;
      gap: 0.2rem;
    }
    .composition__step {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
    }
    .composition__step:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
    .composition__actions {
      justify-content: flex-end;
      border-top: 1px solid var(--color-rule);
      padding-top: 0.45rem;
    }
    @media (max-width: 32rem) {
      .composition__fields {
        grid-template-columns: 1fr 1fr;
      }
      .composition__fields label:last-child {
        grid-column: span 2;
      }
    }
  `,
})
export class ProposalCreateCompositionComponent {
  readonly lines = input<ProposalDraftLine[]>([]);
  readonly total = input(0);
  readonly readOnly = input(false);
  readonly lineChange = output<ProposalCompositionLineChange>();
  readonly addCustom = output<void>();
  readonly remove = output<number>();
  readonly duplicate = output<number>();
  readonly move = output<{ index: number; direction: -1 | 1 }>();

  protected readonly minusIcon = Minus;
  protected readonly plusIcon = Plus;
  protected readonly upIcon = ChevronUp;
  protected readonly downIcon = ChevronDown;
  protected readonly copyIcon = Copy;
  protected readonly trashIcon = Trash2;

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
      patch: { productName: (event.target as HTMLInputElement).value.trim() },
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
