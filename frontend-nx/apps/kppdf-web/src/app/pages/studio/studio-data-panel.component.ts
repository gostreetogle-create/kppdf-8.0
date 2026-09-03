import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { SelectComponent, SelectOptionComponent } from '@kppdf/ui/select';
import type { Counterparty, Order, Quotation, QuotationStatus } from '@kppdf/data-access';
import { StudioDataVitrinaComponent, type StudioCatalogSelections, type StudioShowcaseKind } from './studio-data-vitrina.component';

@Component({
  selector: 'pi-studio-data-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldComponent, SelectComponent, SelectOptionComponent, StudioDataVitrinaComponent],
  template: `
    <div data-test="studio-data-panel">
      <p class="heading">Данные</p>
      <pi-studio-data-vitrina [selected]="catalogSelections()" (catalogChange)="catalogChange.emit($event)" />
      @if (selectedAnchors().length > 0 || catalogChips().length > 0) {
        <div class="selected" data-test="studio-selected-anchors">
          <dt class="label">Выбрано</dt>
          @for (anchor of selectedAnchors(); track anchor.key) {
            <dd class="chip"><strong>{{ anchor.label }}</strong><span>{{ anchor.name }}</span></dd>
          }
          @for (chip of catalogChips(); track chip.key) {
            <dd class="chip" data-test="studio-catalog-chip"><strong>{{ chip.count }} {{ chip.label }}</strong><button type="button" class="chip-remove" (click)="catalogRemove.emit(chip.key)" [attr.aria-label]="'Убрать ' + chip.label">×</button></dd>
          }
        </div>
      }
      <dl class="fields">
        <div>
          <dt class="label">Исполнитель</dt>
          <dd class="value">{{ issuerOrgName() || '—' }}</dd>
        </div>
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
              @for (cp of counterparties(); track cp._id) {
                <app-pi-select-option [value]="cp._id">
                  {{ cp.shortName || cp.name }}
                </app-pi-select-option>
              }
            </app-pi-select>
          </app-pi-form-field>
        </div>
        <div>
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
              @for (cp of counterparties(); track cp._id) {
                <app-pi-select-option [value]="cp._id">{{ cp.shortName || cp.name }}</app-pi-select-option>
              }
            </app-pi-select>
          </app-pi-form-field>
        </div>
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
              @for (cp of counterparties(); track cp._id) {
                <app-pi-select-option [value]="cp._id">{{ cp.shortName || cp.name }}</app-pi-select-option>
              }
            </app-pi-select>
          </app-pi-form-field>
        </div>
        <div>
          <app-pi-form-field label="Коммерческое предложение" htmlFor="studio-quotation-select">
            <app-pi-select
              id="studio-quotation-select"
              size="sm"
              ariaLabel="Коммерческое предложение"
              placeholder="— не выбрано —"
              [disabled]="contextSaving()"
              [value]="quotationId() || null"
              (valueChange)="quotationChange.emit($event ?? '')"
              data-test="studio-quotation-select"
            >
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
              @for (o of orders(); track o._id) {
                <app-pi-select-option [value]="o._id">{{ o.number }}</app-pi-select-option>
              }
            </app-pi-select>
          </app-pi-form-field>
        </div>
      </dl>
      @if (contextSaveError()) {
        <p class="error">{{ contextSaveError() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .heading {
        margin: 12px 0 0;
        font-weight: 600;
        color: var(--color-ink);
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
      .selected { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
      .chip { display: flex; gap: 6px; align-items: baseline; margin: 0; padding: 5px 7px; border: 1px solid var(--color-rule); background: var(--color-paper-2); font-size: 11px; }
      .chip strong { color: var(--color-muted-foreground-strong); }
      .chip-remove { margin-left: auto; border: 0; background: transparent; color: var(--color-muted-foreground); cursor: pointer; font-size: 14px; line-height: 1; }
      .error {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-destructive);
      }
    `,
  ],
})
export class StudioDataPanelComponent {
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

  protected onQuotationStatusSelect(value: string | null): void {
    const status = (value ?? 'draft') as QuotationStatus;
    this.quotationStatusChange.emit(status);
  }
}