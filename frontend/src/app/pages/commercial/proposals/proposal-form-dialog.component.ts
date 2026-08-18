import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { PiFormSectionComponent } from '../../../shared/ui/form-section';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../../shared/ui/toast';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  Counterparty,
  CounterpartyService,
} from '../../../shared/services/pi-counterparty.service';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import { Product, ProductsService } from '../../../shared/services/products.service';
import {
  DiscountType,
  Proposal,
  ProposalItem,
  ProposalStatus,
  ProposalsService,
} from '../../../shared/services/pi-proposals.service';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { toOptionalNumber } from '../../../shared/forms/to-optional-number';

type Result = Proposal | null | undefined;

/** Create = null; edit = Proposal; view variant = { proposal, mode:'view' }. */
export type ProposalFormDialogData =
  Proposal | null | { proposal: Proposal; mode: 'view' | 'edit' };

function resolveProposalFormData(data: ProposalFormDialogData): {
  proposal: Proposal | null;
  readOnly: boolean;
} {
  if (data == null) return { proposal: null, readOnly: false };
  if (typeof data === 'object' && 'mode' in data && 'proposal' in data) {
    return { proposal: data.proposal, readOnly: data.mode === 'view' };
  }
  return { proposal: data, readOnly: false };
}

const STATUS_OPTIONS: { value: ProposalStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'sent', label: 'Отправлено' },
  { value: 'accepted', label: 'Оплачена' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'cancelled', label: 'Отменено' },
];

const DISCOUNT_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'none', label: 'Без скидки' },
  { value: 'percent', label: 'Процент' },
  { value: 'amount', label: 'Сумма' },
];

interface ItemFormGroup extends FormGroup {
  controls: {
    productId: FormControl<string>;
    productName: FormControl<string>;
    quantity: FormControl<number>;
    unit: FormControl<string>;
    unitPrice: FormControl<number>;
  };
}

/**
 * ProposalFormDialogComponent — create/edit КП (quotation).
 *
 * SALES-301 thin UI: wraps the existing `QuotationService` CRUD contract
 * (`CreateQuotationDto` requires organizationId + counterpartyId + items[]).
 *
 * IMMUTABILITY (plan §S1): item rows store productName/productSku as an
 * inline SNAPSHOT captured at save time (auto-filled from the picker but
 * never re-fetched on display). unitPrice is the operator-entered deal
 * price — listPrice is reference only.
 *
 * Standalone + OnPush + signal-based. Same structural skeleton as
 * ContractFormDialog / OrderFormDialog.
 */
