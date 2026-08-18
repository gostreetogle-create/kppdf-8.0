import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
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
  Organization,
  OrganizationsService,
  ORG_ASSET_LABELS,
  ORG_ASSET_ROLES,
  ORG_TYPES,
  ORG_TYPE_LABELS,
  type OrganizationAsset,
  type OrgAssetRole,
  type OrgType,
} from '../../shared/services/organizations.service';
import { AuthService } from '../../core/auth.service';
import { toOptionalNumber } from '../../shared/forms/to-optional-number';

type Result = Organization | null | undefined;

type LegalType = NonNullable<Organization['legalType']>;

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
 * TZ-PARTY-302 — Organization FullEditor (kind C, 1120).
 *
 * The old `md/lg` dialog exposed 7 of ~25 schema fields, so requisites needed
 * for documents (bank, ОГРН, signer, ИП passport) were unreachable from the UI.
 * Layout follows the material dialog canon: `variant="content"` +
 * `min(1120px, calc(100vw - 2rem))`, sections as `app-pi-form-section`.
 *
 * Passport fields appear only for `legalType = ip` — for a company they are
 * noise, and an ИП has no ОГРН/КПП of its own.
 *
 * TZ-ORG-ASSETS-301: логотип / печать / подпись живут в отдельной секции и
 * пишутся сразу (multipart PUT), а не по «Сохранить» — файл нельзя положить в
 * JSON-payload, а слот привязан к уже существующей организации.
 */
