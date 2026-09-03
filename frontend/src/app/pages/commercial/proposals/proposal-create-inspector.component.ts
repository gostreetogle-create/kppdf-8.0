import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationFullEditorDialogComponent } from '../../organizations/organization-full-editor-dialog.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { PiSelectAddRowComponent } from '../../../shared/ui/select-add-row';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import {
  estimateFamilyTotal,
  type ProposalStatus,
} from '../../../shared/services/pi-proposals.service';
import { formatPrice } from '../../../shared/util/format';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import type { ProposalDraftLine } from './proposal-product-rail.component';

export interface ProposalTableLayoutColumn {
  key: string;
  label: string;
  visible: boolean;
  /** Copy-on-write width for this КП instance (~sum of visible ≈ 100). */
  widthPercent?: number;
}

/** Instance-only table chrome (not shared TableTemplate). */
export interface ProposalTableChrome {
  borderWeight?: 'thin' | 'normal' | 'thick';
  headerWeight?: 'normal' | 'bold';
}

export interface ProposalTableTarget {
  id: string;
  templateId: string;
  label: string;
  explicit: boolean;
}

export interface ProposalSheetLayoutState {
  rowsFirstPage: number;
  rowsNextPage: number;
  photoScalePercent: number;
  photoCropYPercent: number;
  showPhotoColumn: boolean;
  /** KP table body font size in px (default 12, clamp 8–20). */
  tableFontSize: number;
  /** KP table header font size in px (default 12, clamp 8–20). */
  tableHeaderFontSize: number;
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
  sheetLayout?: ProposalSheetLayoutState;
}

