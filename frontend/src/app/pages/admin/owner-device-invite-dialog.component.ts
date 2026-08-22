import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import {
  IssuedInvite,
  PiDeviceEnrollmentService,
} from '../../shared/services/pi-device-enrollment.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';

/**
 * TZ-AUTH-304 — owner-only «Добавить мой компьютер».
 *
 * Запрашивает текущий пароль владельца (step-up), затем выдаёт одноразовую
 * ссылку на 15 минут БЕЗ выбора роли: новый браузер привязывается к тому же
 * единственному owner (второй owner не создаётся).
 */
@Component({
  selector: 'pi-owner-device-invite-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="result() ? 'Ссылка готова' : 'Добавить мой компьютер'"
      [width]="'sm'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        @if (result(); as invite) {
          <p class="text-sm text-muted-foreground mb-3">
            Одноразовая ссылка (15 минут) подключит новый компьютер к вашей учётной записи
            владельца.
          </p>
          <div
            class="invite-link pi-dashed-panel p-3 mb-4 break-all text-xs font-mono"
            data-test="owner-invite-url"
          >
            {{ invite.url }}
          </div>
          <app-pi-button
            variant="default"
            size="sm"
            (click)="onCopy()"
            data-test="owner-invite-copy"
          >
            {{ copied() ? 'Скопировано' : 'Копировать' }}
          </app-pi-button>
        } @else {
          <div class="owner-form">
            <label class="field">
              <span class="field__label">Пароль владельца</span>
              <input
                class="field__input"
                type="password"
                [value]="password()"
                (input)="onPasswordInput($event)"
                autocomplete="current-password"
                data-test="owner-invite-password"
              />
            </label>
            @if (error()) {
              <p class="field__error" data-test="owner-invite-error">{{ error() }}</p>
            }
          </div>
        }
      </div>
      <div footer>
        @if (result()) {
          <app-pi-button variant="ghost" size="sm" (click)="ref.close()">Готово</app-pi-button>
        } @else {
          <app-pi-button variant="ghost" size="sm" (click)="ref.close()">Отмена</app-pi-button>
          <app-pi-button
            variant="default"
            size="sm"
            [disabled]="!password() || submitting()"
            (click)="onSubmit()"
            data-test="owner-invite-submit"
          >
            {{ submitting() ? 'Создаём…' : 'Создать ссылку' }}
          </app-pi-button>
        }
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .owner-form {
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
export class OwnerDeviceInviteDialogComponent {
  protected readonly ref = inject<DialogRef<IssuedInvite>>(PI_DIALOG_REF);
  private readonly devices = inject(PiDeviceEnrollmentService);

  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly result = signal<IssuedInvite | null>(null);
  protected readonly copied = signal(false);

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(): void {
    if (this.submitting() || !this.password()) return;
    this.submitting.set(true);
    this.error.set(null);
    this.devices
      .createOwnerInvite(this.password())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe((res) => {
        if (res.ok) {
          this.password.set('');
          this.result.set(res.data);
        } else {
          this.error.set(
            res.error.status === 401 ? 'Неверный пароль владельца.' : this.describe(res.error),
          );
        }
      });
  }

  protected onCopy(): void {
    const url = this.result()?.url;
    if (!url) return;
    navigator.clipboard
      ?.writeText(url)
      .then(() => this.copied.set(true))
      .catch(() => undefined);
  }

  private describe(e: { error?: { message?: string } }): string {
    return e?.error?.message ?? 'Не удалось создать ссылку.';
  }
}
