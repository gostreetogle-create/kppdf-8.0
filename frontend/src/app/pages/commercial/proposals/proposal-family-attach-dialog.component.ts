import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import {
  AttachOrganizationItem,
  estimateFamilyTotal,
  Proposal,
  ProposalFamilyResponse,
  ProposalsService,
} from '../../../shared/services/pi-proposals.service';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { formatPrice } from '../../../shared/util/format';

export interface ProposalFamilyAttachDialogData {
  master: Proposal;
}

/**
 * Attach blank Organizations to a КП family (TZ-SALES-313).
 * Sum column is UI-only «оценка» — not written to BE.
 */
@Component({
  selector: 'app-proposal-family-attach-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-dialog title="Несколько фирм" [width]="'md'">
      <form body [formGroup]="form" class="space-y-3" data-test="family-attach-form">
        <p class="text-sm text-muted-foreground m-0">
          Добавьте бланки Organization к КП «{{ master.number }}». Сумма справа — только
          <strong>оценка</strong> (наценка не пишется в сохранённый total).
        </p>

        <div formArrayName="rows" class="space-y-2">
          @for (_ of rows.controls; track $index; let i = $index) {
            <div
              [formGroupName]="i"
              class="grid grid-cols-12 gap-2 items-end hairline rounded-sm p-2"
              [attr.data-test]="'family-attach-row-' + i"
            >
              <div class="col-span-12 sm:col-span-6">
                <app-pi-form-field label="Фирма (бланк)" [htmlFor]="'fa-org-' + i">
                  <app-pi-overflow-select
                    [items]="organizationItems()"
                    [value]="rowGroup(i).controls['organizationId'].value"
                    (valueChange)="onOrgChange(i, $event)"
                    searchable="auto"
                    placeholder="— выберите —"
                    [ariaLabel]="'Фирма ' + (i + 1)"
                    [dataTest]="'fa-org-' + i"
                  />
                </app-pi-form-field>
              </div>
              <div class="col-span-4 sm:col-span-2">
                <app-pi-form-field label="Наценка %" [htmlFor]="'fa-pct-' + i">
                  <app-pi-input
                    [id]="'fa-pct-' + i"
                    type="number"
                    formControlName="orgMarkupPercent"
                    size="sm"
                  />
                </app-pi-form-field>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <p class="eyebrow m-0 mb-1">оценка</p>
                <p class="text-sm font-mono m-0" [attr.data-test]="'fa-estimate-' + i">
                  {{ formatEstimate(rowGroup(i).controls['orgMarkupPercent'].value) }}
                </p>
              </div>
              <div class="col-span-2 sm:col-span-1 flex justify-end">
                <app-pi-button
                  type="button"
                  variant="ghost"
                  size="sm"
                  (click)="removeRow(i)"
                  [attr.aria-label]="'Удалить строку ' + (i + 1)"
                >
                  ×
                </app-pi-button>
              </div>
            </div>
          }
        </div>

        <app-pi-button
          type="button"
          variant="outline"
          size="sm"
          (click)="addRow()"
          data-test="fa-add-row"
        >
          + Фирма
        </app-pi-button>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive m-0">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
          data-test="fa-submit"
        >
          {{ submitting() ? 'Сохранение…' : 'Прикрепить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProposalFamilyAttachDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly orgs = inject(OrganizationsService);
  private readonly proposals = inject(ProposalsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<ProposalFamilyResponse | null>>(PI_DIALOG_REF);
  private readonly data = inject<ProposalFamilyAttachDialogData>(PI_DIALOG_DATA);

  protected readonly master = this.data.master;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly organizations = signal<Organization[]>([]);

  protected readonly form = this.fb.group({
    rows: this.fb.array([this.createRow()]),
  });

  get rows(): FormArray {
    return this.form.controls.rows;
  }

  /** Typed access for strict template checks (AbstractControl has no `.controls`). */
  protected rowGroup(index: number): FormGroup {
    return this.rows.at(index) as FormGroup;
  }

  protected readonly organizationItems = computed(() =>
    this.organizations().map((o) => ({
      id: o._id,
      label: `${o.name}${o.inn ? ' · ИНН ' + o.inn : ''}`,
    })),
  );

  constructor() {
    this.orgs.list({ limit: 200 }).subscribe((res) => {
      this.organizations.set(res.ok ? (res.data.items ?? []) : []);
    });
  }

  protected formatEstimate(pct: number | null | undefined): string {
    return formatPrice(estimateFamilyTotal(this.master.total ?? 0, Number(pct) || 0));
  }

  protected onOrgChange(index: number, id: string): void {
    this.rows.at(index).get('organizationId')?.setValue(id);
    this.rows.at(index).get('organizationId')?.markAsDirty();
  }

  protected addRow(): void {
    this.rows.push(this.createRow());
  }

  protected removeRow(index: number): void {
    if (this.rows.length <= 1) return;
    this.rows.removeAt(index);
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Выберите фирму в каждой строке');
      return;
    }
    const items: AttachOrganizationItem[] = this.rows.getRawValue().map((r) => ({
      organizationId: r.organizationId,
      orgMarkupPercent: Number(r.orgMarkupPercent) || 0,
    }));
    if (items.some((i) => !i.organizationId)) {
      this.errorMessage.set('Выберите фирму в каждой строке');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.proposals.attachOrganizations(this.master._id, items).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Фирмы прикреплены к семье КП');
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

  private createRow() {
    return this.fb.group({
      organizationId: this.fb.control('', [Validators.required]),
      orgMarkupPercent: this.fb.control(0, [Validators.min(0)]),
    });
  }
}
