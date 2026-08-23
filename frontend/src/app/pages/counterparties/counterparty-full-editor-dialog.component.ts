import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section/form-section.component';
import {
  PiOverflowSelectComponent,
  type PiOverflowSelectItem,
} from '../../shared/ui/overflow-select/pi-overflow-select.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../core/silent-http';
import {
  Counterparty,
  CounterpartyService,
  type CounterpartyRole,
} from '../../shared/services/pi-counterparty.service';
import { PersonsService, type Person } from '../../shared/services/pi-persons.service';
import { toOptionalNumber } from '../../shared/forms/to-optional-number';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PersonQuickCreateDialogComponent } from '../../shared/person/person-quick-create-dialog.component';
import { personToOverflowItem } from '../../shared/person/person.util';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';

type Result = Counterparty | null | undefined;

type LegalType = NonNullable<Counterparty['legalType']>;

const LEGAL_TYPE_LABELS: Record<LegalType, string> = {
  ooo: 'ООО',
  ip: 'ИП',
  pao: 'ПАО',
  ao: 'АО',
  other: 'Другое',
};

/** Empty string is the «not set» option; the backend field is optional. */
const LEGAL_TYPE_ITEMS: PiOverflowSelectItem[] = [
  { id: '', label: '— не указан —' },
  ...(Object.keys(LEGAL_TYPE_LABELS) as LegalType[]).map((id) => ({
    id,
    label: LEGAL_TYPE_LABELS[id],
  })),
];

/**
 * Fallback role slugs — the seeded set (`counterparty-roles.seed.ts`). Used only
 * if the role catalog request fails: a manager must still be able to save a
 * client, and `roles` is required by the create DTO.
 */
const FALLBACK_ROLES: { slug: string; label: string }[] = [
  { slug: 'customer', label: 'Покупатель' },
  { slug: 'supplier', label: 'Поставщик' },
  { slug: 'contractor', label: 'Подрядчик' },
  { slug: 'manufacturer', label: 'Производитель' },
];

/**
 * TZ-PARTY-303 — Counterparty FullEditor (kind C, 1120).
 *
 * The Клиенты page was read-only, so a client created by quick-create (name +
 * phone + address, stub INN) could never be completed: real INN, КПП/ОГРН, bank
 * and signer had no UI. Layout follows the same canon as the organization
 * editor: `variant="content"` + `min(1120px, calc(100vw - 2rem))`, sections as
 * `app-pi-form-section`.
 *
 * `organizationId` is never sent — the server stamps the tenant from the JWT
 * (TZ-PARTY-301). Editing a stub INN clears `innIsStub` server-side, so the
 * dialog only warns about it.
 *
 * Not here: DaData lookup (TZ-INN-301), photo vault, sites/площадки.
 */
