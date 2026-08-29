import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { SelectOptionComponent } from '../../../shared/ui/select/select-option.component';
import type { Counterparty } from '../../../shared/services/pi-counterparty.service';
import type { Proposal } from '../../../shared/services/pi-proposals.service';
import type { Order } from '../../../shared/services/orders.service';

@Component({
  selector: 'app-studio-panel-data',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldComponent, SelectComponent, SelectOptionComponent],
  template: `
    <p class="mt-3 font-medium text-ink">Данные</p>
    <dl class="mt-3 space-y-3 text-xs">
      <div>
        <dt class="text-muted-foreground">Исполнитель</dt>
        <dd class="text-ink mt-0.5">{{ issuerOrgName() || '…' }}</dd>
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
            @for (q of proposals(); track q._id) {
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
      <p class="mt-2 text-xs text-destructive">{{ contextSaveError() }}</p>
    }
  `,
})
export class StudioPanelDataComponent {
  readonly issuerOrgName = input('');
  readonly counterpartyId = input('');
  readonly quotationId = input('');
  readonly orderId = input('');
  readonly counterparties = input<Counterparty[]>([]);
  readonly proposals = input<Proposal[]>([]);
  readonly orders = input<Order[]>([]);
  readonly contextSaving = input(false);
  readonly contextSaveError = input<string | null>(null);

  readonly counterpartyChange = output<string>();
  readonly quotationChange = output<string>();
  readonly orderChange = output<string>();
}
