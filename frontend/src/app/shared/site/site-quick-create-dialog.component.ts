import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../ui/button/button.component';
import { FormFieldComponent } from '../ui/form-field/form-field.component';
import { InputComponent } from '../ui/input/input.component';
import { PiDialogComponent } from '../ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../ui/dialog/dialog.tokens';
import type { DialogRef } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { Site, SiteService } from '../services/pi-site.service';
import { extractErrorMessage } from '../../core/silent-http';

export interface SiteQuickCreateDialogData {
  counterpartyId: string;
}

/**
 * TZ-UI-PLUS-603 — create site for selected counterparty from order form +.
 */
@Component({
  selector: 'app-site-quick-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
  ],
  template: `
    <app-pi-dialog title="Новый объект" [width]="'sm'" variant="form" [animate]="false">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="grid grid-cols-1 gap-form-field"
        data-test="site-quick-create-form"
      >
        <app-pi-form-field
          label="Название"
          htmlFor="sqc-name"
          [required]="true"
          [error]="errorFor('name')"
        >
          <app-pi-input
            id="sqc-name"
            formControlName="name"
            placeholder="Объект / площадка"
            [invalid]="hasError('name')"
            data-test="sqc-name"
          />
        </app-pi-form-field>

        <app-pi-form-field
          label="Адрес"
          htmlFor="sqc-address"
          [required]="true"
          [error]="errorFor('address')"
        >
          <app-pi-input
            id="sqc-address"
            formControlName="address"
            placeholder="Город, улица…"
            [invalid]="hasError('address')"
            data-test="sqc-address"
          />
        </app-pi-form-field>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="sqc-form-error">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex justify-end gap-2">
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
          data-test="sqc-save"
        >
          {{ submitting() ? 'Создание…' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class SiteQuickCreateDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly siteService = inject(SiteService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Site | null>>(PI_DIALOG_REF);
  private readonly data = inject<SiteQuickCreateDialogData>(PI_DIALOG_DATA);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
    address: this.fb.control('', [Validators.required, Validators.maxLength(512)]),
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.siteService
      .create({
        counterpartyId: this.data.counterpartyId,
        name: v.name.trim(),
        address: v.address.trim(),
      })
      .subscribe((res) => {
        if (!res.ok) {
          this.errorMessage.set(extractErrorMessage(res.error));
          this.submitting.set(false);
          return;
        }
        this.toast.success('Объект создан');
        this.ref.close(res.data);
      });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