@Component({
  selector: 'app-organization-full-editor-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    SwitchComponent,
    PiFormSectionComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать организацию' : 'Создать организацию'"
      [variant]="'content'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-5"
        data-test="organization-full-editor"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <app-pi-form-section title="Основные" headingId="org-sec-basics" tone="gold">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field
                class="sm:col-span-2"
                label="Полное наименование"
                htmlFor="org-name"
                [required]="true"
                [error]="errorFor('name')"
              >
                <app-pi-input
                  id="org-name"
                  formControlName="name"
                  placeholder="ООО «Ромашка»"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Краткое наименование"
                htmlFor="org-shortName"
                [error]="errorFor('shortName')"
              >
                <app-pi-input
                  id="org-shortName"
                  formControlName="shortName"
                  placeholder="Ромашка"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Юридический тип" htmlFor="org-legalType">
                <app-pi-overflow-select
                  [items]="legalTypeItems"
                  [value]="form.controls.legalType.value"
                  (valueChange)="onLegalTypeChange($event)"
                  placeholder="— не указан —"
                  ariaLabel="Юридический тип"
                  dataTest="org-legal-type"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Правовая форма"
                htmlFor="org-legalForm"
                hint="Как в уставе, если отличается от типа."
              >
                <app-pi-input
                  id="org-legalForm"
                  formControlName="legalForm"
                  placeholder="Общество с ограниченной ответственностью"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Сайт" htmlFor="org-website">
                <app-pi-input id="org-website" formControlName="website" placeholder="example.ru" />
              </app-pi-form-field>

              <app-pi-form-field class="sm:col-span-2" label="Типы (роли)">
                <div class="flex flex-wrap gap-2">
                  @for (t of allTypes; track t) {
                    <label
                      class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y hairline rounded-sm cursor-pointer hover:bg-paper-2 transition-colors"
                      [class.bg-sunrise-warm]="isTypeSelected(t)"
                      [class.text-on-gold]="isTypeSelected(t)"
                      [class.text-paper]="isTypeSelected(t)"
                      [class.border-ink]="isTypeSelected(t)"
                    >
                      <input
                        type="checkbox"
                        [attr.name]="'org-type-' + t"
                        [checked]="isTypeSelected(t)"
                        (change)="onTypeToggle(t, $any($event.target).checked)"
                        class="sr-only"
                      />
                      <span class="text-sm">{{ typeLabels[t] }}</span>
                    </label>
                  }
                </div>
              </app-pi-form-field>

              <div class="sm:col-span-2 flex flex-wrap gap-6">
                <label class="flex items-center gap-2 text-sm">
                  <app-pi-switch
                    [checked]="form.controls.isOurCompany.value"
                    (checkedChange)="form.controls.isOurCompany.setValue($event)"
                    ariaLabel="Наша фирма"
                    id="org-isOurCompany"
                  />
                  <span>Наша фирма (для документов)</span>
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <app-pi-switch
                    [checked]="form.controls.isActive.value"
                    (checkedChange)="form.controls.isActive.setValue($event)"
                    ariaLabel="Активна"
                    id="org-isActive"
                  />
                  <span>Активна</span>
                </label>
              </div>
            </div>
          </app-pi-form-section>

          <app-pi-form-section title="Реквизиты" headingId="org-sec-requisites" tone="neutral">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field
                label="ИНН"
                htmlFor="org-inn"
                [required]="true"
                [error]="errorFor('inn')"
              >
                <app-pi-input
                  id="org-inn"
                  formControlName="inn"
                  placeholder="7701234567"
                  [invalid]="hasError('inn')"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field label="КПП" htmlFor="org-kpp" [error]="errorFor('kpp')">
                <app-pi-input id="org-kpp" formControlName="kpp" placeholder="770101001" />
              </app-pi-form-field>

              <app-pi-form-field label="ОГРН" htmlFor="org-ogrn" [error]="errorFor('ogrn')">
                <app-pi-input id="org-ogrn" formControlName="ogrn" placeholder="1027700012345" />
              </app-pi-form-field>

              <app-pi-form-field label="ОГРНИП" htmlFor="org-ogrnip" [error]="errorFor('ogrnip')">
                <app-pi-input
                  id="org-ogrnip"
                  formControlName="ogrnip"
                  placeholder="304770000012345"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Дата регистрации" htmlFor="org-registrationDate">
                <input
                  id="org-registrationDate"
                  type="date"
                  name="org-registrationDate"
                  formControlName="registrationDate"
                  class="pi-input w-full"
                />
              </app-pi-form-field>

              <app-pi-form-field
                class="sm:col-span-2"
                label="Юридический адрес"
                htmlFor="org-legalAddress"
                hint="Печатается в шапке договоров и счетов."
              >
                <app-pi-input
                  id="org-legalAddress"
                  formControlName="legalAddress"
                  placeholder="350000, г. Краснодар, ул. Красная, 1, офис 5"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Директор" htmlFor="org-directorName">
                <app-pi-input
                  id="org-directorName"
                  formControlName="directorName"
                  placeholder="Иванов И. И."
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Отсрочка оплаты, дней"
                htmlFor="org-paymentTermDays"
                [error]="errorFor('paymentTermDays')"
              >
                <app-pi-input
                  id="org-paymentTermDays"
                  type="number"
                  min="0"
                  max="365"
                  formControlName="paymentTermDays"
                  [invalid]="hasError('paymentTermDays')"
                />
              </app-pi-form-field>

              <app-pi-form-field label="НДС, %" htmlFor="org-vatRate" [error]="errorFor('vatRate')">
                <app-pi-input
                  id="org-vatRate"
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <app-pi-form-section title="Банк" headingId="org-sec-bank" tone="neutral">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field class="sm:col-span-2" label="Банк" htmlFor="org-bankName">
                <app-pi-input
                  id="org-bankName"
                  formControlName="bankName"
                  placeholder="ПАО Сбербанк"
                />
              </app-pi-form-field>

              <app-pi-form-field label="БИК" htmlFor="org-bankBik" [error]="errorFor('bankBik')">
                <app-pi-input
                  id="org-bankBik"
                  formControlName="bankBik"
                  placeholder="044525225"
                  [invalid]="hasError('bankBik')"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Расчётный счёт"
                htmlFor="org-bankAccount"
                [error]="errorFor('bankAccount')"
              >
                <app-pi-input
                  id="org-bankAccount"
                  formControlName="bankAccount"
                  placeholder="40702810000000000000"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field
                class="sm:col-span-2"
                label="Корр. счёт"
                htmlFor="org-bankCorrAccount"
                [error]="errorFor('bankCorrAccount')"
              >
                <app-pi-input
                  id="org-bankCorrAccount"
                  formControlName="bankCorrAccount"
                  placeholder="30101810400000000225"
                  class="font-mono"
                />
              </app-pi-form-field>
            </div>
          </app-pi-form-section>

          <app-pi-form-section title="Подписант" headingId="org-sec-signer" tone="neutral">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field label="ФИО подписанта" htmlFor="org-signerName">
                <app-pi-input
                  id="org-signerName"
                  formControlName="signerName"
                  placeholder="Иванов Иван Иванович"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Должность" htmlFor="org-signerPosition">
                <app-pi-input
                  id="org-signerPosition"
                  formControlName="signerPosition"
                  placeholder="Генеральный директор"
                />
              </app-pi-form-field>
            </div>
            <p class="text-[11px] text-muted-foreground leading-snug">
              Скан подписи и печати — в секции «Файлы для документов» ниже.
            </p>
          </app-pi-form-section>
        </div>

        <app-pi-form-section title="Файлы для документов" headingId="org-sec-assets" tone="neutral">
          @if (!isEdit()) {
            <p class="text-xs text-muted-foreground" data-test="org-assets-locked">
              Логотип, печать и подпись можно загрузить после сохранения организации.
            </p>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" data-test="org-assets">
              @for (role of assetRoles; track role) {
                <div class="space-y-2" [attr.data-test]="'org-asset-' + role">
                  <div class="flex items-baseline justify-between gap-2">
                    <span class="text-sm font-medium">{{ assetLabels[role] }}</span>
                    @if (assetOf(role); as asset) {
                      <span class="text-[11px] text-muted-foreground truncate max-w-[10rem]">
                        {{ asset.originalFilename }}
                      </span>
                    }
                  </div>

                  <div
                    class="relative h-28 hairline rounded-sm bg-paper-2 flex items-center justify-center overflow-hidden"
                  >
                    @if (assetOf(role); as asset) {
                      <img
                        [src]="asset.storageUrl"
                        [alt]="assetLabels[role] + ' организации'"
                        class="max-h-full max-w-full object-contain"
                        [attr.data-test]="'org-asset-preview-' + role"
                      />
                    } @else {
                      <span class="text-[11px] text-muted-foreground">Не загружен</span>
                    }
                  </div>

                  @if (assetLocked(role)) {
                    <p
                      class="text-[11px] text-muted-foreground"
                      [attr.data-test]="'org-asset-locked-' + role"
                    >
                      Печать меняет только администратор.
                    </p>
                  } @else {
                    <div class="flex items-center gap-2">
                      <label
                        class="inline-flex items-center min-h-touch px-control-x py-control-y text-xs hairline rounded-sm cursor-pointer hover:bg-paper-2 transition-colors"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          class="sr-only"
                          [attr.data-test]="'org-asset-file-' + role"
                          [disabled]="assetBusy() === role"
                          (change)="onAssetPicked(role, $event)"
                        />
                        <span>{{ assetOf(role) ? 'Заменить' : 'Загрузить' }}</span>
                      </label>
                      @if (assetOf(role)) {
                        <app-pi-button
                          type="button"
                          variant="ghost"
                          [disabled]="assetBusy() === role"
                          [attr.data-test]="'org-asset-remove-' + role"
                          (click)="onAssetRemove(role)"
                        >
                          Снять
                        </app-pi-button>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </app-pi-form-section>

        @if (isSoleProprietor()) {
          <app-pi-form-section title="Паспорт ИП" headingId="org-sec-passport" tone="dimensions">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-form-field">
              <app-pi-form-field label="Серия" htmlFor="org-passportSeries">
                <app-pi-input
                  id="org-passportSeries"
                  formControlName="passportSeries"
                  placeholder="03 05"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Номер" htmlFor="org-passportNumber">
                <app-pi-input
                  id="org-passportNumber"
                  formControlName="passportNumber"
                  placeholder="123456"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Дата выдачи" htmlFor="org-passportIssuedAt">
                <input
                  id="org-passportIssuedAt"
                  type="date"
                  name="org-passportIssuedAt"
                  formControlName="passportIssuedAt"
                  class="pi-input w-full"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Код подразделения" htmlFor="org-passportDivisionCode">
                <app-pi-input
                  id="org-passportDivisionCode"
                  formControlName="passportDivisionCode"
                  placeholder="230-001"
                  class="font-mono"
                />
              </app-pi-form-field>

              <app-pi-form-field
                class="col-span-2 sm:col-span-4"
                label="Кем выдан"
                htmlFor="org-passportIssuedBy"
              >
                <app-pi-input
                  id="org-passportIssuedBy"
                  formControlName="passportIssuedBy"
                  placeholder="ОУФМС России по Краснодарскому краю"
                />
              </app-pi-form-field>
            </div>
          </app-pi-form-section>
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="organization-form-error">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          data-test="organization-save"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class OrganizationFullEditorDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(OrganizationsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Organization | null>(PI_DIALOG_DATA);
  private readonly auth = inject(AuthService);

  protected readonly allTypes = ORG_TYPES;
  protected readonly typeLabels = ORG_TYPE_LABELS;
  protected readonly legalTypeItems = LEGAL_TYPE_ITEMS;
  protected readonly assetRoles = ORG_ASSET_ROLES;
  protected readonly assetLabels = ORG_ASSET_LABELS;

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly assets = signal<OrganizationAsset[]>(this.data?.assets ?? []);
  /** Роль, по которой сейчас идёт загрузка/снятие — блокирует свой слот. */
  protected readonly assetBusy = signal<OrgAssetRole | null>(null);
  /** Флаг «файлы менялись»: список организаций должен перечитаться. */
  private assetsTouched = false;

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
    shortName: this.fb.control('', [Validators.maxLength(128)]),
    legalForm: this.fb.control(''),
    legalType: this.fb.control<LegalType | ''>(''),
    website: this.fb.control(''),
    type: this.fb.control<OrgType[]>([]),
    isOurCompany: this.fb.control(false),
    isActive: this.fb.control(true),

    inn: this.fb.control('', [Validators.required, Validators.pattern(/^\d{10}$|^\d{12}$/)]),
    kpp: this.fb.control('', [Validators.maxLength(16)]),
    ogrn: this.fb.control('', [Validators.maxLength(16)]),
    ogrnip: this.fb.control('', [Validators.maxLength(16)]),
    registrationDate: this.fb.control(''),
    legalAddress: this.fb.control('', [Validators.maxLength(512)]),
    directorName: this.fb.control(''),
    paymentTermDays: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(365)]),
    vatRate: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),

    bankName: this.fb.control(''),
    bankBik: this.fb.control('', [Validators.pattern(/^$|^\d{9}$/)]),
    bankAccount: this.fb.control('', [Validators.maxLength(32)]),
    bankCorrAccount: this.fb.control('', [Validators.maxLength(32)]),

    signerName: this.fb.control(''),
    signerPosition: this.fb.control(''),

    passportSeries: this.fb.control(''),
    passportNumber: this.fb.control(''),
    passportIssuedBy: this.fb.control(''),
    passportIssuedAt: this.fb.control(''),
    passportDivisionCode: this.fb.control(''),
  });

  /** Legal-type signal so the passport section reacts to the select. */
  private readonly legalType = signal<LegalType | ''>('');
  protected readonly isSoleProprietor = computed(() => this.legalType() === 'ip');

  constructor() {
    const org = this.data;
    if (!org) return;

    this.form.patchValue({
      name: org.name,
      shortName: org.shortName ?? '',
      legalForm: org.legalForm ?? '',
      legalType: org.legalType ?? '',
      website: org.website ?? '',
      type: org.type ?? [],
      isOurCompany: org.isOurCompany ?? false,
      isActive: org.isActive ?? true,

      inn: org.inn,
      kpp: org.kpp ?? '',
      ogrn: org.ogrn ?? '',
      ogrnip: org.ogrnip ?? '',
      registrationDate: toDateInput(org.registrationDate),
      legalAddress: org.legalAddress ?? '',
      directorName: org.directorName ?? '',
      paymentTermDays: org.paymentTermDays ?? null,
      vatRate: org.vatRate ?? null,

      bankName: org.bankName ?? '',
      bankBik: org.bankBik ?? '',
      bankAccount: org.bankAccount ?? '',
      bankCorrAccount: org.bankCorrAccount ?? '',

      signerName: org.signerName ?? '',
      signerPosition: org.signerPosition ?? '',

      passportSeries: org.passportSeries ?? '',
      passportNumber: org.passportNumber ?? '',
      passportIssuedBy: org.passportIssuedBy ?? '',
      passportIssuedAt: toDateInput(org.passportIssuedAt),
      passportDivisionCode: org.passportDivisionCode ?? '',
    });
    this.legalType.set(org.legalType ?? '');
  }

  protected onLegalTypeChange(value: string): void {
    const next = (value || '') as LegalType | '';
    this.form.controls.legalType.setValue(next);
    this.legalType.set(next);
  }

  protected isTypeSelected(t: OrgType): boolean {
    return this.form.controls.type.value.includes(t);
  }

  protected onTypeToggle(t: OrgType, checked: boolean): void {
    const current = this.form.controls.type.value;
    const next = checked ? [...new Set([...current, t])] : current.filter((x) => x !== t);
    this.form.controls.type.setValue(next);
  }

  protected assetOf(role: OrgAssetRole): OrganizationAsset | undefined {
    return this.assets().find((asset) => asset.role === role);
  }

  /** Печать — подпись фирмы; менеджеру её видно, но менять нельзя. */
  protected assetLocked(role: OrgAssetRole): boolean {
    return role === 'seal' && this.auth.user()?.role !== 'admin';
  }

  protected onAssetPicked(role: OrgAssetRole, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.assetBusy()) return;

    this.assetBusy.set(role);
    this.service.putAsset(this.data!._id, role, file).subscribe((res) => {
      this.assetBusy.set(null);
      // Иначе повторный выбор того же файла не даст change-события.
      input.value = '';
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      this.assets.set(res.data.assets ?? []);
      this.assetsTouched = true;
      this.toast.success(`${this.assetLabels[role]} загружен`);
    });
  }

  protected onAssetRemove(role: OrgAssetRole): void {
    if (this.assetBusy()) return;
    this.assetBusy.set(role);
    this.service.removeAsset(this.data!._id, role).subscribe((res) => {
      this.assetBusy.set(null);
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      this.assets.set(res.data.assets ?? []);
      this.assetsTouched = true;
      this.toast.success(`${this.assetLabels[role]} снят`);
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
      this.errorMessage.set('Проверьте обязательные поля: наименование и ИНН.');
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
        this.toast.success(this.isEdit() ? 'Организация обновлена' : 'Организация создана');
        this.ref.close(res.data);
        return;
      }
      this.errorMessage.set(extractErrorMessage(res.error));
      this.submitting.set(false);
    });
  }

  /**
   * The API runs `forbidNonWhitelisted`, so only DTO fields may be sent, and
   * empty strings are omitted rather than written as empty requisites.
   */
  private buildPayload(): Partial<Organization> {
    const v = this.form.getRawValue();
    const payload: Partial<Organization> = {
      name: v.name.trim(),
      inn: v.inn.trim(),
      type: v.type,
      isActive: v.isActive,
      isOurCompany: v.isOurCompany,
    };

    const text: [keyof Organization, string][] = [
      ['shortName', v.shortName],
      ['legalForm', v.legalForm],
      ['website', v.website],
      ['kpp', v.kpp],
      ['ogrn', v.ogrn],
      ['ogrnip', v.ogrnip],
      ['legalAddress', v.legalAddress],
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

    if (v.legalType === 'ip') {
      const passport: [keyof Organization, string][] = [
        ['passportSeries', v.passportSeries],
        ['passportNumber', v.passportNumber],
        ['passportIssuedBy', v.passportIssuedBy],
        ['passportDivisionCode', v.passportDivisionCode],
      ];
      for (const [key, raw] of passport) {
        const value = raw.trim();
        if (value) Object.assign(payload, { [key]: value });
      }
      if (v.passportIssuedAt) payload.passportIssuedAt = toIsoDate(v.passportIssuedAt);
    }

    return payload;
  }

  /**
   * Файлы пишутся сразу, поэтому «Отмена» после загрузки логотипа всё равно
   * обязана вернуть обновлённую организацию — иначе список покажет старое.
   */
  protected onCancel(): void {
    this.ref.close(
      this.assetsTouched && this.data ? { ...this.data, assets: this.assets() } : null,
    );
  }
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
