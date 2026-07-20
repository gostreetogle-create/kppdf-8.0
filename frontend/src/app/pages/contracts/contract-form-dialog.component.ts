import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../core/silent-http';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { Product, ProductsService } from '../../shared/services/products.service';
import { Contract, ContractItem, ContractStatus, ContractsService } from './contracts.service';

type Result = Contract | null | undefined;

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'signed', label: 'Подписан' },
  { value: 'active', label: 'Активен' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
  { value: 'expired', label: 'Истёк' },
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
 * ContractFormDialogComponent — create/edit contract.
 *
 * Backend CreateContractDto requires:
 *   - organizationId  (the "us" side party)
 *   - customerId      (the counterparty — receipt of goods/services)
 *   - items[]         (line items with productId/quantity/unitPrice)
 *
 * Both selects load via their respective services on dialog open.
 * Items FormArray, product picker via ProductsService — same
 * pattern as OrderFormDialog. productName auto-fill on product pick.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-contract-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
  ],
  template: `
    <app-pi-dialog [title]="isEdit() ? 'Редактировать договор' : 'Создать договор'" [width]="'lg'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="contract-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Наша организация"
            htmlFor="ct-org"
            [required]="true"
            [error]="errorFor('organizationId')"
          >
            <select
              id="ct-org"
              formControlName="organizationId"
              class="pi-input w-full"
              [class.border-destructive]="hasError('organizationId')"
            >
              <option value="" disabled>— выберите —</option>
              @for (o of organizations(); track o._id) {
                <option [value]="o._id">{{ o.name }}{{ o.inn ? ' · ИНН ' + o.inn : '' }}</option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Контрагент"
            htmlFor="ct-cp"
            [required]="true"
            [error]="errorFor('customerId')"
          >
            <select
              id="ct-cp"
              formControlName="customerId"
              class="pi-input w-full"
              [class.border-destructive]="hasError('customerId')"
            >
              <option value="" disabled>— выберите —</option>
              @for (cp of counterparties(); track cp._id) {
                <option [value]="cp._id">
                  {{ cp.name }}{{ cp.inn ? ' · ИНН ' + cp.inn : '' }}
                </option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Номер"
            htmlFor="ct-number"
            hint="Если не задан — генерируется автоматически"
          >
            <app-pi-input id="ct-number" formControlName="number" placeholder="Номер договора" />
          </app-pi-form-field>

          <app-pi-form-field label="Название" htmlFor="ct-title">
            <app-pi-input id="ct-title" formControlName="title" placeholder="Название договора" />
          </app-pi-form-field>

          <app-pi-form-field label="Статус" htmlFor="ct-status">
            <select id="ct-status" formControlName="status" class="pi-input w-full">
              @for (opt of STATUS_OPTIONS; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field label="Срок действия" htmlFor="ct-expiresAt">
            <app-pi-input
              id="ct-expiresAt"
              type="text"
              formControlName="expiresAt"
              placeholder="ГГГГ-ММ-ДД"
            />
          </app-pi-form-field>

          <app-pi-form-field label="Пакет / тег" htmlFor="ct-packageTag">
            <app-pi-input id="ct-packageTag" formControlName="packageTag" placeholder="Тег" />
          </app-pi-form-field>
        </div>

        <!-- ─── Items ─── -->
        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <p class="eyebrow">Позиции <span class="text-destructive">*</span></p>
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              (click)="addItem()"
              data-test="add-item"
            >
              + Добавить позицию
            </app-pi-button>
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
                  <select
                    [attr.id]="'ct-item-product-' + i"
                    [attr.name]="'item-product-' + i"
                    formControlName="productId"
                    (change)="onProductPick(i, $any($event.target).value)"
                    class="h-8 px-3 text-xs hairline rounded-sm bg-paper pi-focus-ring w-full"
                    [attr.aria-label]="'Продукт ' + (i + 1)"
                  >
                    <option value="" disabled>— выберите —</option>
                    @for (p of products(); track p._id) {
                      <option [value]="p._id">{{ p.name }}{{ p.sku ? ' · ' + p.sku : '' }}</option>
                    }
                  </select>
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

                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  [attr.aria-label]="'Удалить позицию ' + (i + 1)"
                  (click)="removeItem(i)"
                >
                  ×
                </app-pi-button>
              </div>
            }
          </div>
        </div>

        <!-- ─── Notes ─── -->
        <app-pi-form-field label="Заметки" htmlFor="ct-notes">
          <app-pi-textarea
            id="ct-notes"
            formControlName="notes"
            [rows]="2"
            [maxLength]="2000"
            ariaLabel="Заметки"
          />
        </app-pi-form-field>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ContractFormDialogComponent {
  constructor() {
    this.loadLookups();
    if (this.data) {
      this.patchFromData(this.data);
    } else {
      this.addItem();
    }
  }
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ContractsService);
  private readonly orgService = inject(OrganizationsService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly productsService = inject(ProductsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Contract | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly organizations = signal<Organization[]>([]);
  protected readonly counterparties = signal<Counterparty[]>([]);
  protected readonly products = signal<Product[]>([]);

  protected readonly form = this.fb.group({
    organizationId: this.fb.control('', [Validators.required]),
    customerId: this.fb.control('', [Validators.required]),
    number: this.fb.control<string | null>(null),
    title: this.fb.control<string | null>(null, [Validators.maxLength(256)]),
    status: this.fb.control<ContractStatus>('draft'),
    expiresAt: this.fb.control<string | null>(null),
    packageTag: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    items: this.fb.array<ItemFormGroup>([]),
  });

  get itemsArray(): FormArray<ItemFormGroup> {
    return this.form.controls.items as FormArray<ItemFormGroup>;
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

  private patchFromData(c: Contract): void {
    const orgId =
      typeof c.organizationId === 'string' ? c.organizationId : (c.organizationId?._id ?? '');
    const cpId = typeof c.customerId === 'string' ? c.customerId : (c.customerId?._id ?? '');
    this.form.patchValue({
      organizationId: orgId,
      customerId: cpId,
      number: c.number,
      title: c.title ?? null,
      status: c.status ?? 'draft',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : null,
      packageTag: c.packageTag ?? null,
      notes: c.notes ?? null,
    });
    (c.items ?? []).forEach((it) => this.appendItem(it as Partial<ContractItem>));
  }

  addItem(): void {
    this.itemsArray.push(this.createItemGroup({}));
  }

  removeItem(i: number): void {
    this.itemsArray.removeAt(i);
  }

  onProductPick(index: number, productId: string): void {
    const selected = this.products().find((p) => p._id === productId);
    if (!selected) return;
    const group = this.itemsArray.at(index);
    group.controls.productName.setValue(selected.name);
    if (selected.unit && !group.controls.unit.value) {
      group.controls.unit.setValue(selected.unit);
    }
  }

  private createItemGroup(initial: Partial<ContractItem> = {}): ItemFormGroup {
    return this.fb.group({
      productId: this.fb.control(initial.productId ?? '', [Validators.required]),
      productName: this.fb.control<string>(initial.productName ?? ''),
      quantity: this.fb.control(initial.quantity ?? 1, [Validators.required, Validators.min(0)]),
      unit: this.fb.control<string>(initial.unit ?? ''),
      unitPrice: this.fb.control(initial.unitPrice ?? 0, [Validators.required, Validators.min(0)]),
    }) as ItemFormGroup;
  }

  private appendItem(initial: Partial<ContractItem>): void {
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
    if (this.submitting()) return;
    if (this.form.invalid || this.itemsArray.length === 0) {
      this.form.markAllAsTouched();
      if (this.itemsArray.length === 0) {
        this.errorMessage.set('Добавьте хотя бы одну позицию');
      }
      return;
    }
    const v = this.form.getRawValue();
    const items: ContractItem[] = (v.items ?? []).map((i) => ({
      productId: i.productId,
      productName: i.productName || undefined,
      quantity: Number(i.quantity),
      unit: i.unit || undefined,
      unitPrice: Number(i.unitPrice),
    }));

    const payload: Partial<Contract> = {
      organizationId: v.organizationId,
      customerId: v.customerId,
      status: v.status,
      items,
    };
    if (v.number) payload.number = v.number;
    if (v.title) payload.title = v.title;
    if (v.expiresAt) payload.expiresAt = v.expiresAt;
    if (v.packageTag) payload.packageTag = v.packageTag;
    if (v.notes) payload.notes = v.notes;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Договор обновлён' : 'Договор создан');
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
