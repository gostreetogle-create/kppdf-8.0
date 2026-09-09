import { ChangeDetectionStrategy, Component, DestroyRef, Injector, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiMaterialsService,
  PiSupplyRequestsService,
  type CreateSupplyRequestPayload,
  type Material,
  type Order,
  type Organization,
  type SupplyRequest,
  type SupplyRequestStatus,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { SUPPLY_REQUEST_STATUS_LABELS } from '../registries/data/supply-request-formatters';
import {
  MaterialFormDialogComponent,
  type MaterialFormDialogData,
} from '../registries/dialogs/material-form-dialog.component';

/** Sentinel `<option>` value — order not found in the list, switch to free-text `orderLabel`. */
const MANUAL_ORDER_VALUE = '__manual__';
const MIN_MATERIAL_QUERY = 2;
const MATERIAL_SEARCH_DEBOUNCE_MS = 300;

export interface SupplyRequestFormDialogData {
  readonly request?: SupplyRequest;
  readonly orders: readonly Order[];
  readonly suppliers: readonly Organization[];
}

/**
 * TZ-NX-SUPPLY-S3-REQUEST-JOURNAL — full SupplyRequest create/edit form (Sheets parity).
 * Persists via `PiSupplyRequestsService` itself (like `StockMovementFormDialogComponent`):
 * closes with the saved `SupplyRequest` on success, `undefined` on cancel.
 */
@Component({
  selector: 'pi-supply-request-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, PiDialogComponent, PiFormSectionComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog [title]="title" variant="content" width="md" [showClose]="true" (userClose)="cancel()">
      <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" data-test="supply-request-form">
        <app-pi-form-section title="Позиция" headingId="supply-request-form-item" tone="gold">
          <div class="space-y-form-field">
            @if (materialId(); as id) {
              <div class="flex items-center justify-between gap-2 pi-input" data-test="supply-request-material-chip">
                <span class="truncate">{{ materialLabel() }}</span>
                <button type="button" class="pi-outline-btn" (click)="clearMaterial()" data-test="supply-request-material-clear">
                  Очистить
                </button>
              </div>
            } @else {
              <app-pi-form-field label="Наименование" htmlFor="supply-request-title" [required]="true">
                <app-pi-input id="supply-request-title" formControlName="title" data-test="supply-request-title" />
              </app-pi-form-field>
              <app-pi-form-field label="Артикул" htmlFor="supply-request-article">
                <app-pi-input id="supply-request-article" formControlName="article" data-test="supply-request-article" />
              </app-pi-form-field>
              <div class="flex items-end gap-2">
                <app-pi-form-field label="Найти материал в каталоге" htmlFor="supply-request-material-search" class="flex-1">
                  <app-pi-input
                    id="supply-request-material-search"
                    [value]="materialQuery()"
                    (valueChange)="onMaterialQuery($event)"
                    placeholder="Начните вводить название или артикул…"
                    data-test="supply-request-material-search"
                  />
                </app-pi-form-field>
                <app-pi-button type="button" variant="outline" size="sm" (click)="openCreateMaterial()" data-test="supply-request-material-create">
                  + Новый материал
                </app-pi-button>
              </div>
              @if (materialResults().length > 0) {
                <ul class="pi-dashed-panel divide-y divide-border" data-test="supply-request-material-results">
                  @for (m of materialResults(); track m._id) {
                    <li class="flex items-center gap-2">
                      <button
                        type="button"
                        class="flex-1 text-left px-2 py-1.5 text-sm hover:bg-paper-2"
                        (click)="pickMaterial(m)"
                        [attr.data-test]="'supply-request-material-pick-' + m._id"
                      >
                        {{ m.name }} @if (m.article) { <span class="text-muted-foreground">· {{ m.article }}</span> }
                      </button>
                      <button
                        type="button"
                        class="pi-outline-btn shrink-0"
                        (click)="openCopyMaterial(m)"
                        [attr.data-test]="'supply-request-material-copy-' + m._id"
                      >
                        Копировать и изменить
                      </button>
                    </li>
                  }
                </ul>
              }
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-pi-form-field label="Количество" htmlFor="supply-request-qty" [required]="true">
                <app-pi-input id="supply-request-qty" type="number" formControlName="qty" data-test="supply-request-qty" />
              </app-pi-form-field>
              <app-pi-form-field label="Ед. изм." htmlFor="supply-request-unit">
                <app-pi-input id="supply-request-unit" formControlName="unit" data-test="supply-request-unit" />
              </app-pi-form-field>
            </div>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Поставщик и заказ" headingId="supply-request-form-order" tone="gold">
          <div class="space-y-form-field">
            <app-pi-form-field label="Поставщик" htmlFor="supply-request-supplier">
              <select id="supply-request-supplier" class="pi-input w-full" formControlName="supplierId" data-test="supply-request-supplier">
                <option value="">Не выбран</option>
                @for (s of data.suppliers; track s._id) {
                  <option [value]="s._id">{{ s.name }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Заказчик (заказ)" htmlFor="supply-request-order">
              <select id="supply-request-order" class="pi-input w-full" formControlName="orderId" data-test="supply-request-order">
                <option value="">Без заказа</option>
                <option [value]="manualOrderValue">Не найден в списке — ввести текст</option>
                @for (o of data.orders; track o._id) {
                  <option [value]="o._id">{{ o.number }}</option>
                }
              </select>
            </app-pi-form-field>
            @if (isManualOrder()) {
              <app-pi-form-field label="Заказчик (текст)" htmlFor="supply-request-order-label">
                <app-pi-input id="supply-request-order-label" formControlName="orderLabel" placeholder="Например: Цех 2, участок сборки" data-test="supply-request-order-label" />
              </app-pi-form-field>
            }

            <app-pi-form-field label="Нужно к дате" htmlFor="supply-request-needed-by">
              <input id="supply-request-needed-by" type="date" class="pi-input w-full" formControlName="neededBy" data-test="supply-request-needed-by" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Статус и оплата" headingId="supply-request-form-status" tone="gold">
          <div class="space-y-form-field">
            <app-pi-form-field label="Статус" htmlFor="supply-request-status">
              <select id="supply-request-status" class="pi-input w-full" formControlName="status" data-test="supply-request-status">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ statusLabels[s] }}</option>
                }
              </select>
            </app-pi-form-field>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-pi-form-field label="Счёт №" htmlFor="supply-request-invoice">
                <app-pi-input id="supply-request-invoice" formControlName="invoiceNo" data-test="supply-request-invoice" />
              </app-pi-form-field>
              <app-pi-form-field label="Доставка" htmlFor="supply-request-delivery">
                <app-pi-input id="supply-request-delivery" formControlName="deliveryNote" data-test="supply-request-delivery" />
              </app-pi-form-field>
            </div>

            <label class="inline-flex items-center gap-2 text-sm" for="supply-request-paid">
              <input id="supply-request-paid" type="checkbox" formControlName="paid" data-test="supply-request-paid" />
              <span>Оплачено</span>
            </label>

            <app-pi-form-field label="Примечание" htmlFor="supply-request-notes">
              <textarea id="supply-request-notes" class="pi-input w-full min-h-16" formControlName="notes" data-test="supply-request-notes"></textarea>
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        @if (error()) {
          <p class="text-sm text-destructive m-0" role="alert" data-test="supply-request-form-error">{{ error() }}</p>
        }
      </form>

      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" [disabled]="saving()" (click)="cancel()">Отмена</app-pi-button>
        <app-pi-button type="button" variant="default" [disabled]="saving()" (click)="submit()" data-test="supply-request-form-submit">
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class SupplyRequestFormDialogComponent {
  readonly data = inject<SupplyRequestFormDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<SupplyRequest | undefined>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(PiSupplyRequestsService);
  private readonly materialsApi = inject(PiMaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly manualOrderValue = MANUAL_ORDER_VALUE;
  readonly statuses: readonly SupplyRequestStatus[] = ['in_progress', 'requested', 'ordered', 'received', 'cancelled'];
  readonly statusLabels = SUPPLY_REQUEST_STATUS_LABELS;
  readonly title = this.data.request ? 'Изменить заявку' : 'Создать заявку';

  readonly saving = signal(false);
  readonly error = signal('');
  readonly materialId = signal<string | null>(this.data.request?.materialId ?? null);
  readonly materialLabel = signal(this.initialMaterialLabel());
  readonly materialQuery = signal('');
  readonly materialResults = signal<Material[]>([]);
  private materialSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private materialSearchVersion = 0;

  readonly form = this.fb.group({
    title: this.fb.control(this.data.request?.title ?? ''),
    article: this.fb.control(this.data.request?.article ?? ''),
    qty: this.fb.control(this.data.request?.qty ?? 1, [Validators.required, Validators.min(0)]),
    unit: this.fb.control(this.data.request?.unit ?? ''),
    supplierId: this.fb.control(this.data.request?.supplierId ?? ''),
    orderId: this.fb.control(this.initialOrderId()),
    orderLabel: this.fb.control(this.data.request?.orderLabel ?? ''),
    neededBy: this.fb.control(this.data.request?.neededBy?.slice(0, 10) ?? ''),
    status: this.fb.control<SupplyRequestStatus>(this.data.request?.status ?? 'in_progress'),
    invoiceNo: this.fb.control(this.data.request?.invoiceNo ?? ''),
    deliveryNote: this.fb.control(this.data.request?.deliveryNote ?? ''),
    paid: this.fb.control(this.data.request?.paid ?? false),
    notes: this.fb.control(this.data.request?.notes ?? ''),
  });

  isManualOrder(): boolean {
    return this.form.controls.orderId.value === MANUAL_ORDER_VALUE;
  }

  onMaterialQuery(value: string): void {
    this.materialQuery.set(value);
    if (this.materialSearchTimer) clearTimeout(this.materialSearchTimer);
    const query = value.trim();
    if (query.length < MIN_MATERIAL_QUERY) {
      this.materialResults.set([]);
      return;
    }
    const version = ++this.materialSearchVersion;
    this.materialSearchTimer = setTimeout(() => {
      void firstValueFrom(this.materialsApi.list({ search: query, limit: 10 })).then((res) => {
        if (version !== this.materialSearchVersion) return;
        this.materialResults.set(res.ok ? res.data.items : []);
      });
    }, MATERIAL_SEARCH_DEBOUNCE_MS);
  }

  pickMaterial(material: Material): void {
    this.materialId.set(material._id);
    this.materialLabel.set(material.article ? `${material.name} · ${material.article}` : material.name);
    this.form.patchValue({
      title: material.name,
      article: material.article ?? '',
      unit: material.unit ?? this.form.controls.unit.value,
    });
    this.materialQuery.set('');
    this.materialResults.set([]);
  }

  clearMaterial(): void {
    this.materialId.set(null);
    this.materialLabel.set('');
  }

  /** PO §6: supply access may create Material — same shared form as the catalog registry. */
  openCreateMaterial(): void {
    this.openMaterialDialog({ mode: 'create', allowKindSelect: true });
  }

  /** «Копировать материал»: prefill create from an existing material, user edits before it saves as a NEW one. */
  openCopyMaterial(source: Material): void {
    this.openMaterialDialog({ mode: 'create', material: source, allowKindSelect: true });
  }

  private openMaterialDialog(data: MaterialFormDialogData): void {
    const ref = this.dialog.open<Material | null | undefined>(MaterialFormDialogComponent, {
      data,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (material) => {
      if (material) this.pickMaterial(material);
    });
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const materialId = this.materialId();
    const title = value.title.trim();
    const qty = Number(value.qty);
    if (!materialId && !title) {
      this.error.set('Укажите материал из каталога или наименование вручную.');
      return;
    }
    if (!Number.isFinite(qty) || qty < 0) {
      this.error.set('Количество должно быть 0 или больше.');
      return;
    }

    const manualOrder = this.isManualOrder();
    const payload: CreateSupplyRequestPayload = {
      ...(materialId ? { materialId } : { title }),
      ...(!materialId && value.article.trim() ? { article: value.article.trim() } : {}),
      qty,
      ...(value.unit.trim() ? { unit: value.unit.trim() } : {}),
      ...(value.supplierId ? { supplierId: value.supplierId } : {}),
      ...(manualOrder
        ? value.orderLabel.trim()
          ? { orderLabel: value.orderLabel.trim() }
          : {}
        : value.orderId
          ? { orderId: value.orderId }
          : {}),
      ...(value.neededBy ? { neededBy: value.neededBy } : {}),
      status: value.status,
      ...(value.invoiceNo.trim() ? { invoiceNo: value.invoiceNo.trim() } : {}),
      ...(value.deliveryNote.trim() ? { deliveryNote: value.deliveryNote.trim() } : {}),
      paid: value.paid,
      ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
    };

    this.saving.set(true);
    this.error.set('');
    const result = this.data.request
      ? await firstValueFrom(this.api.update(this.data.request._id, payload))
      : await firstValueFrom(this.api.create(payload));
    if (result.ok) {
      this.ref.close(result.data);
    } else {
      this.error.set(extractErrorMessage(result.error));
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.ref.close(undefined);
  }

  private initialOrderId(): string {
    const request = this.data.request;
    if (!request) return '';
    if (request.orderId) return request.orderId;
    if (request.orderLabel) return MANUAL_ORDER_VALUE;
    return '';
  }

  private initialMaterialLabel(): string {
    const request = this.data.request;
    if (!request?.materialId) return '';
    return request.article ? `${request.title ?? ''} · ${request.article}` : (request.title ?? '');
  }
}
