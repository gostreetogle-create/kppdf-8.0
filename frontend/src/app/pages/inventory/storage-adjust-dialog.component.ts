import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { StorageItem, storageItemName, StorageItemsService } from './storage-items.service';

export interface StorageAdjustDialogData {
  item: StorageItem;
}

type Result = StorageItem | null | undefined;

/**
 * Adjust storage qty — POST /storage-items/:id/adjust (creates adjust movement).
 */
@Component({
  selector: 'app-storage-adjust-dialog',
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
      [maxWidth]="'min(520px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="storage-adjust-form"
      >
        <p class="text-sm text-muted-foreground">
          {{ itemLabel }} · сейчас {{ data.item.quantity }}
          @if (data.item.warehouse?.name) {
            · {{ data.item.warehouse?.name }}
          }
        </p>

        <app-pi-form-field
          label="Изменение (±)"
          htmlFor="adj-delta"
          hint="Отрицательное — списать, положительное — добавить"
          [required]="true"
          [error]="errorFor('delta')"
        >
          <app-pi-input
            id="adj-delta"
            type="number"
            formControlName="delta"
            placeholder="0"
            [invalid]="hasError('delta')"
          />
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
            ariaLabel="Причина корректировки"
          />
        </app-pi-form-field>

        <p class="text-sm">
          Будет:
          <span class="font-mono">{{ previewQty() }}</span>
        </p>

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
          data-test="adjust-save"
        >
          {{ submitting() ? 'Сохранение…' : 'Скорректировать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StorageAdjustDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(StorageItemsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  protected readonly data = inject<StorageAdjustDialogData>(PI_DIALOG_DATA);

  protected readonly itemLabel = storageItemName(this.data.item);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    delta: this.fb.control(0, [Validators.required]),
    reason: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
  });

  protected previewQty(): number {
    return (this.data.item.quantity ?? 0) + Number(this.form.controls.delta.value || 0);
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) return 'Слишком длинно';
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
    if (this.previewQty() < 0) {
      this.errorMessage.set('Итог не может быть отрицательным');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.service.adjust(this.data.item._id, { delta, reason: v.reason.trim() }).subscribe((res) => {
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