export type ProposalCreateStatus = ProposalStatus;
export type ProposalCreateInspectorMode = 'params' | 'money' | 'deadlines';

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
    PiSelectAddRowComponent,
  ],
  template: `
    <div class="inspector" data-test="kp-create-inspector">
      @if (mode() === 'params') {
        <p class="text-xs text-muted-foreground m-0" data-test="kp-hint-params">
          Параметры этого коммерческого предложения. Каталог и шаблон не меняются.
        </p>
        <div class="inspector__lock" data-test="kp-status-lock">
          <span class="text-xs" [class.text-destructive]="readOnly()">
            {{ statusLabel() }} ·
            {{ readOnly() ? 'бланк заблокирован' : 'доступно редактирование' }}
          </span>
          @if (status() === 'accepted') {
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              data-test="kp-unlock-paid"
              (click)="statusRequest.emit('draft')"
            >
              Снять «Принято»
            </app-pi-button>
          } @else if (statusOptions().length > 0) {
            <select
              class="pi-input w-auto text-xs"
              [value]="status()"
              [disabled]="readOnly()"
              data-test="kp-status-select"
              (change)="onStatusChange($event)"
            >
              <option [value]="status()">Изменить статус…</option>
              @for (option of statusOptions(); track option) {
                <option [value]="option">{{ statusLabel(option) }}</option>
              }
            </select>
          }
        </div>
      }

      @if (mode() === 'params') {
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
              placeholder="Присвоится при сохранении"
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
          <app-pi-select-add-row
            addTitle="Новая организация"
            addDataTest="kp-insp-org-add"
            [addDisabled]="readOnly()"
            (addClick)="openCreateOrganization()"
          >
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
          </app-pi-select-add-row>
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
      }

      @if (mode() === 'money') {
        <section class="inspector__section" data-test="kp-insp-money-fields">
          <div class="inspector__section-heading">
            <h3>Деньги</h3>
            <p>Финансовые параметры только этого КП</p>
          </div>
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

          <p class="inspector__markup-hint">Только в этом КП; каталог не меняем.</p>

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
        </section>
      }

      @if (mode() === 'params') {
        <section class="inspector__sheet" data-test="kp-insp-sheet-layout">
          <div class="inspector__section-heading">
            <h3>Вид листа</h3>
          </div>
          <label
            >Строк на 1-й странице
            <input
              type="number"
              min="0"
              max="200"
              [value]="sheetLayout().rowsFirstPage"
              [disabled]="readOnly()"
              data-test="kp-sheet-rows-first"
              (change)="onSheetNumberChange('rowsFirstPage', $event)"
            />
          </label>
          <label
            >Строк на следующих
            <input
              type="number"
              min="0"
              max="200"
              [value]="sheetLayout().rowsNextPage"
              [disabled]="readOnly()"
              data-test="kp-sheet-rows-next"
              (change)="onSheetNumberChange('rowsNextPage', $event)"
            />
          </label>
          <p class="inspector__hint" data-test="kp-sheet-rows-auto-hint">
            0 — автоматически по рамке таблицы в шаблоне
          </p>
          <label
            >Размер фото %
            <input
              type="number"
              min="10"
              max="400"
              [value]="sheetLayout().photoScalePercent"
              [disabled]="readOnly()"
              data-test="kp-sheet-photo-scale"
              (change)="onSheetNumberChange('photoScalePercent', $event)"
            />
          </label>
          <label
            >Обрезка фото %
            <input
              type="number"
              min="0"
              max="100"
              [value]="sheetLayout().photoCropYPercent"
              [disabled]="readOnly()"
              data-test="kp-sheet-photo-crop"
              (change)="onSheetNumberChange('photoCropYPercent', $event)"
            />
          </label>
          <label class="inspector__checkbox">
            <input
              type="checkbox"
              [checked]="sheetLayout().showPhotoColumn"
              [disabled]="readOnly()"
              data-test="kp-sheet-photo-column"
              (change)="onPhotoColumnChange($event)"
            />
            Колонка фото
          </label>
          <app-pi-form-field label="Шрифт шапки" htmlFor="kp-sheet-table-font-header">
            <app-pi-overflow-select
              [items]="tableFontSizeItems"
              [value]="tableHeaderFontSizeValue()"
              (valueChange)="onTableHeaderFontSizeChange($event)"
              [searchable]="false"
              placeholder="12"
              ariaLabel="Шрифт шапки таблицы"
              dataTest="kp-sheet-table-font-header"
              [disabled]="readOnly()"
            />
          </app-pi-form-field>
          <app-pi-form-field label="Шрифт таблицы" htmlFor="kp-sheet-table-font">
            <app-pi-overflow-select
              [items]="tableFontSizeItems"
              [value]="tableFontSizeValue()"
              (valueChange)="onTableFontSizeChange($event)"
              [searchable]="false"
              placeholder="12"
              ariaLabel="Шрифт тела таблицы"
              dataTest="kp-sheet-table-font"
              [disabled]="readOnly()"
            />
          </app-pi-form-field>
        </section>
      }

      @if (mode() === 'money') {
        <section class="inspector__section" data-test="kp-insp-discount">
          <div class="inspector__section-heading">
            <h3>Деньги</h3>
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

      @if (mode() === 'deadlines') {
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

      @if (error() && (mode() === 'params' || mode() === 'money')) {
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
      background: color-mix(in oklch, var(--color-paper) 90%, transparent);
    }

    .inspector__markup-hint {
      margin: -0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.7rem;
    }
    .inspector__section,
    .inspector__estimate,
    .inspector__table,
    .inspector__sheet {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper) 90%, transparent);
    }
    .inspector__section > label,
    .inspector__sheet label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.75rem;
    }
    .inspector__sheet input[type='number'] {
      width: 5rem;
      padding: 0.25rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper);
    }
    .inspector__sheet .inspector__checkbox {
      justify-content: flex-start;
    }
    .inspector__sheet app-pi-form-field {
      display: block;
    }
    .inspector__sheet app-pi-overflow-select {
      display: block;
      width: 5.5rem;
      margin-left: auto;
    }
    .inspector__section-heading h3,
    .inspector__section-heading p {
      margin: 0;
    }
    .inspector__section > label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: var(--color-muted-foreground);
      font-size: 0.7rem;
    }
    .inspector__section-heading h3 {
      font-size: 0.9rem;
      color: var(--color-ink);
    }
    .inspector__section-heading p {
      color: var(--color-muted-foreground);
      font-size: 0.7rem;
    }
    .inspector__table-target-hint {
      margin: -0.35rem 0 0;
      color: var(--color-muted-foreground);
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
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly draftLines = input<ProposalDraftLine[]>([]);
  readonly tableLayout = input<ProposalTableLayoutColumn[]>([]);
  /** Read-only context carried through state events; selection belongs to the Client panel. */
  readonly selectedCounterpartyId = input('');
  readonly mode = input<ProposalCreateInspectorMode>('params');
  /** Legacy table mode is retained for the table editor consumer only. */
  readonly tableOnly = input(false);
  readonly tableTemplateId = input<string | null>(null);
  readonly tableTargets = input<ProposalTableTarget[]>([]);
  readonly selectedTableTargetId = input<string | null>(null);
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
  readonly initialSheetLayout = input<ProposalSheetLayoutState>({
    rowsFirstPage: 0,
    rowsNextPage: 0,
    photoScalePercent: 100,
    photoCropYPercent: 0,
    showPhotoColumn: true,
    tableFontSize: 12,
    tableHeaderFontSize: 12,
  });
  readonly readOnly = input(false);
  readonly status = input<ProposalCreateStatus>('draft');
  readonly stateChange = output<ProposalCreateInspectorState>();
  readonly tableLayoutChange = output<ProposalTableLayoutColumn[]>();
  readonly commercialColumnsRequest = output<void>();
  readonly tableTargetChange = output<string>();
  readonly statusRequest = output<ProposalCreateStatus>();

  protected readonly organizations = signal<Organization[]>([]);
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
  protected readonly sheetLayout = signal<ProposalSheetLayoutState>({
    rowsFirstPage: 0,
    rowsNextPage: 0,
    photoScalePercent: 100,
    photoCropYPercent: 0,
    showPhotoColumn: true,
    tableFontSize: 12,
    tableHeaderFontSize: 12,
  });
  protected readonly error = signal<string | null>(null);

  /** Font size options 8…20 for «Шрифт таблицы» (TZ-SALES-373). */
  protected readonly tableFontSizeItems = Array.from({ length: 13 }, (_, i) => {
    const n = 8 + i;
    return { id: String(n), label: String(n) };
  });

  protected readonly tableFontSizeValue = computed(() =>
    String(this.sheetLayout().tableFontSize ?? 12),
  );

  protected readonly tableHeaderFontSizeValue = computed(() =>
    String(this.sheetLayout().tableHeaderFontSize ?? 12),
  );

  private lastSyncedInitialState: ProposalCreateInspectorState | null = null;

  private readonly syncInitialState = effect(() => {
    const next = {
      organizationId: this.initialOrganizationId(),
      orgMarkupPercent: this.initialOrgMarkupPercent(),
      dealVatPercent: this.initialDealVatPercent(),
      number: this.initialNumber(),
      title: this.initialTitle(),
      date: this.initialDate(),
      validUntil: this.initialValidUntil(),
      discountType: this.initialDiscountType(),
      discountPercent: this.initialDiscountPercent(),
      discountAmount: this.initialDiscountAmount(),
      prepaymentPercent: this.initialPrepaymentPercent(),
      productionDays: this.initialProductionDays(),
      deliveryDays: this.initialDeliveryDays(),
      sheetLayout: this.initialSheetLayout(),
    };

    untracked(() => {
      const previous = this.lastSyncedInitialState;
      this.organizationId.set(
        previous === null || Object.is(this.organizationId(), previous.organizationId)
          ? next.organizationId
          : this.organizationId(),
      );
      this.orgMarkupPercent.set(
        previous === null || Object.is(this.orgMarkupPercent(), previous.orgMarkupPercent)
          ? next.orgMarkupPercent
          : this.orgMarkupPercent(),
      );
      this.dealVatPercent.set(
        previous === null || Object.is(this.dealVatPercent(), previous.dealVatPercent)
          ? next.dealVatPercent
          : this.dealVatPercent(),
      );
      this.number.set(
        previous === null || Object.is(this.number(), previous.number)
          ? next.number
          : this.number(),
      );
      this.title.set(
        previous === null || Object.is(this.title(), previous.title) ? next.title : this.title(),
      );
      this.date.set(
        previous === null || Object.is(this.date(), previous.date) ? next.date : this.date(),
      );
      this.validUntil.set(
        previous === null || Object.is(this.validUntil(), previous.validUntil)
          ? next.validUntil
          : this.validUntil(),
      );
      this.discountType.set(
        previous === null || Object.is(this.discountType(), previous.discountType)
          ? next.discountType
          : this.discountType(),
      );
      this.discountPercent.set(
        previous === null || Object.is(this.discountPercent(), previous.discountPercent)
          ? next.discountPercent
          : this.discountPercent(),
      );
      this.discountAmount.set(
        previous === null || Object.is(this.discountAmount(), previous.discountAmount)
          ? next.discountAmount
          : this.discountAmount(),
      );
      this.prepaymentPercent.set(
        previous === null || Object.is(this.prepaymentPercent(), previous.prepaymentPercent)
          ? next.prepaymentPercent
          : this.prepaymentPercent(),
      );
      this.productionDays.set(
        previous === null || Object.is(this.productionDays(), previous.productionDays)
          ? next.productionDays
          : this.productionDays(),
      );
      this.deliveryDays.set(
        previous === null || Object.is(this.deliveryDays(), previous.deliveryDays)
          ? next.deliveryDays
          : this.deliveryDays(),
      );
      const currentSheetLayout = this.sheetLayout();
      this.sheetLayout.set(
        previous === null || this.areSheetLayoutsEqual(currentSheetLayout, previous.sheetLayout)
          ? next.sheetLayout
          : currentSheetLayout,
      );
      this.lastSyncedInitialState = next;
    });
  });

  private areSheetLayoutsEqual(
    current: ProposalSheetLayoutState,
    previous: ProposalSheetLayoutState | undefined,
  ): boolean {
    return (
      previous !== undefined &&
      current.rowsFirstPage === previous.rowsFirstPage &&
      current.rowsNextPage === previous.rowsNextPage &&
      current.photoScalePercent === previous.photoScalePercent &&
      current.photoCropYPercent === previous.photoCropYPercent &&
      current.showPhotoColumn === previous.showPhotoColumn &&
      current.tableFontSize === previous.tableFontSize &&
      current.tableHeaderFontSize === previous.tableHeaderFontSize
    );
  }

  protected readonly organizationItems = computed(() =>
    this.organizations().map((o) => ({
      id: o._id,
      label: `${o.name}${o.inn ? ' · ИНН ' + o.inn : ''}`,
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

  protected readonly statusOptions = computed<ProposalStatus[]>(() => {
    const transitions: Record<ProposalStatus, ProposalStatus[]> = {
      draft: ['sent'],
      sent: ['accepted', 'rejected'],
      accepted: [],
      rejected: ['sent'],
      converted: [],
      cancelled: [],
    };
    return transitions[this.status()] ?? [];
  });

  ngOnInit(): void {
    this.orgs.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error));
        this.organizations.set([]);
        return;
      }
      this.organizations.set(res.data.items ?? []);
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

  protected statusLabel(status = this.status()): string {
    const labels: Record<ProposalStatus, string> = {
      draft: 'Черновик',
      sent: 'Отправлено',
      accepted: 'Принято',
      rejected: 'Отклонено',
      converted: 'В заказе',
      cancelled: 'Отменено',
    };
    return labels[status];
  }

  protected onStatusChange(event: Event): void {
    if (this.readOnly()) return;
    const next = (event.target as HTMLSelectElement).value as ProposalStatus;
    if (this.statusOptions().includes(next)) this.statusRequest.emit(next);
  }

  protected onVatChange(raw: string | number): void {
    if (this.readOnly()) return;
    const n = Number(raw);
    this.dealVatPercent.set(Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0);
    this.emitState();
  }

  protected onSheetNumberChange(
    field: 'rowsFirstPage' | 'rowsNextPage' | 'photoScalePercent' | 'photoCropYPercent',
    event: Event,
  ): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    const limits = {
      rowsFirstPage: [0, 200],
      rowsNextPage: [0, 200],
      photoScalePercent: [10, 400],
      photoCropYPercent: [0, 100],
    } as const;
    const [min, max] = limits[field];
    const value = Number.isFinite(raw) ? Math.min(max, Math.max(min, Math.round(raw))) : min;
    this.sheetLayout.update((current) => ({ ...current, [field]: value }));
    this.emitState();
  }

  protected onPhotoColumnChange(event: Event): void {
    if (this.readOnly()) return;
    this.sheetLayout.update((current) => ({
      ...current,
      showPhotoColumn: (event.target as HTMLInputElement).checked,
    }));
    this.emitState();
  }

  protected onTableFontSizeChange(raw: string): void {
    if (this.readOnly()) return;
    const n = Number(raw);
    const value = Number.isFinite(n) ? Math.min(20, Math.max(8, Math.round(n))) : 12;
    this.sheetLayout.update((current) => ({ ...current, tableFontSize: value }));
    this.emitState();
  }

  protected onTableHeaderFontSizeChange(raw: string): void {
    if (this.readOnly()) return;
    const n = Number(raw);
    const value = Number.isFinite(n) ? Math.min(20, Math.max(8, Math.round(n))) : 12;
    this.sheetLayout.update((current) => ({ ...current, tableHeaderFontSize: value }));
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

  /** TZ-UI-PLUS-604: create org via FullEditor, then select. */
  protected openCreateOrganization(): void {
    if (this.readOnly()) return;
    const ref = this.dialog.open<Organization | null>(OrganizationFullEditorDialogComponent, {
      data: null,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce<Organization | null>(ref, this.injector, (org) => {
      if (!org || org.isActive === false) return;
      this.organizations.update((list) =>
        list.some((item) => item._id === org._id) ? list : [...list, org],
      );
      this.onOrgChange(org._id);
    });
  }

  protected openOrganization(): void {
    if (this.readOnly()) return;
    const id = this.organizationId();
    if (!id) return;
    const cached = this.organizations().find((org) => org._id === id);
    if (cached) {
      this.openOrganizationDialog(cached);
      return;
    }
    this.orgs
      .findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) return;
        this.openOrganizationDialog(res.data);
      });
  }

  private openOrganizationDialog(org: Organization): void {
    const ref = this.dialog.open<Organization>(OrganizationFullEditorDialogComponent, {
      data: org,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (saved) => {
      this.organizations.update((items) =>
        items.map((item) => (item._id === saved._id ? saved : item)),
      );
    });
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

  private emitState(): void {
    this.stateChange.emit({
      organizationId: this.organizationId(),
      orgMarkupPercent: this.orgMarkupPercent(),
      counterpartyId: this.selectedCounterpartyId(),
      dealVatPercent: this.dealVatPercent(),
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
      sheetLayout: this.sheetLayout(),
    });
  }
}
