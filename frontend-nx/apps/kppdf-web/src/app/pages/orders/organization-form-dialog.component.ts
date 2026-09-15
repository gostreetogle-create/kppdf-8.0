import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { CreateOrganizationPayload } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';

/**
 * TZ-NX-ORDER-WS-META-INLINE — thin create-only dialog for the order
 * workspace's «Наша фирма» «+» (mirrors `CounterpartyFormDialogComponent`'s
 * name/ИНН-only surface, not the full registries `SimpleRegistryFormDialogComponent`
 * admin form, which is generic-registries-context-coupled and out of
 * proportion here). Always sets `isOurCompany: true` — this dialog only
 * ever creates the organization the order itself is fulfilled by, never a
 * supplier or other org type.
 */
@Component({
  selector: 'pi-organization-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog title="Создать нашу фирму" variant="content" width="sm" [showClose]="true" (userClose)="ref.close()">
      <div body class="space-y-form-field">
        <label class="flex flex-col gap-1 text-sm">
          <span>Название *</span>
          <input
            type="text"
            class="pi-input pi-focus-ring"
            [value]="name()"
            (input)="name.set($any($event.target).value)"
            data-test="organization-form-name"
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
            data-test="organization-form-inn"
            required
          />
        </label>
      </div>
      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" (click)="ref.close()" data-test="organization-form-cancel">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="!name().trim() || !inn().trim()"
          (click)="confirm()"
          data-test="organization-form-submit"
        >
          Создать
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class OrganizationFormDialogComponent {
  readonly ref = inject<DialogRef<CreateOrganizationPayload | undefined>>(PI_DIALOG_REF);

  readonly name = signal('');
  readonly inn = signal('');

  confirm(): void {
    const name = this.name().trim();
    const inn = this.inn().trim();
    if (!name || !inn) return;
    const payload: CreateOrganizationPayload = { name, inn, isOurCompany: true };
    this.ref.close(payload);
  }
}
