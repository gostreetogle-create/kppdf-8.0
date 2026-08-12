import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { formatPrice } from '../../../shared/util/format';
import type { ProposalDraftLine } from './proposal-product-rail.component';
import type { ProposalCompositionLineChange } from './proposal-create-composition.component';
import type {
  ProposalTableChrome,
  ProposalTableLayoutColumn,
  ProposalTableTarget,
} from './proposal-create-inspector.component';

/**
 * TZ-SALES-357 — KP Table Studio: A4-width live table editor for this КП instance.
 * Shared TableTemplate stays untouched (copy-on-write layout + chrome only).
 */
@Component({
  selector: 'app-proposal-create-table-studio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LucideAngularModule, ButtonComponent, PiOverflowSelectComponent],
  template: `
    <section
      class="studio"
      data-test="kp-table-studio"
      [attr.data-border]="chrome().borderWeight || 'normal'"
      [attr.data-header]="chrome().headerWeight || 'normal'"
    >
      <header class="studio__header">
        <div>
          <p class="eyebrow m-0">КП</p>
          <h2 class="studio__title">Таблица этого КП</h2>
          <p class="studio__hint">Вид на бланке A4. Общий шаблон в Документах не меняется.</p>
        </div>
      </header>

      @if (tableTargets().length > 1) {
        <app-pi-overflow-select
          [items]="tableTargetItems()"
          [value]="selectedTableTargetId() ?? ''"
          (valueChange)="tableTargetChange.emit($event)"
          searchable="auto"
          placeholder="Выберите таблицу…"
          ariaLabel="Таблица бланка"
          dataTest="kp-table-target"
          [disabled]="readOnly()"
        />
        <p class="studio__target-hint">Выберите таблицу с позициями для настройки.</p>
      }

      <div class="studio__toolbar" data-test="kp-table-studio-toolbar">
        <div class="studio__toolbar-group" role="group" aria-label="Рамка">
          <span class="studio__toolbar-label">Рамка</span>
          @for (weight of borderWeights; track weight.value) {
            <button
              type="button"
              class="studio__chip"
              [class.studio__chip--active]="(chrome().borderWeight || 'normal') === weight.value"
              [disabled]="readOnly()"
              [attr.data-test]="'kp-table-border-' + weight.value"
              (click)="setBorder(weight.value)"
            >
              {{ weight.label }}
            </button>
          }
        </div>
        <div class="studio__toolbar-group" role="group" aria-label="Шапка">
          <span class="studio__toolbar-label">Шапка</span>
          @for (weight of headerWeights; track weight.value) {
            <button
              type="button"
              class="studio__chip"
              [class.studio__chip--active]="(chrome().headerWeight || 'normal') === weight.value"
              [disabled]="readOnly()"
              [attr.data-test]="'kp-table-header-' + weight.value"
              (click)="setHeader(weight.value)"
            >
              {{ weight.label }}
            </button>
          }
        </div>
        <div class="studio__toolbar-actions">
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            data-test="kp-table-add-commercial-columns"
            [disabled]="readOnly()"
            (click)="commercialColumnsRequest.emit()"
          >
            Добавить поля КП (кол-во/цена)
          </app-pi-button>
          <app-pi-button
            type="button"
            variant="ghost"
            size="sm"
            data-test="kp-table-open-template"
            [disabled]="readOnly()"
            (click)="openTableTemplate()"
          >
            Открыть пресет в Документах
          </app-pi-button>
        </div>
      </div>

      <div class="studio__columns" data-test="kp-table-studio-columns">
        @for (column of tableLayout(); track column.key; let index = $index) {
          <div
            class="studio__column"
            [class.studio__column--hidden]="!column.visible"
            [attr.data-test]="'kp-table-column-' + column.key"
          >
            <span class="studio__column-label">{{ column.label }}</span>
            <div class="studio__column-actions">
              <button
                type="button"
                class="studio__icon-btn"
                [disabled]="readOnly() || index === 0"
                [attr.data-test]="'kp-table-left-' + column.key"
                [attr.aria-label]="'Левее ' + column.label"
                (click)="moveColumn(index, -1)"
              >
                <lucide-angular [img]="leftIcon" [size]="14" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="studio__icon-btn"
                [disabled]="readOnly() || index === tableLayout().length - 1"
                [attr.data-test]="'kp-table-right-' + column.key"
                [attr.aria-label]="'Правее ' + column.label"
                (click)="moveColumn(index, 1)"
              >
                <lucide-angular [img]="rightIcon" [size]="14" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="studio__icon-btn"
                [disabled]="readOnly() || (column.visible && visibleColumnCount() === 1)"
                [attr.data-test]="'kp-table-visible-' + column.key"
                [attr.aria-label]="
                  column.visible ? 'Скрыть ' + column.label : 'Показать ' + column.label
                "
                (click)="toggleColumn(index)"
              >
                <lucide-angular
                  [img]="column.visible ? eyeIcon : eyeOffIcon"
                  [size]="14"
                  aria-hidden="true"
                />
                <span class="sr-only">{{ column.visible ? 'Видна' : 'Скрыта' }}</span>
              </button>
              @if (column.visible) {
                <label class="studio__width">
                  <span class="sr-only">Ширина {{ column.label }}, %</span>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    step="1"
                    class="studio__width-input"
                    [value]="columnWidth(column)"
                    [disabled]="readOnly()"
                    [attr.data-test]="'kp-table-width-' + column.key"
                    (change)="widthChanged(index, $event)"
                  />
                  <span aria-hidden="true">%</span>
                </label>
              }
            </div>
          </div>
        }
      </div>

      <div class="studio__live-wrap" data-test="kp-table-studio-live">
        @if (lines().length === 0) {
          <p class="studio__empty">Добавьте позиции в «Состав» — здесь появится живая таблица.</p>
        } @else {
          <table class="studio__live">
            <colgroup>
              @for (column of visibleColumns(); track column.key) {
                <col [style.width.%]="columnWidth(column)" />
              }
            </colgroup>
            <thead>
              <tr>
                @for (column of visibleColumns(); track column.key) {
                  <th scope="col">{{ column.label }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (line of lines(); track line.productId + '-' + $index; let index = $index) {
                <tr [class.studio__row--optional]="line.isOptional === true">
                  @for (column of visibleColumns(); track column.key) {
                    <td [attr.data-col]="column.key">
                      @switch (column.key) {
                        @case ('index') {
                          {{ index + 1 }}
                        }
                        @case ('productName') {
                          <div class="studio__name">
                            <strong>{{ line.productName || 'Без названия' }}</strong>
                            @if (line.description) {
                              <span class="studio__desc">{{ line.description }}</span>
                            }
                          </div>
                        }
                        @case ('quantity') {
                          <input
                            class="studio__cell-input"
                            type="number"
                            min="0.001"
                            step="1"
                            [value]="line.quantity"
                            [disabled]="readOnly()"
                            [attr.data-test]="'kp-studio-qty-' + index"
                            (change)="quantityChanged(index, $event)"
                            aria-label="Количество"
                          />
                        }
                        @case ('unit') {
                          {{ line.unit || '' }}
                        }
                        @case ('unitPrice') {
                          <input
                            class="studio__cell-input"
                            type="number"
                            min="0"
                            step="0.01"
                            [value]="line.unitPrice"
                            [disabled]="readOnly()"
                            [attr.data-test]="'kp-studio-price-' + index"
                            (change)="priceChanged(index, $event)"
                            aria-label="Цена"
                          />
                        }
                        @case ('sum') {
                          {{ price(lineTotal(line)) }}
                        }
                        @case ('productSku') {
                          {{ line.productSku || '' }}
                        }
                        @default {
                          {{ cellFallback(column.key, line, index) }}
                        }
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
      height: 100%;
    }
    .studio {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 0.1rem 0.15rem 0.25rem;
      min-height: 0;
      height: 100%;
    }
    .studio__header {
      flex: 0 0 auto;
    }
    .studio__title {
      margin: 0.05rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.2rem;
      line-height: 1.15;
    }
    .studio__hint,
    .studio__target-hint {
      margin: 0.25rem 0 0;
      color: var(--color-muted);
      font-size: 0.7rem;
      line-height: 1.35;
    }
    .studio__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.55rem 0.85rem;
      padding: 0.55rem 0.65rem;
      background: color-mix(in oklch, var(--color-paper, #fff) 82%, var(--color-rule));
      border: 1px solid var(--color-rule);
      border-radius: 2px;
      flex: 0 0 auto;
    }
    .studio__toolbar-group {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    .studio__toolbar-label {
      font-size: 0.65rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-right: 0.15rem;
    }
    .studio__chip {
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      font-size: 0.72rem;
      padding: 0.2rem 0.45rem;
      cursor: pointer;
      border-radius: 2px;
    }
    .studio__chip--active {
      border-color: var(--color-ink);
      background: color-mix(in oklch, var(--color-paper, #fff) 96%, transparent);
      font-weight: 600;
    }
    .studio__chip:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .studio__toolbar-actions {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-left: auto;
    }
    .studio__columns {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      padding: 0.45rem 0.55rem;
      border: 1px solid var(--color-rule);
      border-radius: 2px;
      background: color-mix(in oklch, var(--color-paper, #fff) 90%, transparent);
      flex: 0 0 auto;
    }
    .studio__column {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.4rem;
      border: 1px solid var(--color-rule);
      border-radius: 2px;
      background: var(--color-paper, #fff);
      max-width: 100%;
    }
    .studio__column--hidden {
      opacity: 0.55;
    }
    .studio__column-label {
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .studio__column-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
    }
    .studio__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      border: 1px solid transparent;
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
      border-radius: 2px;
    }
    .studio__icon-btn:hover:not(:disabled) {
      border-color: var(--color-rule);
    }
    .studio__icon-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .studio__width {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      font-size: 0.65rem;
      color: var(--color-muted);
    }
    .studio__width-input {
      width: 2.6rem;
      padding: 0.1rem 0.2rem;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      font-size: 0.7rem;
      font-variant-numeric: tabular-nums;
    }
    .studio__live-wrap {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      border: 1px solid var(--color-rule);
      border-radius: 2px;
      background: var(--color-paper, #fff);
    }
    .studio__empty {
      margin: 1.25rem;
      text-align: center;
      color: var(--color-muted);
      font-size: 0.8125rem;
    }
    .studio__live {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 0.78rem;
    }
    .studio[data-border='thin'] .studio__live th,
    .studio[data-border='thin'] .studio__live td {
      border-width: 0.5px;
    }
    .studio[data-border='normal'] .studio__live th,
    .studio[data-border='normal'] .studio__live td {
      border-width: 1px;
    }
    .studio[data-border='thick'] .studio__live th,
    .studio[data-border='thick'] .studio__live td {
      border-width: 2px;
    }
    .studio[data-header='bold'] .studio__live th {
      font-weight: 700;
    }
    .studio[data-header='normal'] .studio__live th {
      font-weight: 600;
    }
    .studio__live th,
    .studio__live td {
      border-style: solid;
      border-color: #ccc;
      padding: 0.35rem 0.45rem;
      text-align: left;
      vertical-align: top;
      overflow-wrap: anywhere;
    }
    .studio__live th {
      background: color-mix(in oklch, var(--color-paper, #fff) 88%, var(--color-rule));
    }
    .studio__row--optional {
      opacity: 0.72;
    }
    .studio__name {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .studio__desc {
      color: var(--color-muted);
      font-size: 0.7rem;
    }
    .studio__cell-input {
      width: 100%;
      max-width: 5.5rem;
      padding: 0.15rem 0.25rem;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      font-size: 0.78rem;
      font-variant-numeric: tabular-nums;
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
export class ProposalCreateTableStudioComponent {
  private readonly router = inject(Router);

  readonly lines = input<ProposalDraftLine[]>([]);
  readonly tableLayout = input<ProposalTableLayoutColumn[]>([]);
  readonly chrome = input<ProposalTableChrome>({ borderWeight: 'normal', headerWeight: 'normal' });
  readonly tableTemplateId = input<string | null>(null);
  readonly tableTargets = input<ProposalTableTarget[]>([]);
  readonly selectedTableTargetId = input<string | null>(null);
  readonly readOnly = input(false);

  readonly tableLayoutChange = output<ProposalTableLayoutColumn[]>();
  readonly chromeChange = output<ProposalTableChrome>();
  readonly commercialColumnsRequest = output<void>();
  readonly tableTargetChange = output<string>();
  readonly lineChange = output<ProposalCompositionLineChange>();

  protected readonly leftIcon = ChevronLeft;
  protected readonly rightIcon = ChevronRight;
  protected readonly eyeIcon = Eye;
  protected readonly eyeOffIcon = EyeOff;

  protected readonly borderWeights = [
    { value: 'thin' as const, label: 'тонкая' },
    { value: 'normal' as const, label: 'обычная' },
    { value: 'thick' as const, label: 'жирная' },
  ];
  protected readonly headerWeights = [
    { value: 'normal' as const, label: 'обычная' },
    { value: 'bold' as const, label: 'жирнее' },
  ];

  protected readonly visibleColumnCount = computed(
    () => this.tableLayout().filter((column) => column.visible).length,
  );

  protected readonly visibleColumns = computed(() =>
    this.tableLayout().filter((column) => column.visible),
  );

  protected readonly tableTargetItems = computed(() =>
    this.tableTargets().map((target) => ({ id: target.id, label: target.label })),
  );

  protected price = formatPrice;

  protected columnWidth(column: ProposalTableLayoutColumn): number {
    const visible = this.visibleColumns();
    const explicit = column.widthPercent;
    if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) {
      return Math.min(80, Math.max(5, Math.round(explicit)));
    }
    const equal = visible.length > 0 ? Math.round(100 / visible.length) : 100;
    return equal;
  }

  protected lineTotal(line: ProposalDraftLine): number {
    const discount = Math.min(100, Math.max(0, line.discountPercent ?? 0));
    return Math.round(line.quantity * line.unitPrice * (1 - discount / 100) * 100) / 100;
  }

  protected cellFallback(key: string, line: ProposalDraftLine, index: number): string {
    const normalized = key.trim().toLowerCase();
    if (['index', 'number', '№', 'номер'].includes(normalized)) return String(index + 1);
    if (['productname', 'name', 'title', 'product', 'наименование'].includes(normalized)) {
      return line.productName || '';
    }
    if (['quantity', 'qty', 'count', 'кол-во', 'количество'].includes(normalized)) {
      return String(line.quantity);
    }
    if (['unitprice', 'price', 'unit_price', 'цена'].includes(normalized)) {
      return String(line.unitPrice);
    }
    if (['sum', 'total', 'amount', 'сумма'].includes(normalized)) {
      return this.price(this.lineTotal(line));
    }
    if (['productsku', 'sku', 'article', 'артикул'].includes(normalized)) {
      return line.productSku || '';
    }
    if (['unit', 'ед', 'ед.изм'].includes(normalized)) return line.unit || '';
    return '';
  }

  protected setBorder(borderWeight: NonNullable<ProposalTableChrome['borderWeight']>): void {
    if (this.readOnly()) return;
    this.chromeChange.emit({ ...this.chrome(), borderWeight });
  }

  protected setHeader(headerWeight: NonNullable<ProposalTableChrome['headerWeight']>): void {
    if (this.readOnly()) return;
    this.chromeChange.emit({ ...this.chrome(), headerWeight });
  }

  protected moveColumn(index: number, delta: -1 | 1): void {
    if (this.readOnly()) return;
    const nextIndex = index + delta;
    const current = this.tableLayout();
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;
    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    this.tableLayoutChange.emit(next);
  }

  protected toggleColumn(index: number): void {
    if (this.readOnly()) return;
    const current = this.tableLayout();
    const column = current[index];
    if (!column || (column.visible && this.visibleColumnCount() === 1)) return;
    this.tableLayoutChange.emit(
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, visible: !entry.visible } : entry,
      ),
    );
  }

  protected widthChanged(index: number, event: Event): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    const widthPercent = Number.isFinite(raw) ? Math.min(80, Math.max(5, Math.round(raw))) : 10;
    const current = this.tableLayout();
    this.tableLayoutChange.emit(
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, widthPercent } : entry,
      ),
    );
  }

  protected quantityChanged(index: number, event: Event): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    const quantity = Number.isFinite(raw) && raw > 0 ? raw : 1;
    this.lineChange.emit({ index, patch: { quantity } });
  }

  protected priceChanged(index: number, event: Event): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    const unitPrice = Number.isFinite(raw) && raw >= 0 ? raw : 0;
    this.lineChange.emit({ index, patch: { unitPrice } });
  }

  protected openTableTemplate(): void {
    if (this.readOnly()) return;
    const id = this.tableTemplateId();
    void this.router.navigate(['/doc-constructor/tables'], {
      queryParams: id ? { editId: id } : undefined,
    });
  }
}
