import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { extractErrorMessage } from '../../core/silent-http';
import {
  ActiveRole,
  AdminDevice,
  PiDeviceEnrollmentService,
} from '../../shared/services/pi-device-enrollment.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';

export interface DeviceEditData {
  device: AdminDevice;
  /** 'role' → change role picker; 'ttl' → change access lifetime picker. */
  mode: 'role' | 'ttl';
}

const DEVICE_TTL_OPTIONS = [
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
  { value: 365, label: '365 дней' },
] as const;

/**
 * TZ-AUTH-304 — «Изменить роль» / «Изменить срок» для устройства.
 *
 * Роль меняется на следующем автоматическом продлении сессии (≤5 минут);
 * срок — новый период действия grant от текущего момента.
 */
@Component({
  selector: 'pi-device-role-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.mode === 'role' ? 'Изменить роль' : 'Изменить срок'"
      [width]="'sm'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <p class="text-sm text-muted-foreground mb-4">
          Компьютер <span class="font-mono">{{ data.device.deviceName }}</span
          >.
        </p>

        @if (data.mode === 'role') {
          @if (loadingRoles()) {
            <p class="text-sm text-muted-foreground">Загружаем роли…</p>
          } @else {
            <label class="field">
              <span class="field__label">Роль</span>
              <select
                class="field__input"
                [value]="role()"
                (change)="onRoleChange($event)"
                data-test="device-role-select"
              >
                @for (r of roles(); track r.name) {
                  <option [value]="r.name">{{ r.label || r.name }}</option>
                }
              </select>
            </label>
          }
        } @else {
          <label class="field">
            <span class="field__label">Срок доступа</span>
            <select
              class="field__input"
              [value]="ttlDays()"
              (change)="onTtlChange($event)"
              data-test="device-ttl-select"
            >
              @for (o of deviceTtlOptions; track o.value) {
                <option [value]="o.value">{{ o.label }}</option>
              }
            </select>
          </label>
        }

        @if (error()) {
          <p class="field__error" data-test="device-edit-error">{{ error() }}</p>
        }
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="ref.close()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          [disabled]="submitting() || (data.mode === 'role' && !role())"
          (click)="onSubmit()"
          data-test="device-edit-submit"
        >
          {{ submitting() ? 'Сохраняем…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
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
export class DeviceRoleDialogComponent implements OnInit {
  protected readonly data = inject<DeviceEditData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<AdminDevice>>(PI_DIALOG_REF);
  private readonly devices = inject(PiDeviceEnrollmentService);
  private readonly auth = inject(AuthService);

  protected readonly deviceTtlOptions = DEVICE_TTL_OPTIONS;

  protected readonly roles = signal<ActiveRole[]>([]);
  protected readonly loadingRoles = signal(true);
  protected readonly role = signal('');
  protected readonly ttlDays = signal<number>(365);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.data.mode === 'role') {
      this.role.set(this.data.device.role);
      this.devices.listRoles().subscribe((res) => {
        this.loadingRoles.set(false);
        if (!res.ok) {
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        this.roles.set(
          res.data.filter(
            (r) => r.isActive !== false && (this.auth.isOwner() || r.name !== 'admin'),
          ),
        );
      });
    }
  }

  protected onRoleChange(event: Event): void {
    this.role.set((event.target as HTMLSelectElement).value);
  }

  protected onTtlChange(event: Event): void {
    this.ttlDays.set(Number((event.target as HTMLSelectElement).value));
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    const payload =
      this.data.mode === 'role' ? { role: this.role() } : { expiresInDays: this.ttlDays() };
    if (this.data.mode === 'role' && !payload.role) return;

    this.submitting.set(true);
    this.error.set(null);
    this.devices
      .updateDevice(this.data.device.id, payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe((res) => {
        if (res.ok) {
          this.ref.close(res.data);
        } else {
          this.error.set(this.describeError(res.error));
        }
      });
  }

  private describeError(e: { status?: number; error?: unknown }): string {
    if (e?.status === 403)
      return 'Управление администраторским устройством — только для владельца.';
    return extractErrorMessage(e as never);
  }
}
