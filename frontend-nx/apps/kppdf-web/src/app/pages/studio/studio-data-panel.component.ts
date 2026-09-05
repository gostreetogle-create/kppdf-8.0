import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { SelectComponent, SelectOptionComponent } from '@kppdf/ui/select';
import type { Counterparty, Order, Quotation, QuotationStatus } from '@kppdf/data-access';
import { StudioDataVitrinaComponent, type StudioCatalogSelections, type StudioShowcaseKind } from './studio-data-vitrina.component';

/** TOC categories inside the wide «Данные» panel (TZ-NX-DOCSTUDIO-D50). */
export type StudioDataCategory = 'products' | 'whom' | 'links' | 'more';
export type StudioDataPanelMode = 'data' | 'selected';

const DATA_CATEGORIES: readonly { key: StudioDataCategory; label: string }[] = [
  { key: 'products', label: 'Товары' },
  { key: 'whom', label: 'Кому' },
  { key: 'links', label: 'Связи' },
  { key: 'more', label: 'Ещё' },
];

const INSERT_TARGET_LABELS: Record<StudioShowcaseKind, string> = {
  products: 'изделия',
  modules: 'модули',
  parts: 'детали',
  materials: 'материалы',
};

@Component({
  selector: 'pi-studio-data-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldComponent, SelectComponent, SelectOptionComponent, StudioDataVitrinaComponent],
  template: `
    <div data-test="studio-data-panel" [attr.data-panel-mode]="mode()">
      @if (mode() === 'data') {
        <nav class="data-toc" data-test="studio-data-toc" aria-label="Категории данных">
          @for (cat of categories; track cat.key) {
            <button
            type="button"
            class="toc-tab"
            [class.active]="activeCategory() === cat.key"
            [attr.data-test]="'studio-data-toc-' + cat.key"
            [attr.aria-current]="activeCategory() === cat.key ? 'true' : null"
            (click)="activeCategory.set(cat.key)"
          >
            {{ cat.label }}
          </button>
          }
        </nav>
      }

      @switch (mode() === 'selected' ? 'selected' : activeCategory()) {
        @case ('products') {
          <div data-test="studio-data-section-products">
            <pi-studio-data-vitrina [selected]="catalogSelections()" [busy]="catalogWriteBusy()" (catalogChange)="catalogChange.emit($event)" />
          </div>
        }
        @case ('selected') {
          <div data-test="studio-data-section-selected">
            @if (selectedAnchors().length === 0 && catalogChips().length === 0) {
              <p class="empty" data-test="studio-selected-empty">
                Ничего не выбрано — добавьте товары или укажите клиента
              </p>
            } @else {
              <div class="selected" data-test="studio-selected-anchors">
                @for (anchor of selectedAnchors(); track anchor.key) {
                  <dd class="chip"><strong>{{ anchor.label }}</strong><span>{{ anchor.name }}</span></dd>
                }
                @for (chip of catalogChips(); track chip.key) {
                  <dd class="chip" data-test="studio-catalog-chip"><strong>{{ chip.count }} {{ chip.label }}</strong><button type="button" class="chip-remove" (click)="catalogRemove.emit(chip.key)" [attr.aria-label]="'Убрать ' + chip.label">×</button></dd>
                }
              </div>
              <div class="insert-suggest" data-test="studio-insert-suggest">
                @if (insertTargets().length === 0) {
                  <button type="button" class="insert-btn" disabled data-test="studio-insert-disabled">
                    Вставить на лист
                  </button>
                  <p class="insert-hint" data-test="studio-insert-hint">Выберите товары, чтобы вставить таблицу</p>
                } @else {
                  @for (target of insertTargets(); track target.kind) {
                    <button
                      type="button"
                      class="insert-btn"
                      [attr.data-test]="'studio-insert-' + target.kind"
                      (click)="insertTable.emit(target.kind)"
                    >
                      Вставить таблицу «{{ target.label }}»
                    </button>
                  }
                  <p class="insert-hint">На листе появятся строки из выбранных товаров</p>
                }
              </div>
            }
          </div>
        }
        @case ('whom') {
          <dl class="fields" data-test="studio-data-section-whom">
            <div>
              <app-pi-form-field label="Клиент" htmlFor="studio-counterparty-select">
                <app-pi-select
                  id="studio-counterparty-select"
                  size="sm"
                  ariaLabel="Клиент"
                  placeholder="— не выбран —"
                  [disabled]="contextSaving()"
                  [value]="counterpartyId() || null"
                  (valueChange)="counterpartyChange.emit($event ?? '')"
                  data-test="studio-counterparty-select"
                >
                  <app-pi-select-option value="">— не выбран —</app-pi-select-option>
                  @for (cp of counterparties(); track cp._id) {
                    <app-pi-select-option [value]="cp._id">
                      {{ cp.shortName || cp.name }}
                    </app-pi-select-option>
                  }
                </app-pi-select>
              </app-pi-form-field>
            </div>
            <div>
              @if (!payerDisclosureOpen() && !payerId()) {
                <button
                  type="button"
                  class="disclosure-link"
                  data-test="studio-payer-disclosure-toggle"
                  (click)="payerDisclosureOpen.set(true)"
                >
                  Указать плательщика отдельно
                </button>
                <p class="hint">По умолчанию плательщик = клиент.</p>
              } @else {
                <app-pi-form-field label="Плательщик" htmlFor="studio-payer-select">
                  <app-pi-select
                    id="studio-payer-select"
                    size="sm"
                    ariaLabel="Плательщик"
                    placeholder="— не выбран —"
                    [disabled]="contextSaving()"
                    [value]="payerId() || null"
                    (valueChange)="payerChange.emit($event ?? '')"
                    data-test="studio-payer-select"
                  >
                    <app-pi-select-option value="">— не выбран —</app-pi-select-option>
                    @for (cp of counterparties(); track cp._id) {
                      <app-pi-select-option [value]="cp._id">{{ cp.shortName || cp.name }}</app-pi-select-option>
                    }
                  </app-pi-select>
                </app-pi-form-field>
              }
            </div>
          </dl>
        }
        @case ('links') {
          <p class="hint" data-test="studio-links-hint">
            Свяжите лист с КП или заказом — подставятся их номер и строки
          </p>
          <dl class="fields" data-test="studio-data-section-links">
            <div>
              <app-pi-form-field label="КП" htmlFor="studio-quotation-select">
                <app-pi-select
                  id="studio-quotation-select"
                  size="sm"
                  ariaLabel="КП"
                  placeholder="— не выбрано —"
                  [disabled]="contextSaving()"
                  [value]="quotationId() || null"
                  (valueChange)="quotationChange.emit($event ?? '')"
                  data-test="studio-quotation-select"
                >
                  <app-pi-select-option value="">— не выбрано —</app-pi-select-option>
                  @for (q of quotations(); track q._id) {
                    <app-pi-select-option [value]="q._id">{{ q.number }}</app-pi-select-option>
                  }
                </app-pi-select>
              </app-pi-form-field>
            </div>
            @if (showKpStatus()) {
              <div>
                <app-pi-form-field label="Статус КП" htmlFor="studio-quotation-status-select">
                  <app-pi-select
                    id="studio-quotation-status-select"
                    size="sm"
                    ariaLabel="Статус КП"
                    [disabled]="contextSaving()"
                    [value]="quotationStatus() || 'draft'"
                    (valueChange)="onQuotationStatusSelect($event)"
                    data-test="studio-quotation-status-select"
                  >
                    <app-pi-select-option value="draft">Черновик</app-pi-select-option>
                    <app-pi-select-option value="sent">На проверке</app-pi-select-option>
                    <app-pi-select-option value="accepted">Принято</app-pi-select-option>
                  </app-pi-select>
                </app-pi-form-field>
              </div>
            }
            <div>
              <app-pi-form-field label="Заказ" htmlFor="studio-order-select">
                <app-pi-select
                  id="studio-order-select"
                  size="sm"
                  ariaLabel="Заказ"
                  placeholder="— не выбран —"
                  [disabled]="contextSaving()"
                  [value]="orderId() || null"
                  (valueChange)="orderChange.emit($event ?? '')"
                  data-test="studio-order-select"
                >
                  <app-pi-select-option value="">— не выбран —</app-pi-select-option>
                  @for (o of orders(); track o._id) {
                    <app-pi-select-option [value]="o._id">{{ o.number }}</app-pi-select-option>
                  }
                </app-pi-select>
              </app-pi-form-field>
            </div>
          </dl>
        }
        @case ('more') {
          <dl class="fields" data-test="studio-data-section-more">
            <div>
              <app-pi-form-field label="Поставщик" htmlFor="studio-supplier-select">
                <app-pi-select
                  id="studio-supplier-select"
                  size="sm"
                  ariaLabel="Поставщик"
                  placeholder="— не выбран —"
                  [disabled]="contextSaving()"
                  [value]="supplierId() || null"
                  (valueChange)="supplierChange.emit($event ?? '')"
                  data-test="studio-supplier-select"
                >
                  <app-pi-select-option value="">— не выбран —</app-pi-select-option>
                  @for (cp of counterparties(); track cp._id) {
                    <app-pi-select-option [value]="cp._id">{{ cp.shortName || cp.name }}</app-pi-select-option>
                  }
                </app-pi-select>
              </app-pi-form-field>
              <p class="hint">Редко нужен для КП — чаще для других типов документов</p>
            </div>
            <div>
              <dt class="label">Исполнитель</dt>
              <dd class="value" data-test="studio-issuer-readonly">
                {{ issuerOrgName() ? 'Наша фирма: ' + issuerOrgName() : '—' }}
              </dd>
            </div>
          </dl>
        }
      }

      @if (contextSaveError()) {
        <p class="error">{{ contextSaveError() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .data-toc {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 10px;
      }
      .toc-tab {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        border: 1px solid var(--color-rule);
        border-radius: var(--radius-sm);
        background: var(--color-paper-2);
        color: var(--color-ink);
        font-size: 11px;
        cursor: pointer;
      }
      .toc-tab.active {
        background: var(--color-ink);
        color: var(--color-paper);
        border-color: var(--color-ink);
      }
      .toc-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 15px;
        height: 15px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--color-gold-deep);
        color: var(--color-ink);
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
      }
      .fields {
        margin: 12px 0 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-size: 12px;
      }
      .label {
        color: var(--color-muted-foreground);
      }
      .value {
        margin: 2px 0 0;
        color: var(--color-ink);
      }
      .disclosure-link {
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--color-ink);
        font-size: 12px;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }
      .hint {
        margin: 4px 0 0;
        font-size: 11px;
        color: var(--color-muted-foreground);
      }
      .empty {
        margin: 12px 0 0;
        font-size: 12px;
        color: var(--color-muted-foreground);
      }
      .selected { display: flex; flex-direction: column; gap: 5px; margin-top: 12px; }
      .chip { display: flex; gap: 6px; align-items: baseline; margin: 0; padding: 5px 7px; border: 1px solid var(--color-rule); background: var(--color-paper-2); font-size: 11px; }
      .chip strong { color: var(--color-muted-foreground-strong); }
      .chip-remove { margin-left: auto; border: 0; background: transparent; color: var(--color-muted-foreground); cursor: pointer; font-size: 14px; line-height: 1; }
      .insert-suggest { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--color-rule); }
      .insert-btn {
        padding: 7px 10px;
        border: 1px solid var(--color-gold-deep);
        border-radius: var(--radius-sm);
        background: var(--color-paper-2);
        color: var(--color-ink);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
      }
      .insert-btn:hover:not(:disabled) {
        background: var(--color-paper-3);
      }
      .insert-btn:disabled {
        border-color: var(--color-rule);
        opacity: 0.55;
        cursor: not-allowed;
      }
      .insert-hint {
        margin: 0;
        font-size: 11px;
        color: var(--color-muted-foreground);
      }
      .error {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-destructive);
      }
    `,
  ],
})
export class StudioDataPanelComponent {
  readonly mode = input<StudioDataPanelMode>('data');
  readonly issuerOrgName = input('');
  readonly counterpartyId = input('');
  readonly quotationId = input('');
  readonly orderId = input('');
  readonly payerId = input('');
  readonly supplierId = input('');
  readonly counterparties = input<Counterparty[]>([]);
  readonly quotations = input<Quotation[]>([]);
  readonly orders = input<Order[]>([]);
  readonly contextSaving = input(false);
  readonly contextSaveError = input<string | null>(null);
  readonly selectedAnchors = input<readonly { key: string; label: string; name: string }[]>([]);
  readonly catalogChips = input<readonly { key: string; label: string; count: number }[]>([]);
  readonly catalogSelections = input<StudioCatalogSelections>({ products: [], modules: [], parts: [], materials: [] });
  readonly catalogWriteBusy = input(false);
  readonly showKpStatus = input(false);
  readonly quotationStatus = input<QuotationStatus | ''>('');

