import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  PiDialogComponent,
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import {
  PiStorageItemsService,
  type StorageAdjustPayload,
  type StorageItem,
} from '@kppdf/data-access';
import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { storageItemName } from '@kppdf/data-access';

export interface StorageAdjustDialogData {
  readonly item: StorageItem;
}

@Component({
  selector: 'pi-storage-adjust-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Корректировка остатка"
      variant="content"
      width="sm"
      [showClose]="true"
      (userClose)="ref.close(undefined)"
    >
      <div body class="space-y-form-field">
        <p class="text-sm text-muted-foreground m-0">
          {{ itemName }} · сейчас {{ data.item.quantity }}
        </p>
        <label class="flex flex-col gap-1 text-sm" for="adjust-delta">
          <span>Изменение (±) *</span>
          <input
            id="adjust-delta"
            class="pi-input pi-focus-ring"
            type="number"
            [value]="delta()"
            (input)="delta.set(numberValue($event))"
            data-test="adjust-delta"
          />
          <span class="text-xs text-muted-foreground"
            >Отрицательное значение уменьшает остаток.</span
          >
        </label>
        <label class="flex flex-col gap-1 text-sm" for="adjust-reason">
          <span>Причина *</span>
          <textarea
            id="adjust-reason"
            class="pi-input pi-focus-ring min-h-20"
            [value]="reason()"
            (input)="reason.set(inputValue($event))"
            maxlength="256"
            data-test="adjust-reason"
          ></textarea>
        </label>
        <p class="text-sm m-0">
          Итог:
          <strong data-test="adjust-preview">{{ previewQuantity() }}</strong>
        </p>
        @if (error()) {
          <p
            class="text-sm text-destructive m-0"
            role="alert"
            data-test="adjust-error"
          >
            {{ error() }}
          </p>
        }
      </div>
      <div footer class="flex justify-end gap-3">
        <button
          type="button"
          class="pi-button pi-button-outline"
          (click)="ref.close(undefined)"
        >
          Отмена
        </button>
        <button
          type="button"
          class="pi-button pi-button-primary"
          [disabled]="saving()"
          (click)="submit()"
          data-test="adjust-submit"
        >
          Скорректировать
        </button>
      </div>
    </app-pi-dialog>
  `,
})
export class StorageAdjustDialogComponent {
  readonly data = inject<StorageAdjustDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<unknown>>(PI_DIALOG_REF);
  private readonly api = inject(PiStorageItemsService);
  private readonly toast = inject(PiToastService);

  readonly itemName = storageItemName(this.data.item);
  readonly delta = signal(0);
  readonly reason = signal('');
  readonly saving = signal(false);
  readonly error = signal('');
  readonly previewQuantity = computed(
    () => this.data.item.quantity + this.delta(),
  );

  inputValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  numberValue(event: Event): number {
    return Number((event.target as HTMLInputElement).value) || 0;
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    if (this.delta() === 0 || !this.reason().trim()) {
      this.error.set('Укажите ненулевое изменение и причину.');
      return;
    }
    if (this.previewQuantity() < 0) {
      this.error.set('Итоговый остаток не может быть отрицательным.');
      return;
    }
    const payload: StorageAdjustPayload = {
      delta: this.delta(),
      reason: this.reason().trim(),
    };
    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(
      this.api.adjust(this.data.item._id, payload),
    );
    if (result.ok) {
      this.toast.success('Остаток скорректирован');
      this.ref.close(result.data);
    } else {
      this.error.set(extractErrorMessage(result.error));
      this.saving.set(false);
    }
  }
}
