import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import {
  Counterparty,
  CounterpartyService,
} from '../../../shared/services/pi-counterparty.service';
import {
  estimateFamilyTotal,
  type ProposalStatus,
} from '../../../shared/services/pi-proposals.service';
import { formatPrice } from '../../../shared/util/format';
import { extractErrorMessage } from '../../../core/silent-http';
import type { ProposalDraftLine } from './proposal-product-rail.component';

export interface ProposalTableLayoutColumn {
  key: string;
  label: string;
  visible: boolean;
}

export interface ProposalTableTarget {
  id: string;
  templateId: string;
  label: string;
  explicit: boolean;
}

export interface ProposalCreateInspectorState {
  organizationId: string;
  orgMarkupPercent: number;
  dealVatPercent?: number;
  counterpartyId?: string;
  number?: string;
  title?: string;
  date?: string;
  validUntil?: string;
  discountType?: 'none' | 'percent' | 'amount';
  discountPercent?: number;
  discountAmount?: number;
  prepaymentPercent?: number;
  productionDays?: number;
  deliveryDays?: number;
}

export type ProposalCreateStatus = Extract<ProposalStatus, 'draft' | 'accepted'>;

/**
 * Right inspector for Create KP (TZ-SALES-315 + TZ-SALES-330).
 * Estimate sum is UI-only preview from draft lines × markup %.
 */