@Component({
  selector: 'app-counterparty-full-editor-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    SwitchComponent,
    BadgeComponent,
    PiFormSectionComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать заказчика' : 'Создать заказчика'"
      [variant]="'content'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-4"
        data-test="counterparty-full-editor"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <app-pi-form-section title="Основные" headingId="cp-sec-basics" tone="gold">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field
                class="sm:col-span-2"
                label="Название"
                htmlFor="cp-name"
                [required]="true"
                [error]="errorFor('name')"
              >
                <app-pi-input
                  id="cp-name"
                  formControlName="name"
                  placeholder="ООО «Ромашка» или Иванов Иван Иванович"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Краткое наименование"
                htmlFor="cp-shortName"
                [error]="errorFor('shortName')"
              >
                <app-pi-input id="cp-shortName" formControlName="shortName" placeholder="Ромашка" />
              </app-pi-form-field>

              <app-pi-form-field label="Телефон" htmlFor="cp-phone" [error]="errorFor('phone')">
                <app-pi-input
                  id="cp-phone"
                  formControlName="phone"
                  placeholder="+7 900 000-00-00"
                  [invalid]="hasError('phone')"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Почта" htmlFor="cp-email" [error]="errorFor('email')">
                <app-pi-input
                  id="cp-email"
                  formControlName="email"
                  type="email"
                  placeholder="info@example.ru"
                  [invalid]="hasError('email')"
                  data-test="cp-email"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Юридический тип" htmlFor="cp-legalType">
                <app-pi-overflow-select
                  [items]="legalTypeItems"
                  [value]="form.controls.legalType.value"
                  (valueChange)="onLegalTypeChange($event)"
                  placeholder="— не указан —"
                  ariaLabel="Юридический тип"
                  dataTest="cp-legal-type"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Правовая форма"
                htmlFor="cp-legalForm"
                hint="Как в уставе, если отличается от типа."
              >
                <app-pi-input
                  id="cp-legalForm"
                  formControlName="legalForm"
                  placeholder="Общество с ограниченной ответственностью"
                />
              </app-pi-form-field>

              <app-pi-form-field class="sm:col-span-2" label="Сайт" htmlFor="cp-website">
                <app-pi-input id="cp-website" formControlName="website" placeholder="example.ru" />
              </app-pi-form-field>

              <app-pi-form-field
                class="sm:col-span-2"
                label="Роли"
                [required]="true"
                [error]="rolesError()"
                hint="Кем этот контрагент выступает в сделках."
              >
                <div class="flex flex-wrap gap-2" data-test="cp-roles">
                  @for (role of roleItems(); track role.slug) {
                    <label
                      class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y rounded-sm cursor-pointer transition-colors"
                      [class.bg-gold]="isRoleSelected(role.slug)"
                      [class.text-on-gold]="isRoleSelected(role.slug)"
                      [class.border-gold]="isRoleSelected(role.slug)"
                      [class.hairline]="!isRoleSelected(role.slug)"
                      [class.hover:bg-paper-2]="!isRoleSelected(role.slug)"
                    >
                      <input
                        type="checkbox"
                        [attr.name]="'cp-role-' + role.slug"
                        [attr.data-test]="'cp-role-' + role.slug"
                        [checked]="isRoleSelected(role.slug)"
                        (change)="onRoleToggle(role.slug, $any($event.target).checked)"
                        class="sr-only"
                      />
                      <span class="text-sm">{{ role.label }}</span>
                    </label>
                  }
                </div>
              </app-pi-form-field>

              <div class="sm:col-span-2">
                <label class="flex items-center gap-2 text-sm">
                  <app-pi-switch
                    [checked]="form.controls.isActive.value"
                    (checkedChange)="form.controls.isActive.setValue($event)"
                    ariaLabel="Активен"
                    id="cp-isActive"
                  />
                  <span>Активен</span>
                </label>
              </div>
            </div>
          </app-pi-form-section>

          <app-pi-form-section title="Реквизиты" headingId="cp-sec-requisites" tone="neutral">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field
                label="ИНН"
                htmlFor="cp-inn"
                [required]="true"
                [error]="errorFor('inn')"
              >
                <app-pi-input
                  id="cp-inn"
                  formControlName="inn"
                  placeholder="7701234567"
                  [invalid]="hasError('inn')"
                  class="font-mono"
                />
              </app-pi-form-field>

              <div class="flex items-end">
                @if (hasStubInn()) {
                  <p class="text-[11px] text-muted-foreground leading-snug">
                    <app-pi-badge variant="outline" data-test="cp-inn-stub-hint">
                      временный
                    </app-pi-badge>
                    ИНН сгенерирован при быстром создании. Впишите реальный — метка снимется.
                  </p>
                }
              </div>

              <app-pi-form-field label="КПП" htmlFor="cp-kpp" [error]="errorFor('kpp')">
                <app-pi-input id="cp-kpp" formControlName="kpp" placeholder="770101001" />
              </app-pi-form-field>

              <app-pi-form-field label="ОГРН / ОГРНИП" htmlFor="cp-ogrn" [error]="errorFor('ogrn')">
                <app-pi-input id="cp-ogrn" formControlName="ogrn" placeholder="1027700012345" />
              </app-pi-form-field>

              <app-pi-form-field label="Дата регистрации" htmlFor="cp-registrationDate">
                <input
                  id="cp-registrationDate"
                  type="date"
                  name="cp-registrationDate"
                  formControlName="registrationDate"
                  class="pi-input w-full"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Директор" htmlFor="cp-directorName">
                <app-pi-input
                  id="cp-directorName"
                  formControlName="directorName"
                  placeholder="Иванов И. И."
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Отсрочка оплаты, дней"
                htmlFor="cp-paymentTermDays"
                [error]="errorFor('paymentTermDays')"
              >
                <app-pi-input
                  id="cp-paymentTermDays"
                  type="number"
                  min="0"
                  max="365"
                  formControlName="paymentTermDays"
                  [invalid]="hasError('paymentTermDays')"
                />
              </app-pi-form-field>

              <app-pi-form-field label="НДС, %" htmlFor="cp-vatRate" [error]="errorFor('vatRate')">
                <app-pi-input
                  id="cp-vatRate"
                  type="number"
                  min="0"
                  max="100"
                  formControlName="vatRate"
                  [invalid]="hasError('vatRate')"
                />
              </app-pi-form-field>
            </div>
          </app-pi-form-section>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start hairline-t pt-4">
          <app-pi-form-section title="Банк" headingId="cp-sec-bank" tone="neutral">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field class="sm:col-span-2" label="Банк" htmlFor="cp-bankName">
                <app-pi-input
                  id="cp-bankName"
                  formControlName="bankName"
                  placeholder="ПАО Сбербанк"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="БИК"
                htmlFor="cp-bankBik"
                [error]="errorFor('bankBik')"
                hint="9 цифр или пусто."
              >
                <app-pi-input
                  id="cp-bankBik"
                  formControlName="bankBik"
                  placeholder="044525225"
                  [invalid]="hasError('bankBik')"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Расчётный счёт"
                htmlFor="cp-bankAccount"
                [error]="errorFor('bankAccount')"
              >
                <app-pi-input
                  id="cp-bankAccount"
                  formControlName="bankAccount"
                  placeholder="40702810000000000000"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field
                class="sm:col-span-2"
                label="Корр. счёт"
                htmlFor="cp-bankCorrAccount"
                [error]="errorFor('bankCorrAccount')"
              >
                <app-pi-input
                  id="cp-bankCorrAccount"
                  formControlName="bankCorrAccount"
                  placeholder="30101810400000000225"
                  class="font-mono"
                />
              </app-pi-form-field>
            </div>
          </app-pi-form-section>

          <app-pi-form-section title="Подписант и контакт" headingId="cp-sec-signer" tone="neutral">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field label="ФИО подписанта" htmlFor="cp-signerName">
                <app-pi-input
                  id="cp-signerName"
                  formControlName="signerName"
                  placeholder="Иванов Иван Иванович"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Должность" htmlFor="cp-signerPosition">
                <app-pi-input
                  id="cp-signerPosition"
                  formControlName="signerPosition"
                  placeholder="Генеральный директор"
                />
              </app-pi-form-field>
            </div>

            <app-pi-form-field
              label="Контактное лицо"
              htmlFor="cp-contactPerson"
              hint="Выберите человека из справочника контактов."
            >
              <div class="pi-select-add-row">
                <app-pi-overflow-select
                  [items]="personItems()"
                  [value]="form.controls.contactPersonId.value"
                  (valueChange)="onContactPersonChange($event)"
                  placeholder="— не выбран —"
                  ariaLabel="Контактное лицо"
                  dataTest="cp-contact-person"
                  [searchable]="'auto'"
                  searchPlaceholder="Поиск по имени или телефону…"
                />
                <button
                  type="button"
                  class="pi-select-add-btn"
                  (click)="openCreatePerson()"
                  title="Новое контактное лицо"
                  aria-label="Новое контактное лицо"
                  data-test="cp-contact-person-add"
                >
                  +
                </button>
              </div>
            </app-pi-form-field>

            <p class="text-[11px] text-muted-foreground leading-snug">
              Объекты (площадки) заказчика — карточка заказчика, волна ORDERS-303.
            </p>
          </app-pi-form-section>
        </div>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="counterparty-form-error">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          data-test="counterparty-save"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class CounterpartyFullEditorDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(CounterpartyService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Counterparty | null>(PI_DIALOG_DATA);

  protected readonly legalTypeItems = LEGAL_TYPE_ITEMS;

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasStubInn = signal<boolean>(this.data?.innIsStub === true);

  protected readonly roleItems = signal<{ slug: string; label: string }[]>(FALLBACK_ROLES);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
    shortName: this.fb.control('', [Validators.maxLength(128)]),
    phone: this.fb.control('', [Validators.maxLength(32)]),
    email: this.fb.control('', [Validators.email, Validators.maxLength(256)]),
    legalForm: this.fb.control(''),
    legalType: this.fb.control<LegalType | ''>(''),
    website: this.fb.control(''),
    roles: this.fb.control<string[]>(['customer'], [minOneRole]),
    isActive: this.fb.control(true),

    inn: this.fb.control('', [Validators.required, Validators.pattern(/^\d{10}$|^\d{12}$/)]),
    kpp: this.fb.control('', [Validators.maxLength(16)]),
    ogrn: this.fb.control('', [Validators.maxLength(16)]),
    registrationDate: this.fb.control(''),
    directorName: this.fb.control(''),
    paymentTermDays: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(365)]),
    vatRate: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),

    bankName: this.fb.control(''),
    bankBik: this.fb.control('', [Validators.pattern(/^$|^\d{9}$/)]),
    bankAccount: this.fb.control('', [Validators.maxLength(32)]),
    bankCorrAccount: this.fb.control('', [Validators.maxLength(32)]),

    signerName: this.fb.control(''),
    signerPosition: this.fb.control(''),

    contactPersonId: this.fb.control(''),
  });

  private readonly selectedRoles = signal<string[]>(['customer']);

  protected readonly rolesError = computed(() =>
    this.selectedRoles().length === 0 ? 'Выберите хотя бы одну роль' : '',
  );

  private readonly personsService = inject(PersonsService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly personItems = signal<PiOverflowSelectItem[]>([]);
  protected readonly personsLoading = signal(false);

  constructor() {
    this.loadRoles();
    this.loadPersons();

    const cp = this.data;
    if (!cp) return;

    const roles = cp.roles?.length ? cp.roles : ['customer'];
    this.form.patchValue({
      name: cp.name,
      shortName: cp.shortName ?? '',
      phone: cp.phone ?? '',
      email: cp.email ?? '',
      legalForm: cp.legalForm ?? '',
      legalType: cp.legalType ?? '',
      website: cp.website ?? '',
      roles,
      isActive: cp.isActive ?? true,

      inn: cp.inn,
      kpp: cp.kpp ?? '',
      ogrn: cp.ogrn ?? '',
      registrationDate: toDateInput(cp.registrationDate),
      directorName: cp.directorName ?? '',
      paymentTermDays: cp.paymentTermDays ?? null,
      vatRate: cp.vatRate ?? null,

      bankName: cp.bankName ?? '',
      bankBik: cp.bankBik ?? '',
      bankAccount: cp.bankAccount ?? '',
      bankCorrAccount: cp.bankCorrAccount ?? '',

      signerName: cp.signerName ?? '',
      signerPosition: cp.signerPosition ?? '',

      contactPersonId: cp.contactPersonId ?? '',
    });
    this.selectedRoles.set(roles);
  }

  /**
   * Role slugs come from the catalog so an admin-added role is selectable; a
   * failed request falls back to the seeded set rather than blocking the save.
   */
  private loadRoles(): void {
    this.service.listRoles().subscribe((res) => {
      if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) return;
      this.roleItems.set(res.data.filter((r) => r.isActive !== false).map(toRoleItem));
    });
  }

  /** TZ-PARTY-305: загружаем список контактных лиц для выпадающего списка. */
  protected loadPersons(search?: string): void {
    this.personsLoading.set(true);
    this.personsService.list(search).subscribe((res) => {
      this.personsLoading.set(false);
      if (res.ok && Array.isArray(res.data?.items)) {
        this.personItems.set(res.data.items.map((p: Person) => personToOverflowItem(p)));
      }
    });
  }

  protected openCreatePerson(): void {
    const ref = this.dialog.open<Person | null>(PersonQuickCreateDialogComponent, {
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce<Person | null>(ref, this.injector, (person) => {
      this.personItems.update((items) => {
        const next = personToOverflowItem(person);
        return items.some((item) => item.id === next.id) ? items : [...items, next];
      });
      this.form.controls.contactPersonId.setValue(person._id);
      this.form.controls.contactPersonId.markAsDirty();
    });
  }

  protected onLegalTypeChange(value: string): void {
    this.form.controls.legalType.setValue((value || '') as LegalType | '');
  }

  protected onContactPersonChange(value: string): void {
    this.form.controls.contactPersonId.setValue(value);
  }

  protected isRoleSelected(slug: string): boolean {
    return this.selectedRoles().includes(slug);
  }

  protected onRoleToggle(slug: string, checked: boolean): void {
    const current = this.selectedRoles();
    const next = checked ? [...new Set([...current, slug])] : current.filter((x) => x !== slug);
    this.selectedRoles.set(next);
    this.form.controls.roles.setValue(next);
    this.form.controls.roles.markAsDirty();
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['email']) return 'Некорректный адрес почты';
    if (c.errors?.['pattern']) return 'Некорректный формат';
    if (c.errors?.['min']) return `Минимум ${c.errors['min'].min}`;
    if (c.errors?.['max']) return `Максимум ${c.errors['max'].max}`;
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Проверьте обязательные поля: название, ИНН и хотя бы одна роль.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const payload = this.buildPayload();
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Заказчик обновлён' : 'Заказчик создан');
        this.ref.close(res.data);
        return;
      }
      this.errorMessage.set(extractErrorMessage(res.error));
      this.submitting.set(false);
    });
  }

  /**
   * The API runs `forbidNonWhitelisted`, so only DTO fields may be sent, empty
   * strings are omitted instead of writing empty requisites, and
   * `organizationId` / `isSystem` stay server-side (TZ-PARTY-301).
   */
  private buildPayload(): Partial<Counterparty> {
    const v = this.form.getRawValue();
    const payload: Partial<Counterparty> = {
      name: v.name.trim(),
      inn: v.inn.trim(),
      roles: v.roles,
      isActive: v.isActive,
    };

    const text: [keyof Counterparty, string][] = [
      ['shortName', v.shortName],
      ['phone', v.phone],
      ['email', v.email],
      ['legalForm', v.legalForm],
      ['website', v.website],
      ['kpp', v.kpp],
      ['ogrn', v.ogrn],
      ['directorName', v.directorName],
      ['bankName', v.bankName],
      ['bankBik', v.bankBik],
      ['bankAccount', v.bankAccount],
      ['bankCorrAccount', v.bankCorrAccount],
      ['signerName', v.signerName],
      ['signerPosition', v.signerPosition],
    ];
    for (const [key, raw] of text) {
      const value = raw.trim();
      if (value) Object.assign(payload, { [key]: value });
    }

    if (v.legalType) payload.legalType = v.legalType;
    const paymentTermDays = toOptionalNumber(v.paymentTermDays);
    const vatRate = toOptionalNumber(v.vatRate);
    if (paymentTermDays !== undefined) payload.paymentTermDays = paymentTermDays;
    if (vatRate !== undefined) payload.vatRate = vatRate;
    if (v.registrationDate) payload.registrationDate = toIsoDate(v.registrationDate);

    const contactPersonId = v.contactPersonId.trim();
    if (contactPersonId) payload.contactPersonId = contactPersonId;

    return payload;
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}

/** `roles` is required by the create DTO, so an empty selection is invalid. */
function minOneRole(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string[] | null;
  return value && value.length > 0 ? null : { required: true };
}

function toRoleItem(role: CounterpartyRole): { slug: string; label: string } {
  return { slug: role.slug, label: role.description?.trim() || role.name || role.slug };
}

/** ISO timestamp → `yyyy-MM-dd` for `<input type="date">`. */
function toDateInput(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

/** `yyyy-MM-dd` → ISO timestamp the backend `@IsDate()` transform accepts. */
function toIsoDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
