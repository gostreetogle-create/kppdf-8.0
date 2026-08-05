import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  StorageItem,
  storageItemName,
  storageItemWarehouseName,
  StorageItemsService,
  type StorageItemsListResponse,
} from './storage-items.service';

type Result = StorageItem | null | undefined;

/**
 * Pick a storage position then adjust qty (used from Движения +Корр.).
 */
@Component({
  selector: 'app-storage-adjust-pick-dialog',
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
    <app-pi-dialog
      title="Корректировка остатка"
      [variant]="'content'"
      [maxWidth]="'min(560px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="adjust-pick-form"
      >
        <app-pi-form-field
          label="Позиция"
          htmlFor="adj-item"
          [required]="true"
          [error]="errorFor('itemId')"
        >
          <select
            id="adj-item"
            class="pi-input w-full"
            formControlName="itemId"
            data-test="adj-item"
          >
            <option value="">Выберите позицию…</option>
            @for (item of items(); track item._id) {
              <option [value]="item._id">
                {{ label(item) }} · {{ item.quantity }} ({{ warehouseLabel(item) }})
              </option>
            }
          </select>
        </app-pi-form-field>

        <app-pi-form-field
          label="Изменение (±)"
          htmlFor="adj-delta"
          [required]="true"
          [error]="errorFor('delta')"
        >
          <app-pi-input id="adj-delta" type="number" formControlName="delta" />
        </app-pi-form-field>

        <app-pi-form-field
          label="Причина"
          htmlFor="adj-reason"
          [required]="true"
          [error]="errorFor('reason')"
        >
          <app-pi-textarea
            id="adj-reason"
            formControlName="reason"
            [rows]="2"
            [maxLength]="256"
            ariaLabel="Причина"
          />
        </app-pi-form-field>

        @if (errorMessage()) {
          <p class="text-sm text-destructive" role="alert">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex justify-end gap-2">
        <app-pi-button
          type="button"
          variant="outline"
          (click)="onCancel()"
          [disabled]="submitting()"
        >
          Отмена
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          (click)="onSubmit()"
          [disabled]="submitting()"
          data-test="adjust-pick-save"
        >
          {{ submitting() ? 'Сохранение…' : 'Скорректировать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StorageAdjustPickDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(StorageItemsService);
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly listRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/storage-items`,
  }));
  protected readonly items = computed(() => this.listRes.value()?.items ?? []);

  protected readonly form = this.fb.group({
    itemId: this.fb.control('', [Validators.required]),
    delta: this.fb.control(0, [Validators.required]),
    reason: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
  });

  protected label(item: StorageItem): string {
    return storageItemName(item);
  }

  protected warehouseLabel(item: StorageItem): string {
    return storageItemWarehouseName(item);
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const delta = Number(v.delta);
    if (delta === 0) {
      this.errorMessage.set('Изменение не может быть 0');
      return;
    }
    const item = this.items().find((i) => i._id === v.itemId);
    if (item && (item.quantity ?? 0) + delta < 0) {
      this.errorMessage.set('Итог не может быть отрицательным');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.service.adjust(v.itemId, { delta, reason: v.reason.trim() }).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Остаток скорректирован');
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
