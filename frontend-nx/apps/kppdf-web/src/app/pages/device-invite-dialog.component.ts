import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@kppdf/data-access/auth';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  ActiveRole,
  IssuedInvite,
  PiDeviceEnrollmentService,
} from '@kppdf/data-access/admin';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent } from '@kppdf/ui/dialog';
import { PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';

const LINK_TTL_OPTIONS = [
  { value: 1, label: '1 день' },
  { value: 3, label: '3 дня' },
  { value: 7, label: '7 дней' },
] as const;

const DEVICE_TTL_OPTIONS = [
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
  { value: 365, label: '365 дней' },
] as const;

/**
 * TZ-AUTH-304 — диалог создания regular-ссылки.
 *
 * Роль выбирается ОБЯЗАТЕЛЬНО до создания (из активных ролей `GET /api/roles`;
 * `admin` скрыт для ordinary admin — admin-power owner-only). После создания
 * показывается готовая ссылка + кнопка «Копировать».
 */
@Component({
  selector: 'pi-device-invite-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="result() ? 'Ссылка готова' : 'Создать ссылку'"
      [width]="'sm'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        @if (result(); as invite) {
          <p class="text-sm text-muted-foreground mb-3">
            Одноразовая ссылка на подключение компьютера
            @if (invite.role) {
              с ролью <span class="font-mono">{{ invite.role }}</span>
            }
            .
          </p>
          <div
            class="invite-link pi-dashed-panel p-3 mb-4 break-all text-xs font-mono"
            data-test="device-invite-url"
          >
            {{ invite.url }}
          </div>
          <app-pi-button
            variant="default"
            size="sm"
            (click)="onCopy()"
            data-test="device-invite-copy"
          >
            {{ copied() ? 'Скопировано' : 'Копировать' }}
          </app-pi-button>
        } @else {
          @if (loadingRoles()) {
            <p class="text-sm text-muted-foreground">Загружаем роли…</p>
          } @else {
            <div class="invite-form">
              <label class="field">
                <span class="field__label">Роль (обязательно)</span>
                <select
                  class="field__input"
                  [value]="role()"
                  (change)="onRoleChange($event)"
                  data-test="device-invite-role"
                >
                  <option value="" disabled>Выберите роль…</option>
                  @for (r of roles(); track r.name) {
                    <option [value]="r.name">{{ r.label || r.name }}</option>
                  }
                </select>
              </label>

              <label class="field">
                <span class="field__label">Срок действия ссылки</span>
                <select
                  class="field__input"
                  [value]="ttlDays()"
                  (change)="onTtlChange($event)"
                  data-test="device-invite-ttl"
                >
                  @for (o of linkTtlOptions; track o.value) {
                    <option [value]="o.value">{{ o.label }}</option>
                  }
                </select>
              </label>

              <label class="field">
                <span class="field__label">Срок доступа компьютера</span>
                <select
                  class="field__input"
                  [value]="deviceTtlDays()"
                  (change)="onDeviceTtlChange($event)"
                  data-test="device-invite-device-ttl"
                >
                  @for (o of deviceTtlOptions; track o.value) {
                    <option [value]="o.value">{{ o.label }}</option>
                  }
                </select>
              </label>

              @if (error()) {
                <p class="field__error" data-test="device-invite-error">{{ error() }}</p>
              }
            </div>
          }
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
            [disabled]="!role() || submitting()"
            (click)="onSubmit()"
            data-test="device-invite-submit"
          >
            {{ submitting() ? 'Создаём…' : 'Создать ссылку' }}
          </app-pi-button>
        }
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .invite-form {
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
export class DeviceInviteDialogComponent implements OnInit {
  protected readonly ref = inject<DialogRef<IssuedInvite>>(PI_DIALOG_REF);
  private readonly devices = inject(PiDeviceEnrollmentService);
  private readonly auth = inject(AuthService);

  protected readonly linkTtlOptions = LINK_TTL_OPTIONS;
  protected readonly deviceTtlOptions = DEVICE_TTL_OPTIONS;

  protected readonly roles = signal<ActiveRole[]>([]);
  protected readonly loadingRoles = signal(true);
  protected readonly role = signal('');
  protected readonly ttlDays = signal<number>(3);
  protected readonly deviceTtlDays = signal<number>(365);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly result = signal<IssuedInvite | null>(null);
  protected readonly copied = signal(false);

  ngOnInit(): void {
    this.devices.listRoles().subscribe((res) => {
      this.loadingRoles.set(false);
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error));
        return;
      }
      // Active roles only; `admin` is owner-only (TZ-AUTH-306).
      const active = res.data.filter(
        (r) => r.isActive !== false && (this.auth.isOwner() || r.name !== 'admin'),
      );
      this.roles.set(active);
    });
  }

  protected onRoleChange(event: Event): void {
    this.role.set((event.target as HTMLSelectElement).value);
  }

  protected onTtlChange(event: Event): void {
    this.ttlDays.set(Number((event.target as HTMLSelectElement).value));
  }

  protected onDeviceTtlChange(event: Event): void {
    this.deviceTtlDays.set(Number((event.target as HTMLSelectElement).value));
  }

  protected onSubmit(): void {
    if (this.submitting() || !this.role()) return;
    this.submitting.set(true);
    this.error.set(null);
    this.devices
      .createInvite(this.role(), this.ttlDays(), this.deviceTtlDays())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe((res) => {
        if (res.ok) {
          this.result.set(res.data);
        } else {
          this.error.set(this.describeError(res.error));
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

  private describeError(e: { status?: number; error?: unknown }): string {
    if (e?.status === 403) return 'Это действие доступно только владельцу системы.';
    return extractErrorMessage(e as never);
  }
}
