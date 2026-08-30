import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PiUnitsService, type Unit, type UpdateUnitPayload } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { extractErrorMessage } from '@kppdf/util-http';

export interface UnitFormDialogData {
  readonly unit: Unit;
}

@Component({
  selector: 'pi-unit-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog title="Редактировать единицу измерения" variant="content" [showClose]="true">
      <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="unit-form">
        <app-pi-form-field label="Ключ" htmlFor="unit-key">
          <span id="unit-key" class="text-sm font-mono">{{ data.unit.key }}</span>
        </app-pi-form-field>
        <div class="grid md:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Название" htmlFor="unit-label" [required]="true">
            <app-pi-input id="unit-label" formControlName="label" />
          </app-pi-form-field>
          <app-pi-form-field label="Обозначение" htmlFor="unit-symbol">
            <app-pi-input id="unit-symbol" formControlName="symbol" />
          </app-pi-form-field>
          <app-pi-form-field label="Категория" htmlFor="unit-category">
            <app-pi-input id="unit-category" formControlName="category" />
          </app-pi-form-field>
          <app-pi-form-field label="Порядок" htmlFor="unit-sort">
            <app-pi-input id="unit-sort" type="number" formControlName="sortOrder" />
          </app-pi-form-field>
        </div>
        @if (data.unit.isSystem) {
          <p class="text-xs text-muted-foreground">Системная единица — ключ не меняется.</p>
        }
        @if (errorMessage()) {
          <p role="alert" class="text-destructive text-sm">{{ errorMessage() }}</p>
        }
      </form>
      <div footer class="flex justify-end gap-3">
        <app-pi-button variant="default" [disabled]="saving()" (click)="submit()">
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class UnitFormDialogComponent {
  protected readonly data = inject<UnitFormDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Unit | null | undefined>>(PI_DIALOG_REF);
  private readonly service = inject(PiUnitsService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    label: [this.data.unit.label, Validators.required],
    symbol: [this.data.unit.symbol ?? ''],
    category: [this.data.unit.category ?? ''],
    sortOrder: [this.data.unit.sortOrder],
  });

  protected async submit(): Promise<void> {
    if (this.saving() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const v = this.form.getRawValue();
    const payload: UpdateUnitPayload = {
      label: v.label.trim(),
      symbol: v.symbol.trim() || null,
      category: v.category.trim() || null,
      sortOrder: Number(v.sortOrder),
    };
    const result = await firstValueFrom(this.service.update(this.data.unit.key, payload));
    this.saving.set(false);
    if (!result.ok) {
      this.errorMessage.set(extractErrorMessage(result.error));
      return;
    }
    this.ref.close(result.data);
  }
}