@Component({
  selector: 'app-proposal-create-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <div class="inspector" data-test="kp-create-inspector">
      @if (!tableOnly()) {
        <div class="inspector__lock" data-test="kp-status-lock">
          <span class="text-xs" [class.text-destructive]="status() === 'accepted'">
            {{
              status() === 'accepted'
                ? 'Оплачена · бланк заблокирован'
                : 'Черновик · доступно редактирование'
            }}
          </span>
          @if (status() === 'accepted') {
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              data-test="kp-unlock-paid"
              (click)="statusRequest.emit('draft')"
            >
              Снять «Оплачена»
            </app-pi-button>
          } @else {
            <app-pi-button
              type="button"
              variant="ghost"
              size="sm"
              data-test="kp-mark-paid"
              (click)="statusRequest.emit('accepted')"
            >
              Отметить как «Оплачена»
            </app-pi-button>
          }
        </div>
      }

      @if (!tableOnly()) {
        <section class="inspector__section" data-test="kp-insp-document">
          <div class="inspector__section-heading">
            <h3>Документ</h3>
            <p>Данные на бланке КП</p>
          </div>
          <label
            ><span>Номер КП</span
            ><input
              class="pi-input w-full"
              [value]="number()"
              (change)="onTextChange('number', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-number"
          /></label>
          <label
            ><span>Название</span
            ><input
              class="pi-input w-full"
              [value]="title()"
              (change)="onTextChange('title', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-title"
          /></label>
          <label
            ><span>Дата</span
            ><input
              class="pi-input w-full"
              type="date"
              [value]="date()"
              (change)="onTextChange('date', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-date"
          /></label>
          <label
            ><span>Действует до</span
            ><input
              class="pi-input w-full"
              type="date"
              [value]="validUntil()"
              (change)="onTextChange('validUntil', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-valid-until"
          /></label>
        </section>

        <app-pi-form-field label="Наша фирма (бланк)" htmlFor="kp-insp-org">
          <app-pi-overflow-select
            [items]="organizationItems()"
            [value]="organizationId()"
            (valueChange)="onOrgChange($event)"
            searchable="auto"
            placeholder="— выберите —"
            ariaLabel="Наша фирма"
            dataTest="kp-insp-org"
            [disabled]="readOnly()"
          />
        </app-pi-form-field>

        @if (organizationId()) {
          <app-pi-button
            type="button"
            variant="ghost"
            size="sm"
            data-test="kp-insp-open-org"
            [disabled]="readOnly()"
            (click)="openOrganization()"
          >
            Открыть организацию
          </app-pi-button>
        }

        <app-pi-form-field label="Наценка %" htmlFor="kp-insp-markup">
          <app-pi-input
            id="kp-insp-markup"
            type="number"
            [ngModel]="orgMarkupPercent()"
            (ngModelChange)="onMarkupChange($event)"
            [disabled]="readOnly()"
            data-test="kp-insp-markup"
          />
        </app-pi-form-field>

        <p class="inspector__markup-hint">Меняет цены только в этом КП; каталог не трогаем.</p>

        <app-pi-form-field label="НДС %" htmlFor="kp-insp-vat">
          <app-pi-input
            id="kp-insp-vat"
            type="number"
            [ngModel]="dealVatPercent()"
            (ngModelChange)="onVatChange($event)"
            [disabled]="readOnly()"
            data-test="kp-insp-vat"
          />
        </app-pi-form-field>

        <section class="inspector__section" data-test="kp-insp-discount">
          <div class="inspector__section-heading">
            <h3>Деньги</h3>
            <p>Скидка действует только в этом КП</p>
          </div>
          <label
            ><span>Тип скидки</span
            ><select
              class="pi-input w-full"
              [value]="discountType()"
              (change)="onDiscountTypeChange($event)"
              [disabled]="readOnly()"
              data-test="kp-insp-discount-type"
            >
              <option value="none">Нет скидки</option>
              <option value="percent">Процент</option>
              <option value="amount">Сумма, ₽</option>
            </select></label
          >
          @if (discountType() === 'percent') {
            <label
              ><span>Скидка %</span
              ><input
                class="pi-input w-full"
                type="number"
                min="0"
                max="100"
                [value]="discountPercent()"
                (change)="onNumberChange('discountPercent', $event)"
                [disabled]="readOnly()"
                data-test="kp-insp-discount-percent"
            /></label>
          }
          @if (discountType() === 'amount') {
            <label
              ><span>Скидка, ₽</span
              ><input
                class="pi-input w-full"
                type="number"
                min="0"
                [value]="discountAmount()"
                (change)="onNumberChange('discountAmount', $event)"
                [disabled]="readOnly()"
                data-test="kp-insp-discount-amount"
            /></label>
          }
          <app-pi-button
            type="button"
            variant="ghost"
            size="sm"
            [disabled]="readOnly()"
            (click)="resetCommercials()"
            data-test="kp-insp-reset"
            >Сбросить наценку и скидку</app-pi-button
          >
          <div class="inspector__estimate" data-test="kp-insp-estimate">
            <p class="eyebrow m-0">Итого с НДС {{ dealVatPercent() }}%</p>
            <p class="text-base font-mono m-0">{{ estimateLabel() }}</p>
          </div>
        </section>
      }

      @if (tableOnly()) {
        <section class="inspector__table" data-test="kp-insp-table">
          <div class="inspector__section-heading">
            <h3>Таблица</h3>
            <p>Меняет только это КП, не общий шаблон</p>
          </div>
          @if (tableTargets().length > 1) {
            <app-pi-overflow-select
              [items]="tableTargetItems()"
              [value]="selectedTableTargetId() ?? ''"
              (valueChange)="selectTableTarget($event)"
              searchable="auto"
              placeholder="Выберите таблицу…"
              ariaLabel="Таблица бланка"
              dataTest="kp-table-target"
              [disabled]="readOnly()"
            />
            <p class="inspector__table-target-hint">Выберите таблицу с позициями для настройки.</p>
          }
          <div class="inspector__columns">
            @for (column of tableLayout(); track column.key; let index = $index) {
              <div class="inspector__column" [attr.data-test]="'kp-table-column-' + column.key">
                <span class="inspector__column-label">{{ column.label }}</span>
                <span class="inspector__column-actions">
                  <app-pi-button
                    type="button"
                    variant="ghost"
                    size="icon"
                    [disabled]="readOnly() || index === 0"
                    [ariaLabel]="'Левее ' + column.label"
                    [attr.data-test]="'kp-table-left-' + column.key"
                    (click)="moveColumn(index, -1)"
                  >
                    ←
                  </app-pi-button>
                  <app-pi-button
                    type="button"
                    variant="ghost"
                    size="icon"
                    [disabled]="readOnly() || index === tableLayout().length - 1"
                    [ariaLabel]="'Правее ' + column.label"
                    [attr.data-test]="'kp-table-right-' + column.key"
                    (click)="moveColumn(index, 1)"
                  >
                    →
                  </app-pi-button>
                  <app-pi-button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="inspector__visibility"
                    [disabled]="readOnly() || (column.visible && visibleColumnCount() === 1)"
                    [ariaLabel]="
                      column.visible ? 'Скрыть ' + column.label : 'Показать ' + column.label
                    "
                    [attr.data-test]="'kp-table-visible-' + column.key"
                    (click)="toggleColumn(index)"
                  >
                    {{ column.visible ? 'Видна' : 'Скрыта' }}
                  </app-pi-button>
                </span>
              </div>
            }
          </div>
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
            Открыть шаблон таблицы
          </app-pi-button>
        </section>
      }

      @if (!tableOnly()) {
        <section class="inspector__section" data-test="kp-insp-recipient">
          <div class="inspector__section-heading">
            <h3>Получатель</h3>
            <p>{{ selectedRecipient()?.name || 'Клиент не выбран' }}</p>
          </div>
          @if (selectedRecipient(); as recipient) {
            <span class="text-xs text-muted-foreground"
              >ИНН {{ recipient.inn }}{{ recipient.kpp ? ' · КПП ' + recipient.kpp : '' }}</span
            >
          }
          <app-pi-button
            type="button"
            variant="ghost"
            size="sm"
            data-test="kp-insp-edit-recipient"
            [disabled]="readOnly()"
            (click)="recipientEditRequest.emit()"
          >
            Изменить получателя
          </app-pi-button>
        </section>
      }

      @if (!tableOnly()) {
        <section class="inspector__section" data-test="kp-insp-terms">
          <div class="inspector__section-heading">
            <h3>Сроки</h3>
            <p>Значения доступны для бланка и условий</p>
          </div>
          <label
            ><span>Предоплата %</span
            ><input
              class="pi-input w-full"
              type="number"
              min="0"
              max="100"
              [value]="prepaymentPercent()"
              (change)="onNumberChange('prepaymentPercent', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-prepayment"
          /></label>
          <label
            ><span>Срок изготовления, дней</span
            ><input
              class="pi-input w-full"
              type="number"
              min="0"
              [value]="productionDays()"
              (change)="onNumberChange('productionDays', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-production-days"
          /></label>
          <label
            ><span>Срок поставки, дней</span
            ><input
              class="pi-input w-full"
              type="number"
              min="0"
              [value]="deliveryDays()"
              (change)="onNumberChange('deliveryDays', $event)"
              [disabled]="readOnly()"
              data-test="kp-insp-delivery-days"
          /></label>
        </section>
      }

      @if (error() && !tableOnly()) {
        <p class="text-xs text-destructive m-0" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
    .inspector {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
      min-height: 0;
      overflow: auto;
    }
    .inspector__lock {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.55rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 90%, transparent);
    }

    .inspector__markup-hint {
      margin: -0.35rem 0 0;
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.7rem;
    }
    .inspector__section,
    .inspector__estimate,
    .inspector__table {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 90%, transparent);
    }
    .inspector__section > label,
    .inspector__section-heading h3,
    .inspector__section-heading p {
      margin: 0;
    }
    .inspector__section > label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.7rem;
    }
    .inspector__section-heading h3 {
      font-size: 0.9rem;
      color: var(--color-ink);
    }
    .inspector__section-heading p {
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.7rem;
    }
    .inspector__table-target-hint {
      margin: -0.35rem 0 0;
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.7rem;
    }
    .inspector__columns {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .inspector__column {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      min-height: 2rem;
      padding: 0.2rem 0.25rem;
      border-bottom: 1px solid var(--color-rule);
    }
    .inspector__column-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.8rem;
    }
    .inspector__column-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex-shrink: 0;
    }
    .inspector__column-actions app-pi-button {
      flex-shrink: 0;
    }

    .inspector__column-actions .inspector__visibility {
      min-width: 4.5rem;
      font-size: 0.7rem;
    }
  `,
})
export class ProposalCreateInspectorComponent implements OnInit {
  private readonly orgs = inject(OrganizationsService);
  private readonly counterparties = inject(CounterpartyService);
  private readonly router = inject(Router);

  readonly draftLines = input<ProposalDraftLine[]>([]);
  readonly tableLayout = input<ProposalTableLayoutColumn[]>([]);
  readonly tableOnly = input(false);
  readonly tableTemplateId = input<string | null>(null);
  readonly tableTargets = input<ProposalTableTarget[]>([]);
  readonly selectedTableTargetId = input<string | null>(null);
  readonly selectedCounterpartyId = input('');
  readonly initialNumber = input('');
  readonly initialTitle = input('');
  readonly initialDate = input('');
  readonly initialValidUntil = input('');
  readonly initialDiscountType = input<'none' | 'percent' | 'amount'>('none');
  readonly initialDiscountPercent = input(0);
  readonly initialDiscountAmount = input(0);
  readonly initialPrepaymentPercent = input(0);
  readonly initialProductionDays = input(0);
  readonly initialDeliveryDays = input(0);
  readonly initialOrganizationId = input('');
  readonly initialOrgMarkupPercent = input(0);
  readonly initialDealVatPercent = input(20);
  readonly readOnly = input(false);
  readonly status = input<ProposalCreateStatus>('draft');
  readonly stateChange = output<ProposalCreateInspectorState>();
  readonly tableLayoutChange = output<ProposalTableLayoutColumn[]>();
  readonly commercialColumnsRequest = output<void>();
  readonly tableTargetChange = output<string>();
  readonly statusRequest = output<ProposalCreateStatus>();
  readonly recipientEditRequest = output<void>();

  protected readonly organizations = signal<Organization[]>([]);
  protected readonly counterpartiesList = signal<Counterparty[]>([]);
  protected readonly organizationId = signal('');
  protected readonly orgMarkupPercent = signal(0);
  protected readonly dealVatPercent = signal(20);
  protected readonly number = signal('');
  protected readonly title = signal('');
  protected readonly date = signal('');
  protected readonly validUntil = signal('');
  protected readonly discountType = signal<'none' | 'percent' | 'amount'>('none');
  protected readonly discountPercent = signal(0);
  protected readonly discountAmount = signal(0);
  protected readonly prepaymentPercent = signal(0);
  protected readonly productionDays = signal(0);
  protected readonly deliveryDays = signal(0);
  protected readonly error = signal<string | null>(null);

  private readonly syncInitialState = effect(() => {
    this.organizationId.set(this.initialOrganizationId());
    this.orgMarkupPercent.set(this.initialOrgMarkupPercent());
    this.dealVatPercent.set(this.initialDealVatPercent());
    this.number.set(this.initialNumber());
    this.title.set(this.initialTitle());
    this.date.set(this.initialDate());
    this.validUntil.set(this.initialValidUntil());
    this.discountType.set(this.initialDiscountType());
    this.discountPercent.set(this.initialDiscountPercent());
    this.discountAmount.set(this.initialDiscountAmount());
    this.prepaymentPercent.set(this.initialPrepaymentPercent());
    this.productionDays.set(this.initialProductionDays());
    this.deliveryDays.set(this.initialDeliveryDays());
  });

  protected readonly organizationItems = computed(() =>
    this.organizations().map((o) => ({
      id: o._id,
      label: `${o.name}${o.inn ? ' · ИНН ' + o.inn : ''}`,
    })),
  );

  protected readonly selectedRecipient = computed(
    () =>
      this.counterpartiesList().find((item) => item._id === this.selectedCounterpartyId()) ?? null,
  );

  protected readonly counterpartyItems = computed(() =>
    this.counterpartiesList().map((counterparty) => ({
      id: counterparty._id,
      label: `${counterparty.name}${counterparty.inn ? ' · ИНН ' + counterparty.inn : ''}`,
    })),
  );

  protected readonly estimateLabel = computed(() => {
    const base = this.draftLines().reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const marked = estimateFamilyTotal(base, this.orgMarkupPercent());
    const total =
      this.discountType() === 'percent'
        ? marked * (1 - Math.min(100, this.discountPercent()) / 100)
        : this.discountType() === 'amount'
          ? Math.max(0, marked - this.discountAmount())
          : marked;
    return formatPrice(Math.round(total * 100) / 100);
  });

  protected readonly visibleColumnCount = computed(
    () => this.tableLayout().filter((column) => column.visible).length,
  );

  protected readonly tableTargetItems = computed(() =>
    this.tableTargets().map((target) => ({ id: target.id, label: target.label })),
  );

  ngOnInit(): void {
    this.orgs.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error));
        this.organizations.set([]);
        return;
      }
      this.organizations.set(res.data.items ?? []);
    });
    // Client means any active Counterparty: do not send a role/type filter.
    this.counterparties.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) return;
      this.counterpartiesList.set((res.data.items ?? []).filter((item) => item.isActive !== false));
    });
  }

  protected onOrgChange(id: string): void {
    if (this.readOnly()) return;
    this.organizationId.set(id);
    this.emitState();
  }

  protected onMarkupChange(raw: string | number): void {
    if (this.readOnly()) return;
    const n = Number(raw);
    this.orgMarkupPercent.set(Number.isFinite(n) ? n : 0);
    this.emitState();
  }

  protected onCounterpartyChange(id: string): void {
    if (this.readOnly()) return;
    this.emitState(id);
  }

  protected onVatChange(raw: string | number): void {
    if (this.readOnly()) return;
    const n = Number(raw);
    this.dealVatPercent.set(Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0);
    this.emitState();
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

  protected selectTableTarget(id: string): void {
    if (this.readOnly()) return;
    if (this.tableTargets().some((target) => target.id === id)) {
      this.tableTargetChange.emit(id);
    }
  }

  protected openOrganization(): void {
    if (this.readOnly()) return;
    const id = this.organizationId();
    if (!id) return;
    void this.router.navigate(['/organizations'], { queryParams: { highlight: id } });
  }

  protected openTableTemplate(): void {
    if (this.readOnly()) return;
    const id = this.tableTemplateId();
    void this.router.navigate(['/doc-constructor/tables'], {
      queryParams: id ? { editId: id } : undefined,
    });
  }

  protected onTextChange(field: 'number' | 'title' | 'date' | 'validUntil', event: Event): void {
    if (this.readOnly()) return;
    const value = (event.target as HTMLInputElement).value;
    if (field === 'number') this.number.set(value);
    if (field === 'title') this.title.set(value);
    if (field === 'date') this.date.set(value);
    if (field === 'validUntil') this.validUntil.set(value);
    this.emitState();
  }

  protected onDiscountTypeChange(event: Event): void {
    if (this.readOnly()) return;
    this.discountType.set(
      (event.target as HTMLSelectElement).value as 'none' | 'percent' | 'amount',
    );
    this.emitState();
  }

  protected onNumberChange(
    field:
      | 'discountPercent'
      | 'discountAmount'
      | 'prepaymentPercent'
      | 'productionDays'
      | 'deliveryDays',
    event: Event,
  ): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    const value = Number.isFinite(raw) ? Math.max(0, raw) : 0;
    if (field === 'discountPercent') this.discountPercent.set(Math.min(100, value));
    if (field === 'discountAmount') this.discountAmount.set(value);
    if (field === 'prepaymentPercent') this.prepaymentPercent.set(Math.min(100, value));
    if (field === 'productionDays') this.productionDays.set(Math.round(value));
    if (field === 'deliveryDays') this.deliveryDays.set(Math.round(value));
    this.emitState();
  }

  protected resetCommercials(): void {
    if (this.readOnly()) return;
    this.orgMarkupPercent.set(0);
    this.discountType.set('none');
    this.discountPercent.set(0);
    this.discountAmount.set(0);
    this.emitState();
  }

  private emitState(counterpartyId = this.selectedCounterpartyId()): void {
    this.stateChange.emit({
      organizationId: this.organizationId(),
      orgMarkupPercent: this.orgMarkupPercent(),
      dealVatPercent: this.dealVatPercent(),
      counterpartyId,
      number: this.number(),
      title: this.title(),
      date: this.date(),
      validUntil: this.validUntil(),
      discountType: this.discountType(),
      discountPercent: this.discountPercent(),
      discountAmount: this.discountAmount(),
      prepaymentPercent: this.prepaymentPercent(),
      productionDays: this.productionDays(),
      deliveryDays: this.deliveryDays(),
    });
  }
}
