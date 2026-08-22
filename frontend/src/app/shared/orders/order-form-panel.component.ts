import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../ui/button/button.component';
import { FormFieldComponent } from '../ui/form-field/form-field.component';
import { InputComponent } from '../ui/input/input.component';
import { TextareaComponent } from '../ui/textarea/textarea.component';
import { PiFormSectionComponent } from '../ui/form-section';
import { PiToastService } from '../ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { HttpErrorResponse } from '@angular/common/http';
import { Counterparty, CounterpartyService } from '../services/pi-counterparty.service';
import { Product, ProductsService } from '../services/products.service';
import { Site, SiteService } from '../services/pi-site.service';
import {
  Order,
  OrderItem,
  OrdersService,
  OrderPriority,
  OrderStatus,
} from '../services/orders.service';
import {
  PiOverflowSelectComponent,
  type PiOverflowSelectItem,
} from '../ui/overflow-select/pi-overflow-select.component';
import { Users } from '../models/users';
import { OrganizationsService, type Organization } from '../services/organizations.service';

type FreezeMode = 'none' | 'plan' | 'hard';

/**
 * TZ-SWEEP-401: редактируемые статусы формы — только операционные.
 * Отгрузка/отмена — отдельные действия (POST /ship, POST /cancel),
 * их нельзя выбрать как Save-status (PATCH-граф их запрещает).
 */
const EDITABLE_STATUS_OPTIONS: { value: OrderStatus; label: string; disabled?: boolean }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'confirmed', label: 'Подтверждён' },
  { value: 'in_production', label: 'В производстве' },
  { value: 'ready', label: 'Готов' },
];

/** Полный словарь лейблов — для disabled-отображения уже отгруженных/отменённых. */
const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

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
 * OrderFormPanelComponent — create/edit order form (TZ-DESK-402).
 *
 * Extracted from `OrderFormDialogComponent` so both the `/orders` dialog and
 * the `/desk` create/edit flyout host the SAME form and the SAME
 * `OrdersService.create/update` write-path. The host decides the shell; this
 * panel owns validation, lookups and submit.
 */
