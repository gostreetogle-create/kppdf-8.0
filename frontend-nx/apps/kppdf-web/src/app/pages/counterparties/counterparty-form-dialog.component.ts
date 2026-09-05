import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { Counterparty, CreateCounterpartyPayload } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';

export interface CounterpartyFormDialogData {
  /** Present = edit; absent = create. */
  readonly counterparty?: Counterparty;
}

/** Thin create/edit surface (TZ-NX-DEALS-D3) — name/ИНН/телефон/email only, not the legacy EAV editor. */
@Component({
  selector: 'pi-counterparty-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.counterparty ? 'Редактировать заказчика' : 'Создать заказчика'"
      variant="content"
      width="sm"
      [showClose]="true"
      (userClose)="ref.close()"
    >
      <div body class="space-y-form-field">
        <label class="flex flex-col gap-1 text-sm">
          <span>Название *</span>
          <input
            type="text"
            class="pi-input pi-focus-ring"
            [value]="name()"
            (input)="name.set($any($event.target).value)"
            data-test="counterparty-form-name"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>ИНН *</span>
          <input
            type="text"
            class="pi-input pi-focus-ring"
            [value]="inn()"
            (input)="inn.set($any($event.target).value)"
            placeholder="10 или 12 цифр"
            data-test="counterparty-form-inn"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>Телефон</span>
          <input
            type="text"
            class="pi-input pi-focus-ring"
            [value]="phone()"
            (input)="phone.set($any($event.target).value)"
            data-test="counterparty-form-phone"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>Email</span>
          <input
            type="email"
            class="pi-input pi-focus-ring"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            data-test="counterparty-form-email"
          />
        </label>
      </div>
      <div footer class="flex justify-end gap-3">
        <button type="button" class="pi-button pi-button-outline" (click)="ref.close()">Отмена</button>
        <button
          type="button"
          class="pi-button pi-button-primary"
          [disabled]="!name().trim() || !inn().trim()"
          (click)="confirm()"
          data-test="counterparty-form-submit"
        >
          {{ data.counterparty ? 'Сохранить' : 'Создать' }}
        </button>
      </div>
    </app-pi-dialog>
  `,
})
export class CounterpartyFormDialogComponent {
  readonly data = inject<CounterpartyFormDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<CreateCounterpartyPayload | undefined>>(PI_DIALOG_REF);
  private readonly toast = inject(PiToastService);

  readonly name = signal(this.data.counterparty?.name ?? '');
  readonly inn = signal(this.data.counterparty?.inn ?? '');
  readonly phone = signal(this.data.counterparty?.phone ?? '');
  readonly email = signal(this.data.counterparty?.email ?? '');

  confirm(): void {
    const name = this.name().trim();
    const inn = this.inn().trim();
    if (!name || !inn) {
      this.toast.error('Заполните название и ИНН.');
      return;
    }
    const payload: CreateCounterpartyPayload = {
      name,
      inn,
      roles: this.data.counterparty?.roles ?? ['customer'],
      phone: this.phone().trim() || undefined,
      email: this.email().trim() || undefined,
    };
    this.ref.close(payload);
  }
}
