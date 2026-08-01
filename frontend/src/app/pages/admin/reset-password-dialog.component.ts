import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';

export interface ResetPasswordData {
  username: string;
}

/**
 * TZ-257.A.1 §2/§5 — administrator password reset dialog.
 *
 * Only `newPassword` is requested — the backend DTO
 * (`AdminResetPasswordDto`) intentionally has no `oldPassword` field:
 * an admin resets another user's password without knowing the current
 * one. Confirms via a secondary password field to reduce typos.
 */
@Component({
  selector: 'pi-reset-password-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Сброс пароля"
      [width]="'sm'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <p class="text-sm text-muted-foreground mb-4">
          Новый пароль для <span class="font-mono">{{ data.username }}</span>. Пользователю
          придётся войти заново.
        </p>

        <div class="reset-form">
          <label class="field">
            <span class="field__label">Новый пароль (мин. 8 символов)</span>
            <input
              class="field__input"
              type="password"
              [value]="password()"
              (input)="onPasswordInput($event)"
              autocomplete="new-password"
              data-test="reset-password-input"
            />
          </label>

          <label class="field">
            <span class="field__label">Повторите пароль</span>
            <input
              class="field__input"
              type="password"
              [value]="confirm()"
              (input)="onConfirmInput($event)"
              autocomplete="new-password"
              data-test="reset-password-confirm"
            />
          </label>

          @if (error()) {
            <p class="field__error" data-test="reset-password-error">{{ error() }}</p>
          }
        </div>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          [disabled]="!canSubmit()"
          (click)="onSubmit()"
          data-test="reset-password-submit"
        >
          Сбросить
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .reset-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 4px 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__input {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--color-ink, #191c1d);
        background: var(--color-paper, #f8f9fa);
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        outline: none;
        transition: border-color 120ms ease;
      }

      .field__input:focus {
        border-color: var(--color-sunrise-warm, #735c00);
      }

      .field__error {
        font-size: 12px;
        color: var(--color-destructive, #b91c1c);
        margin: 0;
      }
    `,
  ],
})
export class ResetPasswordDialogComponent {
  readonly data = inject<ResetPasswordData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<string>>(PI_DIALOG_REF);

  protected readonly password = signal<string>('');
  protected readonly confirm = signal<string>('');
  protected readonly error = signal<string | null>(null);

  protected readonly canSubmit = (): boolean => {
    return this.password().length >= 8;
  };

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onConfirmInput(event: Event): void {
    this.confirm.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(): void {
    if (this.password() !== this.confirm()) {
      this.error.set('Пароли не совпадают');
      return;
    }
    this.ref.close(this.password());
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