@Component({
  selector: 'app-proposal-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-dialog [title]="dialogTitle()" [width]="'lg'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="proposal-form"
      >
        <app-pi-form-section title="Основные данные" headingId="proposal-sec-basics" tone="gold">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
            <app-pi-form-field
              label="Наша организация"
              htmlFor="pr-org"
              [required]="true"
              [error]="errorFor('organizationId')"
            >
              <app-pi-overflow-select
                [items]="organizationItems()"
                [value]="form.controls.organizationId.value"
                (valueChange)="onOrganizationChange($event)"
                searchable="auto"
                placeholder="— выберите —"
                ariaLabel="Наша организация"
                dataTest="pr-org"
                [disabled]="readOnly()"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="Контрагент"
              htmlFor="pr-cp"
              [required]="true"
              [error]="errorFor('counterpartyId')"
            >
              <app-pi-overflow-select
                [items]="counterpartyItems()"
                [value]="form.controls.counterpartyId.value"
                (valueChange)="onCounterpartyChange($event)"
                searchable="auto"
                placeholder="— выберите —"
                ariaLabel="Контрагент"
                dataTest="pr-cp"
                [disabled]="readOnly()"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="Номер"
              htmlFor="pr-number"
              hint="Если не задан — генерируется автоматически"
            >
              <app-pi-input id="pr-number" formControlName="number" placeholder="Номер КП" />
            </app-pi-form-field>

            <app-pi-form-field label="Название" htmlFor="pr-title">
              <app-pi-input id="pr-title" formControlName="title" placeholder="Название КП" />
            </app-pi-form-field>

            <app-pi-form-field label="Дата" htmlFor="pr-date">
              <app-pi-input
                id="pr-date"
                type="text"
                formControlName="date"
                placeholder="ГГГГ-ММ-ДД"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Действует до" htmlFor="pr-validUntil">
              <app-pi-input
                id="pr-validUntil"
                type="text"
                formControlName="validUntil"
                placeholder="ГГГГ-ММ-ДД"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Статус" htmlFor="pr-status">
              <select id="pr-status" formControlName="status" class="pi-input w-full">
                @for (opt of STATUS_OPTIONS; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Скидка" htmlFor="pr-discountType">
              <select id="pr-discountType" formControlName="discountType" class="pi-input w-full">
                @for (opt of DISCOUNT_OPTIONS; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Скидка %" htmlFor="pr-discountPercent">
              <app-pi-input
                id="pr-discountPercent"
                type="number"
                formControlName="discountPercent"
                placeholder="0"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Скидка ₽" htmlFor="pr-discountAmount">
              <app-pi-input
                id="pr-discountAmount"
                type="number"
                formControlName="discountAmount"
                placeholder="0"
              />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <!-- ─── Items ─── -->
        <app-pi-form-section title="Позиции" headingId="proposal-sec-items" tone="neutral">
          <div>
            <div class="flex items-baseline justify-between mb-form-row">
              <p class="text-sm font-medium">Позиции <span class="text-destructive">*</span></p>
              @if (!readOnly()) {
                <app-pi-button
                  type="button"
                  variant="outline"
                  size="sm"
                  (click)="addItem()"
                  data-test="add-item"
                >
                  + Добавить позицию
                </app-pi-button>
              }
            </div>

            @if (itemsArray.length === 0) {
              <p class="text-xs text-muted-foreground">
                Нет позиций. Backend требует хотя бы одну. Нажмите «+ Добавить позицию».
              </p>
            }

            <div formArrayName="items" class="space-y-2">
              @for (itemGroup of itemsArray.controls; track $index; let i = $index) {
                <div
                  [formGroupName]="i"
                  class="grid grid-cols-12 gap-2 items-end p-2 hairline rounded-sm bg-paper-2/30"
                  [attr.data-test]="'item-row-' + i"
                >
                  <label class="col-span-12 sm:col-span-5 block">
                    <span class="eyebrow block mb-1.5">Продукт</span>
                    <app-pi-overflow-select
                      [items]="productItems()"
                      [value]="itemGroup.controls.productId.value"
                      (valueChange)="onProductPick(i, $event)"
                      searchable="auto"
                      placeholder="— выберите —"
                      [ariaLabel]="'Продукт ' + (i + 1)"
                      [dataTest]="'pr-item-product-' + i"
                      [disabled]="readOnly()"
                    />
                  </label>

                  <label class="col-span-6 sm:col-span-2 block">
                    <span class="eyebrow block mb-1.5">Кол-во</span>
                    <app-pi-input
                      type="number"
                      formControlName="quantity"
                      size="sm"
                      placeholder="0"
                      [attr.aria-label]="'Количество ' + (i + 1)"
                    />
                  </label>

                  <label class="col-span-6 sm:col-span-2 block">
                    <span class="eyebrow block mb-1.5">Цена ₽</span>
                    <app-pi-input
                      type="number"
                      formControlName="unitPrice"
                      size="sm"
                      placeholder="0"
                      [attr.aria-label]="'Цена за единицу ' + (i + 1)"
                    />
                  </label>

                  <label class="col-span-8 sm:col-span-2 block">
                    <span class="eyebrow block mb-1.5">Ед.</span>
                    <app-pi-input
                      formControlName="unit"
                      size="sm"
                      placeholder="шт"
                      [attr.aria-label]="'Единица ' + (i + 1)"
                    />
                  </label>

                  @if (!readOnly()) {
                    <app-pi-button
                      type="button"
                      variant="destructive"
                      size="icon"
                      [attr.aria-label]="'Удалить позицию ' + (i + 1)"
                      (click)="removeItem(i)"
                      data-test="remove-item"
                    >
                      ×
                    </app-pi-button>
                  }
                </div>
              }
            </div>
          </div>
        </app-pi-form-section>

        <!-- ─── Notes ─── -->
        <app-pi-form-section title="Заметки" headingId="proposal-sec-notes" tone="neutral">
          <app-pi-form-field label="Заметки" htmlFor="pr-notes">
            <app-pi-textarea
              id="pr-notes"
              formControlName="notes"
              [rows]="2"
              [maxLength]="2000"
              ariaLabel="Заметки"
            />
          </app-pi-form-field>
        </app-pi-form-section>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        @if (!readOnly()) {
          <app-pi-button
            type="button"
            variant="default"
            [disabled]="submitting()"
            (click)="onSubmit()"
          >
            {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
          </app-pi-button>
        }
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">
          {{ readOnly() ? 'Закрыть' : 'Отмена' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProposalFormDialogComponent {
  private readonly resolved = resolveProposalFormData(
    inject<ProposalFormDialogData>(PI_DIALOG_DATA),
  );

  constructor() {
    this.loadLookups();
    if (this.proposal) {
      this.patchFromData(this.proposal);
    } else {
      this.addItem();
    }
    if (this.readOnly()) {
      this.form.disable({ emitEvent: false });
    }
  }
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly DISCOUNT_OPTIONS = DISCOUNT_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProposalsService);
  private readonly orgService = inject(OrganizationsService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly productsService = inject(ProductsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly proposal = this.resolved.proposal;

  protected readonly readOnly = signal<boolean>(this.resolved.readOnly);
  protected readonly isEdit = signal<boolean>(this.proposal != null && !this.resolved.readOnly);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly dialogTitle = computed(() => {
    if (this.readOnly()) return 'Просмотр КП (вариант)';
    return this.isEdit() ? 'Редактировать КП' : 'Создать КП';
  });

  protected readonly organizations = signal<Organization[]>([]);
  protected readonly counterparties = signal<Counterparty[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly organizationItems = computed(() =>
    this.organizations().map((o) => ({
      id: o._id,
      label: `${o.name}${o.inn ? ' · ИНН ' + o.inn : ''}`,
    })),
  );
  protected readonly counterpartyItems = computed(() =>
    this.counterparties().map((cp) => ({
      id: cp._id,
      label: `${cp.name}${cp.inn ? ' · ИНН ' + cp.inn : ''}`,
    })),
  );
  protected readonly productItems = computed(() =>
    this.products().map((product) => ({
      id: product._id,
      label: `${product.name}${product.sku ? ' · ' + product.sku : ''}`,
    })),
  );

  protected readonly form = this.fb.group({
    organizationId: this.fb.control('', [Validators.required]),
    counterpartyId: this.fb.control('', [Validators.required]),
    number: this.fb.control<string | null>(null),
    title: this.fb.control<string | null>(null, [Validators.maxLength(256)]),
    date: this.fb.control<string | null>(null),
    validUntil: this.fb.control<string | null>(null),
    status: this.fb.control<ProposalStatus>('draft'),
    discountType: this.fb.control<DiscountType>('none'),
    discountPercent: this.fb.control<number>(0, [Validators.min(0)]),
    discountAmount: this.fb.control<number>(0, [Validators.min(0)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    items: this.fb.array<ItemFormGroup>([]),
  });

  get itemsArray(): FormArray<ItemFormGroup> {
    return this.form.controls.items as FormArray<ItemFormGroup>;
  }

  protected onOrganizationChange(id: string): void {
    this.form.controls.organizationId.setValue(id);
    this.form.controls.organizationId.markAsDirty();
  }

  protected onCounterpartyChange(id: string): void {
    this.form.controls.counterpartyId.setValue(id);
    this.form.controls.counterpartyId.markAsDirty();
  }

  private loadLookups(): void {
    this.orgService.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) {
        this.organizations.set(res.data.items ?? []);
      } else {
        this.organizations.set([]);
      }
    });
    this.counterpartyService.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) {
        this.counterparties.set(res.data.items ?? []);
      } else {
        this.counterparties.set([]);
      }
    });
    this.productsService.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) {
        this.products.set(res.data.items ?? []);
      } else {
        this.products.set([]);
      }
    });
  }

  private patchFromData(p: Proposal): void {
    const orgId =
      typeof p.organizationId === 'string' ? p.organizationId : (p.organizationId?._id ?? '');
    const cpId =
      typeof p.counterpartyId === 'string' ? p.counterpartyId : (p.counterpartyId?._id ?? '');
    this.form.patchValue({
      organizationId: orgId,
      counterpartyId: cpId,
      number: p.number,
      title: p.title ?? null,
      date: p.date ? p.date.slice(0, 10) : null,
      validUntil: p.validUntil ? p.validUntil.slice(0, 10) : null,
      status: p.status ?? 'draft',
      discountType: p.discountType ?? 'none',
      discountPercent: p.discountPercent ?? 0,
      discountAmount: p.discountAmount ?? 0,
      notes: p.notes ?? null,
    });
    (p.items ?? []).forEach((it) => this.appendItem(it as Partial<ProposalItem>));
  }

  addItem(): void {
    this.itemsArray.push(this.createItemGroup({}));
  }

  removeItem(i: number): void {
    this.itemsArray.removeAt(i);
  }

  /**
   * Auto-fill productName/productSku SNAPSHOT when the user picks a product.
   * The snapshot is stored at save time and never re-fetched (immutability
   * rule §S1) — catalog renames do NOT mutate existing КП.
   */
  onProductPick(index: number, productId: string): void {
    if (this.readOnly()) return;
    const group = this.itemsArray.at(index);
    group.controls.productId.setValue(productId);
    const selected = this.products().find((p) => p._id === productId);
    if (!selected) return;
    group.controls.productName.setValue(selected.name);
    if (selected.unit && !group.controls.unit.value) {
      group.controls.unit.setValue(selected.unit);
    }
  }

  private createItemGroup(initial: Partial<ProposalItem> = {}): ItemFormGroup {
    return this.fb.group({
      productId: this.fb.control(initial.productId ?? '', [Validators.required]),
      productName: this.fb.control<string>(initial.productName ?? ''),
      quantity: this.fb.control(initial.quantity ?? 1, [Validators.required, Validators.min(0)]),
      unit: this.fb.control<string>(initial.unit ?? ''),
      unitPrice: this.fb.control(initial.unitPrice ?? 0, [Validators.required, Validators.min(0)]),
    }) as ItemFormGroup;
  }

  private appendItem(initial: Partial<ProposalItem>): void {
    this.itemsArray.push(this.createItemGroup(initial));
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    if (c.errors?.['min']) return `Минимум ${c.errors['min'].min}`;
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.readOnly() || this.submitting()) return;
    if (this.form.invalid || this.itemsArray.length === 0) {
      this.form.markAllAsTouched();
      if (this.itemsArray.length === 0) {
        this.errorMessage.set('Добавьте хотя бы одну позицию');
      }
      return;
    }
    const v = this.form.getRawValue();
    const items: ProposalItem[] = (v.items ?? []).map((i) => ({
      productId: i.productId,
      productName: i.productName || undefined,
      quantity: Number(i.quantity),
      unit: i.unit || undefined,
      unitPrice: Number(i.unitPrice),
    }));

    const discountPercent = toOptionalNumber(v.discountPercent);
    const discountAmount = toOptionalNumber(v.discountAmount);
    const payload: Partial<Proposal> = {
      organizationId: v.organizationId,
      counterpartyId: v.counterpartyId,
      status: v.status,
      discountType: v.discountType,
      ...(discountPercent === undefined ? {} : { discountPercent }),
      ...(discountAmount === undefined ? {} : { discountAmount }),
      items,
    };
    if (v.number) payload.number = v.number;
    if (v.title) payload.title = v.title;
    if (v.date) payload.date = v.date;
    if (v.validUntil) payload.validUntil = v.validUntil;
    if (v.notes) payload.notes = v.notes;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.proposal
      ? this.service.update(this.proposal._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'КП обновлено' : 'КП создано');
        this.ref.close(res.data);
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
