import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  DEFAULT_CURRENCIES,
  DEFAULT_UNITS,
  Material,
  MaterialCreateValues,
  materialCreateSchema,
} from '../../core/material.service';

export interface MaterialFormDialogData {
  /** Provided when in edit-mode; absent for create. */
  material?: Material;
}

export type MaterialFormDialogResult =
  | { action: 'submitted'; values: MaterialCreateValues }
  | { action: 'canceled' };

/**
 * Modal dialog used both for **create** and **edit** of a Material.
 * Reuses a single source of truth (MaterialCreateValues via zod) so the
 * server contract stays the only authority on what fields are valid.
 */
@Component({
  selector: 'app-material-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">
        {{ data.material ? 'edit' : 'add_box' }}
      </mat-icon>
      <span>{{ data.material ? 'Редактировать материал' : 'Новый материал' }}</span>
    </h2>

    <form [formGroup]="form" (ngSubmit)="submit()" mat-dialog-content class="form">
      <mat-form-field appearance="outline" class="span-2">
        <mat-label>Название</mat-label>
        <input matInput formControlName="name" maxlength="256" />
        @if (form.controls.name.touched && form.controls.name.hasError('required')) {
          <mat-error>Введите название</mat-error>
        }
        @if (form.controls.name.touched && form.controls.name.hasError('maxlength')) {
          <mat-error>Слишком длинное название</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Артикул</mat-label>
        <input matInput formControlName="article" maxlength="64" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Единица измерения</mat-label>
        <mat-select formControlName="unit">
          @for (u of units; track u) {
            <mat-option [value]="u">{{ u }}</mat-option>
          }
        </mat-select>
        @if (form.controls.unit.touched && form.controls.unit.hasError('required')) {
          <mat-error>Выберите единицу</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="span-2">
        <mat-label>Описание</mat-label>
        <textarea
          matInput
          formControlName="description"
          rows="2"
          maxlength="2000"
        ></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Цена за единицу</mat-label>
        <input
          matInput
          type="number"
          min="0"
          step="0.01"
          formControlName="pricePerUnit"
        />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Валюта</mat-label>
        <mat-select formControlName="priceCurrency">
          <mat-option [value]="''">— не указано —</mat-option>
          @for (c of currencies; track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Остаток на складе</mat-label>
        <input
          matInput
          type="number"
          min="0"
          step="1"
          formControlName="stockQty"
        />
      </mat-form-field>

      <mat-checkbox formControlName="fixedDimensions" class="span-2">
        Фиксированные размеры (не резать под заказ)
      </mat-checkbox>

      <mat-form-field appearance="outline" class="span-2">
        <mat-label>Заметки</mat-label>
        <textarea matInput formControlName="notes" rows="2" maxlength="2000"></textarea>
      </mat-form-field>
    </form>

    <div mat-dialog-actions align="end" class="actions">
      @if (errorMsg(); as msg) {
        <span class="error" role="alert">{{ msg }}</span>
      }
      <button mat-button type="button" (click)="cancel()" [disabled]="submitting()">
        Отмена
      </button>
      <button
        mat-flat-button
        color="primary"
        type="submit"
        (click)="submit()"
        [disabled]="form.invalid || submitting()"
      >
        @if (submitting()) {
          <mat-spinner diameter="18"></mat-spinner>
          <span>Сохраняем…</span>
        } @else {
          <mat-icon>save</mat-icon>
          <span>{{ data.material ? 'Сохранить' : 'Создать' }}</span>
        }
      </button>
    </div>
  `,
  styles: `
    :host { display: block; min-width: 560px; max-width: 90vw; }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }

    .title-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: var(--mat-sys-primary);
    }

    .form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 14px;
      padding-top: 6px;
    }

    .form .span-2 { grid-column: span 2; }

    mat-form-field { width: 100%; }

    mat-checkbox {
      align-self: center;
      padding: 8px 0;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .actions .error {
      flex: 1;
      color: var(--mat-sys-error);
      font-size: 13px;
      background: color-mix(in srgb, var(--mat-sys-error) 8%, transparent);
      padding: 6px 10px;
      border-radius: 4px;
    }
  `,
})
export class MaterialFormDialog {
  readonly units = DEFAULT_UNITS;
  readonly currencies = DEFAULT_CURRENCIES;

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<MatDialogRef<MaterialFormDialog, MaterialFormDialogResult>>(
    MatDialogRef,
  );
  readonly data = inject<MaterialFormDialogData>(MAT_DIALOG_DATA);

  readonly submitting = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(256)]],
    article: ['', [Validators.maxLength(64)]],
    unit: ['pcs', [Validators.required, Validators.maxLength(32)]],
    description: ['', [Validators.maxLength(2000)]],
    pricePerUnit: [null as number | null, [Validators.min(0)]],
    priceCurrency: [''],
    stockQty: [null as number | null, [Validators.min(0)]],
    fixedDimensions: [false],
    notes: ['', [Validators.maxLength(2000)]],
  });

  constructor() {
    // Pre-fill when editing; form defaults are already create-friendly.
    const src = this.data.material;
    if (src) {
      this.form.patchValue({
        name: src.name ?? '',
        article: src.article ?? '',
        unit: src.unit ?? 'pcs',
        description: src.description ?? '',
        pricePerUnit: src.pricePerUnit ?? null,
        priceCurrency: src.priceCurrency ?? '',
        stockQty: src.stockQty ?? null,
        fixedDimensions: src.fixedDimensions ?? false,
        notes: src.notes ?? '',
      });
    }
  }

  cancel(): void {
    this.dialogRef.close({ action: 'canceled' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    // Convert empty strings to undefined so zod `optional().or(z.literal(''))`
    // can normalize; numbers stay null when blank.
    const candidate = {
      ...raw,
      pricePerUnit: raw.pricePerUnit ?? undefined,
      stockQty: raw.stockQty ?? undefined,
    };
    const parsed = materialCreateSchema.safeParse(candidate);
    if (!parsed.success) {
      this.errorMsg.set(parsed.error.issues[0]?.message ?? 'Некорректные данные');
      return;
    }
    this.dialogRef.close({ action: 'submitted', values: parsed.data });
  }
}
