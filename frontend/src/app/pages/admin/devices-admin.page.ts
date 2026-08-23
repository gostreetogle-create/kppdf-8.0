import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { AuthService } from '../../core/auth.service';
import { extractErrorMessage } from '../../core/silent-http';
import {
  AdminDevice,
  PiDeviceEnrollmentService,
} from '../../shared/services/pi-device-enrollment.service';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { ADMIN_ENTITY_SECTION_CHIPS, ADMIN_TOC_CHIPS } from './admin-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { TableComponent, type ColumnDef } from '../../shared/ui/pi-table.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { DeviceInviteDialogComponent } from './device-invite-dialog.component';
import { OwnerDeviceInviteDialogComponent } from './owner-device-invite-dialog.component';
import { DeviceRoleDialogComponent } from './device-role-dialog.component';

/**
 * TZ-AUTH-304 — страница «Устройства» (sibling Пользователи | Роли).
 *
 * Список именованных компьютеров (regular devices + owner devices для
 * владельца), создание одноразовой ссылки с заранее выбранной активной
 * ролью, owner-only «Добавить мой компьютер» (password step-up, 15 минут),
 * изменение роли/срока и отзыв устройства с подтверждением.
 *
 * Все HTTP через silent-* helpers; backend сам фильтрует owner-устройства
 * для обычного администратора (TZ-AUTH-303) — UI ничего не скрывает.
 */
@Component({
  selector: 'pi-devices-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, ButtonComponent, TableComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="devices" [chips]="chips" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        @if (caps.hasAny(['user:admin'])) {
          <app-pi-button
            variant="default"
            size="sm"
            (click)="onCreateInvite()"
            data-test="devices-create-invite"
          >
            Создать ссылку
          </app-pi-button>
        }
        @if (auth.isOwner()) {
          <app-pi-button
            variant="outline"
            size="sm"
            (click)="onCreateOwnerInvite()"
            data-test="devices-owner-invite"
          >
            Добавить мой компьютер
          </app-pi-button>
        }
      </div>
      @if (error(); as err) {
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-xs text-destructive"
          data-test="devices-admin-error"
        >
          {{ err }}
        </div>
      }
      <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
        <app-pi-table
          [compact]="true"
          [data]="devicesList()"
          [columns]="cols"
          [loading]="loading()"
          [emptyMessage]="'Нет подключённых компьютеров.'"
          [ariaLabel]="'Список устройств'"
          [rowActions]="rowActionsTplBinding"
        >
          <ng-template #rowActionsTpl let-d>
            <div class="flex items-center justify-end gap-2">
              @if (loadingRowId() === d.id) {
                <span
                  class="text-xs text-muted-foreground"
                  role="status"
                  aria-label="Загрузка"
                  data-test="devices-row-loading"
                >
                  Загрузка…
                </span>
              }
              @if (d.status === 'active') {
                <button
                  type="button"
                  class="text-xs underline decoration-dotted underline-offset-2 text-muted-foreground hover:text-ink pi-focus-ring"
                  (click)="onEditDevice(d, 'role')"
                  [disabled]="loadingRowId() === d.id"
                  data-test="devices-edit-role"
                >
                  Изменить роль
                </button>
                <button
                  type="button"
                  class="text-xs underline decoration-dotted underline-offset-2 text-muted-foreground hover:text-ink pi-focus-ring"
                  (click)="onEditDevice(d, 'ttl')"
                  [disabled]="loadingRowId() === d.id"
                  data-test="devices-edit-ttl"
                >
                  Изменить срок
                </button>
                <button
                  type="button"
                  class="text-xs text-destructive hover:underline pi-focus-ring"
                  (click)="onRevoke(d)"
                  [disabled]="loadingRowId() === d.id"
                  data-test="devices-revoke"
                >
                  Отключить
                </button>
              }
            </div>
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-group-workspace>
  `,
})
export class DevicesAdminPage implements OnInit {
  protected readonly toc = ADMIN_TOC_CHIPS;
  protected readonly chips = ADMIN_ENTITY_SECTION_CHIPS;

  private readonly devices = inject(PiDeviceEnrollmentService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  protected readonly caps = inject(CapabilitiesService);
  protected readonly auth = inject(AuthService);

  readonly devicesList = signal<AdminDevice[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadingRowId = signal<string | null>(null);

  protected readonly cols: ColumnDef<AdminDevice>[] = [
    { key: 'deviceName', label: 'Имя компьютера', sticky: 'left', cellClass: 'text-xs' },
    {
      key: 'status',
      label: 'Состояние',
      cellClass: 'text-xs',
      format: (d) => (d.status === 'active' ? 'Работает' : 'Отключён'),
    },
    { key: 'role', label: 'Роль', cellClass: 'font-mono text-xs' },
    {
      key: 'expiresAt',
      label: 'Срок доступа',
      cellClass: 'text-xs tabular-nums',
      format: (d) => formatDate(d.expiresAt),
    },
    {
      key: 'lastUsedAt',
      label: 'Последний вход',
      cellClass: 'text-xs text-muted-foreground tabular-nums',
      format: (d) => formatDate(d.lastUsedAt),
    },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: AdminDevice }>;
  protected rowActionsTplBinding: TemplateRef<{ $implicit: AdminDevice }> | null = null;

  constructor() {
    this.refresh();
  }

  ngOnInit(): void {
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  private refresh(): void {
    this.loading.set(true);
    this.devices.listDevices().subscribe((res) => {
      this.loading.set(false);
      if (res.ok) {
        this.devicesList.set(res.data);
        this.error.set(null);
      } else {
        this.error.set(extractErrorMessage(res.error));
      }
    });
  }

  // ── Create regular invite ──
  protected onCreateInvite(): void {
    const ref = this.dialog.open(DeviceInviteDialogComponent, {
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Ссылка создана');
      void this.refresh();
    });
  }

  // ── Owner «Добавить мой компьютер» ──
  protected onCreateOwnerInvite(): void {
    const ref = this.dialog.open(OwnerDeviceInviteDialogComponent, {
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.toast.success('Ссылка владельца создана');
      void this.refresh();
    });
  }

  // ── Change role / access ttl ──
  protected onEditDevice(d: AdminDevice, mode: 'role' | 'ttl'): void {
    const ref = this.dialog.open<AdminDevice>(DeviceRoleDialogComponent, {
      data: { device: d, mode },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (updated) => {
      this.toast.success(mode === 'role' ? 'Роль изменена' : 'Срок изменён');
      // Role changes apply at the next device renewal (≤5 min); the row
      // shows the current DB value, so refresh the list.
      void this.refresh();
      void updated;
    });
  }

  // ── Revoke (confirm) ──
  protected onRevoke(d: AdminDevice): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Отключить этот компьютер?',
        description: `«${d.deviceName}» потеряет доступ максимум за 5 минут. Другие компьютеры не затронуты.`,
        confirmLabel: 'Отключить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      this.loadingRowId.set(d.id);
      this.devices.revokeDevice(d.id).subscribe((res) => {
        this.loadingRowId.set(null);
        if (res.ok) {
          this.toast.success('Компьютер отключён');
          void this.refresh();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
