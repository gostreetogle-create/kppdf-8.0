import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Counterparty, Organization, Site } from '@kppdf/data-access';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';

/**
 * TZ-NX-ORDER-WS-HEADER — dumb workspace header: number/status banner,
 * dates, Заказчик/Объект/Наша фирма/КП grid, isPaid checkbox, and the only
 * two live lifecycle CTAs (Подтвердить/Отменить). No facade injection —
 * all state comes in via inputs, all writes go out via outputs;
 * `OrderWorkspaceFacade` owns the actual PATCH/POST + confirm dialogs.
 * `paidToggle` forwards the raw native `Event` unchanged so the page's
 * existing `onPaidToggle` (same since TZ-NX-ORDER-WS-FACADE-SHELL) still
 * reads `event.target` as the real DOM checkbox — no DOM-revert behavior
 * risk from moving the markup into this component.
 *
 * TZ-NX-ORDER-WS-META-INLINE: Заказчик/Объект/Наша фирма became editable
 * `<select>`s + a «+» quick-create button each (was a dead-end «—»/plain
 * name with no write). The «+» buttons only emit — this dumb component has
 * no dialog access (`OrderDetailPage` opens the app-level quick-create
 * dialogs and hands the facade the resulting payload; NX module
 * boundaries don't let a lib import an app).
 */
@Component({
  selector: 'pi-order-ws-header',
  standalone: true,
  imports: [PiStatusBannerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pi-status-banner [tone]="bannerTone()" [message]="statusLabel()" />

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
      <div>
        <div class="text-xs text-muted-foreground">Заказчик</div>
        <div class="flex items-center gap-1.5">
          <select
            class="pi-input w-full"
            data-test="order-meta-counterparty"
            [value]="counterpartyId()"
            [disabled]="savingMeta()"
            (change)="counterpartyIdChange.emit($any($event.target).value)"
          >
            <option value="">Выберите…</option>
            @for (cp of counterparties(); track cp._id) {
              <option [value]="cp._id">{{ cp.name }}</option>
            }
          </select>
          <app-pi-button
            variant="ghost"
            type="button"
            data-test="order-meta-counterparty-add"
            [disabled]="savingMeta()"
            (click)="createCounterparty.emit()"
          >+</app-pi-button>
        </div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Объект</div>
        <div class="flex items-center gap-1.5">
          <select
            class="pi-input w-full"
            data-test="order-meta-site"
            [value]="siteId()"
            [disabled]="savingMeta()"
            (change)="siteIdChange.emit($any($event.target).value)"
          >
            <option value="">Выберите…</option>
            @for (site of sites(); track site._id) {
              <option [value]="site._id">{{ site.name }}</option>
            }
          </select>
          <app-pi-button
            variant="ghost"
            type="button"
            data-test="order-meta-site-add"
            [disabled]="savingMeta()"
            (click)="createSite.emit()"
          >+</app-pi-button>
        </div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Наша фирма</div>
        <div class="flex items-center gap-1.5">
          <select
            class="pi-input w-full"
            data-test="order-meta-organization"
            [value]="organizationId()"
            [disabled]="savingMeta()"
            (change)="organizationIdChange.emit($any($event.target).value)"
          >
            <option value="">Выберите…</option>
            @for (org of organizations(); track org._id) {
              <option [value]="org._id">{{ org.name }}</option>
            }
          </select>
          <app-pi-button
            variant="ghost"
            type="button"
            data-test="order-meta-organization-add"
            [disabled]="savingMeta()"
            (click)="createOrganization.emit()"
          >+</app-pi-button>
        </div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Дата заказа</div>
        <div class="font-medium" data-test="order-date">{{ orderDateLabel() }}</div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-4 mt-4">
      <div class="text-sm">
        <span class="text-muted-foreground">КП: </span>
        @if (quotationId()) {
          <span class="font-medium" data-test="order-quotation">{{ quotationNumber() ?? 'Есть КП' }}</span>
        } @else {
          <span class="font-medium" data-test="order-no-quotation">Без КП</span>
        }
      </div>
      @if (quotationId()) {
        <app-pi-button variant="secondary" type="button" data-test="order-open-studio" (click)="openQuotation.emit()">
          КП в студии
        </app-pi-button>
      }
    </div>

    <label class="flex items-center gap-3 text-sm cursor-pointer select-none mt-4">
      <input
        type="checkbox"
        class="pi-checkbox"
        data-test="order-paid-toggle"
        [checked]="paid()"
        (change)="paidToggle.emit($event)"
      />
      <span>Оплачен</span>
    </label>

    <div class="flex flex-wrap items-center gap-3 mt-4">
      @if (canConfirm()) {
        <app-pi-button
          variant="default"
          type="button"
          data-test="order-confirm"
          [disabled]="confirming()"
          (click)="confirmOrder.emit()"
        >
          {{ confirming() ? 'Подтверждаем…' : 'Подтвердить заказ' }}
        </app-pi-button>
      }
      @if (canCancel()) {
        <app-pi-button
          variant="secondary"
          type="button"
          data-test="order-cancel"
          [disabled]="cancelling()"
          (click)="cancelOrder.emit()"
        >
          {{ cancelling() ? 'Отменяем…' : 'Отменить заказ' }}
        </app-pi-button>
      }
    </div>
  `,
})
export class OrderWsHeaderComponent {
  readonly statusLabel = input('');
  readonly bannerTone = input<'warning' | 'info' | 'destructive' | 'neutral'>('info');
  readonly quotationId = input<string | null>(null);
  readonly quotationNumber = input<string | null>(null);
  readonly paid = input(false);
  readonly confirming = input(false);
  readonly cancelling = input(false);
  readonly canConfirm = input(false);
  readonly canCancel = input(false);
  readonly orderDateLabel = input('—');

  readonly organizations = input<readonly Organization[]>([]);
  readonly counterparties = input<readonly Counterparty[]>([]);
  readonly sites = input<readonly Site[]>([]);
  readonly organizationId = input('');
  readonly counterpartyId = input('');
  readonly siteId = input('');
  readonly savingMeta = input(false);

  readonly paidToggle = output<Event>();
  readonly openQuotation = output<void>();
  readonly confirmOrder = output<void>();
  readonly cancelOrder = output<void>();
  readonly organizationIdChange = output<string>();
  readonly counterpartyIdChange = output<string>();
  readonly siteIdChange = output<string>();
  readonly createOrganization = output<void>();
  readonly createCounterparty = output<void>();
  readonly createSite = output<void>();
}