@Component({
  selector: 'app-order-form-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="space-y-form-field min-h-0"
      data-test="order-form"
    >
      @if (freezeMode() === 'plan') {
        <p role="status" class="text-xs text-muted-foreground m-0" data-test="order-freeze-banner">
          Заказ в статусе «{{ statusLabel() }}» — состав заморожен. Можно сохранить планируемую дату
          и приоритет.
        </p>
      }
      @if (freezeMode() === 'hard') {
        <p role="status" class="text-xs text-muted-foreground m-0" data-test="order-freeze-banner">
          Заказ в статусе «{{ statusLabel() }}» нельзя обновлять.
        </p>
      }
      <!-- ─── Header ─── -->
      @if (variant() === 'full') {
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
              [disabled]="isCompositionLocked()"
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
              [disabled]="!form.controls.counterpartyId.value || isCompositionLocked()"
              [placeholder]="
                form.controls.counterpartyId.value ? '— выберите —' : 'Сначала заказчик'
              "
              ariaLabel="Объект"
              dataTest="ord-site"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Исполнитель (наша фирма)"
            htmlFor="ord-org"
            hint="Какая организация исполняет заказ."
          >
            <app-pi-overflow-select
              [items]="organizationItems()"
              [value]="form.controls.organizationId.value"
              (valueChange)="onOrganizationChange($event)"
              searchable="auto"
              placeholder="— выберите —"
              ariaLabel="Исполнитель"
              dataTest="ord-org"
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
            <input
              id="ord-plannedDate"
              type="date"
              formControlName="plannedDate"
              class="h-10 px-3 text-sm hairline rounded-sm bg-paper pi-focus-ring w-full"
              data-test="ord-plannedDate"
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
              @for (opt of statusOptions(); track opt.value) {
                <option [value]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
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
      }

      <!-- ─── Quick-create заказчик ─── -->
      @if (variant() === 'full' && !isCompositionLocked()) {
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
      }

      <!-- ─── Items ─── -->
      <app-pi-form-section title="Позиции" headingId="order-sec-items" tone="neutral">
        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <p class="text-sm font-medium">Позиции <span class="text-destructive">*</span></p>
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              [disabled]="isCompositionLocked()"
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
                    [disabled]="isCompositionLocked()"
                    [ariaLabel]="'Продукт ' + (i + 1)"
                    [dataTest]="'ord-item-product-' + i"
                  />
                  @if (itemProductError(i)) {
                    <p role="alert" class="text-xs text-destructive m-0 mt-1">
                      {{ itemProductError(i) }}
                    </p>
                  }
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
                  [disabled]="isCompositionLocked()"
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
      @if (variant() === 'full') {
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
      }

      @if (errorMessage()) {
        <p role="alert" class="text-xs text-destructive">{{ errorMessage() }}</p>
      }

      <div
        class="sticky bottom-0 bg-paper hairline-t pt-3 mt-4 flex justify-end gap-3"
        data-test="order-form-actions"
      >
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting() || freezeMode() === 'hard'"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : variant() === 'items' ? 'Сохранить состав' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </form>
  `,
})
export class OrderFormPanelComponent implements OnInit {
  /** Заказ для edit; null — create. */
  readonly order = input<Order | null>(null);
  /** Items-only mode for the desk tray; keeps the same submit/write path. */
  readonly variant = input<'full' | 'items'>('full');
  /** Испускается после успешного create/update. */
  readonly saved = output<Order>();
  /** Испускается при отмене. */
  readonly cancelled = output<void>();

  constructor() {
    // Inputs are bound before ngOnInit; lookups/patch/freeze run there.
  }

  ngOnInit(): void {
    this.loadLookups();
    const order = this.order();
    if (order) {
      this.patchFromData(order);
      if (this.variant() === 'items' && this.itemsArray.length === 0) this.addItem();
    } else {
      // Fresh order — start with one empty item to satisfy CreateOrderDto.required.
      this.addItem();
    }
    this.applyFreeze();
  }

  protected readonly PRIORITY_OPTIONS = PRIORITY_OPTIONS;

  /**
   * TZ-SWEEP-401: shipped/delivered/cancelled показываются только disabled,
   * если заказ уже в таком статусе (Save не может их отправить).
   */
  protected readonly statusOptions = computed(() => {
    const current = this.order()?.status;
    if (current && !EDITABLE_STATUS_OPTIONS.some((o) => o.value === current)) {
      return [
        ...EDITABLE_STATUS_OPTIONS,
        { value: current, label: STATUS_LABELS[current] ?? current, disabled: true },
      ];
    }
    return EDITABLE_STATUS_OPTIONS;
  });

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(OrdersService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly siteService = inject(SiteService);
  private readonly organizationsService = inject(OrganizationsService);
  private readonly productsService = inject(ProductsService);
  private readonly usersService = Users.inject();
  private readonly toast = inject(PiToastService);

  protected readonly isEdit = computed<boolean>(() => this.order() != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly quickSubmitting = signal<boolean>(false);
  protected readonly quickError = signal<string | null>(null);

  protected readonly counterparties = signal<Counterparty[]>([]);
  protected readonly sites = signal<Site[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly users = signal<OwnerUserOption[]>([]);
  protected readonly freezeMode = computed((): FreezeMode => {
    const order = this.order();
    if (!order) return 'none';
    const status = order.status;
    if (status === 'in_production' || status === 'ready') return 'plan';
    if (status === 'shipped' || status === 'delivered' || status === 'cancelled') return 'hard';
    return 'none';
  });
  protected readonly isCompositionLocked = computed(() => this.freezeMode() !== 'none');
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

  protected readonly organizationItems = signal<PiOverflowSelectItem[]>([]);
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
    organizationId: this.fb.control(''),
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

    // TZ-ORDERS-307: загружаем организации для выпадающего списка «Исполнитель».
    this.organizationsService.list({ limit: 200 }).subscribe((res) => {
      if (res.ok && Array.isArray(res.data?.items)) {
        this.organizationItems.set(
          res.data.items.map((org: Organization) => ({
            id: org._id,
            label: org.shortName || org.name,
            meta: org.isOurCompany ? 'наша фирма' : undefined,
          })),
        );
      }
    });
  }

  private loadSites(counterpartyId: string, preferSiteId?: string): void {
    if (!counterpartyId) {
      this.sites.set([]);
      return;
    }
    this.siteService.listByCounterparty(counterpartyId).subscribe((res) => {
      if (!res.ok) {
        this.sites.set([]);
        return;
      }
      const list = res.data ?? [];
      if (list.length > 0) {
        this.sites.set(list);
        if (preferSiteId) {
          this.form.controls.siteId.setValue(preferSiteId);
        }
        return;
      }
      this.siteService.ensureDefaultForCounterparty(counterpartyId).subscribe((ensured) => {
        if (!ensured.ok || !ensured.data?._id) {
          this.sites.set([]);
          this.errorMessage.set(
            'Не удалось создать объект по умолчанию. Выберите или создайте объект.',
          );
          return;
        }
        this.sites.set([ensured.data]);
        this.form.controls.siteId.setValue(ensured.data._id);
        this.form.controls.siteId.markAsDirty();
      });
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

  protected onOrganizationChange(organizationId: string): void {
    this.form.controls.organizationId.setValue(organizationId);
    this.form.controls.organizationId.markAsDirty();
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
      organizationId: this.unwrapId(o.organizationId),
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
    this.itemsArray.push(this.createItemGroup({}, { defaultShip: true }));
  }

  removeItem(i: number): void {
    this.itemsArray.removeAt(i);
  }

  /**
   * Auto-fill productId + productName + unit when the user picks a product.
   * Keeps `unitPrice` empty — operator enters the actual deal price manually
   * (business rule: listPrice is reference only).
   */
  onProductPick(index: number, productId: string): void {
    const group = this.itemsArray.at(index);
    group.controls.productId.setValue(productId);
    group.controls.productId.markAsDirty();
    group.controls.productId.markAsTouched();
    if (!productId) {
      group.controls.productName.setValue('');
      return;
    }
    const selected = this.products().find((p) => p._id === productId);
    if (!selected) return;
    group.controls.productName.setValue(selected.name);
    if (selected.unit && !group.controls.unit.value) {
      group.controls.unit.setValue(selected.unit);
    }
  }

  private todayDateOnly(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private createItemGroup(
    initial: Partial<OrderItem> = {},
    opts: { defaultShip?: boolean } = {},
  ): ItemFormGroup {
    let ship = initial.plannedShipDate ? String(initial.plannedShipDate).slice(0, 10) : '';
    if (!ship && opts.defaultShip) {
      const header = this.form.controls.plannedDate.value;
      ship = header && header.length >= 10 ? header.slice(0, 10) : this.todayDateOnly();
    }
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
    if (c.errors?.['required']) {
      return name === 'siteId' ? 'Выберите объект' : 'Обязательное поле';
    }
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    if (c.errors?.['min']) return `Минимум ${c.errors['min'].min}`;
    return 'Некорректное значение';
  }

  protected statusLabel(): string {
    const status = this.order()?.status ?? this.form.controls.status.value;
    return STATUS_LABELS[status] ?? status;
  }

  protected itemProductError(index: number): string {
    const c = this.itemsArray.at(index)?.controls.productId;
    if (!c || !c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Выберите изделие';
    return 'Некорректное значение';
  }

  private itemsMissingProduct(): boolean {
    return this.itemsArray.controls.some((group) => !group.controls.productId.value);
  }

  private applyFreeze(): void {
    const mode = this.freezeMode();
    if (mode === 'none') return;
    const composition = [
      'number',
      'counterpartyId',
      'siteId',
      'status',
      'deliveryAddress',
      'notes',
      'items',
    ] as const;
    for (const key of composition) {
      this.form.controls[key].disable({ emitEvent: false });
    }
    this.quickForm.disable({ emitEvent: false });
    if (mode === 'hard') {
      this.form.controls.plannedDate.disable({ emitEvent: false });
      this.form.controls.priority.disable({ emitEvent: false });
    }
  }

  private mapSaveError(err: HttpErrorResponse): string {
    const raw = extractErrorMessage(err);
    if (err.status === 400 && raw && raw !== 'Неизвестная ошибка') return raw;
    if (err.status === 400) return 'Нельзя сохранить эти поля в текущем статусе заказа';
    return raw;
  }

  private sendPayload(payload: Partial<Order>): void {
    this.submitting.set(true);
    this.errorMessage.set(null);
    const order = this.order();
    const obs = order ? this.service.update(order._id, payload) : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Заказ обновлён' : 'Заказ создан');
        this.saved.emit(res.data);
      } else {
        this.errorMessage.set(this.mapSaveError(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    const freeze = this.freezeMode();
    if (freeze === 'hard') {
      this.errorMessage.set(`Заказ в статусе «${this.statusLabel()}» нельзя обновлять`);
      return;
    }
    if (freeze === 'plan') {
      const v = this.form.getRawValue();
      const payload: Partial<Order> = { priority: v.priority };
      if (v.plannedDate) payload.plannedDate = v.plannedDate;
      this.sendPayload(payload);
      return;
    }
    if (this.form.invalid || this.itemsArray.length === 0) {
      this.form.markAllAsTouched();
      if (this.itemsArray.length === 0) {
        this.errorMessage.set('Добавьте хотя бы одну позицию');
      } else if (this.itemsMissingProduct()) {
        this.errorMessage.set('Выберите изделие в каждой позиции');
      } else if (!this.form.controls.siteId.value) {
        this.errorMessage.set('Выберите объект');
      } else {
        this.errorMessage.set('Проверьте обязательные поля');
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
    if (v.organizationId) payload.organizationId = v.organizationId;

    this.sendPayload(payload);
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
