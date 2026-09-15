import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { CreateSitePayload } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';

export interface SiteFormDialogData {
  /** Site always belongs to the order's current counterparty — not user-selectable here. */
  readonly counterpartyId: string;
}

/**
 * TZ-NX-ORDER-WS-META-INLINE — thin create-only dialog for the order
 * workspace's «Объект» «+». Backend `POST /sites` already existed
 * (`SiteController.create`) with no frontend caller before this TZ — the
 * counterparty is fixed context (the order's own), not a field the user
 * picks here.
 */
@Component({
  selector: 'pi-site-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog title="Создать объект" variant="content" width="sm" [showClose]="true" (userClose)="ref.close()">
      <div body class="space-y-form-field">
        <label class="flex flex-col gap-1 text-sm">
          <span>Название *</span>
          <input
            type="text"
            class="pi-input pi-focus-ring"
            [value]="name()"
            (input)="name.set($any($event.target).value)"
            data-test="site-form-name"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>Адрес *</span>
          <input
            type="text"
            class="pi-input pi-focus-ring"
            [value]="address()"
            (input)="address.set($any($event.target).value)"
            data-test="site-form-address"
            required
          />
        </label>
      </div>
      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" (click)="ref.close()" data-test="site-form-cancel">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="!name().trim() || !address().trim()"
          (click)="confirm()"
          data-test="site-form-submit"
        >
          Создать
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class SiteFormDialogComponent {
  readonly data = inject<SiteFormDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<CreateSitePayload | undefined>>(PI_DIALOG_REF);

  readonly name = signal('');
  readonly address = signal('');

  confirm(): void {
    const name = this.name().trim();
    const address = this.address().trim();
    if (!name || !address) return;
    const payload: CreateSitePayload = { counterpartyId: this.data.counterpartyId, name, address };
    this.ref.close(payload);
  }
}