  readonly counterpartyChange = output<string>();
  readonly quotationChange = output<string>();
  readonly quotationStatusChange = output<QuotationStatus>();
  readonly orderChange = output<string>();
  readonly payerChange = output<string>();
  readonly supplierChange = output<string>();
  readonly catalogRemove = output<string>();
  readonly catalogChange = output<{ kind: StudioShowcaseKind; ids: readonly string[] }>();
  /** TZ-NX-DOCSTUDIO-D52 — «Вставить на лист»: parent creates/focuses the matching table + wires putDataSet. */
  readonly insertTable = output<StudioShowcaseKind>();

  protected readonly categories = DATA_CATEGORIES;
  readonly activeCategory = signal<StudioDataCategory>('products');
  /** TZ-NX-DOCSTUDIO-D53 — Плательщик is a secondary disclosure; shown by default once a value already exists. */
  protected readonly payerDisclosureOpen = signal(false);

  /** «Число позиций»: заполненные party-якоря + сумма count по каждому catalog-чипу (не число групп). */
  protected readonly selectedCount = () =>
    this.selectedAnchors().length + this.catalogChips().reduce((sum, chip) => sum + chip.count, 0);

  /** Only kinds with ≥1 selection are offered — «только совместимые варианты» (D52 AC). */
  protected readonly insertTargets = () => {
    const selections = this.catalogSelections();
    return (['products', 'modules', 'parts', 'materials'] as const)
      .filter((kind) => selections[kind].length > 0)
      .map((kind) => ({ kind, label: INSERT_TARGET_LABELS[kind] }));
  };

  protected onQuotationStatusSelect(value: string | null): void {
    const status = (value ?? 'draft') as QuotationStatus;
    this.quotationStatusChange.emit(status);
  }
}
