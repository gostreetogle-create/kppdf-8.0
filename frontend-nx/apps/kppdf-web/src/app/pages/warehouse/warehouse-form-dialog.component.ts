import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { Warehouse, WarehouseWritePayload } from '@kppdf/data-access';

export interface WarehouseFormDialogData {
  readonly warehouse?: Warehouse;
}

@Component({
  selector: 'pi-warehouse-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.warehouse ? 'Изменить склад' : 'Создать склад'"
      variant="content"
      width="sm"
      [showClose]="true"
      (userClose)="ref.close(undefined)"
    >
      <div body class="space-y-form-field">
        <label class="flex flex-col gap-1 text-sm" for="warehouse-name">
          <span>Название *</span>
          <input
            id="warehouse-name"
            class="pi-input pi-focus-ring"
            type="text"
            [value]="name()"
            (input)="onNameInput($event)"
            maxlength="128"
            required
            data-test="warehouse-form-name"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm" for="warehouse-description">
          <span>Описание</span>
          <textarea
            id="warehouse-description"
            class="pi-input pi-focus-ring min-h-20"
            [value]="description()"
            (input)="onDescriptionInput($event)"
            maxlength="512"
            data-test="warehouse-form-description"
          ></textarea>
        </label>
        <label class="inline-flex items-center gap-2 text-sm" for="warehouse-active">
          <input
            id="warehouse-active"
            type="checkbox"
            [checked]="isActive()"
            (change)="onActiveChange($event)"
            data-test="warehouse-form-active"
          />
          <span>Активен</span>
        </label>
        @if (error()) {
          <p class="text-sm text-destructive" role="alert" data-test="warehouse-form-error">{{ error() }}</p>
        }
      </div>
      <div footer class="flex justify-end gap-3">
        <button type="button" class="pi-button pi-button-outline" (click)="ref.close(undefined)">Отмена</button>
        <button
          type="button"
          class="pi-button pi-button-primary"
          [disabled]="saving() || !name().trim()"
          (click)="submit()"
          data-test="warehouse-form-submit"
        >
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </div>
    </app-pi-dialog>
  `,
})
export class WarehouseFormDialogComponent {
  readonly data = inject<WarehouseFormDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<WarehouseWritePayload | undefined>>(PI_DIALOG_REF);
  private readonly toast = inject(PiToastService);

  readonly name = signal(this.data.warehouse?.name ?? '');
  readonly description = signal(this.data.warehouse?.description ?? '');
  readonly isActive = signal(this.data.warehouse?.isActive ?? true);
  readonly saving = signal(false);
  readonly error = signal('');

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onDescriptionInput(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }

  onActiveChange(event: Event): void {
    this.isActive.set((event.target as HTMLInputElement).checked);
  }

  submit(): void {
    const name = this.name().trim();
    if (!name || this.saving()) return;
    const payload: WarehouseWritePayload = {
      name,
      type: 'main',
      zoneNames: [],
      description: this.description().trim() || undefined,
      isActive: this.isActive(),
    };
    this.ref.close(payload);
  }
}
