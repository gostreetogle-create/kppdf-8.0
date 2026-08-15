import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../core/silent-http';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Product, ProductsService } from '../../shared/services/products.service';
import { Site, SiteService } from '../../shared/services/pi-site.service';
import { Order, OrderItem, OrdersService, OrderPriority, OrderStatus } from './orders.service';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
import { Users } from '../users/users.entity';

type Result = Order | null | undefined;

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'confirmed', label: 'Подтверждён' },
  { value: 'in_production', label: 'В производстве' },
  { value: 'ready', label: 'Готов' },
  { value: 'shipped', label: 'Отгружен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

const PRIORITY_OPTIONS: { value: OrderPriority; label: string }[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' },
];

interface OwnerUserOption {
  _id: string;
  displayName?: string;
  username?: string;
  fullName?: string;
}

interface ItemFormGroup extends FormGroup {
  controls: {
    productId: FormControl<string>;
    productName: FormControl<string>;
    quantity: FormControl<number>;
    unit: FormControl<string>;
    unitPrice: FormControl<number>;
    ownerUserId: FormControl<string>;
    plannedShipDate: FormControl<string>;
  };
}

/**
 * OrderFormDialogComponent — create/edit order (TZ-ORDERS-303).
 *
 * Header: заказчик + объект (siteId required), quick-create panel,
 * priority/status/plannedDate. Lines: product, qty, unitPrice, unit,
 * optional ownerUserId + plannedShipDate.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-order-form-dialog',
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
    <app-pi-dialog [title]="isEdit() ? 'Редактировать заказ' : 'Создать заказ'" [width]="'lg'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="order-form"
      >
        <!-- ─── Header ─── -->
        <app-pi-form-section title="Основные данные" headingId="order-sec-basics" tone="gold">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
            <app-pi-form-field
              label="Заказчик"
              htmlFor="ord-cp"
              [required]="true"
              [error]="errorFor('counterpartyId')"
            >
              <app-pi-overflow-select
                [items]="counterpartyItems()"
                [value]="form.controls.counterpartyId.value"
                (valueChange)="onCounterpartyChange($event)"
                searchable="auto"
                placeholder="— выберите —"
                ariaLabel="Заказчик"
                dataTest="ord-cp"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="Объект"
              htmlFor="ord-site"
              [required]="true"
              [error]="errorFor('siteId')"
            >
              <app-pi-overflow-select
                [items]="siteItems()"
                [value]="form.controls.siteId.value"
                (valueChange)="onSiteChange($event)"
                searchable="auto"
                [disabled]="!form.controls.counterpartyId.value"
                [placeholder]="
                  form.controls.counterpartyId.value ? '— выберите —' : 'Сначала заказчик'
                "
                ariaLabel="Объект"
                dataTest="ord-site"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="Номер"
              htmlFor="ord-number"
              hint="Если не задан — генерируется автоматически"
            >
              <app-pi-input id="ord-number" formControlName="number" placeholder="Номер заказа" />
            </app-pi-form-field>

            <app-pi-form-field label="Планируемая дата" htmlFor="ord-plannedDate">
              <app-pi-input
                id="ord-plannedDate"
                type="text"
                formControlName="plannedDate"
                placeholder="ГГГГ-ММ-ДД"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Приоритет" htmlFor="ord-priority">
              <select id="ord-priority" formControlName="priority" class="pi-input w-full">
                @for (opt of PRIORITY_OPTIONS; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Статус" htmlFor="ord-status">
              <select id="ord-status" formControlName="status" class="pi-input w-full">
                @for (opt of STATUS_OPTIONS; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </app-pi-form-field>

            <div class="sm:col-span-2">
              <app-pi-form-field label="Адрес доставки" htmlFor="ord-address">
                <app-pi-input
                  id="ord-address"
                  formControlName="deliveryAddress"
                  placeholder="Адрес доставки"
                />
              </app-pi-form-field>
            </div>
          </div>
        </app-pi-form-section>

        <!-- ─── Quick-create заказчик ─── -->
        <app-pi-form-section
          title="Быстрый заказчик"
          headingId="order-sec-quick-party"
          tone="neutral"
        >
          <div
            class="p-3 hairline rounded-sm bg-paper-2/30 space-y-form-field"
            data-test="order-quick-party"
            [formGroup]="quickForm"
          >
            <p class="text-xs text-muted-foreground m-0">
              Имя, телефон и адрес объекта — создаст заказчика и объект и подставит в заказ.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-form-field">
              <app-pi-form-field label="Имя" htmlFor="ord-qc-name" [required]="true">
                <app-pi-input id="ord-qc-name" formControlName="name" placeholder="ООО … / ИП …" />
              </app-pi-form-field>
              <app-pi-form-field label="Телефон" htmlFor="ord-qc-phone">
                <app-pi-input id="ord-qc-phone" formControlName="phone" placeholder="+7 …" />
              </app-pi-form-field>
              <app-pi-form-field label="Адрес объекта" htmlFor="ord-qc-address" [required]="true">
                <app-pi-input
                  id="ord-qc-address"
                  formControlName="address"
                  placeholder="Город, улица…"
                />
              </app-pi-form-field>
            </div>
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              [disabled]="quickSubmitting()"
              (click)="onQuickCreate()"
              data-test="order-quick-create"
            >
              {{ quickSubmitting() ? 'Создание…' : 'Создать и подставить' }}
            </app-pi-button>
            @if (quickError()) {
              <p role="alert" class="text-xs text-destructive m-0">{{ quickError() }}</p>
            }
          </div>
        </app-pi-form-section>

        <!-- ─── Items ─── -->
        <app-pi-form-section title="Позиции" headingId="order-sec-items" tone="neutral">
          <div>
            <div class="flex items-baseline justify-between mb-form-row">
              <p class="text-sm font-medium">Позиции <span class="text-destructive">*</span></p>
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
                    <app-pi-overflow-select
                      [items]="productItems()"
                      [value]="itemGroup.controls.productId.value"
                      (valueChange)="onProductPick(i, $event)"
                      searchable="auto"
                      placeholder="— выберите —"
                      [ariaLabel]="'Продукт ' + (i + 1)"
                      [dataTest]="'ord-item-product-' + i"
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

                  <label class="col-span-12 sm:col-span-6 block">
                    <span class="eyebrow block mb-1.5">Ответственный</span>
                    <select
                      [attr.id]="'ord-item-owner-' + i"
                      formControlName="ownerUserId"
                      class="h-8 px-3 text-xs hairline rounded-sm bg-paper pi-focus-ring w-full"
                      [attr.aria-label]="'Ответственный ' + (i + 1)"
                    >
                      <option value="">— не назначен —</option>
                      @for (u of users(); track u._id) {
                        <option [value]="u._id">{{ userLabel(u) }}</option>
                      }
                    </select>
                  </label>

                  <label class="col-span-12 sm:col-span-6 block">
                    <span class="eyebrow block mb-1.5">Отгрузка</span>
                    <input
                      type="date"
                      formControlName="plannedShipDate"
                      class="h-8 px-3 text-xs hairline rounded-sm bg-paper pi-focus-ring w-full"
                      [attr.aria-label]="'Дата отгрузки ' + (i + 1)"
                    />
                  </label>
                </div>
              }
            </div>
          </div>
        </app-pi-form-section>

        <!-- ─── Notes ─── -->
        <app-pi-form-section title="Заметки" headingId="order-sec-notes" tone="neutral">
          <app-pi-form-field label="Заметки" htmlFor="ord-notes">
            <app-pi-textarea
              id="ord-notes"
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
export class OrderFormDialogComponent {
  constructor() {
    this.loadLookups();
    if (this.data) {
      this.patchFromData(this.data);
    } else {
      // Fresh order — start with one empty item to satisfy CreateOrderDto.required.
      this.addItem();
    }
  }
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly PRIORITY_OPTIONS = PRIORITY_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(OrdersService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly siteService = inject(SiteService);
  private readonly productsService = inject(ProductsService);
  private readonly usersService = Users.inject();
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Order | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly quickSubmitting = signal<boolean>(false);
  protected readonly quickError = signal<string | null>(null);

  protected readonly counterparties = signal<Counterparty[]>([]);
  protected readonly sites = signal<Site[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly users = signal<OwnerUserOption[]>([]);
  protected readonly counterpartyItems = computed(() =>
    this.counterparties().map((cp) => ({
      id: cp._id,
      label: `${cp.name}${cp.inn ? ' · ИНН ' + cp.inn : ''}`,
    })),
  );
  protected readonly siteItems = computed(() =>
    this.sites().map((site) => ({
      id: site._id,
      label: `${site.name}${site.address ? ' · ' + site.address : ''}`,
    })),
  );
  protected readonly productItems = computed(() =>
    this.products().map((product) => ({
      id: product._id,
      label: `${product.name}${product.sku ? ' · ' + product.sku : ''}`,
    })),
  );

  protected readonly form = this.fb.group({
    number: this.fb.control<string | null>(null),
    counterpartyId: this.fb.control('', [Validators.required]),
    siteId: this.fb.control('', [Validators.required]),
    plannedDate: this.fb.control<string | null>(null),
    priority: this.fb.control<OrderPriority>('normal'),
    status: this.fb.control<OrderStatus>('draft'),
    deliveryAddress: this.fb.control<string | null>(null),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    items: this.fb.array<ItemFormGroup>([]),
  });

  protected readonly quickForm = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    phone: this.fb.control(''),
    address: this.fb.control('', [Validators.required]),
  });

  get itemsArray(): FormArray<ItemFormGroup> {
    return this.form.controls.items as FormArray<ItemFormGroup>;
  }

  protected userLabel(u: OwnerUserOption): string {
    return (u.displayName || u.fullName || u.username || u._id).trim();
  }

  private loadLookups(): void {
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
    this.usersService.list({ page: 1, limit: 100 }).subscribe((res) => {
      if (!res.ok) {
        this.users.set([]);
        return;
      }
      this.users.set(res.data.items);
    });
  }

  private loadSites(counterpartyId: string, preferSiteId?: string): void {
    if (!counterpartyId) {
      this.sites.set([]);
      return;
    }
    this.siteService.listByCounterparty(counterpartyId).subscribe((res) => {
      if (res.ok) {
        this.sites.set(res.data ?? []);
        if (preferSiteId) {
          this.form.controls.siteId.setValue(preferSiteId);
        }
      } else {
        this.sites.set([]);
      }
    });
  }

  protected onCounterpartyChange(counterpartyId: string): void {
    this.form.controls.counterpartyId.setValue(counterpartyId);
    this.form.controls.counterpartyId.markAsDirty();
    this.form.controls.siteId.setValue('');
    this.loadSites(counterpartyId);
  }

  protected onSiteChange(siteId: string): void {
    this.form.controls.siteId.setValue(siteId);
    this.form.controls.siteId.markAsDirty();
  }

  private unwrapId(value: string | { _id: string } | undefined | null): string {
    if (!value) return '';
    return typeof value === 'string' ? value : (value._id ?? '');
  }

  private unwrapOwnerId(value: string | { _id: string } | undefined | null): string {
    return this.unwrapId(value);
  }

  private patchFromData(o: Order): void {
    const cpId = this.unwrapId(o.counterpartyId);
    const siteId = this.unwrapId(o.siteId);
    this.form.patchValue({
      number: o.number,
      counterpartyId: cpId,
      siteId,
      plannedDate: o.plannedDate ? o.plannedDate.slice(0, 10) : null,
      priority: o.priority ?? 'normal',
      status: o.status ?? 'draft',
      deliveryAddress: o.deliveryAddress ?? null,
      notes: o.notes ?? null,
    });
    if (cpId) this.loadSites(cpId, siteId || undefined);
    (o.items ?? []).forEach((it) => this.appendItem(it as Partial<OrderItem>));
  }

  addItem(): void {
    this.itemsArray.push(this.createItemGroup({}));
  }

  removeItem(i: number): void {
    this.itemsArray.removeAt(i);
  }

  /**
   * Auto-fill productName + unit when the user picks a product in
   * the picker. Keeps `unitPrice` empty — operator enters the actual
   * deal price manually (business rule: listPrice is reference only).
   */
  onProductPick(index: number, productId: string): void {
    const selected = this.products().find((p) => p._id === productId);
    if (!selected) return;
    const group = this.itemsArray.at(index);
    group.controls.productName.setValue(selected.name);
    if (selected.unit && !group.controls.unit.value) {
      group.controls.unit.setValue(selected.unit);
    }
  }

  private createItemGroup(initial: Partial<OrderItem> = {}): ItemFormGroup {
    const ship = initial.plannedShipDate ? String(initial.plannedShipDate).slice(0, 10) : '';
    return this.fb.group({
      productId: this.fb.control(initial.productId ?? '', [Validators.required]),
      productName: this.fb.control<string>(initial.productName ?? ''),
      quantity: this.fb.control(initial.quantity ?? 1, [Validators.required, Validators.min(0)]),
      unit: this.fb.control<string>(initial.unit ?? ''),
      unitPrice: this.fb.control(initial.unitPrice ?? 0, [Validators.required, Validators.min(0)]),
      ownerUserId: this.fb.control(this.unwrapOwnerId(initial.ownerUserId)),
      plannedShipDate: this.fb.control(ship),
    }) as ItemFormGroup;
  }

  private appendItem(initial: Partial<OrderItem>): void {
    this.itemsArray.push(this.createItemGroup(initial));
  }

  protected onQuickCreate(): void {
    if (this.quickSubmitting()) return;
    this.quickForm.markAllAsTouched();
    if (this.quickForm.invalid) {
      this.quickError.set('Укажите имя и адрес объекта');
      return;
    }
    const v = this.quickForm.getRawValue();
    this.quickSubmitting.set(true);
    this.quickError.set(null);
    this.counterpartyService
      .quickCreateParty({
        name: v.name.trim(),
        phone: v.phone?.trim() || undefined,
        address: v.address.trim(),
      })
      .subscribe((res) => {
        this.quickSubmitting.set(false);
        if (!res.ok) {
          this.quickError.set(extractErrorMessage(res.error));
          return;
        }
        const { counterparty, site } = res.data;
        const list = this.counterparties();
        if (!list.some((c) => c._id === counterparty._id)) {
          this.counterparties.set([counterparty, ...list]);
        }
        this.form.controls.counterpartyId.setValue(counterparty._id);
        this.loadSites(counterparty._id, site._id);
        this.quickForm.reset({ name: '', phone: '', address: '' });
        this.toast.success('Заказчик и объект созданы');
      });
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
      } else if (!this.form.controls.siteId.value) {
        this.errorMessage.set('Выберите объект');
      }
      return;
    }
    const v = this.form.getRawValue();
    const items: OrderItem[] = (v.items ?? []).map((i) => {
      const row: OrderItem = {
        productId: i.productId,
        productName: i.productName || undefined,
        quantity: Number(i.quantity),
        unit: i.unit || undefined,
        unitPrice: Number(i.unitPrice),
      };
      if (i.ownerUserId) row.ownerUserId = i.ownerUserId;
      if (i.plannedShipDate) row.plannedShipDate = i.plannedShipDate;
      return row;
    });

    const payload: Partial<Order> = {
      counterpartyId: v.counterpartyId,
      siteId: v.siteId,
      status: v.status,
      priority: v.priority,
      items,
    };
    if (v.number) payload.number = v.number;
    if (v.plannedDate) payload.plannedDate = v.plannedDate;
    if (v.deliveryAddress) payload.deliveryAddress = v.deliveryAddress;
    if (v.notes) payload.notes = v.notes;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Заказ обновлён' : 'Заказ создан');
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
