import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { SelectComponent, SelectOptionComponent } from '@kppdf/ui/select';
import type { Counterparty, Order, Quotation } from '@kppdf/data-access';

@Component({
  selector: 'pi-studio-data-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldComponent, SelectComponent, SelectOptionComponent],
  template: `
    <div data-test="studio-data-panel">
      <p class="heading">Данные</p>
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
  readonly counterparties = input<Counterparty[]>([]);
  readonly quotations = input<Quotation[]>([]);
  readonly orders = input<Order[]>([]);
  readonly contextSaving = input(false);
  readonly contextSaveError = input<string | null>(null);

  readonly counterpartyChange = output<string>();
  readonly quotationChange = output<string>();
  readonly orderChange = output<string>();
}