import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage, type SilentResult } from '../../core/silent-http';

export interface ResetPasswordData {
  username: string;
  submit?: (password: string) => Observable<SilentResult<unknown>>;
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
          Новый пароль для <span class="font-mono">{{ data.username }}</span
          >. Пользователю придётся войти заново.
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
          [disabled]="!canSubmit() || submitting()"
          (click)="onSubmit()"
          data-test="reset-password-submit"
        >
          {{ submitting() ? 'Сброс…' : 'Сбросить' }}
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
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted);
      }

      .field__input {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        outline: none;
        transition: border-color 120ms ease;
      }

      .field__input:focus {
        border-color: var(--color-sunrise-warm);
      }

      .field__error {
        font-size: 12px;
        color: var(--color-destructive);
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
  protected readonly submitting = signal(false);

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onConfirmInput(event: Event): void {
    this.confirm.set((event.target as HTMLInputElement).value);
  }

  protected readonly canSubmit = (): boolean => {
    return this.password().length >= 8;
  };

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.password() !== this.confirm()) {
      this.error.set('Пароли не совпадают');
      return;
    }
    if (!this.data.submit) {
      this.ref.close(this.password());
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.data.submit(this.password()).subscribe((res) => {
      if (res.ok) {
        this.submitting.set(false);
        this.ref.close(this.password());
      } else {
        this.error.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
